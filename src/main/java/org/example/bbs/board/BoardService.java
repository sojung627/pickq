package org.example.bbs.board;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Pageable;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardService {

    private final BoardRepository boardRepository;
    private final BoardTypeRepository boardTypeRepository;
    private final BoardLikeRepository boardLikeRepository;

    private final ReplyRepository replyRepository;

    private final MemberRepository memberRepository;

    // 게시글 목록 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 게시글 리스트
    public Map<String, Object> getBoardList(int page, String searchType, String keyword, String typeCode, String sortType) {

        Sort sort = sortType.equals("views") // sortType을 해결할 수 없습니다
                ? Sort.by("boardViewCount").descending()
                : Sort.by("boardIdx").descending();

        Pageable pageable = PageRequest.of(page - 1, 10, sort);

        Page<BoardEntity> boardPage = boardRepository.findBySearch(typeCode, keyword, searchType, pageable);

        Map<String, Object> result = new HashMap<>();
        result.put("boards", boardPage.getContent().stream()
                .map(b -> {
                    String memId = null;
                    try {
                        memId = b.getMember().getMemId();
                    } catch (Exception e) {
                        memId = "(탈퇴회원)";
                    }
                    return BoardListDTO.builder()
                            .boardIdx(b.getBoardIdx())
                            .boardTitle(b.getBoardTitle())
                            .boardViewCount(b.getBoardViewCount())
                            .boardLike(b.getBoardLike())
                            .boardRegdate(b.getBoardRegdate())
                            .boardTypeCode(b.getBoardType().getBoardTypeCode())
                            .memId(memId)
                            .build();
                })
                .toList());
        result.put("currentPage", page);
        result.put("totalPages", boardPage.getTotalPages());

        int blockLimit = 5;
        int start = (((int) (Math.ceil((double) page / blockLimit))) - 1) * blockLimit + 1;
        int end = Math.min((start + blockLimit - 1), Math.max(1, boardPage.getTotalPages()));

        result.put("blockStart", start);
        result.put("blockEnd", end);

        if (typeCode != null && !typeCode.isEmpty()) {
            result.put("currentType", boardTypeRepository.findByBoardTypeCode(typeCode).orElse(null));
        }

        return result;
    }

    // 게시글 상세 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 게시글 상세보기
    @Transactional
    public BoardDetailDTO getBoardDetail(String boardTypeCode, Long boardIdx) {
        BoardEntity board = boardRepository.findDetail(boardTypeCode, boardIdx)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        // 조회수 증가
        board.setBoardViewCount(board.getBoardViewCount() + 1);

        return BoardDetailDTO.builder()
                .boardIdx(board.getBoardIdx())
                .boardTitle(board.getBoardTitle())
                .boardContent(board.getBoardContent())
                .boardTypeCode(board.getBoardType().getBoardTypeCode())
                .boardTypeName(board.getBoardType().getBoardTypeName())
                .memIdx(board.getMember().getMemIdx())
                .memId(board.getMember().getMemId())
                .boardViewCount(board.getBoardViewCount())
                .boardLike(board.getBoardLike())
                .boardRegdate(board.getBoardRegdate())
                .isLiked(false)
                .build();
    }

    // 게시글 좋아요 토글
    @Transactional
    public Map<String, Object> toggleLike(Long boardIdx, String memId) {

        BoardEntity board = boardRepository.findById(boardIdx)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        MemberEntity member = memberRepository.findByMemId(memId)
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

        Optional<BoardLikeEntity> existingLike =
                boardLikeRepository.findByBoard_BoardIdxAndMember_MemId(boardIdx, memId);

        boolean isLiked;

        if (existingLike.isPresent()) {
            // 좋아요 취소
            boardLikeRepository.delete(existingLike.get());
            board.setBoardLike(board.getBoardLike() - 1);
            isLiked = false;
        } else {
            // 좋아요 추가
            BoardLikeEntity like = BoardLikeEntity.builder()
                    .board(board)
                    .member(member)
                    .build();
            boardLikeRepository.save(like);
            board.setBoardLike(board.getBoardLike() + 1);
            isLiked = true;
        }
        Map<String, Object> result = new HashMap<>();
        result.put("boardLike", board.getBoardLike());
        result.put("isLiked", isLiked);

        return result;
    }

    // 댓글 / 답글
    @Transactional
    public void writeReply(Long boardIdx, ReplyWriteDTO dto, HttpServletRequest request, String memId) {
        MemberEntity member = memberRepository.findByMemId(memId)
                .orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));
        BoardEntity board = boardRepository.findById(boardIdx)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        int depth = 0;
        int ref = 0;

        if (dto.getReplyParentIdx() != null) {
            ReplyEntity parent = replyRepository.findById(dto.getReplyParentIdx())
                    .orElseThrow(() -> new RuntimeException("부모 댓글을 찾을 수 없습니다."));
            depth = parent.getReplyDepth() + 1;
            ref = Math.toIntExact(parent.getReplyIdx()); // 원댓글 기준점
        }

        ReplyEntity reply = ReplyEntity.builder()
                .board(board)
                .member(member)
                .replyContent(dto.getReplyContent())
                .replyIp(request.getRemoteAddr())
                .replyRef(ref)
                .replyStep(0)
                .replyDepth(depth)
                .build();

        replyRepository.save(reply);
    }

    // 댓글 리스트 조회
    public Map<String, Object> getReplies(Long boardIdx, String sort, int page) {
        // 1. 정렬 조건 설정 (최신순 vs 오래된순)
        Sort sortOption = sort.equals("latest")
                ? Sort.by("replyRegdate").descending()
                : Sort.by("replyRegdate").ascending();

        // 2. 페이징 정보 생성 (페이지 번호는 0부터 시작하니까 page - 1)
        Pageable pageable = PageRequest.of(page - 1, 10, sortOption);

        // 3. 레포지토리 호출 (이 부분이 에러였지! 변수명을 replyPage로 선언하고 repository를 호출해야 해)
        Page<ReplyEntity> replyPage = replyRepository.findByBoard_BoardIdx(boardIdx, pageable); // 에러라고 5번째 말한다

        // 4. 결과 가공 (Entity -> Map)
        Map<String, Object> result = new HashMap<>();
        result.put("replies", replyPage.getContent().stream()
                .map(r -> {
                    // 탈퇴한 회원일 경우를 대비한 안전한 처리
                    String memId = (r.getMember() != null) ? r.getMember().getMemId() : "(탈퇴회원)";
                    Long memIdx = (r.getMember() != null) ? r.getMember().getMemIdx() : 0L;

                    return Map.of(
                            "replyIdx", r.getReplyIdx(),
                            "replyContent", r.getReplyContent(),
                            "replyRegdate", r.getReplyRegdate(),
                            "replyLike", r.getReplyLike(),
                            "replyDepth", r.getReplyDepth(),
                            "memId", memId,
                            "memIdx", memIdx
                    );
                })
                .toList());

        // 5. 전체 댓글 수 등 추가 정보 담기
        result.put("totalReplies", replyPage.getTotalElements());
        result.put("totalPages", replyPage.getTotalPages());
        result.put("currentPage", page);

        return result;
    }

    // 댓글 좋아요
    @Transactional
    public Map<String, Object> toggleReplyLike(Long replyIdx, String memId) {
        ReplyEntity reply = replyRepository.findById(replyIdx)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        reply.setReplyLike(reply.getReplyLike() + 1);

        Map<String, Object> result = new HashMap<>();
        result.put("replyLike", reply.getReplyLike());
        return result;
    }

    // 댓글 삭제
    @Transactional
    public void deleteReply(Long replyIdx, String memId) {

        ReplyEntity reply = replyRepository.findById(replyIdx)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        // 작성자 검증
        if (!reply.getMember().getMemId().equals(memId)) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        replyRepository.delete(reply);
    }

    // 게시글 삭제
    @Transactional
    public void deleteBoard(Long boardIdx, String memId) {

        BoardEntity board = boardRepository.findById(boardIdx)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        // 작성자 검증
        if (!board.getMember().getMemId().equals(memId)) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        boardRepository.delete(board);
    }

    // 게시글 작성 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 게시글 작성하기
    @Transactional
    public Long writeBoard(String typeCode, BoardWriteDTO dto, HttpServletRequest request, String memId) {
        MemberEntity member = memberRepository.findByMemId(memId)
                .orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));

        BoardTypeEntity boardType = boardTypeRepository.findByBoardTypeCode(typeCode)
                .orElseThrow(() -> new RuntimeException("게시판 타입을 찾을 수 없습니다."));

        BoardEntity board = BoardEntity.builder()
                .member(member)
                .boardType(boardType)
                .boardTitle(dto.getBoardTitle())
                .boardContent(dto.getBoardContent())
                .boardIp(request.getRemoteAddr())
                .build();

        return boardRepository.save(board).getBoardIdx();
    }
}
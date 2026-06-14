package org.example.bbs.board;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.example.bbs.memberProfile.MemberProfileEntity;
import org.example.bbs.memberProfile.MemberProfileRepository;
import org.example.bbs.notification.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
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
    private final ReplyLikeRepository replyLikeRepository;

    private final MemberRepository memberRepository;
    private final MemberProfileRepository memberProfileRepository;

    // ▼ 추가
    private final NotificationService notificationService;

    // 게시글 목록 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    public Map<String, Object> getBoardList(int page, String searchType, String keyword, String typeCode, String sortType) {

        Sort sort = sortType.equals("views")
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

    @Transactional
    public BoardDetailDTO getBoardDetail(String boardTypeCode, Long boardIdx) {
        BoardEntity board = boardRepository.findDetail(boardTypeCode, boardIdx)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        board.setBoardViewCount(board.getBoardViewCount() + 1);

        MemberProfileEntity profile = memberProfileRepository.findById(board.getMember().getMemIdx()).orElse(null);

        return BoardDetailDTO.builder()
                .boardIdx(board.getBoardIdx())
                .boardTitle(board.getBoardTitle())
                .boardContent(board.getBoardContent())
                .boardTypeCode(board.getBoardType().getBoardTypeCode())
                .boardTypeName(board.getBoardType().getBoardTypeName())
                .memIdx(board.getMember().getMemIdx())
                .memId(board.getMember().getMemId())
                .memNickname(profile != null ? profile.getMemNickname() : null)
                .memProfileImg(profile != null ? profile.getMemImg() : null)
                .boardViewCount(board.getBoardViewCount())
                .boardLike(board.getBoardLike())
                .boardRegdate(board.getBoardRegdate())
                .isLiked(false)
                .build();
    }

    // 게시글 좋아요 토글 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

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
            boardLikeRepository.delete(existingLike.get());
            board.setBoardLike(board.getBoardLike() - 1);
            isLiked = false;
        } else {
            BoardLikeEntity like = BoardLikeEntity.builder()
                    .board(board)
                    .member(member)
                    .build();
            boardLikeRepository.save(like);
            board.setBoardLike(board.getBoardLike() + 1);
            isLiked = true;
        }

        // ▼ 추가: 좋아요 눌렸을 때만 알림 (취소 시에는 알림 X)
        if (isLiked) {
            notificationService.notifyBoardLike(board.getMember(), member, board);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("boardLike", board.getBoardLike());
        result.put("isLiked", isLiked);

        return result;
    }

    // 댓글 / 답글 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

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
            ref = Math.toIntExact(parent.getReplyIdx());
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

        // ▼ 추가: 게시글 작성자에게 댓글 알림 (자기 글에 자기 댓글이면 제외는 NotificationService 내부에서 처리)
        notificationService.notifyBoardComment(board.getMember(), member, board, reply);
    }

    // 댓글 리스트 조회 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    public Map<String, Object> getReplies(Long boardIdx, String sort, int page) {
        Sort sortOption = sort.equals("latest")
                ? Sort.by("replyRegdate").descending()
                : Sort.by("replyRegdate").ascending();

        Pageable pageable = PageRequest.of(page - 1, 10, sortOption);

        Page<ReplyEntity> replyPage = replyRepository.findByBoard_BoardIdx(boardIdx, pageable);

        Map<String, Object> result = new HashMap<>();
        result.put("replies", replyPage.getContent().stream()
                .map(r -> {
                    String replyMemId = (r.getMember() != null) ? r.getMember().getMemId() : "(탈퇴회원)";
                    Long replyMemIdx = (r.getMember() != null) ? r.getMember().getMemIdx() : 0L;

                    MemberProfileEntity profile = (r.getMember() != null)
                            ? memberProfileRepository.findById(r.getMember().getMemIdx()).orElse(null)
                            : null;

                    Map<String, Object> replyMap = new HashMap<>();
                    replyMap.put("replyIdx", r.getReplyIdx());
                    replyMap.put("replyContent", r.getReplyContent());
                    replyMap.put("replyRegdate", r.getReplyRegdate());
                    replyMap.put("replyLike", r.getReplyLike());
                    replyMap.put("replyDepth", r.getReplyDepth());
                    replyMap.put("memId", replyMemId);
                    replyMap.put("memIdx", replyMemIdx);
                    replyMap.put("memNickname", profile != null ? profile.getMemNickname() : null);
                    replyMap.put("memProfileImg", profile != null ? profile.getMemImg() : null);
                    return replyMap;
                })
                .toList());

        result.put("totalReplies", replyPage.getTotalElements());
        result.put("totalPages", replyPage.getTotalPages());
        result.put("currentPage", page);

        return result;
    }

    // 댓글 좋아요 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    @Transactional
    public Map<String, Object> toggleReplyLike(Long replyIdx, String memId) {

        ReplyEntity reply = replyRepository.findById(replyIdx)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        MemberEntity member = memberRepository.findByMemId(memId)
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

        Optional<ReplyLikeEntity> existingLike =
                replyLikeRepository.findByReply_ReplyIdxAndMember_MemId(replyIdx, memId);

        if (existingLike.isPresent()) {
            replyLikeRepository.delete(existingLike.get());
            reply.setReplyLike(reply.getReplyLike() - 1);
        } else {
            ReplyLikeEntity like = ReplyLikeEntity.builder()
                    .reply(reply)
                    .member(member)
                    .build();
            replyLikeRepository.save(like);
            reply.setReplyLike(reply.getReplyLike() + 1);
        }
        Map<String, Object> result = new HashMap<>();
        result.put("replyLike", reply.getReplyLike());

        return result;
    }

    // 댓글 삭제 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    @Transactional
    public void deleteReply(Long replyIdx, String memId) {

        ReplyEntity reply = replyRepository.findById(replyIdx)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        if (!reply.getMember().getMemId().equals(memId)) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        replyRepository.delete(reply);
    }

    // 게시글 삭제 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    @Transactional
    public void deleteBoard(Long boardIdx, String memId) {

        BoardEntity board = boardRepository.findById(boardIdx)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        if (!board.getMember().getMemId().equals(memId)) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        boardRepository.delete(board);
    }

    // 게시글 작성 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

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

    // 게시글 수정 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    @Transactional
    public void editBoard(Long boardIdx, BoardWriteDTO dto, String memId) {
        BoardEntity board = boardRepository.findById(boardIdx)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        if (!board.getMember().getMemId().equals(memId)) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }

        board.setBoardTitle(dto.getBoardTitle());
        board.setBoardContent(dto.getBoardContent());
        board.setBoardModdate(LocalDateTime.now());
    }

    // 마이페이지 게시글 리스트 조회 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    public List<BoardListDTO> getMyBoards(String memId) {
        return boardRepository.findByMemberWithReplyCount(memId)
                .stream()
                .map(row -> {
                    BoardEntity b = (BoardEntity) row[0];
                    long replyCount = (Long) row[1];

                    return BoardListDTO.builder()
                            .boardIdx(b.getBoardIdx())
                            .boardTitle(b.getBoardTitle())
                            .boardViewCount(b.getBoardViewCount())
                            .boardLike(b.getBoardLike())
                            .boardRegdate(b.getBoardRegdate())
                            .boardTypeCode(b.getBoardType().getBoardTypeCode())
                            .boardTypeName(b.getBoardType().getBoardTypeName())
                            .replyCount((int) replyCount)
                            .build();
                })
                .toList();
    }

}
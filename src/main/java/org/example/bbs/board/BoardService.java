package org.example.bbs.board;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.example.bbs.memberProfile.MemberProfileEntity;
import org.example.bbs.memberProfile.MemberProfileRepository;
import org.example.bbs.notification.NotificationEntity;
import org.example.bbs.notification.NotificationRepository;
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
import java.util.Objects;
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

    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

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

    // 수정된 댓글 작성 로직 (일반 댓글의 고유 그룹 생성)
    @Transactional
    public void writeReply(Long boardIdx, ReplyWriteDTO dto, HttpServletRequest request, String memId) {
        MemberEntity member = memberRepository.findByMemId(memId)
                .orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다.")); // 주석: 회원 조회 [cite: 413]
        BoardEntity board = boardRepository.findById(boardIdx)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다.")); // 주석: 게시글 조회 [cite: 414]
        int depth = 0; // 주석: 기본 depth 설정 [cite: 415]
        ReplyEntity parent = null; // 주석: 부모 댓글 초기화 [cite: 415]

        if (dto.getReplyParentIdx() != null) {
            parent = replyRepository.findById(dto.getReplyParentIdx())
                    .orElseThrow(() -> new RuntimeException("부모 댓글을 찾을 수 없습니다.")); // 주석: 부모 댓글 조회 [cite: 415]
            depth = parent.getReplyDepth() + 1; // 주석: depth 증가 [cite: 416]
        }

        // 일차적으로 replyRef를 임시로 세팅하여 엔티티 빌드
        ReplyEntity reply = ReplyEntity.builder()
                .board(board)
                .member(member)
                .replyContent(dto.getReplyContent())
                .replyIp(request.getRemoteAddr())
                .replyRef(0) // 아래에서 고유 ID로 업데이트되므로 임시 세팅 [cite: 417]
                .replyStep(0) // 주석: 초기 스텝 설정 [cite: 417]
                .replyDepth(depth)
                .build();
        replyRepository.save(reply); // 주석: 1차 저장 [cite: 418]

        // 일반 댓글(부모가 없는 최상위 댓글)인 경우, 자기 자신의 PK(replyIdx)를 그룹 번호(replyRef)로 지정
        if (parent == null) {
            reply.setReplyRef(Math.toIntExact(reply.getReplyIdx())); // 주석: 본인 인덱스를 ref로 지정 [cite: 418]
        } else {
            reply.setReplyRef(Math.toIntExact(parent.getReplyRef())); // 주석: 부모의 ref를 승계 [cite: 419]
        }

        // 변경된 replyRef 반영을 위해 다시 저장 혹은 더티 체킹 유도
        replyRepository.save(reply); // 주석: 최종 저장 [cite: 420]

        // 알림 서비스 분기 처리
        if (parent != null) {
            // 부모 댓글 작성자에게 답글 알림
            if (parent.getMember() != null) {
                notificationService.notifyBoardReply(
                        parent.getMember(),
                        member,
                        board,
                        reply
                );
            }

            // 게시글 작성자에게도 알림
            // 게시글 작성자와 부모 댓글 작성자가 같으면 중복 발송하지 않음
            if (board.getMember() != null
                    && (parent.getMember() == null
                    || !Objects.equals(
                    board.getMember().getMemIdx(),
                    parent.getMember().getMemIdx()))) {

                notificationService.notifyBoardComment(
                        board.getMember(),
                        member,
                        board,
                        reply
                );
            }
        } else {
            // 일반 댓글은 게시글 작성자에게 알림
            if (board.getMember() != null) {
                notificationService.notifyBoardComment(
                        board.getMember(),
                        member,
                        board,
                        reply
                );
            }
        }
//        if (parent != null) {
//            // 답글인 경우 부모 댓글 작성자에게 알림 발송
//            if (parent.getMember() != null) {
//                notificationService.notifyBoardReply(parent.getMember(), member, board, reply);
//            }
//        } else {
//            // 일반 댓글인 경우 게시글 작성자에게 알림 발송
//            if (board.getMember() != null) {
//                notificationService.notifyBoardComment(board.getMember(), member, board, reply);
//            }
//        }
    }

    // 댓글 리스트 조회 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 수정된 댓글 리스트 조회 메서드
    public Map<String, Object> getReplies(Long boardIdx, String sort, int page) {

        // 트리 구조 순서로 전체 댓글 데이터 조회
        List<ReplyEntity> allReplies = replyRepository.findByBoard_BoardIdxOrderByTree(boardIdx);

        // 정렬 조건의 안전성을 확보하고 명확하게 "latest" 요청이 들어왔을 때만 그룹 역순 정렬 수행
        if (sort != null && "latest".equalsIgnoreCase(sort.trim())) {
            allReplies = reorderGroupsDesc(allReplies);
        }

        int pageSize = 10;
        int totalElements = allReplies.size();
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);

        // 입력된 페이지 번호가 유효 범위를 벗어나지 않도록 방어 로직 추가
        int targetPage = Math.max(1, Math.min(page, totalPages == 0 ? 1 : totalPages));

        // 페이징 처리를 위한 인덱스 계산 및 안전 범위 지정
        int fromIndex = Math.min((targetPage - 1) * pageSize, totalElements);
        int toIndex = Math.min(fromIndex + pageSize, totalElements);

        // 유효한 데이터 범위 내에서만 서브 리스트 추출
        List<ReplyEntity> pageContent = (fromIndex < toIndex)
                ? allReplies.subList(fromIndex, toIndex)
                : new java.util.ArrayList<>();

        Map<String, Object> result = new HashMap<>();
        result.put("replies", pageContent.stream()
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

        result.put("totalReplies", (long) totalElements);
        result.put("totalPages", totalPages);
        result.put("currentPage", targetPage); // 안전하게 가공된 현재 페이지 번호 반환

        return result;
    }

    // 최상위 댓글 그룹(자신 + 하위 답글들) 단위로 묶어서 그룹 순서를 역순으로 재배치
    // 수정된 그룹 역순 재배치 로직 (고유한 replyRef 기반으로 안전하게 그룹핑)
    private List<ReplyEntity> reorderGroupsDesc(List<ReplyEntity> treeOrdered) {
        List<List<ReplyEntity>> groups = new java.util.ArrayList<>();

        for (ReplyEntity r : treeOrdered) {
            // depth가 0인 댓글이 나타나면 새로운 최상위 댓글 그룹으로 인정하고 분리
            if (r.getReplyDepth() == 0) {
                groups.add(new java.util.ArrayList<>(List.of(r)));
            } else if (!groups.isEmpty()) {
                groups.get(groups.size() - 1).add(r);
            }
        }

        java.util.Collections.reverse(groups);
        return groups.stream().flatMap(List::stream).toList();
    }
//    private List<ReplyEntity> reorderGroupsDesc(List<ReplyEntity> treeOrdered) {
//        List<List<ReplyEntity>> groups = new java.util.ArrayList<>();
//        for (ReplyEntity r : treeOrdered) {
//            if (r.getReplyRef() == 0) {
//                groups.add(new java.util.ArrayList<>(List.of(r)));
//            } else if (!groups.isEmpty()) {
//                groups.get(groups.size() - 1).add(r);
//            }
//        }
//        java.util.Collections.reverse(groups);
//        return groups.stream().flatMap(List::stream).toList();
//    }

    // 댓글 좋아요 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    @Transactional
    public Map<String, Object> toggleReplyLike(Long replyIdx, String memId) {

        ReplyEntity reply = replyRepository.findById(replyIdx)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        MemberEntity member = memberRepository.findByMemId(memId)
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

        Optional<ReplyLikeEntity> existingLike =
                replyLikeRepository.findByReply_ReplyIdxAndMember_MemId(replyIdx, memId);

        boolean isLiked;

        if (existingLike.isPresent()) {
            replyLikeRepository.delete(existingLike.get());
            reply.setReplyLike(reply.getReplyLike() - 1);
            isLiked = false;
        } else {
            ReplyLikeEntity like = ReplyLikeEntity.builder()
                    .reply(reply)
                    .member(member)
                    .build();
            replyLikeRepository.save(like);
            reply.setReplyLike(reply.getReplyLike() + 1);
            isLiked = true;
        }

        // 좋아요 눌렸을 때만 댓글/답글 작성자에게 알림 (취소 시에는 알림 X)
        if (isLiked) {
            notificationService.notifyReplyLike(reply.getMember(), member, reply.getBoard(), reply);
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

        // 이 댓글을 참조하는 알림의 reply_idx를 null로 먼저 해제한 뒤 삭제
        List<NotificationEntity> relatedNotis = notificationRepository.findByReply_ReplyIdx(replyIdx);
        relatedNotis.forEach(n -> n.setReply(null));
        notificationRepository.saveAll(relatedNotis);

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

    // 댓글 및 답글 수정
    @Transactional
    public void editReply(Long replyIdx, ReplyWriteDTO dto, String memId) {

        ReplyEntity reply = replyRepository.findById(replyIdx)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        if (!reply.getMember().getMemId().equals(memId)) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }

        reply.setReplyContent(dto.getReplyContent());
        reply.setReplyModdate(LocalDateTime.now());
    }

}
package org.example.bbs.notification;

import lombok.RequiredArgsConstructor;
import org.example.bbs.board.BoardEntity;
import org.example.bbs.board.ReplyEntity;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final MemberRepository memberRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // 게시글 댓글 알림
    @Transactional
    public void notifyBoardComment(MemberEntity receiver, MemberEntity sender,
                                   BoardEntity board, ReplyEntity reply) {
        if (receiver.getMemId().equals(sender.getMemId())) return; // 본인 글 댓글 제외

        NotificationEntity noti = NotificationEntity.builder()
                .receiver(receiver)
                .sender(sender)
                .board(board)
                .reply(reply)
                .notificationType(NotificationTypeCode.BOARD_COMMENT.name())
                .notificationTitle("내 게시글에 댓글이 달렸어요")
                .notificationMessage(sender.getMemName() + "님이 댓글을 남겼습니다: "
                        + truncate(reply.getReplyContent(), 30))
                .targetUrl("/boards/" + board.getBoardType().getBoardTypeCode()
                        + "/" + board.getBoardIdx())
                .build();

        notificationRepository.save(noti);
        pushToClient(receiver.getMemIdx(), NotificationDTO.from(noti));
    }

    // 좋아요 알림
    @Transactional
    public void notifyBoardLike(MemberEntity receiver, MemberEntity sender,
                                BoardEntity board) {
        if (receiver.getMemId().equals(sender.getMemId())) return;

        NotificationEntity noti = NotificationEntity.builder()
                .receiver(receiver)
                .sender(sender)
                .board(board)
                .notificationType(NotificationTypeCode.BOARD_LIKE.name())
                .notificationTitle("내 게시글에 좋아요가 눌렸어요")
                .notificationMessage(sender.getMemName() + "님이 좋아요를 눌렀습니다.")
                .targetUrl("/boards/" + board.getBoardType().getBoardTypeCode()
                        + "/" + board.getBoardIdx())
                .build();

        notificationRepository.save(noti);
        pushToClient(receiver.getMemIdx(), NotificationDTO.from(noti));
    }

    // 조회
    // 조회
    @Transactional(readOnly = true)
    public List<NotificationDTO> getAll(String memId) {
        return notificationRepository
                .findByReceiver_MemIdOrderByCreatedAtDesc(memId)
                .stream().map(NotificationDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getRecent5(String memId) {
        return notificationRepository
                .findTop5ByReceiver_MemIdOrderByCreatedAtDesc(memId)
                .stream().map(NotificationDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String memId) {
        return notificationRepository.countByReceiver_MemIdAndIsRead(memId, "N");
    }

    // 읽음 처리
    @Transactional
    public void markAsRead(Long notificationIdx, String memId) {
        notificationRepository.findById(notificationIdx).ifPresent(n -> {
            if (n.getReceiver().getMemId().equals(memId)) {
                n.setIsRead("Y");
            }
        });
    }

    @Transactional
    public void markAllAsRead(String memId) {
        notificationRepository.markAllAsRead(memId);
    }

    // 내부 유틸
    private void pushToClient(Long memIdx, NotificationDTO dto) {
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + memIdx, dto);
    }

    private String truncate(String text, int limit) {
        if (text == null) return "";
        return text.length() > limit ? text.substring(0, limit) + "..." : text;
    }

    // 댓글에 대한 답글 알림
    @Transactional
    public void notifyBoardReply(MemberEntity receiver, MemberEntity sender,
                                 BoardEntity board, ReplyEntity reply) {
        if (receiver.getMemId().equals(sender.getMemId())) return; // 본인 댓글에 본인 답글 제외

        NotificationEntity noti = NotificationEntity.builder()
                .receiver(receiver)
                .sender(sender)
                .board(board)
                .reply(reply)
                .notificationType(NotificationTypeCode.BOARD_REPLY.name())
                .notificationTitle("내 댓글에 답글이 달렸어요")
                .notificationMessage(sender.getMemName() + "님이 답글을 남겼습니다: "
                        + truncate(reply.getReplyContent(), 30))
                .targetUrl("/boards/" + board.getBoardType().getBoardTypeCode()
                        + "/" + board.getBoardIdx())
                .build();

        notificationRepository.save(noti);
        pushToClient(receiver.getMemIdx(), NotificationDTO.from(noti));
    }


}
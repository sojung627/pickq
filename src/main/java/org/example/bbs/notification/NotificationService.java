package org.example.bbs.notification;

import lombok.RequiredArgsConstructor;
import org.example.bbs.auction.AuctionEntity;
import org.example.bbs.bid.BidEntity;
import org.example.bbs.board.BoardEntity;
import org.example.bbs.board.ReplyEntity;
import org.example.bbs.chat.ChatroomEntity;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.example.bbs.review.ReviewEntity;
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

    // 게시판 알림 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

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

    // 조회 3세트 - 알림에서도 씀
    @Transactional(readOnly = true)
    public List<NotificationDTO> getAll(String memId) {
        return notificationRepository
                .findByReceiver_MemIdOrderByCreatedAtDesc(memId)
                .stream().map(NotificationDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getRecent3(String memId) {
        return notificationRepository
                .findTop3ByReceiver_MemIdOrderByCreatedAtDesc(memId)
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

    // 알림 삭제 (본인 알림만 삭제 가능)
    @Transactional
    public void deleteNotification(Long notificationIdx, String memId) {
        notificationRepository.findById(notificationIdx).ifPresent(n -> {
            if (n.getReceiver().getMemId().equals(memId)) {
                notificationRepository.delete(n);
            }
        });
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

    // 댓글 / 답글 좋아요 알림
    @Transactional
    public void notifyReplyLike(MemberEntity receiver, MemberEntity sender,
                                BoardEntity board, ReplyEntity reply) {
        if (receiver.getMemId().equals(sender.getMemId())) return; // 본인 댓글에 본인 좋아요 제외

        // 답글(depth > 0)인지 일반 댓글(depth == 0)인지에 따라 문구 분기
        boolean isReply = reply.getReplyDepth() != null && reply.getReplyDepth() > 0;
        String label = isReply ? "답글" : "댓글";

        NotificationEntity noti = NotificationEntity.builder()
                .receiver(receiver)
                .sender(sender)
                .board(board)
                .reply(reply)
                .notificationType(NotificationTypeCode.REPLY_LIKE.name())
                .notificationTitle("내 " + label + "에 좋아요가 눌렸어요")
                .notificationMessage(sender.getMemName() + "님이 좋아요를 눌렀습니다: "
                        + truncate(reply.getReplyContent(), 30))
                .targetUrl("/boards/" + board.getBoardType().getBoardTypeCode()
                        + "/" + board.getBoardIdx())
                .build();

        notificationRepository.save(noti);
        pushToClient(receiver.getMemIdx(), NotificationDTO.from(noti));
    }

    // 경매 및 입찰 알림 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 입찰 등록 알림 (경매 buyer에게)
    @Transactional
    public void notifyAuctionBid(AuctionEntity auction, BidEntity bid) {
        MemberEntity receiver = auction.getBuyer();
        MemberEntity sender   = bid.getBidder();
        if (receiver.getMemId().equals(sender.getMemId())) return;

        NotificationEntity noti = NotificationEntity.builder()
                .receiver(receiver)
                .sender(sender)
                .auction(auction)
                .bid(bid)
                .notificationType(NotificationTypeCode.AUCTION_BID.name())
                .notificationTitle("내 경매에 새 입찰이 들어왔어요")
                .notificationMessage(sender.getMemName() + "님이 입찰을 등록했습니다: "
                        + truncate(bid.getBidMessage(), 30))
                .targetUrl("/auctions/" + auction.getAuctionIdx())
                .build();

        notificationRepository.save(noti);
        pushToClient(receiver.getMemIdx(), NotificationDTO.from(noti));
    }

    // 낙찰 알림 (입찰자 bidder에게)
    @Transactional
    public void notifyAuctionDecided(AuctionEntity auction, BidEntity winBid) {
        MemberEntity receiver = winBid.getBidder();
        MemberEntity sender   = auction.getBuyer();

        NotificationEntity noti = NotificationEntity.builder()
                .receiver(receiver)
                .sender(sender)
                .auction(auction)
                .bid(winBid)
                .notificationType(NotificationTypeCode.AUCTION_DECIDED.name())
                .notificationTitle("입찰글이 낙찰되었습니다.")
                .notificationMessage("[" + auction.getAuctionTitle() + "] 경매에 낙찰되었습니다.")
                .targetUrl("/auctions/" + auction.getAuctionIdx())
                .build();

        notificationRepository.save(noti);
        pushToClient(receiver.getMemIdx(), NotificationDTO.from(noti));
    }

    // 경매 상태 변경 알림 (경매 buyer에게)
    @Transactional
    public void notifyAuctionStatusChanged(AuctionEntity auction, String statusName) {
        MemberEntity receiver = auction.getBuyer();

        NotificationEntity noti = NotificationEntity.builder()
                .receiver(receiver)
                .auction(auction)
                .notificationType(NotificationTypeCode.AUCTION_STATUS_CHANGED.name())
                .notificationTitle("경매 상태가 변경되었어요")
                .notificationMessage("[" + auction.getAuctionTitle() + "] 상태: " + statusName)
                .targetUrl("/auctions/" + auction.getAuctionIdx())
                .build();

        notificationRepository.save(noti);
        pushToClient(receiver.getMemIdx(), NotificationDTO.from(noti));
    }

    // 리뷰 알림 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 리뷰 알림 (buyer → bidder에게)

    @Transactional

    public void notifyReviewReceived(MemberEntity receiver, MemberEntity sender,
                                     ReviewEntity review) {
        NotificationEntity noti = NotificationEntity.builder()
                .receiver(receiver)
                .sender(sender)
                .notificationType(NotificationTypeCode.REVIEW_RECEIVED.name())
                .notificationTitle("새 리뷰가 등록되었어요")
                .notificationMessage(sender.getMemName() + "님이 리뷰를 남겼습니다: "
                        + truncate(review.getReviewTitle(), 30))
                .targetUrl("/reviews/" + review.getReviewIdx())
                .build();

        notificationRepository.save(noti);
        pushToClient(receiver.getMemIdx(), NotificationDTO.from(noti));
    }

    // 채팅 알림 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 채팅 알림 (sender → receiver에게)
    @Transactional
    public void notifyChatMessage(MemberEntity receiver, MemberEntity sender,
                                  ChatroomEntity chatroom, String messageContent) {

        if (receiver.getMemId().equals(sender.getMemId())) return; // 본인에게는 알림 생성 안 함

        NotificationEntity noti = NotificationEntity.builder()
                .receiver(receiver)
                .sender(sender)
                .notificationType(NotificationTypeCode.CHAT_MESSAGE.name())
                .notificationTitle("새 채팅 메시지가 도착했어요")
                .notificationMessage(sender.getMemName() + ": "
                        + truncate(messageContent, 30))
                .targetUrl("/chats")
                .build();

        notificationRepository.save(noti);
        pushToClient(receiver.getMemIdx(), NotificationDTO.from(noti));
    }

    // 결제 및 배송 알림 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 결제 완료 알림 (구매자 -> 판매자: 배송을 시작해달라는 알림)
    @Transactional
    public void notifyPaymentDone(MemberEntity receiver, MemberEntity sender, AuctionEntity auction) {
        if (receiver.getMemId().equals(sender.getMemId())) return;

        NotificationEntity noti = NotificationEntity.builder()
                .receiver(receiver)
                .sender(sender)
                .auction(auction)
                .notificationType(NotificationTypeCode.PAYMENT_DONE.name())
                .notificationTitle("결제가 완료되었어요")
                .notificationMessage(sender.getMemName() + "님이 [" + auction.getAuctionTitle()
                        + "] 상품에 대해 결제를 완료했습니다. 배송을 시작해주세요.")
                .targetUrl("/mypage/sales")
                .build();

        notificationRepository.save(noti);
        pushToClient(receiver.getMemIdx(), NotificationDTO.from(noti));
    }

    // 배송 시작 알림 (판매자 -> 구매자)
    @Transactional
    public void notifyDeliveryStarted(MemberEntity receiver, MemberEntity sender, AuctionEntity auction) {
        if (receiver.getMemId().equals(sender.getMemId())) return;

        NotificationEntity noti = NotificationEntity.builder()
                .receiver(receiver)
                .sender(sender)
                .auction(auction)
                .notificationType(NotificationTypeCode.DELIVERY_STARTED.name())
                .notificationTitle("배송이 시작되었어요")
                .notificationMessage("[" + auction.getAuctionTitle() + "] 상품의 배송이 시작되었습니다.")
                .targetUrl("/mypage/orders")
                .build();

        notificationRepository.save(noti);
        pushToClient(receiver.getMemIdx(), NotificationDTO.from(noti));
    }

    // 구매확정(배송 완료) 알림 (구매자 -> 판매자)
    @Transactional
    public void notifyDeliveryConfirmed(MemberEntity receiver, MemberEntity sender, AuctionEntity auction) {
        if (receiver.getMemId().equals(sender.getMemId())) return;

        NotificationEntity noti = NotificationEntity.builder()
                .receiver(receiver)
                .sender(sender)
                .auction(auction)
                .notificationType(NotificationTypeCode.DELIVERY_CONFIRMED.name())
                .notificationTitle("배송이 완료되었어요")
                .notificationMessage(sender.getMemName() + "님이 [" + auction.getAuctionTitle()
                        + "] 상품의 구매를 확정했습니다. 거래가 완료되었습니다.")
                .targetUrl("/mypage/sales")
                .build();

        notificationRepository.save(noti);
        pushToClient(receiver.getMemIdx(), NotificationDTO.from(noti));
    }




    // 회원 점수 / 등급 알림 -------------------------------------------------

    @Transactional
    public void notifyCreditChanged(MemberEntity receiver, int delta,
                                    int beforeCredit, int afterCredit, String reason) {
        String signedDelta = (delta > 0 ? "+" : "") + delta;

        NotificationEntity noti = NotificationEntity.builder()
                .receiver(receiver)
                .notificationType(NotificationTypeCode.CREDIT_CHANGED.name())
                .notificationTitle(delta >= 0 ? "회원 점수가 올랐어요" : "회원 점수가 변경되었어요")
                .notificationMessage(reason + ": " + signedDelta + "점 ("
                        + beforeCredit + "점 → " + afterCredit + "점)")
                .targetUrl("/mypage/info")
                .build();

        notificationRepository.save(noti);
        pushToClient(receiver.getMemIdx(), NotificationDTO.from(noti));
    }

    @Transactional
    public void notifyPenaltyIssued(MemberEntity receiver, int deduction,
                                    int beforeCredit, int afterCredit, String reason) {
        NotificationEntity noti = NotificationEntity.builder()
                .receiver(receiver)
                .notificationType(NotificationTypeCode.PENALTY_ISSUED.name())
                .notificationTitle("회원 점수가 차감되었어요")
                .notificationMessage(reason + ": -" + deduction + "점 ("
                        + beforeCredit + "점 → " + afterCredit + "점)")
                .targetUrl("/mypage/info")
                .build();

        notificationRepository.save(noti);
        pushToClient(receiver.getMemIdx(), NotificationDTO.from(noti));
    }

    @Transactional
    public void notifyGradeChanged(MemberEntity receiver,
                                   String oldGradeName, String newGradeName) {
        NotificationEntity noti = NotificationEntity.builder()
                .receiver(receiver)
                .notificationType(NotificationTypeCode.GRADE_CHANGED.name())
                .notificationTitle("회원 등급이 변경되었어요")
                .notificationMessage(oldGradeName + " → " + newGradeName)
                .targetUrl("/mypage/info")
                .build();

        notificationRepository.save(noti);
        pushToClient(receiver.getMemIdx(), NotificationDTO.from(noti));
    }
}
package org.example.bbs.notification;

public enum NotificationTypeCode {
    // 게시판
    BOARD_COMMENT,
    BOARD_REPLY,
    BOARD_LIKE,
    REPLY_LIKE,

    // 경매 / 입찰
    AUCTION_BID,
    AUCTION_DECIDED,
    AUCTION_STATUS_CHANGED,

    // 리뷰 / 채팅 / 회원 점수·등급
    REVIEW_RECEIVED,
    CHAT_MESSAGE,
    CREDIT_CHANGED,
    PENALTY_ISSUED,
    GRADE_CHANGED,

    // 결제 / 배송
    PAYMENT_DONE,
    DELIVERY_STARTED,
    DELIVERY_CONFIRMED
}

package org.example.bbs.notification;

public enum NotificationTypeCode {
    // 게시판
    BOARD_COMMENT,   // 내 글에 댓글
    BOARD_REPLY,     // 내 댓글에 답글
    BOARD_LIKE,      // 내 글에 좋아요
    REPLY_LIKE,      // 내 댓글/답글에 좋아요

    // 경매 / 입찰
    AUCTION_BID,
    AUCTION_DECIDED,

    // 경매 상태 변경 (마감/유찰)
    AUCTION_STATUS_CHANGED,

    // 리뷰 / 채팅 / 페널티
    REVIEW_RECEIVED,
    CHAT_MESSAGE,
    PENALTY_ISSUED,
    GRADE_CHANGED,

    // 결제 / 배송
    PAYMENT_DONE,    // 구매자가 결제 완료 -> 판매자에게 배송 요청 알림
    DELIVERY_STARTED, // 판매자가 배송 시작 -> 구매자에게 배송 시작 알림
    DELIVERY_CONFIRMED // 구매자가 구매확정 -> 판매자에게 배송 완료(거래 종료) 알림
}
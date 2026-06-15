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
    GRADE_CHANGED
}
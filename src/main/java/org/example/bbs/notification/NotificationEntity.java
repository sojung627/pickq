package org.example.bbs.notification;

import jakarta.persistence.*;
import lombok.*;
import org.example.bbs.auction.AuctionEntity;
import org.example.bbs.bid.BidEntity;
import org.example.bbs.board.BoardEntity;
import org.example.bbs.board.ReplyEntity;
import org.example.bbs.member.MemberEntity;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class NotificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_idx")
    private Long notificationIdx;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_idx", nullable = false)
    private MemberEntity receiver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_idx")
    private MemberEntity sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_idx")
    private AuctionEntity auction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_idx")
    private BidEntity bid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_idx")
    private BoardEntity board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_idx")
    private ReplyEntity reply;

    @Column(name = "notification_type", nullable = false, length = 50)
    private String notificationType;

    @Column(name = "notification_title", nullable = false, length = 200)
    private String notificationTitle;

    @Column(name = "notification_message", nullable = false, length = 500)
    private String notificationMessage;

    @Column(name = "target_url", length = 255)
    private String targetUrl;

    @Column(name = "is_read", nullable = false, length = 1)
    private String isRead;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @PrePersist
    public void prePersist() {
        if (this.isRead == null) {
            this.isRead = "N";
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
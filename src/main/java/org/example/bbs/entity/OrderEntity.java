package org.example.bbs.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.bbs.member.MemberEntity;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders", uniqueConstraints = {
        @UniqueConstraint(name = "ux_order_bid", columnNames = {"bid_idx"})
})
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_idx")
    private Long orderIdx;

    // 경매 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_idx", nullable = false)
    private AuctionEntity auction;

    // 입찰 정보 (FK)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_idx", nullable = false)
    private BidEntity bid;

    // 구매자 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_idx", nullable = false)
    private MemberEntity buyer;

    // 판매자 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_idx", nullable = false)
    private MemberEntity seller;

    @Column(name = "order_amount", nullable = false)
    private Long orderAmount; // 낙찰가 스냅샷

    @Column(name = "order_status", nullable = false, length = 20)
    private String orderStatus; // CREATED, PAID, SHIPPED, CONFIRMED, CANCELED

    @Column(name = "is_settled", nullable = false, length = 1)
    private String isSettled; // 정산 여부 Y/N

    @Column(name = "order_regdate", updatable = false)
    private LocalDateTime orderRegdate;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "refund_at")
    private LocalDateTime refundAt;

    @PrePersist
    public void prePersist() {
        if (this.orderRegdate == null) {
            this.orderRegdate = LocalDateTime.now();
        }
        if (this.isSettled == null) {
            this.isSettled = "N";
        }
    }
}
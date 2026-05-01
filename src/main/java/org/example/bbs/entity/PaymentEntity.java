package org.example.bbs.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.bbs.member.MemberEntity;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment", uniqueConstraints = {
        @UniqueConstraint(name = "ux_payment_key", columnNames = {"payment_key"}),
        @UniqueConstraint(name = "ux_order_id", columnNames = {"order_id"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pay_idx")
    private Long payIdx;

    // 낙찰 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_idx", nullable = false)
    private BidEntity bid;

    // 구매자 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mem_idx", nullable = false)
    private MemberEntity member;

    @Column(name = "payment_key", nullable = false, length = 255)
    private String paymentKey; // 토스 결제 고유 키

    @Column(name = "order_id", nullable = false, length = 255)
    private String orderId; // 시스템 주문번호 (UUID 등)

    @Column(name = "pay_method", nullable = false, length = 100)
    private String payMethod; // 결제 수단

    @Column(name = "pay_amount", nullable = false)
    private Long payAmount;

    @Column(name = "pay_status", nullable = false, length = 20)
    private String payStatus; // READY, DONE, CONFIRMED, CANCELED, EXPIRED

    // 배송지 정보 스냅샷
    @Column(name = "buyer_name", nullable = false, length = 50)
    private String buyerName;

    @Column(name = "buyer_tel", nullable = false, length = 20)
    private String buyerTel;

    @Column(name = "buyer_addr", nullable = false, length = 500)
    private String buyerAddr;

    @Column(name = "buyer_zipcode", nullable = false, length = 20)
    private String buyerZipcode;

    @Column(name = "pay_regdate", updatable = false)
    private LocalDateTime payRegdate;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "canceled_at")
    private LocalDateTime canceledAt;

    @PrePersist
    public void prePersist() {
        if (this.payRegdate == null) {
            this.payRegdate = LocalDateTime.now();
        }
        if (this.payStatus == null) {
            this.payStatus = "READY";
        }
    }
}
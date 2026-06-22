package org.example.bbs.payment;

import jakarta.persistence.*;
import lombok.*;
import org.example.bbs.bid.BidEntity;
import org.example.bbs.member.MemberEntity;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment", uniqueConstraints = {
        @UniqueConstraint(name = "ux_payment_key", columnNames = {"payment_key"}),
        @UniqueConstraint(name = "ux_order_id", columnNames = {"order_id"})
})
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pay_idx")
    private Long payIdx;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_idx", nullable = false)
    private BidEntity bid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mem_idx", nullable = false)
    private MemberEntity member;

    // nullable = true: DB 직접 초기화(READY 상태 복구) 시 NULL 값과 JPA 충돌 방지
    @Column(name = "payment_key", nullable = true, length = 255)
    private String paymentKey;

    @Column(name = "order_id", nullable = true, length = 255)
    private String orderId;

    @Column(name = "pay_method", nullable = true, length = 100)
    private String payMethod;

    @Column(name = "pay_amount", nullable = false)
    private Long payAmount;

    @Column(name = "pay_status", nullable = false, length = 20)
    private String payStatus; // READY, DONE, CONFIRMED, CANCELED, EXPIRED

    // 배송지 스냅샷
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

    // 배송 관련 추가 필드
    // null = 배송준비중 / SHIPPING = 배송중 / DELIVERED = 구매확정완료
    @Column(name = "delivery_status", length = 20)
    private String deliveryStatus;

    @Column(name = "courier_company", length = 50)
    private String courierCompany;

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @PrePersist
    public void prePersist() {
        if (this.payRegdate == null) this.payRegdate = LocalDateTime.now();
        if (this.payStatus == null) this.payStatus = "READY";
        if (this.deliveryStatus == null) this.deliveryStatus = "READY";
    }
}
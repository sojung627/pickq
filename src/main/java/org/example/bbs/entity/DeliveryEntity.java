package org.example.bbs.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class DeliveryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "delivery_idx")
    private Long deliveryIdx;

    // 결제 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pay_idx", nullable = false)
    private PaymentEntity payment;

    // 입찰 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_idx", nullable = false)
    private BidEntity bid;

    @Column(name = "courier_company", length = 50)
    private String courierCompany; // 택배사

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber; // 운송장번호

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt; // 발송일시

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt; // 배송완료일시

    @Column(name = "delivery_status", nullable = false, length = 20)
    private String deliveryStatus; // READY, SHIPPING, DELIVERED

    @PrePersist
    public void prePersist() {
        if (this.deliveryStatus == null) {
            this.deliveryStatus = "READY";
        }
    }
}
package org.example.bbs.order;

import lombok.Builder;
import lombok.Getter;
import org.example.bbs.payment.PaymentEntity;

import java.time.LocalDateTime;

@Getter
@Builder
public class PurchaseResponseDTO {

    private Long bidIdx;
    private String itemName;
    private Long payAmount;
    private String payMethod;
    private String payStatus;
    private LocalDateTime payRegdate;
    private String deliveryStatus;
    private String courierCompany;
    private String trackingNumber;

    // 거래 상대 정보
    private String buyerMemId;
    private String sellerMemId;

    // 타임라인 날짜
    private LocalDateTime paidAt;
    private LocalDateTime shippedAt;
    private LocalDateTime confirmedAt;

    public static PurchaseResponseDTO from(PaymentEntity p) {
        return PurchaseResponseDTO.builder()
                .bidIdx(p.getBid().getBidIdx())
                .itemName(p.getBid().getAuction().getAuctionTitle())
                .payAmount(p.getPayAmount())
                .payMethod(p.getPayMethod())
                .payStatus(p.getPayStatus())
                .payRegdate(p.getPayRegdate())
                .deliveryStatus("CONFIRMED".equals(p.getPayStatus())
                        ? "DELIVERED" : p.getDeliveryStatus())
                .courierCompany(p.getCourierCompany())
                .trackingNumber(p.getTrackingNumber())
                .buyerMemId(p.getMember().getMemId())
                .sellerMemId(p.getBid().getBidder().getMemId())
                .paidAt(p.getPayRegdate())
                .shippedAt(p.getShippedAt())
                .confirmedAt(p.getConfirmedAt())
                .build();
    }
}
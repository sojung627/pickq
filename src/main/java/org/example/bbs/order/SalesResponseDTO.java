package org.example.bbs.order;

import lombok.Builder;
import lombok.Getter;
import org.example.bbs.payment.PaymentEntity;

import java.time.LocalDateTime;

@Getter
@Builder
public class SalesResponseDTO {

    private Long bidIdx;
    private String itemName;
    private Long payAmount;
    private String payStatus;
    private LocalDateTime payRegdate;
    private String buyerName;
    private String buyerTel;
    private String buyerAddr;
    private String buyerZipcode;
    private String deliveryStatus;
    private String courierCompany;
    private String trackingNumber;

    private String buyerMemId;
    private String sellerMemId;

    private LocalDateTime paidAt;
    private LocalDateTime shippedAt;
    private LocalDateTime confirmedAt;

    public static SalesResponseDTO from(PaymentEntity p) {
        // 과거 불일치 데이터도 판매자 화면에서는 거래완료로 안전하게 표시
        String effectiveDeliveryStatus = "CONFIRMED".equals(p.getPayStatus())
                ? "DELIVERED"
                : p.getDeliveryStatus();

        return SalesResponseDTO.builder()
                .bidIdx(p.getBid().getBidIdx())
                .itemName(p.getBid().getAuction().getAuctionTitle())
                .payAmount(p.getPayAmount())
                .payStatus(p.getPayStatus())
                .payRegdate(p.getPayRegdate())
                .buyerName(p.getBuyerName())
                .buyerTel(p.getBuyerTel())
                .buyerAddr(p.getBuyerAddr())
                .buyerZipcode(p.getBuyerZipcode())
                .deliveryStatus(effectiveDeliveryStatus)
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

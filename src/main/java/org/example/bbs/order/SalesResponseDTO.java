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
    private LocalDateTime payRegdate;
    private String buyerName;
    private String buyerTel;
    private String buyerAddr;
    private String buyerZipcode;
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

    public static SalesResponseDTO from(PaymentEntity p) {
        return SalesResponseDTO.builder()
                .bidIdx(p.getBid().getBidIdx())
                .itemName(p.getBid().getAuction().getAuctionTitle())
                .payAmount(p.getPayAmount())
                .payRegdate(p.getPayRegdate())
                .buyerName(p.getBuyerName())
                .buyerTel(p.getBuyerTel())
                .buyerAddr(p.getBuyerAddr())
                .buyerZipcode(p.getBuyerZipcode())
                .deliveryStatus(p.getDeliveryStatus())
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
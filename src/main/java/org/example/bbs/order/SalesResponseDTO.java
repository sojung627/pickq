package org.example.bbs.order;

import lombok.Builder;
import lombok.Getter;
import org.example.bbs.payment.PaymentEntity;

import java.time.LocalDateTime;

@Getter
@Builder
public class SalesResponseDTO {

    private Long bidIdx;
    private String itemName;      // 경매 제목 (상품명 역할)
    private Long payAmount;
    private LocalDateTime payRegdate;

    // 구매자 정보 (배송지 스냅샷에서)
    private String buyerName;
    private String buyerTel;
    private String buyerAddr;
    private String buyerZipcode;

    // 배송 정보
    private String deliveryStatus;
    private String courierCompany;
    private String trackingNumber;

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
                .build();
    }
}
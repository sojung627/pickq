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

    public static PurchaseResponseDTO from(PaymentEntity p) {
        return PurchaseResponseDTO.builder()
                .bidIdx(p.getBid().getBidIdx())
                .itemName(p.getBid().getAuction().getAuctionTitle())
                .payAmount(p.getPayAmount())
                .payMethod(p.getPayMethod())
                .payStatus(p.getPayStatus())
                .payRegdate(p.getPayRegdate())
                .deliveryStatus(p.getDeliveryStatus())
                .courierCompany(p.getCourierCompany())
                .trackingNumber(p.getTrackingNumber())
                .build();
    }
}
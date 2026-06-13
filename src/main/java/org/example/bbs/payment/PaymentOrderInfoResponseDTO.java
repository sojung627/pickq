package org.example.bbs.payment;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentOrderInfoResponseDTO {
    private String orderId;
    private String orderName;
    private Long amount;
    private String customerName;
    private String customerEmail;
}
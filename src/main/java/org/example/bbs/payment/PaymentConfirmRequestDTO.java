package org.example.bbs.payment;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentConfirmRequestDTO {
    private String paymentKey;
    private String orderId;
    private Long amount;
}
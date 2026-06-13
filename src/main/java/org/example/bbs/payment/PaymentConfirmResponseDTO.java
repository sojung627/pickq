package org.example.bbs.payment;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentConfirmResponseDTO {
    private boolean success;
    private String orderId;
    private String payStatus;
}
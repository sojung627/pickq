package org.example.bbs.order;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ShipRequestDTO {
    private Long bidIdx;
    private String courierCompany;
    private String trackingNumber;
}

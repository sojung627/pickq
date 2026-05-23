package org.example.bbs.bid;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BidRequestDTO {
    private String itemName;
    private String itemBrand;
    private Long bidPrice;
    private Integer bidQuantity;
    private String bidMessage;
    private Long itemCategoryIdx;
}
package org.example.bbs.auction;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuctionWriteRequestDTO {
    private Long   itemCategoryIdx;
    private String auctionTitle;
    private String itemBrand;               // AuctionEntity에 없는 필드 (개선팁 5번 참고)
    private Long   auctionTargetPrice;
    private String auctionEndAt;            // "yyyy-MM-dd HH:mm"
    private String auctionDecisionDeadline; // "yyyy-MM-dd HH:mm"
    private String auctionDesc;
}
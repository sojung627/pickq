package org.example.bbs.auction;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuctionDTO {
    private Long auctionIdx;
    private String auctionTitle;
    private String itemCategoryName;
    private Long auctionTargetPrice;
    private Integer auctionStatusIdx;
    private String auctionStatusName;
    private LocalDateTime auctionEndAt;
    private LocalDateTime auctionRegdate;

    // 비즈니스 로직에 필요한 추가 필드
    private Long bidCount;
    private Long minBidPrice;
    private String winnerItemName;
    private Long winnerBidPrice;
    private String winnerBidderMemIdMasked;
    private Long winnerBidIdx;
}

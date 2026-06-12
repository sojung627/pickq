package org.example.bbs.order;

import lombok.Builder;
import lombok.Getter;
import org.example.bbs.bid.BidEntity;

import java.time.LocalDateTime;

@Getter
@Builder
public class PendingBidResponseDTO {

    private Long bidIdx;
    private Long auctionIdx;
    private String auctionTitle;
    private Long bidPrice;
    private LocalDateTime bidRegdate;
    private String sellerMemId;
    private String buyerMemId;

    public static PendingBidResponseDTO from(BidEntity b) {
        return PendingBidResponseDTO.builder()
                .bidIdx(b.getBidIdx())
                .auctionIdx(b.getAuction().getAuctionIdx())
                .auctionTitle(b.getAuction().getAuctionTitle())
                .bidPrice(b.getBidPrice())
                .bidRegdate(b.getBidRegdate())
                .sellerMemId(b.getBidder().getMemId())
                .buyerMemId(b.getAuction().getBuyer().getMemId())
                .build();
    }
}
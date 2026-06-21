package org.example.bbs.review;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReviewDTO {

    private Long reviewIdx;
    private Double reviewStar;
    private String reviewTitle;
    private LocalDateTime reviewRegdate;
    private String auctionTitle;
    private String itemName;
    private String reviewKeywords;
}

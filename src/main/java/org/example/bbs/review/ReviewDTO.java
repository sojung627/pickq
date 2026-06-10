package org.example.bbs.review;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReviewDTO {

    private Long reviewIdx;
    private Double reviewStar;        // Integer → Double 변환
    private String reviewTitle;
    private LocalDateTime reviewRegdate;
    private String auctionTitle;      // auction 테이블 join 필요
}

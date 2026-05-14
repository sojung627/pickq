package org.example.bbs.auction;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionListDTO {

    // PK 및 기본 식별 정보
    private Long auctionIdx;          // 경매 고유 번호
    private String auctionTitle;      // 경매 제목
    private String itemCategoryName;  // 카테고리명 (Entity의 ItemCategoryEntity에서 추출)

    // 이미지 및 상태 배지 관련
    private String auctionThumbnailImg; // 썸네일 이미지 경로
    private int auctionStatusIdx;       // 상태 코드 (1:진행중, 2:결정대기, 3:마감 등)

    // 통계 및 시간 정보
    private int bidCount;           // 제안 수 (Bid 테이블 Count 결과)
    private String timeDisplay;     // "3시간 남음", "마감" 등 계산된 문자열
    private LocalDateTime auctionEndAt; // 타이머용

    // 가격 정보 (toLocaleString() 사용을 위해 숫자 타입 유지)
    private Long auctionTargetPrice; // 희망 예산
    private Long minBidPrice;        // 최저 제안가 (없으면 0)

    // 추가 정보 (필요시)
    private Long auctionViewCount;   // 조회수

}

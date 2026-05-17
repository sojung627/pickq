package org.example.bbs.auction;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionWriteRequestDTO {

    // 썸네일 이미지 (선택)
    private MultipartFile thumbnailFile;

    // 카테고리 idx
    private Long itemCategoryIdx;

    // 경매 제목
    private String auctionTitle;

    // 브랜드명 (AuctionEntity에 컬럼 없음 - 필요시 Entity에 추가)
    private String itemBrand;

    // 희망 최대가 (프론트에서 쉼표 제거 후 전송)
    private Long auctionTargetPrice;

    // 입찰 마감일 (flatpickr 포맷: "yyyy-MM-dd HH:mm")
    private String auctionEndAt;

    // 구매 결정 마감일 (flatpickr 포맷: "yyyy-MM-dd HH:mm")
    private String auctionDecisionDeadline;

    // 상세 설명
    private String auctionDesc;
}
package org.example.bbs.auction;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuctionService {

    // 마이페이지 파트 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    private final AuctionRepository auctionRepository;

    public List<AuctionDTO> findAuctionsByMemId(String memId) {
        List<AuctionEntity> entities = auctionRepository.findAllByBuyerMemId(memId);

        return entities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private AuctionDTO convertToDTO(AuctionEntity entity) {
        return AuctionDTO.builder()
                .auctionIdx(entity.getAuctionIdx())
                .auctionTitle(entity.getAuctionTitle())
                .itemCategoryName(entity.getItemCategory().getItemCategoryName())
                .auctionTargetPrice(entity.getAuctionTargetPrice())
                .auctionStatusIdx(entity.getAuctionStatus().getAuctionStatusIdx())
                .auctionStatusName(entity.getAuctionStatus().getAuctionStatusName())
                .auctionEndAt(entity.getAuctionEndAt())
                .auctionRegdate(entity.getAuctionRegdate())
                .bidCount(0L)
                .minBidPrice(null)
                .build();
    }

    // 경매 파트 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    public List<AuctionListDTO> findAllAuctions(String category, String sortBy, String status, String keyword) {
        // 1. DAO(Repository)를 통해 엔티티 리스트를 가져옴
        List<AuctionEntity> entities = auctionRepository.findAuctionsByFilters(category, sortBy, status, keyword);

        // 2. 엔티티를 DTO로 변환해서 반환
        return entities.stream().map(entity -> AuctionListDTO.builder()
                .auctionIdx(entity.getAuctionIdx())
                .auctionTitle(entity.getAuctionTitle())
                .itemCategoryName(entity.getItemCategory().getItemCategoryName()) // 연관 객체에서 이름 추출
                .auctionThumbnailImg(entity.getAuctionThumbnailImg())
                .auctionStatusIdx(entity.getAuctionStatus().getAuctionStatusIdx().intValue())
                .auctionTargetPrice(entity.getAuctionTargetPrice())
                .bidCount(0) // 이건 나중에 Bid 테이블 Count 쿼리로 채우기!
                .timeDisplay(calculateTime(entity.getAuctionEndAt())) // 시간 계산 로직
                .build()
        ).toList();
    }

    // 남은 시간 계산 로직 예시
    private String calculateTime(LocalDateTime endAt) {
        // 현재 시간과 비교해서 "3시간 남음" 같은 문자열 반환 로직 작성
        return "남은 시간 계산중";
    }

//    @Autowired
//    private final AuctionListDTO auctionListDTO;
//
//    public Map<String, Object> getAuctionList(String categoryCode, String statusFilter, String sortBy, String keyword, int page) {
//        Sort sort = switch (sortBy) {
//            case "views" -> Sort.by("auctionViewCount").descending();
//            case "deadline" -> Sort.by("auctionEndAt").ascending();
//            default -> Sort.by("auctionRegdate").descending();
//        };
//
//        Pageable pageable = PageRequest.of(page - 1, 12, sort);
//        Page<AuctionEntity> auctionPage = auctionRepository.findByFilter(categoryCode, statusFilter, keyword, pageable);
//
//        Map<String, Object> result = new HashMap<>();
//        result.put("auctionList", auctionPage.getContent().stream()
//                .map(a -> AuctionListDTO.builder()
//                        .auctionIdx(a.getAuctionIdx())
//                        .auctionTitle(a.getAuctionTitle())
//                        .auctionThumbnailImg(a.getAuctionThumbnailImg())
//                        .auctionTargetPrice(a.getAuctionTargetPrice())
//                        .auctionStatusIdx(a.getAuctionStatus().getAuctionStatusIdx())
//                        .itemCategoryName(a.getItemCategory().getItemCategoryName())
//                        .auctionEndAt(a.getAuctionEndAt())
//                        .bidCount(0L)
//                        .minBidPrice(0L)
//                        .build())
//                .toList());
//        result.put("totalPages", auctionPage.getTotalPages());
//        result.put("currentPage", page);
//        return result;
//    }
}
package org.example.bbs.auction;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
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

    // 경매 리스트 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
    
    public List<AuctionListDTO> findAllAuctions(String category, String sortBy, String status, String keyword) {
        List<AuctionEntity> entities = auctionRepository.findAuctionsByFilters(category, status, keyword);

        // Java에서 정렬
        if ("views".equals(sortBy)) {
            entities.sort((a, b) -> Long.compare(
                    b.getAuctionViewCount() != null ? b.getAuctionViewCount() : 0,
                    a.getAuctionViewCount() != null ? a.getAuctionViewCount() : 0
            ));
        } else if ("deadline".equals(sortBy)) {
            entities.sort((a, b) -> {
                if (a.getAuctionEndAt() == null) return 1;
                if (b.getAuctionEndAt() == null) return -1;
                return a.getAuctionEndAt().compareTo(b.getAuctionEndAt());
            });
        } else {
            entities.sort((a, b) -> b.getAuctionRegdate().compareTo(a.getAuctionRegdate()));
        }
        return entities.stream().map(entity -> AuctionListDTO.builder()
                .auctionIdx(entity.getAuctionIdx())
                .auctionTitle(entity.getAuctionTitle())
                .itemCategoryName(entity.getItemCategory().getItemCategoryName())
                .auctionThumbnailImg(entity.getAuctionThumbnailImg())
                .auctionStatusIdx(entity.getAuctionStatus().getAuctionStatusIdx().intValue())
                .auctionTargetPrice(entity.getAuctionTargetPrice())
                .auctionViewCount(entity.getAuctionViewCount())
                .bidCount(0)
                .auctionEndAt(entity.getAuctionEndAt())
                .timeDisplay(calculateTime(entity.getAuctionEndAt()))
                .build()
        ).toList();
    }

    // 남은 시간 계산 로직 예시
    private String calculateTime(LocalDateTime endAt) {

        if (endAt == null) return "(날짜 없음)";

        LocalDateTime now = LocalDateTime.now();

        if (now.isAfter(endAt)) return "마감";

        long miniutes = ChronoUnit.MINUTES.between(now, endAt);
        long hours = ChronoUnit.HOURS.between(now, endAt);
        long days = ChronoUnit.DAYS.between(now, endAt);

        if (miniutes < 60) return miniutes + "분 남음";
        if (hours < 24) return hours + "시간 남음";
        return days + "일 남음";
    }

    // 경매 작성 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ






}
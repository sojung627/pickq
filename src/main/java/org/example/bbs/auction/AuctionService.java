package org.example.bbs.auction;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuctionService {

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
}
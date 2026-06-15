package org.example.bbs.auction;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.example.bbs.notification.NotificationService;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuctionScheduler {

    private final AuctionRepository auctionRepository;
    private final AuctionStatusRepository auctionStatusRepository;
    private final NotificationService notificationService;

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void updateAuctionStatus() {

        LocalDateTime now = LocalDateTime.now();

        // 진행중(1) → 결정대기중(2): 입찰마감일 지난 것들
        AuctionStatusEntity decideStatus = auctionStatusRepository
                .findByAuctionStatusCode("decide").orElseThrow();
        List<AuctionEntity> openAuctions = auctionRepository
                .findByAuctionStatus_AuctionStatusIdxAndAuctionEndAtBefore(1, now);
        for (AuctionEntity auction : openAuctions) {
            auction.setAuctionStatus(decideStatus);
            log.info("입찰 마감 처리: auctionIdx={}", auction.getAuctionIdx());
            notificationService.notifyAuctionStatusChanged(auction, "결정 대기중");
        }

        // 결정대기중(2) → 유찰(4): 결정마감일 지난 것들
        AuctionStatusEntity failedStatus = auctionStatusRepository
                .findByAuctionStatusCode("failed").orElseThrow();
        List<AuctionEntity> decideAuctions = auctionRepository
                .findByAuctionStatus_AuctionStatusIdxAndAuctionDecisionDeadlineBefore(2, now);
        for (AuctionEntity auction : decideAuctions) {
            auction.setAuctionStatus(failedStatus);
            log.info("유찰 처리: auctionIdx={}", auction.getAuctionIdx());
            notificationService.notifyAuctionStatusChanged(auction, "유찰");
        }
    }
}
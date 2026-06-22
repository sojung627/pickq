package org.example.bbs.auction;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.bbs.bid.BidEntity;
import org.example.bbs.bid.BidRepository;
import org.example.bbs.memberPenalty.MemberPenaltyRepository;
import org.example.bbs.memberPenalty.PenaltyService;
import org.example.bbs.notification.NotificationService;
import org.example.bbs.payment.PaymentEntity;
import org.example.bbs.payment.PaymentRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuctionScheduler {

    private final AuctionRepository auctionRepository;
    private final AuctionStatusRepository auctionStatusRepository;
    private final NotificationService notificationService;
    private final BidRepository bidRepository;
    private final PaymentRepository paymentRepository;
    private final PenaltyService penaltyService;
    private final MemberPenaltyRepository memberPenaltyRepository;

    // 경매 상태 자동 전환 (기존 유지)
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void updateAuctionStatus() {
        LocalDateTime now = LocalDateTime.now();

        AuctionStatusEntity decideStatus = auctionStatusRepository
                .findByAuctionStatusCode("decide").orElseThrow();
        List<AuctionEntity> openAuctions = auctionRepository
                .findByAuctionStatus_AuctionStatusIdxAndAuctionEndAtBefore(1, now);
        for (AuctionEntity auction : openAuctions) {
            auction.setAuctionStatus(decideStatus);
            log.info("입찰 마감 처리: auctionIdx={}", auction.getAuctionIdx());
            notificationService.notifyAuctionStatusChanged(auction, "결정 대기중");
        }

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

    // 페널티 자동 부과 (1분마다)
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void applyPenalties() {
        log.info("===== 페널티 스케줄러 실행 ====="); // IntelliJ 콘솔에서 확인
        LocalDateTime now = LocalDateTime.now();

        // [1] NO_PAYMENT: 낙찰 후 3일 지나도 결제 없는 경우 → 구매자 페널티
        List<BidEntity> wonBids = bidRepository.findWonBidsWithoutPayment();
        for (BidEntity bid : wonBids) {
            if (bid.getWonAt() == null) continue;
            if (bid.getWonAt().plusDays(3).isAfter(now)) continue;

            // 중복 방지: bid_idx + penalty_code 조합으로 체크
            if (memberPenaltyRepository.existsByMember_MemIdxAndBid_BidIdxAndPenaltyCode(
                    bid.getAuction().getBuyer().getMemIdx(), bid.getBidIdx(), "NO_PAYMENT")) continue;

            Long buyerIdx = bid.getAuction().getBuyer().getMemIdx();
            penaltyService.applyPenalty(buyerIdx, bid.getBidIdx(),
                    "NO_PAYMENT", "낙찰 후 3일 이내 미결제");
            log.info("NO_PAYMENT 페널티: buyerIdx={}, bidIdx={}", buyerIdx, bid.getBidIdx());
        }

        // [2] LATE_PAYMENT: 3일 초과 결제 → 쿼리에서 중복 방지 처리됨
        List<PaymentEntity> latePayments = paymentRepository.findLatePayments(3);
        for (PaymentEntity payment : latePayments) {
            Long buyerIdx = payment.getMember().getMemIdx();
            penaltyService.applyPenalty(buyerIdx, payment.getBid().getBidIdx(),
                    "LATE_PAYMENT", "결제 기한(3일) 초과 후 결제");
            log.info("LATE_PAYMENT 페널티: buyerIdx={}, bidIdx={}", buyerIdx, payment.getBid().getBidIdx());
        }

        // [3] NO_SHIPMENT: 결제 후 3일 지나도 발송 없음 → 쿼리에서 중복 방지 처리됨
        List<PaymentEntity> noShipments = paymentRepository.findNoShipmentPayments(3);
        for (PaymentEntity payment : noShipments) {
            Long sellerIdx = payment.getBid().getBidder().getMemIdx();
            penaltyService.applyPenalty(sellerIdx, payment.getBid().getBidIdx(),
                    "NO_SHIPMENT", "결제 후 3일 초과 미발송");
            log.info("NO_SHIPMENT 페널티: sellerIdx={}, bidIdx={}", sellerIdx, payment.getBid().getBidIdx());
        }

        // [4] LATE_SHIPMENT: 3일 초과 발송 → 쿼리에서 중복 방지 처리됨
        List<PaymentEntity> lateShipments = paymentRepository.findLateShipments(3);
        for (PaymentEntity payment : lateShipments) {
            Long sellerIdx = payment.getBid().getBidder().getMemIdx();
            penaltyService.applyPenalty(sellerIdx, payment.getBid().getBidIdx(),
                    "LATE_SHIPMENT", "발송 기한(3일) 초과 후 발송");
            log.info("LATE_SHIPMENT 페널티: sellerIdx={}, bidIdx={}", sellerIdx, payment.getBid().getBidIdx());
        }
    }
}
package org.example.bbs.order;

import org.example.bbs.payment.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<PaymentEntity, Long> {

    /**
     * 판매 내역 조회
     * PaymentEntity → BidEntity → AuctionEntity → buyer(MemberEntity) 경로에서
     * auction.buyer = 경매 등록자(구매 요청자) 가 아니라
     * bid.bidder = 실제 판매자(상품 제안자) 기준으로 조회
     */
    @Query("""
            SELECT p FROM PaymentEntity p
            JOIN FETCH p.bid b
            JOIN FETCH b.auction a
            JOIN FETCH b.bidder seller
            WHERE seller.memId = :memId
              AND p.payStatus = 'DONE'
            ORDER BY p.payRegdate DESC
            """)
    List<PaymentEntity> findSalesBySellerMemId(@Param("memId") String memId);

    /**
     * 운송장 등록 시 해당 결제 건 조회 (판매자 본인 검증 포함)
     */
    @Query("""
            SELECT p FROM PaymentEntity p
            JOIN FETCH p.bid b
            JOIN FETCH b.bidder seller
            WHERE b.bidIdx = :bidIdx
              AND seller.memId = :memId
            """)
    Optional<PaymentEntity> findByBidIdxAndSellerMemId(
            @Param("bidIdx") Long bidIdx,
            @Param("memId") String memId
    );
}
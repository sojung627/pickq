package org.example.bbs.order;

import org.example.bbs.payment.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<PaymentEntity, Long> {

    // 마이페이지 - 판매내역 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    @Query("""
            SELECT p FROM PaymentEntity p
            JOIN FETCH p.bid b
            JOIN FETCH b.auction a
            JOIN FETCH b.bidder seller
            JOIN FETCH p.member buyer
            WHERE seller.memId = :memId
              AND p.payStatus IN ('DONE', 'CONFIRMED')
            ORDER BY p.payRegdate DESC
            """)
    List<PaymentEntity> findSalesBySellerMemId(@Param("memId") String memId);

    // 운송장 등록 시 해당 결제 건 조회 (판매자 본인 검증 포함)
    @Query("""
            SELECT p FROM PaymentEntity p
            JOIN FETCH p.bid b
            JOIN FETCH b.auction a
            JOIN FETCH b.bidder seller
            JOIN FETCH p.member buyer
            WHERE b.bidIdx = :bidIdx
              AND seller.memId = :memId
            """)
    Optional<PaymentEntity> findByBidIdxAndSellerMemId(
            @Param("bidIdx") Long bidIdx,
            @Param("memId") String memId
    );

    // 마이페이지 - 구매내역 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 구매 내역 조회 (payment.member = 구매자 기준)
    @Query("""
            SELECT p FROM PaymentEntity p
            JOIN FETCH p.bid b
            JOIN FETCH b.auction a
            JOIN FETCH b.bidder seller
            JOIN FETCH p.member buyer
            WHERE buyer.memId = :memId
            ORDER BY p.payRegdate DESC
            """)
    List<PaymentEntity> findPurchasesByBuyerMemId(@Param("memId") String memId);

    // 구매확정용 조회 (구매자 본인 검증 포함)
    @Query("""
            SELECT p FROM PaymentEntity p
            JOIN FETCH p.member buyer
            JOIN FETCH p.bid b
            JOIN FETCH b.auction a
            JOIN FETCH b.bidder seller
            WHERE b.bidIdx = :bidIdx
              AND buyer.memId = :memId
            """)
    Optional<PaymentEntity> findByBidIdxAndBuyerMemId(
            @Param("bidIdx") Long bidIdx,
            @Param("memId") String memId
    );

}
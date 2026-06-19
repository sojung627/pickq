package org.example.bbs.order;

import org.example.bbs.payment.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<PaymentEntity, Long> {

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

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE PaymentEntity p
               SET p.payStatus = 'CONFIRMED',
                   p.deliveryStatus = 'DELIVERED',
                   p.confirmedAt = :confirmedAt
             WHERE p.payIdx = :payIdx
               AND p.payStatus = 'DONE'
               AND p.deliveryStatus = 'SHIPPING'
            """)
    int confirmReceiptAtomically(@Param("payIdx") Long payIdx,
                                 @Param("confirmedAt") LocalDateTime confirmedAt);

    // 과거 데이터가 pay_status=CONFIRMED, delivery_status=SHIPPING으로 남은 경우 자체 복구
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE PaymentEntity p
               SET p.deliveryStatus = 'DELIVERED'
             WHERE p.payIdx = :payIdx
               AND p.payStatus = 'CONFIRMED'
               AND (p.deliveryStatus IS NULL OR p.deliveryStatus <> 'DELIVERED')
            """)
    int synchronizeConfirmedDeliveryStatus(@Param("payIdx") Long payIdx);
}

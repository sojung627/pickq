package org.example.bbs.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {
    Optional<PaymentEntity> findByOrderId(String orderId);
    Optional<PaymentEntity> findByBid_BidIdx(Long bidIdx);

    // 판매자 기준 구매확정(거래완료) 건수 - 등급 산정에 사용
    @Query("""
            SELECT COUNT(p)
            FROM PaymentEntity p
            WHERE p.bid.bidder.memIdx = :memIdx
              AND p.payStatus = 'CONFIRMED'
            """)
    long countCompletedSalesBySeller(@Param("memIdx") Long memIdx);

    // 낙찰 후 N일을 넘겨 결제한 건: 구매자에게 LATE_PAYMENT -10
    @Query(value = """
        SELECT p.* FROM payment p
        JOIN bid b ON p.bid_idx = b.bid_idx
        WHERE p.pay_status IN ('DONE', 'CONFIRMED')
          AND b.won_at IS NOT NULL
          AND TIMESTAMPDIFF(HOUR, b.won_at, p.pay_regdate) >= (:days * 24)
          AND NOT EXISTS (
              SELECT 1 FROM member_penalty mp
              WHERE mp.mem_idx = p.mem_idx
                AND mp.bid_idx = b.bid_idx
                AND mp.penalty_code IN ('LATE_PAYMENT', 'NO_PAYMENT')
          )
    """, nativeQuery = true)
    List<PaymentEntity> findLatePayments(@Param("days") int days);

    // 결제 후 N일이 지나도 발송하지 않은 건: 판매자에게 NO_SHIPMENT -30
    @Query(value = """
        SELECT p.* FROM payment p
        JOIN bid b ON p.bid_idx = b.bid_idx
        WHERE p.pay_status = 'DONE'
          AND COALESCE(p.delivery_status, 'READY') = 'READY'
          AND TIMESTAMPDIFF(HOUR, p.pay_regdate, NOW()) >= (:days * 24)
          AND NOT EXISTS (
              SELECT 1 FROM member_penalty mp
              WHERE mp.mem_idx = b.bidder_idx
                AND mp.bid_idx = p.bid_idx
                AND mp.penalty_code = 'NO_SHIPMENT'
          )
    """, nativeQuery = true)
    List<PaymentEntity> findNoShipmentPayments(@Param("days") int days);

    // 결제 후 N일을 넘겨 발송한 건: 판매자에게 LATE_SHIPMENT -10
    // 이미 NO_SHIPMENT가 부과된 거래에는 중복 차감하지 않음
    @Query(value = """
        SELECT p.* FROM payment p
        JOIN bid b ON p.bid_idx = b.bid_idx
        WHERE p.shipped_at IS NOT NULL
          AND p.pay_regdate IS NOT NULL
          AND p.pay_status IN ('DONE', 'CONFIRMED')
          AND TIMESTAMPDIFF(HOUR, p.pay_regdate, p.shipped_at) >= (:days * 24)
          AND NOT EXISTS (
              SELECT 1 FROM member_penalty mp
              WHERE mp.mem_idx = b.bidder_idx
                AND mp.bid_idx = p.bid_idx
                AND mp.penalty_code IN ('LATE_SHIPMENT', 'NO_SHIPMENT')
          )
    """, nativeQuery = true)
    List<PaymentEntity> findLateShipments(@Param("days") int days);
}

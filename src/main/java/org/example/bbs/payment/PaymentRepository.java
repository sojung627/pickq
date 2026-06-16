package org.example.bbs.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {
    Optional<PaymentEntity> findByOrderId(String orderId); // 사용 안되고 있음
    Optional<PaymentEntity> findByBid_BidIdx(Long bidIdx);

    // 결제 및 배송 등등에 대한 크레딧 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // [LATE_PAYMENT] 낙찰 후 N일 초과해서 결제한 건
    // CONFIRMED 제외, 이미 shipped된 것도 포함 OK (결제 지연 사실은 변하지 않음)
    @Query(value = """
        SELECT p.* FROM payment p
        JOIN bid b ON p.bid_idx = b.bid_idx
        WHERE p.pay_status IN ('DONE', 'CONFIRMED')
          AND b.bid_moddate IS NOT NULL
          AND TIMESTAMPDIFF(DAY, b.bid_moddate, p.pay_regdate) > :days
          AND NOT EXISTS (
              SELECT 1 FROM member_penalty mp
              WHERE mp.bid_idx = b.bid_idx
                AND mp.penalty_code = 'LATE_PAYMENT'
          )
    """, nativeQuery = true)
    List<PaymentEntity> findLatePayments(@Param("days") int days);

    // [NO_SHIPMENT] 결제 완료(DONE)인데 N일 지나도 발송 안 한 건
    // pay_status = DONE 만 (CONFIRMED는 이미 거래 완료니까 제외)
    @Query(value = """
        SELECT p.* FROM payment p
        WHERE p.pay_status = 'DONE'
          AND p.delivery_status IS NULL
          AND TIMESTAMPDIFF(DAY, p.pay_regdate, NOW()) > :days
          AND NOT EXISTS (
              SELECT 1 FROM member_penalty mp
              WHERE mp.bid_idx = p.bid_idx
                AND mp.penalty_code = 'NO_SHIPMENT'
          )
    """, nativeQuery = true)
    List<PaymentEntity> findNoShipmentPayments(@Param("days") int days);

    // [LATE_SHIPMENT] 결제 후 N일 초과해서 발송한 건
    // CONFIRMED 제외 (이미 구매확정 완료된 건 건드리지 않음)
    @Query(value = """
        SELECT p.* FROM payment p
        WHERE p.shipped_at IS NOT NULL
          AND p.pay_regdate IS NOT NULL
          AND p.pay_status != 'CONFIRMED'
          AND TIMESTAMPDIFF(DAY, p.pay_regdate, p.shipped_at) > :days
          AND NOT EXISTS (
              SELECT 1 FROM member_penalty mp
              WHERE mp.bid_idx = p.bid_idx
                AND mp.penalty_code = 'LATE_SHIPMENT'
          )
    """, nativeQuery = true)
    List<PaymentEntity> findLateShipments(@Param("days") int days);

}
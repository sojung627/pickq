package org.example.bbs.payment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {
    Optional<PaymentEntity> findByOrderId(String orderId); // 사용 안되고 있음
    Optional<PaymentEntity> findByBid_BidIdx(Long bidIdx);
}
package org.example.bbs.payment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {
    Optional<PaymentEntity> findByOrderId(String orderId);
    Optional<PaymentEntity> findByBid_BidIdx(Long bidIdx);
}
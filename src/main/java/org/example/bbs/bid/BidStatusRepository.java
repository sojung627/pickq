package org.example.bbs.bid;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BidStatusRepository extends JpaRepository<BidStatusEntity, Integer> {
    // 입찰 취소 기능
    Optional<BidStatusEntity> findByBidStatusCode(String bidStatusCode);
}
package org.example.bbs.auction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuctionStatusRepository
        extends JpaRepository<AuctionStatusEntity, Integer> {

    // 수동마감 + 취소 기능
    Optional<AuctionStatusEntity> findByAuctionStatusCode(String code);
}
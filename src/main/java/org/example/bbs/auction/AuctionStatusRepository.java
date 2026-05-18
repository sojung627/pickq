package org.example.bbs.auction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuctionStatusRepository
        extends JpaRepository<AuctionStatusEntity, Integer> {
}
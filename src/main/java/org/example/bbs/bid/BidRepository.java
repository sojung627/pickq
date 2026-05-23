package org.example.bbs.bid;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BidRepository extends JpaRepository<BidEntity, Long> {
    List<BidEntity> findByAuction_AuctionIdxOrderByBidRegdateDesc(Long auctionIdx);
}
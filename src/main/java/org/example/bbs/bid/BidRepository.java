package org.example.bbs.bid;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BidRepository extends JpaRepository<BidEntity, Long> {
    List<BidEntity> findByAuction_AuctionIdxOrderByBidRegdateDesc(Long auctionIdx);

    // 마이페이지 입찰
    List<BidEntity> findAllByBidder_MemIdOrderByBidRegdateDesc(String memId);
}
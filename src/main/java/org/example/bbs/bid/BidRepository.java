package org.example.bbs.bid;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BidRepository extends JpaRepository<BidEntity, Long> {
    List<BidEntity> findByAuction_AuctionIdxOrderByBidRegdateDesc(Long auctionIdx);

    // 마이페이지 입찰
    List<BidEntity> findAllByBidder_MemIdOrderByBidRegdateDesc(String memId);

    // 결제 대기 낙찰 건 조회 - auction 구매자 기준, bid_status='won', payment 미존재
    @Query("""
            SELECT b FROM BidEntity b
            JOIN FETCH b.auction a
            JOIN FETCH a.buyer buyer
            JOIN FETCH b.bidder seller
            WHERE buyer.memId = :memId
              AND b.bidStatus.bidStatusCode = 'won'
              AND NOT EXISTS (
                  SELECT 1 FROM PaymentEntity p WHERE p.bid = b
              )
            ORDER BY b.bidRegdate DESC
            """)
    List<BidEntity> findPendingBidsByBuyerMemId(@Param("memId") String memId);

}
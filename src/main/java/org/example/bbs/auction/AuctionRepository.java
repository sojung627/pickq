package org.example.bbs.auction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionRepository extends JpaRepository<AuctionEntity, Long> {

    // 내가 등록한 경매 목록 조회 (삭제되지 않은 것만, 최신순)
    @Query("SELECT a FROM AuctionEntity a " +
            "JOIN FETCH a.itemCategory " +
            "JOIN FETCH a.auctionStatus " +
            "WHERE a.buyer.memId = :memId " +
            "AND a.auctionIsDeleted = 'N' " +
            "ORDER BY a.auctionRegdate DESC")
    List<AuctionEntity> findAllByBuyerMemId(@Param("memId") String memId);
}

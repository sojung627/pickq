package org.example.bbs.auction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionRepository extends JpaRepository<AuctionEntity, Long> {

    // 마이페이지 파트 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 내가 등록한 경매 목록 조회 (삭제되지 않은 것만, 최신순)
    @Query("SELECT a FROM AuctionEntity a " +
            "JOIN FETCH a.itemCategory " +
            "JOIN FETCH a.auctionStatus " +
            "WHERE a.buyer.memId = :memId " +
            "AND a.auctionIsDeleted = 'N' " +
            "ORDER BY a.auctionRegdate DESC")
    List<AuctionEntity> findAllByBuyerMemId(@Param("memId") String memId);

    // 경매 리스트 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    @Query("SELECT a FROM AuctionEntity a " +
            "JOIN FETCH a.itemCategory " +
            "JOIN FETCH a.auctionStatus " +
            "WHERE a.auctionIsDeleted = 'N' " +
            "AND (:category IS NULL OR a.itemCategory.itemCategoryName = :category) " +
            "AND (:keyword IS NULL OR :keyword = '' OR a.auctionTitle LIKE CONCAT('%', :keyword, '%')) " +
            "AND ((:status = 'open' AND a.auctionStatus.auctionStatusIdx = 1) OR " +
            "     (:status = 'closed' AND a.auctionStatus.auctionStatusIdx > 1) OR " +
            "     (:status IS NULL OR :status = ''))")
    List<AuctionEntity> findAuctionsByFilters(
            @Param("category") String category,
            @Param("status") String status,
            @Param("keyword") String keyword
    );

//    @Query("SELECT a FROM AuctionEntity a " +
//            "WHERE a.auctionIsDeleted = 'N' " +
//            "AND (:category IS NULL OR a.itemCategory.itemCategoryName = :category) " +
//            "AND (:keyword IS NULL OR a.auctionTitle LIKE %:keyword%) " +
//            "AND (:status = 'open' AND a.auctionStatus.auctionStatusIdx = 1 OR " +
//            "     :status = 'closed' AND a.auctionStatus.auctionStatusIdx > 1 OR " +
//            "     :status IS NULL)")
//    List<AuctionEntity> findAuctionsByFilters(
//            @Param("category") String category,
//            @Param("status") String status,
//            @Param("keyword") String keyword
//    );


}

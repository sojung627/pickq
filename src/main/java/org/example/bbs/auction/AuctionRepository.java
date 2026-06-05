package org.example.bbs.auction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionRepository extends JpaRepository<AuctionEntity, Long> {

    // 마이페이지 파트 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 내가 등록한 경매 목록 조회 (삭제되지 않은 것만, 최신순)

    @Query("SELECT a FROM AuctionEntity a " +
            "JOIN FETCH a.itemCategory " +
            "JOIN FETCH a.auctionStatus " +
            "LEFT JOIN FETCH a.bids " +
            "WHERE a.buyer.memId = :memId " +
            "AND a.auctionIsDeleted = 'N' " +
            "ORDER BY a.auctionRegdate DESC")
    List<AuctionEntity> findAllByBuyerMemId(@Param("memId") String memId);

    // 경매 리스트 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 진행중만
    @Query("SELECT a FROM AuctionEntity a " +
            "JOIN FETCH a.itemCategory " +
            "JOIN FETCH a.auctionStatus " +
            "WHERE a.auctionIsDeleted = 'N' " +
            "AND a.auctionStatus.auctionStatusIdx = 1 " +
            "AND (:category IS NULL OR a.itemCategory.itemCategoryCode = :category) " +
            "AND (:keyword IS NULL OR :keyword = '' OR a.auctionTitle LIKE CONCAT('%', :keyword, '%'))")
    List<AuctionEntity> findOpenAuctions(
            @Param("category") String category,
            @Param("keyword") String keyword
    );

    // 마감된 경매만 (statusIdx > 1)
    @Query("SELECT a FROM AuctionEntity a " +
            "JOIN FETCH a.itemCategory " +
            "JOIN FETCH a.auctionStatus " +
            "WHERE a.auctionIsDeleted = 'N' " +
            "AND a.auctionStatus.auctionStatusIdx > 1 " +
            "AND (:category IS NULL OR a.itemCategory.itemCategoryCode = :category) " +
            "AND (:keyword IS NULL OR :keyword = '' OR a.auctionTitle LIKE CONCAT('%', :keyword, '%'))")
    List<AuctionEntity> findClosedAuctions(
            @Param("category") String category,
            @Param("keyword") String keyword
    );

    // 경매 시간 자동 처리 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 진행중 & 입찰마감일 지난 것
    List<AuctionEntity> findByAuctionStatus_AuctionStatusIdxAndAuctionEndAtBefore(
            Integer auctionStatusIdx, LocalDateTime now);

    // 결정대기중 & 결정마감일 지난 것
    List<AuctionEntity> findByAuctionStatus_AuctionStatusIdxAndAuctionDecisionDeadlineBefore(
            Integer auctionStatusIdx, LocalDateTime now);

}

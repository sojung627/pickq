package org.example.bbs.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, Long> {

    // 리뷰 매니지먼트 페이지 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 키워드 없이 낙찰 후 미작성 거래 전체 조회
    @Query(value = """
    SELECT 
        b.bid_idx AS bidIdx,
        a.auction_idx AS auctionIdx,
        b.bidder_idx AS bidderIdx,
        a.auction_title AS auctionTitle,
        i.item_name AS itemName
    FROM bid b
    JOIN auction a ON b.auction_idx = a.auction_idx
    JOIN item i ON b.item_idx = i.item_idx
    LEFT JOIN review r ON r.bid_idx = b.bid_idx AND r.review_is_deleted = 'N'
    WHERE a.buyer_idx = :buyerIdx
      AND b.bid_status_idx = 2
      AND r.review_idx IS NULL
    """, nativeQuery = true)
    List<Map<String, Object>> findAllReviewTargets(@Param("buyerIdx") Long buyerIdx);

    // 내가 남긴 리뷰
    @Query(value = """
    SELECT
        r.review_idx AS reviewIdx,
        a.auction_title AS auctionTitle,
        i.item_name AS itemName,
        r.review_star AS reviewStar,
        r.review_regdate AS reviewRegdate
    FROM review r
    JOIN auction a ON r.auction_idx = a.auction_idx
    JOIN bid b ON r.bid_idx = b.bid_idx
    JOIN item i ON b.item_idx = i.item_idx
    WHERE r.buyer_idx = :memIdx
      AND r.review_is_deleted = 'N'
    ORDER BY r.review_regdate DESC
    """, nativeQuery = true)
    List<Map<String, Object>> findMyReviews(@Param("memIdx") Long memIdx);

    // 내가 받은 리뷰
    @Query(value = """
    SELECT
        r.review_idx AS reviewIdx,
        a.auction_title AS auctionTitle,
        i.item_name AS itemName,
        r.review_star AS reviewStar,
        r.review_regdate AS reviewRegdate
    FROM review r
    JOIN auction a ON r.auction_idx = a.auction_idx
    JOIN bid b ON r.bid_idx = b.bid_idx
    JOIN item i ON b.item_idx = i.item_idx
    WHERE r.bidder_idx = :memIdx
      AND r.review_is_deleted = 'N'
    ORDER BY r.review_regdate DESC
    """, nativeQuery = true)
    List<Map<String, Object>> findReceivedReviews(@Param("memIdx") Long memIdx);

    // 평균 별점
    @Query(value = """
    SELECT AVG(r.review_star)
    FROM review r
    WHERE r.bidder_idx = :memIdx
      AND r.review_is_deleted = 'N'
    """, nativeQuery = true)
    Double findAvgRating(@Param("memIdx") Long memIdx);

    // 리뷰 작성 페이지 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 낙찰된 입찰 중 리뷰 안 쓴 것 (경매 제목 or 상품명 검색)
    @Query(value = """
        SELECT 
            b.bid_idx AS bidIdx,
            a.auction_idx AS auctionIdx,
            b.bidder_idx AS bidderIdx,
            a.auction_title AS auctionTitle,
            i.item_name AS itemName
        FROM bid b
        JOIN auction a ON b.auction_idx = a.auction_idx
        JOIN item i ON b.item_idx = i.item_idx
        LEFT JOIN review r ON r.bid_idx = b.bid_idx AND r.review_is_deleted = 'N'
        WHERE a.buyer_idx = :buyerIdx
          AND b.bid_status_idx = 2
          AND r.review_idx IS NULL
          AND (
            (:searchType = 'auctionTitle' AND a.auction_title LIKE CONCAT('%', :keyword, '%'))
            OR
            (:searchType = 'itemName' AND i.item_name LIKE CONCAT('%', :keyword, '%'))
          )
        """, nativeQuery = true)
    List<Map<String, Object>> findReviewTargets(
            @Param("buyerIdx") Long buyerIdx,
            @Param("searchType") String searchType,
            @Param("keyword") String keyword);

    // 리뷰 상세 페이지 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    @Query(value = """
    SELECT
        r.review_idx AS reviewIdx,
        r.review_title AS reviewTitle,
        r.review_content AS reviewContent,
        r.review_star AS reviewStar,
        r.review_regdate AS reviewRegdate,
        a.auction_title AS auctionTitle,
        a.auction_target_price AS auctionTargetPrice,
        buyer.mem_name AS memName,
        bidder.mem_name AS bidderName,
        b.bid_regdate AS bidRegdate
    FROM review r
    JOIN auction a ON r.auction_idx = a.auction_idx
    JOIN bid b ON r.bid_idx = b.bid_idx
    JOIN member buyer ON r.buyer_idx = buyer.mem_idx
    JOIN member bidder ON r.bidder_idx = bidder.mem_idx
    WHERE r.review_idx = :reviewIdx
      
    """, nativeQuery = true)
    Map<String, Object> findReviewDetail(@Param("reviewIdx") Long reviewIdx);

    // 리뷰 관리자 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 활성 리뷰 전체
    @Query(value = """
    SELECT
        r.review_idx AS reviewIdx,
        a.auction_title AS auctionTitle,
        i.item_name AS itemName,
        r.review_star AS reviewStar,
        r.review_regdate AS reviewRegdate
    FROM review r
    JOIN auction a ON r.auction_idx = a.auction_idx
    JOIN bid b ON r.bid_idx = b.bid_idx
    JOIN item i ON b.item_idx = i.item_idx
    WHERE r.review_is_deleted = 'N'
    ORDER BY r.review_regdate DESC
    """, nativeQuery = true)
    List<Map<String, Object>> findAllActiveReviews();

    // 임시 삭제 리뷰 전체
    @Query(value = """
    SELECT
        r.review_idx AS reviewIdx,
        a.auction_title AS auctionTitle,
        i.item_name AS itemName,
        r.review_star AS reviewStar,
        r.review_regdate AS reviewRegdate
    FROM review r
    JOIN auction a ON r.auction_idx = a.auction_idx
    JOIN bid b ON r.bid_idx = b.bid_idx
    JOIN item i ON b.item_idx = i.item_idx
    WHERE r.review_is_deleted = 'Y'
    ORDER BY r.review_regdate DESC
    """, nativeQuery = true)
    List<Map<String, Object>> findAllDeletedReviews();




}
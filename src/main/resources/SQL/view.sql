-- 뷰 테이블 만들기

-- 기존 뷰 삭제 후 재생성 (MySQL은 CREATE OR REPLACE VIEW 지원)

/* ==========================================
   6. 뷰 테이블
   ========================================== */
   
   DROP VIEW IF EXISTS auction_list_view;
   DROP VIEW IF EXISTS auction_detail_view;
   DROP VIEW IF EXISTS bid_list_view;
   
-- AuctionList
CREATE OR REPLACE VIEW auction_list_view AS
SELECT
    a.auction_idx,
    a.buyer_idx,
    a.item_category_idx,
    a.auction_thumbnail_img,
    a.auction_title,
    a.auction_desc,
    a.auction_target_price,
    a.auction_end_at,
    a.auction_decision_deadline,
    a.auction_view_count,
    a.auction_status_idx,
    s.auction_status_code,
    s.auction_status_name,
    ic.item_category_name,
    ic.item_category_code,
    COUNT(b.bid_idx)            AS bid_count,
    IFNULL(MIN(b.bid_price), 0) AS min_bid_price,
    a.auction_regdate,
    a.auction_is_deleted
FROM auction a
JOIN auction_status s      ON a.auction_status_idx  = s.auction_status_idx
LEFT JOIN item_category ic ON a.item_category_idx   = ic.item_category_idx
LEFT JOIN bid b            ON a.auction_idx          = b.auction_idx
                          AND b.bid_status_idx NOT IN (4, 5)  -- ← 취소/삭제 제외
GROUP BY
    a.auction_idx, a.buyer_idx, a.item_category_idx,
    a.auction_thumbnail_img, a.auction_title, a.auction_desc, a.auction_target_price,
    a.auction_end_at, a.auction_decision_deadline, a.auction_view_count,
    a.auction_status_idx, s.auction_status_name, s.auction_status_code,
    ic.item_category_name, ic.item_category_code,
    a.auction_regdate, a.auction_is_deleted;


-- AuctionDetail
CREATE OR REPLACE VIEW auction_detail_view AS
SELECT
    a.auction_idx,
    a.buyer_idx,
    buyer.mem_id AS buyer_mem_id,   -- 구매자 회원 아이디 추가
    a.item_category_idx,
    a.auction_thumbnail_img,
    a.auction_title,
    a.auction_desc,
    a.auction_target_price,
    a.auction_end_at,
    a.auction_decision_deadline,
    a.auction_status_idx,
    s.auction_status_code,
    s.auction_status_name,
    ic.item_category_name,
    COUNT(b.bid_idx)            AS bid_count,
    IFNULL(MIN(b.bid_price), 0) AS min_bid_price,
    a.auction_is_deleted
FROM auction a
JOIN auction_status s      ON a.auction_status_idx  = s.auction_status_idx
LEFT JOIN member buyer     ON a.buyer_idx          = buyer.mem_idx
LEFT JOIN item_category ic ON a.item_category_idx   = ic.item_category_idx
LEFT JOIN bid b            ON a.auction_idx          = b.auction_idx
                          AND b.bid_status_idx NOT IN (4, 5)  -- ← 취소/삭제 제외
GROUP BY
    a.auction_idx, a.buyer_idx, buyer.mem_id, a.item_category_idx,
    a.auction_thumbnail_img, a.auction_title, a.auction_desc,
    a.auction_target_price, a.auction_end_at, a.auction_decision_deadline,
    a.auction_status_idx, s.auction_status_name, s.auction_status_code,
    ic.item_category_name, a.auction_is_deleted;


-- BidList (item_category JOIN 추가)
CREATE OR REPLACE VIEW bid_list_view AS
SELECT
    b.bid_idx,
    b.auction_idx,
    b.bidder_idx,
    m.mem_name AS mem_name,        -- 실명 (구매자에게만 노출, 서비스에서 마스킹 처리)
    m.mem_id AS bidder_mem_id,            -- 회원 아이디 (마스킹 후 표시)
    m.mem_grade_idx AS bidder_grade_idx,  -- 등급 인덱스
    g.grade_name AS bidder_grade_name,    -- 등급명 (bronze, silver, gold 등)
    IFNULL(r.avg_rating, 0) AS bidder_average_rating,  -- 평균 별점 (기본값 0)
    b.bid_price,
    b.bid_quantity,
    b.bid_message,
    b.bid_status_idx,
    bs.bid_status_name,
    b.bid_regdate,
    i.item_idx,
    i.item_name,
    i.item_brand,
    i.item_thumbnail_img,
    ic.item_category_name                   -- 카테고리명 추가
FROM bid b
JOIN member m      ON b.bidder_idx     = m.mem_idx
JOIN bid_status bs ON b.bid_status_idx = bs.bid_status_idx
LEFT JOIN grade g  ON m.mem_grade_idx  = g.grade_idx
LEFT JOIN (
    SELECT bidder_idx, AVG(review_star) AS avg_rating
    FROM review
    WHERE review_is_deleted = 'N'
    GROUP BY bidder_idx
) r ON b.bidder_idx = r.bidder_idx
LEFT JOIN item i   ON b.item_idx       = i.item_idx
LEFT JOIN item_category ic ON i.item_category_idx = ic.item_category_idx;

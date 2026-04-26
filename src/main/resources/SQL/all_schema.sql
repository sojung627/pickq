/* ==========================================
   DATABASE 생성 및 선택
   ========================================== */

DROP DATABASE IF EXISTS final;
CREATE DATABASE IF NOT EXISTS final
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE final;

/* ==========================================
   RESET (DROP TABLES)
   ========================================== */

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS chatmessage;
DROP TABLE IF EXISTS chatroom;

DROP TABLE IF EXISTS member_penalty;

DROP TABLE IF EXISTS delivery;
DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS orders;

DROP TABLE IF EXISTS review;

DROP TABLE IF EXISTS reply;
DROP TABLE IF EXISTS board;
DROP TABLE IF EXISTS board_type;

DROP TABLE IF EXISTS bid;
DROP TABLE IF EXISTS bid_status;

DROP TABLE IF EXISTS auction;
DROP TABLE IF EXISTS auction_status;

DROP TABLE IF EXISTS item;
DROP TABLE IF EXISTS item_category;

DROP TABLE IF EXISTS member_addr;
DROP TABLE IF EXISTS member_profile;
DROP TABLE IF EXISTS member;

DROP TABLE IF EXISTS grade;
DROP TABLE IF EXISTS role;

SET FOREIGN_KEY_CHECKS = 1;



/* ==========================================
   0. 코드 테이블
   ========================================== */

-- 0-1) ROLE (권한 코드: 1 USER, 2 ADMIN)
CREATE TABLE role (
    role_idx   INT       	NOT NULL AUTO_INCREMENT COMMENT 'PK',
    role_name  VARCHAR(20)  NOT NULL COMMENT '권한 등급 명칭 (USER/ADMIN)',
    PRIMARY KEY (role_idx)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='권한 코드 테이블';

-- 0-2) GRADE (회원 등급 코드)
CREATE TABLE grade (
    grade_idx     INT          NOT NULL AUTO_INCREMENT COMMENT 'PK',
    grade_name    VARCHAR(20)  NOT NULL COMMENT '등급명 (basic/silver/gold/vip)',
    grade_credit  DOUBLE       NOT NULL COMMENT '신용도 기준 (평균 별점 등)',
    PRIMARY KEY (grade_idx)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='회원 등급 코드 테이블';

-- 0-3) ITEM_CATEGORY (아이템 카테고리 코드)
CREATE TABLE item_category (
    item_category_idx   INT          NOT NULL AUTO_INCREMENT COMMENT 'PK',
    item_category_code  VARCHAR(50)  NOT NULL COMMENT '카테고리 코드 (BALL, RACKET 등)',
    item_category_name  VARCHAR(100) NOT NULL COMMENT '카테고리 이름 (구기 종목 등)',
    PRIMARY KEY (item_category_idx),
    UNIQUE KEY ux_item_category_code (item_category_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='아이템 카테고리 코드 테이블';

-- 0-4) AUCTION_STATUS (경매 상태 코드)
CREATE TABLE auction_status (
    auction_status_idx   INT          NOT NULL AUTO_INCREMENT COMMENT 'PK',
    auction_status_code  VARCHAR(50)  NOT NULL COMMENT '상태 코드 (open/closed/failed/canceled)',
    auction_status_name  VARCHAR(50)  NOT NULL COMMENT '한글 상태명 (진행중/마감/유찰/취소 등)',
    PRIMARY KEY (auction_status_idx),
    UNIQUE KEY ux_auction_status_code (auction_status_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='경매 상태 코드 테이블';

-- 0-5) BID_STATUS (입찰 상태 코드)
CREATE TABLE bid_status (
    bid_status_idx   INT          NOT NULL AUTO_INCREMENT COMMENT 'PK',
    bid_status_code  VARCHAR(50)  NOT NULL COMMENT '상태 코드 (normal/won/lost/canceled)',
    bid_status_name  VARCHAR(50)  NOT NULL COMMENT '한글 상태명 (일반/낙찰 등)',
    PRIMARY KEY (bid_status_idx),
    UNIQUE KEY ux_bid_status_code (bid_status_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='입찰 상태 코드 테이블';

-- 0-6) BOARD_TYPE (게시판 타입 코드)
CREATE TABLE board_type (
    board_type_idx    INT          NOT NULL AUTO_INCREMENT COMMENT 'PK',
    board_type_code   VARCHAR(50)  NOT NULL COMMENT '게시판 코드 (GOLF_BOARD 등)',
    board_type_name   VARCHAR(100) NOT NULL COMMENT '게시판 이름',
    board_can_comment CHAR(1)      NOT NULL DEFAULT 'Y' COMMENT 'Y / N 댓글 가능 여부',
    board_min_role    BIGINT       NOT NULL DEFAULT 1 COMMENT '최소 권한 (role_idx)',
    PRIMARY KEY (board_type_idx),
    UNIQUE KEY ux_board_type_code (board_type_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='게시판 타입 코드 테이블';



/* ==========================================
   1. 회원 관련
   ========================================== */

-- 1-1) MEMBER (회원 기본 정보)
CREATE TABLE member (
    mem_idx        BIGINT        NOT NULL AUTO_INCREMENT COMMENT 'PK',
    mem_id         VARCHAR(50)   NOT NULL COMMENT '로그인 ID',
    mem_pwd        VARCHAR(255)  NOT NULL COMMENT '비밀번호 해시',
    mem_name       VARCHAR(50)   DEFAULT NULL COMMENT '성명', 
    mem_tel        VARCHAR(20)   DEFAULT NULL COMMENT '전화번호',
    mem_email      VARCHAR(100)  DEFAULT NULL COMMENT '이메일',
    mem_ip         VARCHAR(100)  NOT NULL COMMENT 'IP 주소',
    mem_role_idx   INT        	 NOT NULL COMMENT 'FK → role.role_idx (권한 등급)',
    mem_grade_idx  INT           NOT NULL COMMENT 'FK → grade.grade_idx (신용도 등급)',
	mem_credit 	   INT 			 NOT NULL DEFAULT 50 COMMENT '신용 크레딧 점수',
	mem_penalty	   INT 			 NOT NULL DEFAULT 0 COMMENT '패널티 점수',
    mem_bday       DATE          DEFAULT NULL COMMENT '생일',
    mem_regdate    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '가입일',
    mem_is_deleted CHAR(1)       NOT NULL DEFAULT 'N' COMMENT 'Y / N (삭제 여부)',
    mem_deldate    DATETIME      DEFAULT NULL COMMENT '탈퇴일',
    mem_login_type VARCHAR(10)   DEFAULT NULL COMMENT 'LOCAL, NAVER',
    PRIMARY KEY (mem_idx),
    UNIQUE KEY ux_member_mem_id (mem_id),
    CONSTRAINT ck_member_is_deleted CHECK (mem_is_deleted IN ('Y','N')),
    CONSTRAINT ck_member_login_type CHECK (mem_login_type IN ('LOCAL','NAVER')),
    CONSTRAINT fk_member_role  FOREIGN KEY (mem_role_idx)  REFERENCES role(role_idx),
    CONSTRAINT fk_member_grade FOREIGN KEY (mem_grade_idx) REFERENCES grade(grade_idx)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='회원 기본 정보 테이블';

-- 1-2) MEMBER_PROFILE (회원 프로필)
CREATE TABLE member_profile (
    mem_idx       BIGINT        NOT NULL COMMENT 'PK & FK → member.mem_idx',
    mem_nickname  VARCHAR(50)   DEFAULT NULL COMMENT '닉네임',
    mem_intro     VARCHAR(255)  DEFAULT NULL COMMENT '자기소개',
    mem_img       VARCHAR(255)  DEFAULT NULL COMMENT '프로필 이미지',
    PRIMARY KEY (mem_idx),
    CONSTRAINT fk_profile_member
        FOREIGN KEY (mem_idx) REFERENCES member(mem_idx)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='회원 프로필 테이블';

-- 1-3) MEMBER_ADDR (회원 배송지)
CREATE TABLE member_addr (
    addr_idx        BIGINT        NOT NULL AUTO_INCREMENT COMMENT 'PK',
    mem_idx         BIGINT        NOT NULL COMMENT 'FK → member.mem_idx',
    mem_zipcode     VARCHAR(10)   DEFAULT NULL COMMENT '우편번호',
    mem_addr        VARCHAR(255)  DEFAULT NULL COMMENT '주소',
    mem_addr_detail VARCHAR(255)  DEFAULT NULL COMMENT '상세 주소',
    is_primary      CHAR(1)       NOT NULL DEFAULT 'N' COMMENT 'Y / N 대표 주소 여부',
    PRIMARY KEY (addr_idx),
    KEY idx_member_addr_mem_idx (mem_idx),
    CONSTRAINT ck_addr_is_primary CHECK (is_primary IN ('Y','N')),
    CONSTRAINT fk_addr_member
        FOREIGN KEY (mem_idx) REFERENCES member(mem_idx)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='회원 배송지 테이블';


/* ==========================================
   2. 아이템 / 카테고리
   ========================================== */

-- 2-1) ITEM (아이템)
CREATE TABLE item (
    item_idx           BIGINT        NOT NULL AUTO_INCREMENT COMMENT 'PK',
    item_name          VARCHAR(200)  NOT NULL COMMENT '상품명',
    item_category_idx  INT           NOT NULL COMMENT 'FK → item_category',
    item_brand         VARCHAR(100)  DEFAULT NULL COMMENT '브랜드',
    item_condition     VARCHAR(50)   NOT NULL COMMENT '상태 (NEW / USED_A / USED_B 등)',
    item_thumbnail_img VARCHAR(255)  DEFAULT NULL COMMENT '썸네일 이미지',
    item_detail_img    VARCHAR(255)  DEFAULT NULL COMMENT '상세 이미지',
    item_regdate       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
    item_is_deleted    CHAR(1)       NOT NULL DEFAULT 'N' COMMENT 'Y / N',
    PRIMARY KEY (item_idx),
    KEY idx_item_category (item_category_idx),
    CONSTRAINT ck_item_is_deleted CHECK (item_is_deleted IN ('Y','N')),
    CONSTRAINT fk_item_item_category
        FOREIGN KEY (item_category_idx) REFERENCES item_category(item_category_idx)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='아이템 테이블';



/* ==========================================
   3. 역경매 / 입찰
   ========================================== */

-- 3-1) AUCTION (역경매 요청) 
CREATE TABLE auction (
    auction_idx               BIGINT        NOT NULL AUTO_INCREMENT COMMENT 'PK',
    buyer_idx                 BIGINT        NOT NULL COMMENT 'FK → member.mem_idx (구매자)',
    item_category_idx         INT           NOT NULL COMMENT 'FK → item_category',
    auction_thumbnail_img     VARCHAR(200)  DEFAULT NULL COMMENT '경매 썸네일',
    auction_title             VARCHAR(200)  NOT NULL COMMENT '경매 제목',
    auction_desc              TEXT          NOT NULL COMMENT '경매 설명',
    auction_target_price      BIGINT        DEFAULT NULL COMMENT '희망 최대가 (nullable)',
    auction_view_count        BIGINT        NOT NULL DEFAULT 0 COMMENT '조회수',
    auction_start_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '경매 시작일시',
    auction_end_at            DATETIME      NOT NULL COMMENT '입찰 마감일시',
    auction_decision_deadline DATETIME      NOT NULL COMMENT '결정 마감일',
    auction_status_idx        INT           NOT NULL COMMENT 'FK → auction_status',
    auction_regdate           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
    auction_moddate           DATETIME      DEFAULT NULL COMMENT '수정일',
    auction_is_deleted        CHAR(1)       NOT NULL DEFAULT 'N' COMMENT 'Y/N',
    auction_deldate           DATETIME      DEFAULT NULL COMMENT '삭제일',
    PRIMARY KEY (auction_idx),
    KEY idx_auction_buyer (buyer_idx),
    KEY idx_auction_item_category (item_category_idx),
    KEY idx_auction_status (auction_status_idx),
    CONSTRAINT ck_auction_is_deleted CHECK (auction_is_deleted IN ('Y','N')),
    CONSTRAINT fk_auction_buyer
        FOREIGN KEY (buyer_idx) REFERENCES member(mem_idx) ON DELETE CASCADE,
    CONSTRAINT fk_auction_item_category
        FOREIGN KEY (item_category_idx) REFERENCES item_category(item_category_idx),
    CONSTRAINT fk_auction_status
        FOREIGN KEY (auction_status_idx) REFERENCES auction_status(auction_status_idx)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='역경매 요청 테이블';

-- 3-2) BID (입찰)
CREATE TABLE bid (
    bid_idx           BIGINT        NOT NULL AUTO_INCREMENT COMMENT 'PK',
    auction_idx       BIGINT        NOT NULL COMMENT 'FK → auction',
    bidder_idx        BIGINT        NOT NULL COMMENT 'FK → member (입찰자)',
    item_idx          BIGINT        NOT NULL COMMENT 'FK → item (실제 제안 상품)',
    bid_price         BIGINT        NOT NULL COMMENT '제안 가격',
    bid_quantity      INT           NOT NULL DEFAULT 1 COMMENT '수량',
    bid_message       LONGTEXT		DEFAULT NULL COMMENT '제안 조건/설명',
    bid_status_idx    INT           NOT NULL COMMENT 'FK → bid_status',
    bid_regdate       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
    bid_moddate       DATETIME      DEFAULT NULL COMMENT '수정/취소일',
    PRIMARY KEY (bid_idx),
    KEY idx_bid_auction (auction_idx),
    KEY idx_bid_bidder (bidder_idx),
    KEY idx_bid_item (item_idx),
    KEY idx_bid_status (bid_status_idx),
    CONSTRAINT fk_bid_auction
        FOREIGN KEY (auction_idx) REFERENCES auction(auction_idx) ON DELETE CASCADE,
    CONSTRAINT fk_bid_bidder
        FOREIGN KEY (bidder_idx) REFERENCES member(mem_idx) ON DELETE CASCADE,
    CONSTRAINT fk_bid_item
        FOREIGN KEY (item_idx) REFERENCES item(item_idx),
    CONSTRAINT fk_bid_status
        FOREIGN KEY (bid_status_idx) REFERENCES bid_status(bid_status_idx)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='입찰 테이블'; 


/* ==========================================
   4. 리뷰 (review)
   ========================================== */
CREATE TABLE review (
    review_idx        BIGINT        NOT NULL AUTO_INCREMENT COMMENT 'PK',

    buyer_idx         BIGINT        NOT NULL COMMENT '구매자 (FK → member.mem_idx)',
    bidder_idx        BIGINT        NOT NULL COMMENT '판매자/입찰자 (FK → member.mem_idx)',
    
    auction_idx       BIGINT        NOT NULL COMMENT 'FK → auction', 
    bid_idx           BIGINT        NOT NULL COMMENT 'FK → bid (선택된 입찰)',

    review_title      VARCHAR(200)  NOT NULL COMMENT '리뷰 제목',
    review_content    TEXT          NOT NULL COMMENT '리뷰 내용 (20자 이상 - db말고 컨트롤러에서 조건줄 것!)',
    review_star       INT           NOT NULL COMMENT '1~5점',

    review_regdate    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '작성일',

    review_is_deleted CHAR(1)       NOT NULL DEFAULT 'N', 
    review_deldate    DATETIME      DEFAULT NULL,

    PRIMARY KEY (review_idx),

    KEY idx_review_buyer (buyer_idx),
    KEY idx_review_bidder (bidder_idx),
    KEY idx_review_auction (auction_idx),
    KEY idx_review_bid (bid_idx),

    -- 한 거래당 하나씩 리뷰 남기기! (같은 사람에게 여러번 리뷰 남기는건 가능 / 같은 거래에 중복 리뷰 불가능)
    UNIQUE KEY ux_review_unique (bid_idx), 

    -- 별점 제한 (1 ~ 5)
    CONSTRAINT ck_review_star CHECK (review_star BETWEEN 1 AND 5),

    -- 삭제 여부 (기본은 N)
    CONSTRAINT ck_review_is_deleted CHECK (review_is_deleted IN ('Y','N')),

    -- FK
    CONSTRAINT fk_review_buyer
        FOREIGN KEY (buyer_idx) REFERENCES member(mem_idx) ON DELETE CASCADE,

    CONSTRAINT fk_review_bidder
        FOREIGN KEY (bidder_idx) REFERENCES member(mem_idx) ON DELETE CASCADE,

    CONSTRAINT fk_review_auction
        FOREIGN KEY (auction_idx) REFERENCES auction(auction_idx) ON DELETE CASCADE,

    CONSTRAINT fk_review_bid
        FOREIGN KEY (bid_idx) REFERENCES bid(bid_idx) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='리뷰 테이블';


/* ==========================================
   4. 커뮤니티 (게시판 / 댓글)
   ========================================== */

-- 4-1) BOARD (게시글)
CREATE TABLE board (
    board_idx        BIGINT        NOT NULL AUTO_INCREMENT COMMENT 'PK',
    mem_idx          BIGINT        NOT NULL COMMENT 'FK → member.mem_idx',
    board_title      VARCHAR(200)  NOT NULL COMMENT '제목',
    board_content    TEXT          DEFAULT NULL COMMENT '내용',
    board_ip         VARCHAR(40)   NOT NULL COMMENT 'IP',
    board_thumbnail  VARCHAR(200)  DEFAULT NULL COMMENT '썸네일',
    board_view_count BIGINT        NOT NULL DEFAULT 0 COMMENT '조회수',
    board_like       INT         NOT NULL DEFAULT 0 COMMENT '좋아요',
    board_type_idx   INT           NOT NULL COMMENT 'FK → board_type.board_type_idx',
    board_regdate    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
    board_moddate    DATETIME      DEFAULT NULL COMMENT '수정일',
    board_is_deleted CHAR(1)       NOT NULL DEFAULT 'N' COMMENT 'Y / N',
    board_deldate    DATETIME      DEFAULT NULL COMMENT '삭제일',
    PRIMARY KEY (board_idx),
    KEY idx_board_mem (mem_idx),
    KEY idx_board_board_type (board_type_idx),
    CONSTRAINT ck_board_is_deleted CHECK (board_is_deleted IN ('Y','N')),
    CONSTRAINT fk_board_member
        FOREIGN KEY (mem_idx) REFERENCES member(mem_idx)
        ON DELETE CASCADE,
    CONSTRAINT fk_board_board_type
        FOREIGN KEY (board_type_idx) REFERENCES board_type(board_type_idx)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='게시글 테이블';

-- 4-2) REPLY (댓글)
CREATE TABLE reply (
    reply_idx        BIGINT         NOT NULL AUTO_INCREMENT COMMENT 'PK',
    board_idx        BIGINT         NOT NULL COMMENT 'FK → board.board_idx',
    mem_idx          BIGINT         NOT NULL COMMENT 'FK → member.mem_idx',
    reply_content    VARCHAR(1000)  DEFAULT NULL COMMENT '댓글 내용',
    reply_ip         VARCHAR(40)    DEFAULT NULL COMMENT 'IP',
    reply_like       INT            NOT NULL DEFAULT 0 COMMENT '좋아요',
    reply_regdate    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
    reply_moddate    DATETIME       DEFAULT NULL COMMENT '수정일',
    reply_is_deleted CHAR(1)        NOT NULL DEFAULT 'N' COMMENT 'Y / N',
    reply_deldate    DATETIME       DEFAULT NULL COMMENT '삭제일',
    reply_ref        INT            NOT NULL COMMENT '원댓',
    reply_step       INT            DEFAULT NULL COMMENT '댓글 순서',
    reply_depth      INT            DEFAULT NULL COMMENT '댓글 깊이',
    PRIMARY KEY (reply_idx),
    KEY idx_reply_board (board_idx),
    KEY idx_reply_mem (mem_idx),
    KEY idx_reply_ref (reply_ref),
    CONSTRAINT ck_reply_is_deleted CHECK (reply_is_deleted IN ('Y','N')),
    CONSTRAINT fk_reply_board
        FOREIGN KEY (board_idx) REFERENCES board(board_idx)
        ON DELETE CASCADE,
    CONSTRAINT fk_reply_member
        FOREIGN KEY (mem_idx)  REFERENCES member(mem_idx)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='댓글 테이블';


/* ==========================================
   5. 패널티 (추가기능)
   ========================================== */

CREATE TABLE member_penalty (
    penalty_idx      BIGINT       NOT NULL AUTO_INCREMENT COMMENT 'PK',
    mem_idx          BIGINT       NOT NULL COMMENT 'FK → member.mem_idx (패널티 받은 회원)',
    auction_idx      BIGINT       DEFAULT NULL COMMENT '관련 경매 FK → auction.auction_idx',
    bid_idx          BIGINT       DEFAULT NULL COMMENT '관련 입찰 FK → bid.bid_idx',
    penalty_code     VARCHAR(50)  NOT NULL COMMENT '패널티 코드 (e.g. NO_PAYMENT, NO_SHIPMENT, LATE_CANCEL)',
    penalty_reason   VARCHAR(255) DEFAULT NULL COMMENT '추가 설명(운영자 메모 등)',
    penalty_score    INT          NOT NULL DEFAULT 1 COMMENT '패널티 점수/카운트 (보통 1로 고정 후 누적)',
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '부과 일시',
    PRIMARY KEY (penalty_idx),
    KEY idx_penalty_mem (mem_idx),
    KEY idx_penalty_auction (auction_idx),
    KEY idx_penalty_bid (bid_idx),
    CONSTRAINT fk_penalty_member
        FOREIGN KEY (mem_idx) REFERENCES member(mem_idx) ON DELETE CASCADE,
    CONSTRAINT fk_penalty_auction
        FOREIGN KEY (auction_idx) REFERENCES auction(auction_idx) ON DELETE SET NULL,
    CONSTRAINT fk_penalty_bid
        FOREIGN KEY (bid_idx) REFERENCES bid(bid_idx) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='회원 패널티 이력 테이블';

/* ==========================================
   6. 결제 관련 (수정본)
   ========================================== */

CREATE TABLE payment (
    pay_idx          BIGINT        NOT NULL AUTO_INCREMENT COMMENT 'PK',
    bid_idx          BIGINT        NOT NULL COMMENT 'FK → bid.bid_idx (낙찰 정보)',
    mem_idx          BIGINT        NOT NULL COMMENT 'FK → member.mem_idx (구매자)',
    
    -- 결제 식별 정보 (토스페이먼츠 기준)
    payment_key      VARCHAR(255)  NOT NULL COMMENT '토스 결제 고유 키 (승인/취소 시 사용)',
    order_id         VARCHAR(255)  NOT NULL COMMENT '우리 시스템 주문번호 (UUID 등)',
    
    -- 결제 금액 및 수단
    pay_method       VARCHAR(100)  NOT NULL COMMENT '결제 수단 (카드, 가상계좌, 간편결제 등)',
    pay_amount       BIGINT        NOT NULL COMMENT '실제 결제 금액',
    pay_status       VARCHAR(20)   NOT NULL DEFAULT 'READY'
                     COMMENT '결제 상태 (READY, DONE, CONFIRMED, CANCELED, EXPIRED)',

    -- 배송지 정보 스냅샷
    buyer_name       VARCHAR(50)   NOT NULL COMMENT '수령인 성함',
    buyer_tel        VARCHAR(20)   NOT NULL COMMENT '수령인 연락처',
    buyer_addr       VARCHAR(500)  NOT NULL COMMENT '배송지 주소',
    buyer_zipcode    VARCHAR(20)   NOT NULL COMMENT '우편번호',
    pay_regdate      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '결제 완료 일시',
    confirmed_at     DATETIME      NULL COMMENT '구매 확정 일시',
    canceled_at      DATETIME      NULL COMMENT '결제 취소 일시',

    PRIMARY KEY (pay_idx),
    UNIQUE KEY ux_payment_key (payment_key),
    UNIQUE KEY ux_order_id (order_id),
    CONSTRAINT fk_payment_bid    FOREIGN KEY (bid_idx) REFERENCES bid(bid_idx),
    CONSTRAINT fk_payment_buyer  FOREIGN KEY (mem_idx) REFERENCES member(mem_idx)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='결제 상세 정보 테이블';

-- delivery 테이블 새로 생성
CREATE TABLE delivery (
    delivery_idx     BIGINT        NOT NULL AUTO_INCREMENT COMMENT 'PK',
    pay_idx          BIGINT        NOT NULL COMMENT 'FK → payment.pay_idx',
    bid_idx          BIGINT        NOT NULL COMMENT 'FK → bid.bid_idx',
    courier_company  VARCHAR(50)   NULL COMMENT '택배사',
    tracking_number  VARCHAR(100)  NULL COMMENT '운송장번호',
    shipped_at       DATETIME      NULL COMMENT '발송일시',
    delivered_at     DATETIME      NULL COMMENT '배송완료일시',
    delivery_status  VARCHAR(20)   NOT NULL DEFAULT 'READY'
                     COMMENT '배송 상태 (READY, SHIPPING, DELIVERED)',
    PRIMARY KEY (delivery_idx),
    CONSTRAINT fk_delivery_payment FOREIGN KEY (pay_idx) REFERENCES payment(pay_idx),
    CONSTRAINT fk_delivery_bid     FOREIGN KEY (bid_idx) REFERENCES bid(bid_idx)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='배송 정보 테이블';

-- 거래 마스터용 vo
CREATE TABLE orders (
    order_idx       BIGINT      NOT NULL AUTO_INCREMENT COMMENT 'PK',
    
    -- 어떤 거래인지 식별 (경매 + 입찰 + 양 당사자)
    auction_idx     BIGINT      NOT NULL COMMENT 'FK auction.auctionidx',
    bid_idx         BIGINT      NOT NULL COMMENT 'FK bid.bididx',
    buyer_idx       BIGINT      NOT NULL COMMENT 'FK member.memidx (구매자)',
    seller_idx      BIGINT      NOT NULL COMMENT 'FK member.memidx (판매자)',

    -- 거래 금액 (낙찰가 스냅샷)
    order_amount    BIGINT      NOT NULL COMMENT '주문 금액(낙찰가)',

    -- 거래 전체의 상태 (메인 타임라인)
    order_status    VARCHAR(20) NOT NULL COMMENT 'CREATED, PAID, SHIPPED, CONFIRMED, CANCELED',

    -- 정산 여부
    is_settled      CHAR(1)     NOT NULL DEFAULT 'N' COMMENT '정산 여부 Y/N',

    -- 중요한 시점만 요약 (상세 시간/값은 payment, delivery에 있음)
    order_regdate   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '주문 생성일',
    paid_at         DATETIME    DEFAULT NULL COMMENT '결제 완료 일시',
    shipped_at      DATETIME    DEFAULT NULL COMMENT '배송 시작 일시',
    confirmed_at    DATETIME    DEFAULT NULL COMMENT '구매 확정 일시',
    refund_at       DATETIME    DEFAULT NULL COMMENT '환불 일시',

    PRIMARY KEY (order_idx),

    KEY idx_order_auction  (auction_idx),
    KEY idx_order_bid      (bid_idx),
    KEY idx_order_buyer    (buyer_idx),
    KEY idx_order_seller   (seller_idx),
    UNIQUE KEY ux_order_bid (bid_idx),

    CONSTRAINT fk_order_auction FOREIGN KEY (auction_idx)
        REFERENCES auction(auction_idx) ON DELETE CASCADE,
    CONSTRAINT fk_order_bid FOREIGN KEY (bid_idx)
        REFERENCES bid(bid_idx),
    CONSTRAINT fk_order_buyer FOREIGN KEY (buyer_idx)
        REFERENCES member(mem_idx) ON DELETE CASCADE,
    CONSTRAINT fk_order_seller FOREIGN KEY (seller_idx)
        REFERENCES member(mem_idx) ON DELETE CASCADE,

    CONSTRAINT ck_order_is_settled CHECK (is_settled IN ('Y','N')),
    CONSTRAINT ck_order_status CHECK (order_status IN ('CREATED','PAID','SHIPPED','CONFIRMED','CANCELED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='역경매 주문/거래 마스터';

/* ==========================================
   채팅 관련 (추가기능)
   ========================================== */
   
   CREATE TABLE chatroom (
    chatroom_idx   BIGINT      NOT NULL AUTO_INCREMENT COMMENT 'PK',
    auction_idx    BIGINT      NOT NULL COMMENT 'FK auction.auctionidx',
    buyer_idx      BIGINT      NOT NULL COMMENT 'FK member.memidx (구매자)',
    bidder_idx     BIGINT      NOT NULL COMMENT 'FK member.memidx (입찰자)',
    created_at     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '방 생성 시각',
    PRIMARY KEY (chatroom_idx),
    UNIQUE KEY ux_chatroom_unique (auction_idx, buyer_idx, bidder_idx),
    KEY idx_chatroom_auction (auction_idx),
    KEY idx_chatroom_buyer (buyer_idx),
    KEY idx_chatroom_bidder (bidder_idx),
    CONSTRAINT fk_chatroom_auction
        FOREIGN KEY (auction_idx) REFERENCES auction(auction_idx)
        ON DELETE CASCADE,
    CONSTRAINT fk_chatroom_buyer
        FOREIGN KEY (buyer_idx) REFERENCES member(mem_idx)
        ON DELETE CASCADE,
    CONSTRAINT fk_chatroom_bidder
        FOREIGN KEY (bidder_idx) REFERENCES member(mem_idx)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='경매별 1:1 채팅방';

CREATE TABLE chatmessage (
    message_idx    BIGINT      NOT NULL AUTO_INCREMENT COMMENT 'PK',
    chatroom_idx   BIGINT      NOT NULL COMMENT 'FK chatroom.chatroom_idx',
    sender_idx     BIGINT      NOT NULL COMMENT 'FK member.memidx',
    message_content VARCHAR(1000) NOT NULL COMMENT '메시지 내용',
    sent_at        DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '보낸 시각',
    is_read        CHAR(1)     NOT NULL DEFAULT 'N' COMMENT '읽음 여부 Y/N',
    read_at        DATETIME    DEFAULT NULL COMMENT '읽은 시각',
    PRIMARY KEY (message_idx),
    KEY idx_chatmessage_room (chatroom_idx),
    KEY idx_chatmessage_sender (sender_idx),
    KEY idx_chatmessage_unread (is_read),
    CONSTRAINT ck_chatmessage_is_read CHECK (is_read IN ('Y', 'N')),
    CONSTRAINT fk_chatmessage_room
        FOREIGN KEY (chatroom_idx) REFERENCES chatroom(chatroom_idx)
        ON DELETE CASCADE,
    CONSTRAINT fk_chatmessage_sender
        FOREIGN KEY (sender_idx) REFERENCES member(mem_idx)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='채팅 메시지';

CREATE TABLE notification (
    notification_idx     BIGINT        NOT NULL AUTO_INCREMENT COMMENT 'PK',
    receiver_idx         BIGINT        NOT NULL COMMENT '알림 수신자 FK → member.mem_idx',
    sender_idx           BIGINT        DEFAULT NULL COMMENT '알림 발생시킨 회원 FK → member.mem_idx',

    auction_idx          BIGINT        DEFAULT NULL COMMENT '관련 경매 FK → auction.auction_idx',
    bid_idx              BIGINT        DEFAULT NULL COMMENT '관련 입찰 FK → bid.bid_idx',
    board_idx            BIGINT        DEFAULT NULL COMMENT '관련 게시글 FK → board.board_idx',
    reply_idx            BIGINT        DEFAULT NULL COMMENT '관련 댓글 FK → reply.reply_idx',

    notification_type    VARCHAR(50)   NOT NULL COMMENT 'AUCTION_..., TRADE_..., BOARD_... 등',
    notification_title   VARCHAR(200)  NOT NULL COMMENT '알림 제목/요약',
    notification_message VARCHAR(500)  NOT NULL COMMENT '알림 상세 내용',
    target_url           VARCHAR(255)  DEFAULT NULL COMMENT '클릭 시 이동 URL',

    is_read              CHAR(1)       NOT NULL DEFAULT 'N' COMMENT '읽음 여부 Y/N',
    created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    read_at              DATETIME      DEFAULT NULL COMMENT '읽은 시각',

    PRIMARY KEY (notification_idx),

    KEY idx_notification_receiver (receiver_idx),
    KEY idx_notification_sender (sender_idx),
    KEY idx_notification_auction (auction_idx),
    KEY idx_notification_bid (bid_idx),
    KEY idx_notification_board (board_idx),
    KEY idx_notification_reply (reply_idx),

    CONSTRAINT ck_notification_is_read
        CHECK (is_read IN ('Y','N'))
    
    -- FK들은 지금 바로 걸어도 되고, 개발 속도 생각해서 나중에 alter table로 추가해도 됨
    -- CONSTRAINT fk_notification_receiver
    --     FOREIGN KEY (receiver_idx) REFERENCES member(mem_idx) ON DELETE CASCADE,
    -- CONSTRAINT fk_notification_sender
    --     FOREIGN KEY (sender_idx)  REFERENCES member(mem_idx) ON DELETE SET NULL,
    -- CONSTRAINT fk_notification_auction
    --     FOREIGN KEY (auction_idx) REFERENCES auction(auction_idx) ON DELETE CASCADE,
    -- CONSTRAINT fk_notification_bid
    --     FOREIGN KEY (bid_idx)     REFERENCES bid(bid_idx) ON DELETE CASCADE,
    -- CONSTRAINT fk_notification_board
    --     FOREIGN KEY (board_idx)   REFERENCES board(board_idx) ON DELETE CASCADE,
    -- CONSTRAINT fk_notification_reply
    --     FOREIGN KEY (reply_idx)   REFERENCES reply(reply_idx) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='알림 테이블';

/* ==========================================
   7. 코드 테이블 기본 데이터
   ========================================== */

-- 7-1) ROLE 코드 (1 USER, 2 ADMIN)
INSERT INTO role (role_idx, role_name) VALUES (1, 'USER');
INSERT INTO role (role_idx, role_name) VALUES (2, 'ADMIN');

-- 7-2) GRADE 코드
INSERT INTO grade (grade_idx, grade_name, grade_credit) VALUES (1, 'normal',  0);
INSERT INTO grade (grade_idx, grade_name, grade_credit) VALUES (2, 'bronze',  500);
INSERT INTO grade (grade_idx, grade_name, grade_credit) VALUES (3, 'silver', 2000);
INSERT INTO grade (grade_idx, grade_name, grade_credit) VALUES (4, 'gold',   5000);
INSERT INTO grade (grade_idx, grade_name, grade_credit) VALUES (5, 'vip',    10000);

-- 7-3) ITEM_CATEGORY 코드
INSERT INTO item_category (item_category_idx, item_category_code, item_category_name)
VALUES (1, 'ball',        '공/볼');

INSERT INTO item_category (item_category_idx, item_category_code, item_category_name)
VALUES (2, 'racket',      '라켓/배트/클럽');

INSERT INTO item_category (item_category_idx, item_category_code, item_category_name)
VALUES (3, 'protective',  '보호대/보호장비');

INSERT INTO item_category (item_category_idx, item_category_code, item_category_name)
VALUES (4, 'apparel',     '의류/신발');

INSERT INTO item_category (item_category_idx, item_category_code, item_category_name)
VALUES (5, 'fitness',     '헬스/홈트 용품');

INSERT INTO item_category (item_category_idx, item_category_code, item_category_name)
VALUES (6, 'outdoor',     '아웃도어/캠핑 스포츠');

INSERT INTO item_category (item_category_idx, item_category_code, item_category_name)
VALUES (7, 'swim',        '수영/수상 스포츠 용품');

INSERT INTO item_category (item_category_idx, item_category_code, item_category_name)
VALUES (8, 'accessory',   '액세서리/잡화');


-- 7-4) AUCTION_STATUS 코드
INSERT INTO auction_status (auction_status_idx, auction_status_code, auction_status_name)
VALUES (1, 'open','진행중');
INSERT INTO auction_status (auction_status_idx, auction_status_code, auction_status_name)
VALUES (2, 'decide','결정대기중');
INSERT INTO auction_status (auction_status_idx, auction_status_code, auction_status_name)
VALUES (3, 'closed','마감');
INSERT INTO auction_status (auction_status_idx, auction_status_code, auction_status_name)
VALUES (4, 'failed','유찰');
INSERT INTO auction_status (auction_status_idx, auction_status_code, auction_status_name)
VALUES (5, 'canceled','취소');
INSERT INTO auction_status (auction_status_idx, auction_status_code, auction_status_name)
VALUES (6, 'deleted','삭제됨');

-- 7-5) BID_STATUS 코드
INSERT INTO bid_status (bid_status_idx, bid_status_code, bid_status_name)
VALUES (1, 'normal',   '일반');
INSERT INTO bid_status (bid_status_idx, bid_status_code, bid_status_name)
VALUES (2, 'won',      '낙찰');
INSERT INTO bid_status (bid_status_idx, bid_status_code, bid_status_name)
VALUES (3, 'lost',     '실패');
INSERT INTO bid_status (bid_status_idx, bid_status_code, bid_status_name)
VALUES (4, 'canceled', '취소');
INSERT INTO bid_status (bid_status_idx, bid_status_code, bid_status_name)
VALUES (5, 'deleted', '삭제됨');

-- 7-6) BOARD_TYPE 코드
INSERT INTO board_type (board_type_idx, board_type_code, board_type_name, board_can_comment, board_min_role)
VALUES (1,  'soccer',    '축구',     'Y', 1);
INSERT INTO board_type (board_type_idx, board_type_code, board_type_name, board_can_comment, board_min_role)
VALUES (2,  'baseball',  '야구',     'Y', 1);
INSERT INTO board_type (board_type_idx, board_type_code, board_type_name, board_can_comment, board_min_role)
VALUES (3,  'basketball','농구',     'Y', 1);
INSERT INTO board_type (board_type_idx, board_type_code, board_type_name, board_can_comment, board_min_role)
VALUES (4,  'golf',      '골프',     'Y', 1);
INSERT INTO board_type (board_type_idx, board_type_code, board_type_name, board_can_comment, board_min_role)
VALUES (5,  'ski',       '스키',     'Y', 1);
INSERT INTO board_type (board_type_idx, board_type_code, board_type_name, board_can_comment, board_min_role)
VALUES (6,  'tennis',    '테니스',   'Y', 1);
INSERT INTO board_type (board_type_idx, board_type_code, board_type_name, board_can_comment, board_min_role)
VALUES (7,  'badminton', '배드민턴', 'Y', 1);
INSERT INTO board_type (board_type_idx, board_type_code, board_type_name, board_can_comment, board_min_role)
VALUES (8,  'tabletennis','탁구',    'Y', 1);
INSERT INTO board_type (board_type_idx, board_type_code, board_type_name, board_can_comment, board_min_role)
VALUES (9,  'running',   '러닝',     'Y', 1);
INSERT INTO board_type (board_type_idx, board_type_code, board_type_name, board_can_comment, board_min_role)
VALUES (10, 'cycling',   '자전거',   'Y', 1);
INSERT INTO board_type (board_type_idx, board_type_code, board_type_name, board_can_comment, board_min_role)
VALUES (11, 'fitness',   '헬스',     'Y', 1);
INSERT INTO board_type (board_type_idx, board_type_code, board_type_name, board_can_comment, board_min_role)
VALUES (12, 'yoga',      '요가',     'Y', 1);
INSERT INTO board_type (board_type_idx, board_type_code, board_type_name, board_can_comment, board_min_role)
VALUES (13, 'pilates',   '필라테스', 'Y', 1);
INSERT INTO board_type (board_type_idx, board_type_code, board_type_name, board_can_comment, board_min_role)
VALUES (14, 'aerobics',  '에어로빅', 'Y', 1);
INSERT INTO board_type (board_type_idx, board_type_code, board_type_name, board_can_comment, board_min_role)
VALUES (15, 'swimming',  '수영',     'Y', 1);


USE final;

/* ==========================================
   1) MEMBER (관리자 1 + 유저 9)
   ========================================== */

INSERT INTO member (
    mem_id, mem_pwd, mem_name, mem_tel, mem_email,
    mem_ip, mem_role_idx, mem_grade_idx, mem_bday
) VALUES
('admin', 'admin', '관리자', '010-0000-0000', 'admin01@test.com',
 '127.0.0.1', 2, 5, '1990-01-01'),

('user01', '1234', '유저01', '010-1111-1111', 'user01@test.com',
 '127.0.0.1', 1, 1, '1993-01-01'),
('user02', '1234', '유저02', '010-2222-2222', 'user02@test.com',
 '127.0.0.1', 1, 1, '1993-02-01'),
('user03', '1234', '유저03', '010-3333-3333', 'user03@test.com',
 '127.0.0.1', 1, 2, '1993-03-01'),
('user04', '1234', '유저04', '010-4444-4444', 'user04@test.com',
 '127.0.0.1', 1, 2, '1993-04-01'),
('user05', '1234', '유저05', '010-5555-5555', 'user05@test.com',
 '127.0.0.1', 1, 3, '1993-05-01'),
('user06', '1234', '유저06', '010-6666-6666', 'user06@test.com',
 '127.0.0.1', 1, 3, '1993-06-01'),
('user07', '1234', '유저07', '010-7777-7777', 'user07@test.com',
 '127.0.0.1', 1, 1, '1993-07-01'),
('user08', '1234', '유저08', '010-8888-8888', 'user08@test.com',
 '127.0.0.1', 1, 2, '1993-08-01'),
('user09', '1234', '유저09', '010-9999-9999', 'user09@test.com',
 '127.0.0.1', 1, 4, '1993-09-01');

 /* ==========================================
   BOARD 더미
   ========================================== */

INSERT INTO board (
    mem_idx, board_title, board_content, board_ip,
    board_thumbnail, board_view_count, board_type_idx
) VALUES
-- 축구(1)
(3, '주말 풋살 같이 하실 분 계신가요?', 
 '대구 남구 쪽에서 주말 저녁에 풋살 같이 할 팀 찾고 있습니다.\n실력보단 재밌게 뛰는 분위기 좋아요. 20~30대 위주면 좋겠습니다.', 
 '127.0.0.1', NULL, 23, 1),
(3, '인조잔디 축구화 추천 좀 해주세요', 
 '인조잔디 구장에서만 뛰는데, 발볼 넓은 사람에게 잘 맞는 축구화 있을까요?\n가격은 10만원 전후 생각하고 있어요.', 
 '127.0.0.1', NULL, 15, 1),
(4, '초보도 센터백 해도 될까요?', 
 '동호회에서 센터백이 부족하다는데, 축구 완전 초보도 센터백 맡아도 괜찮을까요?\n포지션별 역할 잘 아시는 분 조언 부탁드립니다.', 
 '127.0.0.1', NULL, 9, 1),

-- 골프(4)
(2, '완전 초보인데 골프채 세트 어떤 걸로 시작해야 할까요?', 
 '골프 완전 처음인데 입문용 풀세트를 살지, 중고로 아이언만 맞춰갈지 고민 중입니다.\n예산은 70~100 정도 생각하고 있어요. 브랜드나 구성 추천 부탁드려요.', 
 '127.0.0.1', NULL, 32, 4),
(2, '스크린 골프 80대 진입하려면 연습 어떻게 해야 하나요?', 
 '현재 스크린 기준 90대 초반 꾸준히 나오고 있고, 드라이버는 그럭저럭인데 아이언이 문제입니다.\n효율적인 연습 루틴 추천해주실 분 계실까요?', 
 '127.0.0.1', NULL, 18, 4),
(2, '레슨 받을 때 이건 꼭 체크해라 하는 포인트 있을까요?', 
 '이제 레슨 시작하려고 하는데, 코치님한테 꼭 확인해야 할 포인트(자세, 빈스윙, 영상 촬영 등) 있으면 알려주세요.', 
 '127.0.0.1', NULL, 11, 4),

-- 러닝(9)
(1, '러닝크루 들어가볼까 하는데 어떠세요?', 
 '혼자 뛰다 보니 슬슬 동기부여가 떨어져서 러닝크루 가입을 고민 중입니다.\n처음 가면 어색하지는 않은지, 실력 차이 많이 나면 민폐인지 궁금합니다.', 
 '127.0.0.1', NULL, 27, 9),
(1, '10km 완주 목표인데 신발 추천 부탁드려요', 
 '지금은 그냥 캐주얼 운동화로 5km 정도만 가볍게 뛰고 있습니다.\n무릎 부담 덜한 러닝화 브랜드/모델 추천해주시면 감사하겠습니다.', 
 '127.0.0.1', NULL, 19, 9),
(1, '출퇴근 러닝 해보신 분 계세요?', 
 '회사까지 5km 정도 거리인데, 주 1~2회는 러닝으로 출퇴근 해볼까 고민 중입니다.\n샤워, 짐 보관 같은 현실적인 팁 알려주시면 좋겠어요.', 
 '127.0.0.1', NULL, 13, 9),

-- 자전거(10)
(9, '로드 입문인데 클릿페달 바로 가도 될까요?', 
 '자전거는 자출용 미니벨로만 타다가 이번에 로드를 하나 들이려고 합니다.\n클릿이 편하다고들 하는데, 입문자도 바로 적응 가능할까요?', 
 '127.0.0.1', NULL, 16, 10),
(9, '대구 근교 주말 라이딩 코스 추천 부탁드려요', 
 '주말에 40~60km 정도 타기 좋은 코스 있을까요?\n차少+풍경 좋은 코스면 더 좋습니다.', 
 '127.0.0.1', NULL, 21, 10),
(4, '헬멧/라이트 같은 자전거 안전장비 필수템 뭐가 있을까요?', 
 '자출을 시작해보려고 하는데, 헬멧 말고도 꼭 챙겨야 할 안전 장비들이 있을까요?', 
 '127.0.0.1', NULL, 8, 10),

-- 헬스(11)
(10, '3분할 운동 루틴 이렇게 짜도 괜찮을까요?', 
 '월: 가슴/삼두, 수: 등/이두, 금: 하체/어깨 이렇게 3분할로 생각 중입니다.\n헬린이라서 세트 수나 볼륨 감이 안 오는데 피드백 부탁드립니다.', 
 '127.0.0.1', NULL, 34, 11),
(10, 'PT 꼭 받아야 할까요? 혼자 유튜브 보고 해도 될지 고민입니다.', 
 '헬스장 등록만 해두고 제대로 못 가는 전형적인 3일 열정형입니다.\nPT 한 달 정도는 받아보는 게 나을까요, 아니면 그냥 프로그램만 짜서 혼자 해도 될까요?', 
 '127.0.0.1', NULL, 22, 11),
(10, '데드리프트 할 때 허리 통증… 자세 문제일까요?', 
 '무게를 많이 올린 건 아닌데, 데드하고 나면 허리가 뻐근하게 아픕니다.\n자세를 어떻게 점검해야 하는지 팁 있으면 알려주세요.', 
 '127.0.0.1', NULL, 17, 11),

-- 요가(12)
(7, '요가 초보인데 집에서 유튜브만으로 시작해도 될까요?', 
 '스트레칭 겸 요가를 해보고 싶은데, 요가원 다니기보다는 집에서 유튜브 보고 따라하는 걸로 시작해볼까 합니다.\n자세 교정이 안 되면 부상 위험이 있을까요?', 
 '127.0.0.1', NULL, 14, 12),
(7, '아침 요가 루틴 추천해주세요', 
 '출근 전에 10~15분 정도 할 수 있는 가벼운 요가 루틴 추천 부탁드립니다.\n허리랑 어깨가 자주 뭉치는 편입니다.', 
 '127.0.0.1', NULL, 9, 12),
(7, '명상 요가 해보신 분 계신가요?', 
 '요가랑 명상을 같이 하는 프로그램이 있던데, 실제로 해보신 분들 경험이 궁금합니다.\n집중력이나 수면에 도움이 되셨나요?', 
 '127.0.0.1', NULL, 7, 12),

-- 수영(15)
(8, '접영 배우고 싶은데 크롤이랑 평영만 할 줄 아는 상태입니다.', 
 '접영이 그렇게 힘들다는데도 궁금하네요.\n지금 단계에서 접영 배우는 게 무리일까요, 아니면 크롤/평영 더 다지고 가야 할까요?', 
 '127.0.0.1', NULL, 12, 15),
(8, '성인 수영 초급반 첫날에 보통 뭐 하나요?', 
 '수영 배우는 건 처음이라 옷부터 뭘 가져가야 할지 모르겠습니다.\n첫 수업 때 진행 방식이랑 준비물 알려주실 분 계신가요?', 
 '127.0.0.1', NULL, 20, 15),
(8, '오전/저녁 중 언제 수영하는 게 더 좋나요?', 
 '회사 다니면서 수영 병행해 보려고 하는데, 피곤함이나 컨디션 관리 측면에서 오전/저녁 중 뭐가 나을지 고민입니다.', 
 '127.0.0.1', NULL, 10, 15);

 
 /* ==========================================
   REPLY 더미
   ========================================== */

INSERT INTO reply (
    board_idx, mem_idx, reply_content, reply_ip,
    reply_is_deleted, reply_ref, reply_step, reply_depth
) VALUES
-- 골프 게시글 1번
(2, 1, '입문이시면 중고 풀세트 하나 구해서 1~2년 써보시고 기변하는 걸 추천드려요. 처음엔 브랜드보단 스윙 만드는 게 더 중요하더라구요.', 
 '127.0.0.1', 'N', 1, 1, 0),
(2, 10, '동의합니다. 드라이버/아이언 다 새 제품으로 맞추면 금방 후회할 수도 있어서, 중고로 무난한 브랜드부터 시작해 보세요.', 
 '127.0.0.1', 'N', 2, 2, 0),

-- 골프 게시글 2번(스크린 80대)
(3, 2, '아이언 정확도가 문제라면, 스크린보다는 연습장 가서 7번 아이언 하나로 거리/탄도 맞추는 연습만 한 달 해보셔도 체감이 올 거예요.', 
 '127.0.0.1', 'N', 3, 1, 0),
(3, 6, '필드보다 스크린 스코어가 잘 나오긴 하니까, 목표를 80대 초반이 아니라 90 꾸준히 유지부터 잡는 것도 좋아요. 꾸준함이 답입니다.', 
 '127.0.0.1', 'N', 4, 2, 0),

-- 러닝크루 고민 글
(7, 4, '러닝크루 이미 2년째 활동 중인데, 실력 차이 크게 신경 안 쓰셔도 됩니다. 본인 페이스대로 뛰도록 배려해주는 크루인지가 더 중요해요.', 
 '127.0.0.1', 'N', 5, 1, 0),
(7, 9, '처음엔 어색한데 두세 번만 나가면 금방 친해지더라구요. 단, 기록 위주 크루인지, 친목 위주인지 성격은 꼭 보고 들어가세요.', 
 '127.0.0.1', 'N', 6, 2, 0),

-- 러닝화 추천 글
(8, 3, '무릎 부담 줄이려면 쿠션 좋은 모델로 가는 게 좋아요. 아식스나 호카 같은 브랜드 입문용 많이들 쓰십니다.', 
 '127.0.0.1', 'N', 7, 1, 0),
(8, 1, '발볼 넓으시면 반 치수 크게 신거나, 실제 매장에서 꼭 신어보고 사세요. 온라인 후기만 믿고 사면 피곤해집니다 ㅠㅠ', 
 '127.0.0.1', 'N', 8, 2, 0),

-- 헬스 3분할 루틴 글
(13, 8, '3분할 구성이 무난하긴 한데, 어깨를 하체랑 같이 하면 생각보다 힘들 수 있어요. 하체/어깨를 나누거나, 어깨를 가슴날에 조금 섞어도 좋습니다.', 
 '127.0.0.1', 'N', 9, 1, 0),
(13, 10, '운동 시작한 지 얼마 안 되셨다면, 처음 한 달은 전신 루틴로 기본기 다지고 3분할로 넘어가는 것도 추천드립니다.', 
 '127.0.0.1', 'N', 10, 2, 0),

-- PT 고민 글
(14, 2, '본인이 스스로 루틴 짜서 꾸준히 할 수 있는 타입이면 PT 없이도 충분하지만, 전혀 감이 없으면 최소 10회 정도는 받아보시는 걸 추천해요.', 
 '127.0.0.1', 'N', 11, 1, 0),
(14, 7, '저는 PT 한 달 해보고, 동작만 익힌 다음에 혼자 운동 중인데 이 조합이 괜찮았어요. 무조건 PT or 노PT라기보다, 기간을 정해서 써보는 느낌이 좋더라구요.', 
 '127.0.0.1', 'N', 12, 2, 0),

-- 요가 집에서 시작 글
(16, 6, '완전 초보라면 처음 1~2개월은 요가원에서 기본 자세 배워두는 걸 추천드려요. 그 이후에 유튜브로 혼자 해도 훨씬 안전합니다.', 
 '127.0.0.1', 'N', 13, 1, 0),
(16, 1, '집에서 할 땐 무리해서 끝까지 따라가기보다, 통증 느껴지면 바로 풀어주는 게 중요해요. 특히 허리/목 조심하세요.', 
 '127.0.0.1', 'N', 14, 2, 0),

-- 수영 성인 초급반 글
(20, 5, '첫날에는 물 적응이랑 호흡 연습 정도만 하실 거라 너무 긴장 안 하셔도 됩니다. 수모, 수경, 수영복 정도만 준비하시면 돼요.', 
 '127.0.0.1', 'N', 15, 1, 0),
(20, 8, '샤워용 슬리퍼 하나 챙기시면 편하고, 귀에 물 자주 차는 편이면 귀마개도 있으면 좋아요.', 
 '127.0.0.1', 'N', 16, 2, 0);
 
 /* ==========================================
   ITEM 더미 데이터 (AUCTION/BID에서 참조하는 1~20번)
   ========================================== */

INSERT INTO item (
    item_name, item_category_idx, item_brand, item_condition,
    item_thumbnail_img, item_detail_img,
    item_is_deleted
) VALUES
-- 1~3: 러닝화 (카테고리 fitness = 5)
('10km 대회용 러닝화 - 쿠션 좋은 모델', 5, 'ASICS',  'USED_A', NULL, NULL, 'N'),
('경량 러닝화 - 전시 제품',                 5, 'NIKE',   'NEW',    NULL, NULL, 'N'),
('초보자용 러닝화 - 한 달 사용',            5, 'HOKA',   'USED_B', NULL, NULL, 'N'),

-- 4~6: 골프 아이언 세트 (racket = 2)
('중고 아이언 세트 - 사용감 있음',         2, 'Callaway',  'USED_B', NULL, NULL, 'N'),
('아이언 세트 - 거의 새 제품',             2, 'TaylorMade','USED_A', NULL, NULL, 'N'),
('연습용 아이언 세트',                     2, 'PING',      'USED_B', NULL, NULL, 'N'),

-- 7~8: 자전거 헬멧 (accessory = 8)
('로드용 헬멧 A - 한 시즌 사용',           8, 'GIRO',   'USED_A', NULL, NULL, 'N'),
('경량 로드 헬멧 B',                       8, 'KASK',   'USED_A', NULL, NULL, 'N'),

-- 9~11: 홈트 세트 관련 (fitness = 5)
('아령 세트 + 두꺼운 매트',                5, 'NoBrand', 'USED_A', NULL, NULL, 'N'),
('브랜드 홈트 세트',                       5, 'IFIT',    'USED_A', NULL, NULL, 'N'),
('가성비 홈트 세트',                       5, 'LOCAL',   'USED_B', NULL, NULL, 'N'),

-- 12~14: 수영 세트 (swim = 7)
('수영 입문 세트 A (수경+수모+수영복)',     7, 'Arena',  'NEW',    NULL, NULL, 'N'),
('수영 세트 B - 수경 사용감 있음',         7, 'Speedo', 'USED_A', NULL, NULL, 'N'),
('브랜드 수영 세트 C',                     7, 'Mizuno', 'USED_B', NULL, NULL, 'N'),

-- 15~16: 축구 스파이크 (ball = 1)
('인조잔디용 축구 스파이크 A',             1, 'Adidas', 'USED_A', NULL, NULL, 'N'),
('발볼 넓은 축구 스파이크 B',              1, 'Nike',   'USED_B', NULL, NULL, 'N'),

-- 17: 스키 세트 (outdoor = 6)
('스키 풀세트 (구형 장비)',                6, 'Rossignol', 'USED_B', NULL, NULL, 'N'),

-- 18: 요가 매트 (fitness = 5)
('두꺼운 요가 매트',                       5, 'Reebok', 'USED_A', NULL, NULL, 'N'),

-- 19: 리조트 숙박권 (accessory = 8)
('리조트 숙박권 1박',                      8, 'ResortX','NEW',   NULL, NULL, 'N'),

-- 20: 콘서트 티켓 (accessory = 8)
('콘서트 티켓 2장',                        8, 'Ticket','NEW',   NULL, NULL, 'N'),
 
 -- 공/볼 (카테고리 : 1번)
('프리미어리그 공인구 - 미개봉 새제품', 1, 'NIKE', 'NEW', '/images/ball_01.jpg', NULL, 'N'),
('KBL 공식 시합용 농구공', 1, 'Wilson', 'USED_A', '/images/ball_02.jpg', NULL, 'N'),

-- 액세서리/잡화 (카테고리 : 8번)
('대용량 스포츠 백팩 (신발주머니 포함)', 8, 'UnderArmour', 'USED_A', '/images/bag_01.jpg', NULL, 'N'),
('겨울철 야외 러닝용 스마트폰 터치 장갑', 8, 'Adidas', 'NEW', '/images/gloves_01.jpg', NULL, 'N');
 
 /* ==========================================
   AUCTION 더미 데이터 (10건)
   ========================================== */

INSERT INTO auction (
    buyer_idx, item_category_idx,
    auction_title, auction_desc,
    auction_target_price, auction_view_count,
    auction_start_at, auction_end_at, auction_decision_deadline,
    auction_status_idx,
    auction_regdate, auction_moddate,
    auction_is_deleted, auction_deldate
) VALUES
-- 1. 진행중 경매 (open) - 러닝화
(1, 4,
 '10km 대회용 러닝화 추천받습니다',
 '10km 대회 출전 예정이라, 초보 러너에게 맞는 쿠션 좋은 러닝화 추천받고 싶습니다.',
 150000, 35,
 NOW() - INTERVAL 1 DAY,
 NOW() + INTERVAL 3 DAY,
 NOW() + INTERVAL 5 DAY,
 1,
 NOW() - INTERVAL 1 DAY, NULL,
 'N', NULL),

-- 2. 진행중 경매 (open) - 골프 아이언
(2, 2,
 '골프 아이언 세트 역경매 (중급자용)',
 '현재 핸디 90대 초반, 중급자용 아이언 세트 제안 부탁드립니다. 중고/새 제품 모두 가능.',
 800000, 42,
 NOW() - INTERVAL 2 DAY,
 NOW() + INTERVAL 5 DAY,
 NOW() + INTERVAL 7 DAY,
 1,
 NOW() - INTERVAL 2 DAY, NULL,
 'N', NULL),

-- 3. 진행중 경매 (open) - 자전거 헬멧
(9, 3,
 '로드용 헬멧, 가벼운 모델 찾습니다',
 '자출+주말 라이딩용으로 쓸 헬멧 찾고 있습니다. M 사이즈, 통풍 잘 되는 모델로 제안 부탁드려요.',
 200000, 18,
 NOW() - INTERVAL 3 DAY,
 NOW() + INTERVAL 2 DAY,
 NOW() + INTERVAL 4 DAY,
 1,
 NOW() - INTERVAL 3 DAY, NULL,
 'N', NULL),

-- 4. 정상 낙찰된 경매 (closed) - 헬스 홈트 세트
(10, 5,
 '홈트용 아령 + 매트 세트 구합니다',
 '1~10kg 조절 가능한 아령과 두꺼운 요가매트 세트로 제안 부탁드려요.',
 250000, 57,
 NOW() - INTERVAL 10 DAY,
 NOW() - INTERVAL 5 DAY,
 NOW() - INTERVAL 3 DAY,
 3,
 NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 3 DAY,
 'N', NULL),

-- 5. 정상 낙찰된 경매 (closed) - 수영 용품 세트
(8, 7,
 '수영 입문용 세트 (수경+수모+수영복)',
 '성인 남성 수영 입문용 세트 제안 부탁드립니다. 브랜드는 크게 상관 없고 내구성 좋은 제품이면 좋겠습니다.',
 200000, 44,
 NOW() - INTERVAL 12 DAY,
 NOW() - INTERVAL 7 DAY,
 NOW() - INTERVAL 5 DAY,
 3,
 NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 5 DAY,
 'N', NULL),

-- 6. 마감 후 결정 진행중 느낌 (closed, 낙찰자 아직 확정 X) - 축구 스파이크
(3, 4,
 '인조잔디용 축구 스파이크 요청',
 '발볼 넓은 편이라, 발 편한 인조잔디용 스파이크 찾고 있습니다. 270mm 기준 제안 부탁드려요.',
 180000, 29,
 NOW() - INTERVAL 6 DAY,
 NOW() - INTERVAL 1 DAY,
 NOW() + INTERVAL 1 DAY,
 2,
 NOW() - INTERVAL 6 DAY, NULL,
 'N', NULL),

-- 7. 유찰된 경매 (failed) - 스키 장비
(4, 6,
 '스키 풀세트(중고) 구합니다',
 '스키/부츠/폴/헬멧 풀세트로 중고 매물을 찾고 있습니다. 175cm, 70kg 기준 맞는 장비면 좋겠습니다.',
 500000, 12,
 NOW() - INTERVAL 15 DAY,
 NOW() - INTERVAL 10 DAY,
 NOW() - INTERVAL 8 DAY,
 4,
 NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 8 DAY,
 'N', NULL),

-- 8. 취소된 경매 (canceled) - 요가 매트 (구매자 취소)
(7, 5,
 '두꺼운 요가 매트 구합니다 (취소됨)',
 '무릎이 안 좋아서 두꺼운 요가 매트 찾아요. 집에서 사용하는 용도입니다.',
 80000, 9,
 NOW() - INTERVAL 7 DAY,
 NOW() - INTERVAL 4 DAY,
 NOW() - INTERVAL 3 DAY,
 5,
 NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 3 DAY,
 'N', NULL),

-- 9. 관리자 삭제된 경매 (is_deleted = Y) - 리조트 이용권 (법적 이슈 케이스)
(5, 8,
 '리조트 숙박권 양도 요청 (관리자 삭제)',
 '리조트 숙박권 양도 받으려고 합니다. 날짜는 협의 가능해요.',
 600000, 5,
 NOW() - INTERVAL 20 DAY,
 NOW() - INTERVAL 15 DAY,
 NOW() - INTERVAL 14 DAY,
 6,
 NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 14 DAY,
 'Y', NOW() - INTERVAL 13 DAY),

-- 10. 관리자 삭제된 경매 (is_deleted = Y) - 콘서트 티켓 (정책 위반)
(6, 8,
 '콘서트 티켓 양도 요청 (정책 위반)',
 '콘서트 티켓 구해봅니다. 연석이면 좋겠습니다.',
 400000, 7,
 NOW() - INTERVAL 18 DAY,
 NOW() - INTERVAL 13 DAY,
 NOW() - INTERVAL 12 DAY,
 6,
 NOW() - INTERVAL 18 DAY, NOW() - INTERVAL 12 DAY,
 'Y', NOW() - INTERVAL 11 DAY),
 
 -- 11. 공/볼 (1번) 관련 경매
(3, 1, 
 '축구 소모임에서 쓸 공인구 여러 개 구해요', 
 '상태 좋은 프리미어리그나 챔스 공인구 찾습니다. 낱개도 좋으니 제안 주세요.', 
 120000, 15, 
 NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 4 DAY, NOW() + INTERVAL 6 DAY, 
 1, NOW() - INTERVAL 1 DAY, NULL, 'N', NULL),

-- 12. 공/볼 (1번) 관련 경매
(4, 1, 
 '야외 우레탄 코트용 농구공 추천 바랍니다', 
 '내구성 좋은 농구공 찾고 있습니다. 7호 사이즈 위주로 제안 부탁드려요.', 
 60000, 22, 
 NOW() - INTERVAL 2 DAY, NOW() + INTERVAL 3 DAY, NOW() + INTERVAL 5 DAY, 
 1, NOW() - INTERVAL 2 DAY, NULL, 'N', NULL),

-- 13. 액세서리/잡화 (8번) 관련 경매
(5, 8, 
 '헬스장 갈 때 들기 좋은 큰 가방 구합니다', 
 '신발이랑 옷이 다 들어가는 넉넉한 사이즈의 백팩이나 더플백 찾고 있어요.', 
 100000, 10, 
 NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 5 DAY, NOW() + INTERVAL 7 DAY, 
 1, NOW() - INTERVAL 1 DAY, NULL, 'N', NULL),

-- 14. 액세서리/잡화 (8번) 관련 경매
(6, 8, 
 '야간 라이딩용 반사 장갑이나 양말 세트', 
 '밤에 자전거 탈 때 안전을 위해 눈에 잘 띄는 잡화 세트 제안 부탁드립니다.', 
 40000, 5, 
 NOW() - INTERVAL 12 HOUR, NOW() + INTERVAL 2 DAY, NOW() + INTERVAL 4 DAY, 
 1, NOW() - INTERVAL 12 HOUR, NULL, 'N', NULL);
 
 /* ==========================================
   BID 더미 데이터 (각 상태별)
   ========================================== */

INSERT INTO bid (
    auction_idx, bidder_idx, item_idx, bid_price,
    bid_quantity, bid_message, bid_status_idx,
    bid_regdate, bid_moddate
) VALUES
-- Auction 1 (open) : 여러 normal 입찰, 아직 낙찰 없음
(1, 9,  1, 130000, 1, '쿠션 좋은 러닝화 새 제품으로 제안드립니다.', 1,
 NOW() - INTERVAL 1 DAY, NULL),
(1, 10, 2, 140000, 1, '전시 상품이었지만 거의 새 것이라 상태 좋습니다.', 1,
 NOW() - INTERVAL 20 HOUR, NULL),
(1, 2,  3, 150000, 1, '인기 모델이고, 한 달 사용했습니다.', 1,
 NOW() - INTERVAL 10 HOUR, NULL),

-- Auction 2 (open) : normal + 취소된 입찰
(2, 4,  4, 750000, 1, '중고 아이언 세트입니다. 사용감 있지만 성능 좋습니다.', 1,
 NOW() - INTERVAL 2 DAY, NULL),
(2, 5,  5, 900000, 1, '거의 새 제품 수준입니다. 피팅 포함 가능합니다.', 1,
 NOW() - INTERVAL 1 DAY, NULL),
(2, 3,  6, 700000, 1, '연습용으로 쓰던 세트라 흠집은 있지만 저렴하게 드립니다.', 4,
 NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 2 DAY), -- 취소된 입찰

-- Auction 3 (open) : normal 입찰 몇 개
(3, 1,  7, 150000, 1, '경량 헬멧, 사이즈 M, 한 시즌 사용했습니다.', 1,
 NOW() - INTERVAL 2 DAY, NULL),
(3, 8,  8, 180000, 1, '통풍 잘 되는 모델입니다. 실착 10회 미만.', 1,
 NOW() - INTERVAL 30 HOUR, NULL),

-- Auction 4 (closed, 정상 낙찰된 케이스)
--   1개 won, 나머지 lost
(4, 10, 9, 220000, 1, '아령 세트(2~10kg) + 두꺼운 매트 세트입니다.', 2,
 NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 5 DAY),  -- 낙찰된 입찰
(4, 2,  10,240000, 1, '브랜드 제품이며 사용감 거의 없습니다.', 3,
 NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 5 DAY),  -- 낙찰 실패
(4, 7,  11,200000, 1, '사용감 있지만 가성비 좋은 세트입니다.', 3,
 NOW() - INTERVAL 9 DAY, NOW() - INTERVAL 5 DAY),

-- Auction 5 (closed, 정상 낙찰된 수영 세트)
(5, 8,  12,150000, 1, '수경+수모+수영복 새 제품 세트입니다.', 2,
 NOW() - INTERVAL 9 DAY, NOW() - INTERVAL 7 DAY),  -- 낙찰
(5, 1,  13,130000, 1, '수경만 사용감 있고 나머지는 새것 수준입니다.', 3,
 NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 7 DAY),
(5, 3,  14,170000, 1, '브랜드 세트이며, 사이즈 교환은 어렵습니다.', 3,
 NOW() - INTERVAL 11 DAY, NOW() - INTERVAL 7 DAY),

-- Auction 6 (closed, 마감 후 결정 진행중 느낌: normal 입찰만 있고 won 없음)
(6, 4,  15,160000, 1, '인조잔디용 스파이크, 270mm, 사용감 적습니다.', 1,
 NOW() - INTERVAL 3 DAY, NULL),
(6, 5,  16,150000, 1, '발볼 넓은 분께 추천드리는 모델입니다.', 1,
 NOW() - INTERVAL 4 DAY, NULL),

-- Auction 7 (failed, 유찰: 입찰이 거의 없거나 너무 낮음)
(7, 6,  17,200000, 1, '스키 세트지만 연식이 좀 있습니다.', 3,
 NOW() - INTERVAL 14 DAY, NULL),

-- Auction 8 (canceled, 취소된 경매: 입찰은 있었지만 상태 canceled)
(8, 7,  18,60000, 1, '살짝 사용감 있는 요가 매트입니다.', 4,
 NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 4 DAY),

-- Auction 9 (관리자 삭제된 경매: 입찰도 모두 취소 처리)
(9, 5,  19,550000, 1, '리조트 숙박권 주중 1박 양도 제안드립니다.', 5,
 NOW() - INTERVAL 19 DAY, NOW() - INTERVAL 13 DAY),

-- Auction 10 (관리자 삭제된 콘서트 티켓 케이스)
(10,6,  20,350000, 2, '콘서트 티켓 2장 양도합니다.', 5,
 NOW() - INTERVAL 17 DAY, NOW() - INTERVAL 11 DAY),

-- Auction 11
(11, 7, 21, 110000, 1, '미개봉 나이키 공인구입니다. 박스 풀셋이에요.', 1, NOW() - INTERVAL 5 HOUR, NULL),

-- Auction 13
(13, 1, 23, 85000, 1, '언더아머 백팩인데 수납공간 정말 많고 깨끗합니다.', 1, NOW() - INTERVAL 2 HOUR, NULL);


 /* ==========================================
   리뷰 더미 데이터 (각 상태별)
   ========================================== */
   
INSERT INTO review (
    buyer_idx, bidder_idx, auction_idx, bid_idx,
    review_title, review_content, review_star
) VALUES
-- auction 4 (낙찰 성공 케이스)
(10, 10, 4, 9,
 '빠른 거래 감사합니다!',
 '제품 상태도 설명과 동일했고 거래도 빠르게 진행되어 매우 만족합니다. 다음에도 거래하고 싶어요!',
 5),
-- auction 5 (낙찰 성공 케이스)
(8, 8, 5, 12,
 '좋은 상품 감사합니다',
 '수영 세트 상태도 좋고 가격도 합리적이어서 만족스러운 거래였습니다. 배송도 빨랐어요.',
 4),
-- auction 1 (진행중이지만 테스트용)
(1, 9, 1, 1,
 '괜찮은 제안이었어요',
 '가격과 상품 상태 모두 괜찮았고 응답도 빨라서 좋았습니다. 다음에도 기회되면 거래하고 싶어요.',
 4),
-- auction 2
(2, 4, 2, 4,
 '가성비 좋네요',
 '중고지만 상태 괜찮고 가격도 합리적이라 만족합니다. 잘 쓰겠습니다!',
 4),
-- auction 3
(9, 1, 3, 7,
 '추천합니다',
 '헬멧 상태 좋고 설명 그대로였습니다. 안전하게 잘 쓰겠습니다.',
 5);
 
 
  /* ==========================================
   옥션 더미 데이터 (추가)
   ========================================== */
 
 INSERT INTO auction (
    buyer_idx,
    item_category_idx,
    auction_thumbnail_img,
    auction_title,
    auction_desc,
    auction_target_price,
    auction_view_count,
    auction_start_at,
    auction_end_at,
    auction_decision_deadline,
    auction_status_idx,
    auction_regdate,
    auction_moddate,
    auction_is_deleted,
    auction_deldate
) VALUES
-- 15. 스쿼트 랙 + 바벨 세트
(1, 5,
 '/images/auction/23418b2b-cff1-404b-bfbc-862abc9d9b07_fit_dm.png',
 '입문용 스쿼트 랙 + 바벨 세트 구해요! 🏋️‍♀️',
 '이제 막 홈짐 시작하려는 헬린이입니다. 아파트라 너무 크지 않은 미니 랙이나 분리형 랙이었으면 좋겠어요. 바벨은 탄력봉 아니어도 되니까 저렴하게 넘겨주실 판매자님 찾습니다!',
 200000,
 0,
 NOW() - INTERVAL 2 DAY,          -- start_at
 NOW() + INTERVAL 1 DAY,          -- end_at
 NOW() + INTERVAL 1 DAY + INTERVAL 30 MINUTE, -- decision_deadline
 1,
 NOW() - INTERVAL 2 DAY,
 NULL,
 'N',
 NULL
),

-- 16. 요가매트
(2, 5,
 '/images/auction/ea94aa3f-7d64-484c-af18-d72ec90cfffd_fit_dm2.png',
 '요가매트 8mm 이상 두꺼운 거 파실 분? 🧘‍♀️',
 '무릎이 아파서 아주 푹신하고 두꺼운 TPE 소재 요가매트 찾습니다. 사용감 조금 있어도 괜찮으니까 찢어진 곳만 없으면 돼요! 색상은 가급적 파스텔톤이면 좋겠어요! (샤방샤방한 거 좋아함💖)',
 100000,
 0,
 NOW() - INTERVAL 2 DAY,
 NOW() + INTERVAL 1 DAY,
 NOW() + INTERVAL 1 DAY + INTERVAL 30 MINUTE,
 1,
 NOW() - INTERVAL 2 DAY,
 NULL,
 'N',
 NULL
),

-- 17. 스텔스 농구공
(3, 1,
 '/images/auction/6ad8833d-12a0-4759-83f6-62927b691267_ball_dm.png',
 '층간소음 없는 실내용 ''스텔스 농구공'' 구해요! 🏀',
 '밤에도 집에서 드리블 연습하고 싶어서 저소음 공 찾고 있어요! 7호 사이즈면 좋겠고, 상태 깨끗한 녀석으로 픽 하겠습니다! 🐯',
 50000,
 0,
 NOW() - INTERVAL 2 DAY,
 NOW() + INTERVAL 5 DAY,
 NOW() + INTERVAL 8 DAY,
 1,
 NOW() - INTERVAL 2 DAY,
 NULL,
 'N',
 NULL
),

-- 18. 요넥스 배드민턴 라켓 (버전 1)
(4, 2,
 '/images/auction/auction_default.png',
 '입문용 요넥스 배드민턴 라켓(경량) 구합니다 🏸',
 '손목이 약해서 4U~5U 정도의 가벼운 라켓 찾아요. 거트(줄) 새로 안 갈아도 바로 쓸 수 있는 상태면 더 좋습니다! 파스텔톤이면 바로 낙찰! 💖',
 100000,
 0,
 NOW() - INTERVAL 2 DAY,
 NOW() + INTERVAL 1 DAY,
 NOW() + INTERVAL 3 DAY,
 5,                                -- 예: 진행 상태 코드
 NOW() - INTERVAL 2 DAY,
 NOW() - INTERVAL 2 DAY + INTERVAL 10 MINUTE,
 'N',
 NULL
),

-- 19. 요넥스 배드민턴 라켓 (버전 2)
(4, 2,
 '/images/auction/6de1d54f-89fe-486f-bd2a-775d3dec2345_ra_dm.png',
 '입문용 요넥스 배드민턴 라켓(경량) 구합니다 🏸',
 '손목이 약해서 4U~5U 정도의 가벼운 라켓 찾아요. 거트(줄) 새로 안 갈아도 바로 쓸 수 있는 상태면 더 좋습니다! 파스텔톤이면 바로 낙찰! 💖',
 100000,
 0,
 NOW() - INTERVAL 2 DAY,
 NOW() + INTERVAL 1 DAY,
 NOW() + INTERVAL 2 DAY,
 1,
 NOW() - INTERVAL 2 DAY,
 NULL,
 'N',
 NULL
),

-- 20. 무릎 니슬리브
(5, 3,
 '/images/auction/aecff9f6-5ef3-49b6-83d4-6f01539b930b_pro_dm.png',
 '러닝용 무릎 니슬리브 1세트 구함 (M사이즈) 🏃‍♀️',
 '무릎 지지력이 짱짱한 제품 찾아요! 세탁해도 냄새 안 나고 늘어남 없는 S급 상태였으면 좋겠습니다. 택배비 포함해서 좋은 가격 제시해주세요! ✨',
 60000,
 0,
 NOW() - INTERVAL 2 DAY,
 NOW() + INTERVAL 2 DAY,
 NOW() + INTERVAL 3 DAY,
 1,
 NOW() - INTERVAL 2 DAY,
 NULL,
 'N',
 NULL
),

-- 21. 러닝화
(6, 1,
 '/images/auction/c726c0cf-efce-4da5-aa4b-5f8884d62502_sh_dm.png',
 '나이키 에어줌 페가수스 러닝화 (240mm) 👟',
 '조깅 시작해보려고 해요! 핑크나 화이트 컬러 들어간 디자인 좋아합니다. 바닥창 거의 안 닳은 새거 같은 중고 부탁드려요!',
 100000,
 0,
 NOW() - INTERVAL 2 DAY,
 NOW() + INTERVAL 0 DAY + INTERVAL 4 HOUR,
 NOW() + INTERVAL 3 DAY + INTERVAL 4 HOUR,
 1,
 NOW() - INTERVAL 2 DAY,
 NULL,
 'N',
 NULL
),

-- 22. 스쿼트 머신
(7, 5,
 '/images/auction/63f683a4-d760-4be1-ba09-84ddaa275534_fit_dm3.png',
 '멜킨 스쿼트 머신 (화이트 에디션) 구해요! 🏋️‍♀️',
 '거실 인테리어 해치지 않는 깔끔한 화이트 컬러 스쿼트 머신 삽니다! 사용감 적고 발등 스펀지 짱짱한 걸로 보내주실 분?',
 100000,
 0,
 NOW() - INTERVAL 2 DAY,
 NOW() + INTERVAL 1 DAY,
 NOW() + INTERVAL 3 DAY,
 1,
 NOW() - INTERVAL 2 DAY,
 NULL,
 'N',
 NULL
),

-- 23. 캠핑 랜턴
(8, 6,
 '/images/auction/c0eb63d7-fd10-48e2-8bde-9c63020b626c_out_dm.png',
 '감성 캠핑용 루미에르 랜턴 구합니다 🕯️',
 '캠핑 밤을 샤방샤방하게 밝혀줄 가스 랜턴 찾아요! 유리 갓에 금 안 가고 케이스까지 풀세트로 있으신 분 찾습니다. 분위기 장인 되고 싶어요! 🔥',
 50000,
 0,
 NOW() - INTERVAL 2 DAY,
 NOW() + INTERVAL 3 DAY,
 NOW() + INTERVAL 5 DAY,
 1,
 NOW() - INTERVAL 2 DAY,
 NULL,
 'N',
 NULL
),

-- 24. 수경
(9, 7,
 '/images/auction/182adde3-dbca-43e6-b79f-d0f3dc30a8ed_sw_dm.png',
 '미즈노 엑셀아이 수경 (노패킹/미러) 🏊‍♀️',
 '눈 자국 덜 남는 노패킹 수경 찾아요! 렌즈에 기스 없는 거 선호하고, 컬러는 화려할수록 좋습니다. 수영장 인싸 되게 도와주세요! ✨',
 50000,
 0,
 NOW() - INTERVAL 2 DAY,
 NOW() - INTERVAL 1 DAY,
 NOW() + INTERVAL 2 DAY,
 4,
 NOW() - INTERVAL 2 DAY,
 NULL,
 'N',
 NULL
),

-- 25. 가민 충전 케이블
(10, 8,
 '/images/auction/bdc9e624-0e28-41cf-9e54-29af4a83254c_ac_dm.png',
 '가민 스마트워치 충전 케이블(정품) 급구! ⚡',
 '충전기를 잃어버려서 운동 기록을 못 하고 있어요 ㅠㅠ 정품 케이블 단선 안 된 걸로 빨리 보내주실 판매자님 찾습니다!',
 1500000,
 0,
 NOW() - INTERVAL 2 DAY,
 NOW() - INTERVAL 1 DAY,
 NOW() + INTERVAL 1 DAY,
 4,
 NOW() - INTERVAL 2 DAY,
 NULL,
 'N',
 NULL
);

/* ==========================================
   알림용 더미
   ========================================== */

INSERT INTO notification (
    receiver_idx, sender_idx,
    auction_idx, bid_idx, board_idx, reply_idx,
    notification_type, notification_title, notification_message, target_url,
    is_read, created_at, read_at
) VALUES
-- 1. 내가 올린 경매에 새 입찰이 들어온 경우
(1, 9,
 1, 1, NULL, NULL,
 'AUCTION_NEW_BID',
 '새 입찰이 도착했습니다.',
 '등록하신 경매에 새로운 입찰 제안이 도착했습니다. 내용을 확인해보세요.',
 '/mypage/auctions',
 'N', NOW() - INTERVAL 10 MINUTE, NULL),

-- 2. 내가 올린 경매 입찰 마감 안내 (읽지 않음)
(1, NULL,
 4, NULL, NULL, NULL,
 'AUCTION_BID_CLOSED_BUYER',
 '입찰이 마감되었습니다.',
 '올리신 홈트 세트 경매의 입찰이 마감되었습니다. 낙찰자를 선택해주세요.',
 '/mypage/bids',
 'N', NOW() - INTERVAL 1 HOUR, NULL),

-- 3. 내가 쓴 게시글에 댓글이 달린 경우 (읽지 않음)
(1, 4,
 NULL, NULL, 7, 5,
 'BOARD_REPLY_CREATED',
 '작성하신 게시글에 새 댓글이 달렸습니다.',
 '러닝크루 관련 게시글에 새로운 댓글이 등록되었습니다.',
 '/mypage/boards',
 'N', NOW() - INTERVAL 2 HOUR, NULL),

-- 4. 거래가 완료된 후 리뷰가 등록된 경우 (이미 읽음)
(1, 10,
 4, 9, NULL, NULL,
 'TRADE_REVIEW_CREATED',
 '거래 후기가 등록되었습니다.',
 '진행하신 거래에 대한 후기가 등록되었습니다. 내용을 확인해보세요.',
 '/mypage/reviews',
 'Y', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 23 HOUR);

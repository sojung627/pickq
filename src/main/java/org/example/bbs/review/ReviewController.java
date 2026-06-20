package org.example.bbs.review;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final MemberRepository memberRepository;
    private final ReviewRepository reviewRepository;

    // 리뷰 매니지먼트 페이지 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 검색어 없이 미작성 거래 전체 조회
    @GetMapping("/mypage/reviews/reviewAll")
    public ResponseEntity<?> reviewAll(HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginMember") == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }

        String memId = (String) session.getAttribute("loginMember");
        MemberEntity member = memberRepository.findByMemId(memId).orElseThrow();

        // 키워드 없이 전체 조회
        List<Map<String, Object>> list = reviewService.findAllReviewTargets(member.getMemIdx());

        return ResponseEntity.ok(Map.of("reviewList", list));
    }

    // 리뷰 리스트
    @GetMapping("/mypage/reviews/api")
    public ResponseEntity<?> reviewApi(HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginMember") == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }

        String memId = (String) session.getAttribute("loginMember");
        MemberEntity member = memberRepository.findByMemId(memId).orElseThrow();
        Long memIdx = member.getMemIdx();

        List<Map<String, Object>> reviewList = reviewRepository.findMyReviews(memIdx);
        List<Map<String, Object>> receivedReviewList = reviewRepository.findReceivedReviews(memIdx);
        Double avgRating = reviewRepository.findAvgRating(memIdx);

        Map<String, Object> response = new HashMap<>();
        response.put("reviewList", reviewList);
        response.put("receivedReviewList", receivedReviewList);
        response.put("avgRating", avgRating != null ? avgRating : 0.0);

        return ResponseEntity.ok(response);
    }

    // 리뷰 작성 페이지 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 거래 검색 (낙찰된 입찰 중 리뷰 안 쓴 것)
    @GetMapping("/mypage/reviews/reviewSearch")
    public ResponseEntity<?> reviewSearch(
            @RequestParam String searchType,
            @RequestParam String keyword,
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginMember") == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }

        String memId = (String) session.getAttribute("loginMember");
        MemberEntity member = memberRepository.findByMemId(memId).orElseThrow();

        List<Map<String, Object>> list = reviewService.searchReviewTargets(member.getMemIdx(), searchType, keyword);

        Map<String, Object> response = new HashMap<>();
        response.put("reviewList", list);
        return ResponseEntity.ok(response);
    }

    // 리뷰 등록
    @PostMapping("/mypage/reviews/reviewWrite")
    public ResponseEntity<?> reviewWrite(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginMember") == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }

        String memId = (String) session.getAttribute("loginMember");
        MemberEntity member = memberRepository.findByMemId(memId).orElseThrow();

        String reviewTitle = (String) body.get("reviewTitle");
        String content = (String) body.get("content");
        int reviewStar = (int) body.get("reviewStar");
        Long bidIdx = Long.valueOf(body.get("bid_idx").toString());
        Long auctionIdx = Long.valueOf(body.get("auction_idx").toString());
        Long bidderIdx = Long.valueOf(body.get("bidder_idx").toString());

        // 유효성 검사
        if (reviewTitle == null || reviewTitle.trim().length() < 5) {
            return ResponseEntity.badRequest().body(Map.of("message", "리뷰 제목은 5글자 이상이어야 합니다."));
        }
        if (content == null || content.trim().length() < 10 || content.trim().length() > 300) {
            return ResponseEntity.badRequest().body(Map.of("message", "리뷰 내용은 10자 이상 300자 이하여야 합니다."));
        }

        reviewService.saveReview(member.getMemIdx(), bidderIdx, auctionIdx, bidIdx, reviewTitle, content, reviewStar);
        return ResponseEntity.ok(Map.of("message", "리뷰가 등록되었습니다."));
    }

    // 리뷰 상세 페이지 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    @GetMapping("/mypage/reviews/api/detail")
    public ResponseEntity<?> reviewDetail(
            @RequestParam Long reviewIdx,
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginMember") == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }

        Map<String, Object> reviewData = reviewRepository.findReviewDetail(reviewIdx);

        if (reviewData == null) {
            return ResponseEntity.status(404).body(Map.of("message", "리뷰를 찾을 수 없습니다."));
        }

        return ResponseEntity.ok(Map.of("review", reviewData));
    }

    // 리뷰 관리자 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 관리자 리뷰 전체 조회
    @GetMapping("/mypage/reviews/admin/api")
    public ResponseEntity<?> reviewAdminApi(HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginMember") == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }

        List<Map<String, Object>> activeList = reviewRepository.findAllActiveReviews();
        List<Map<String, Object>> deletedList = reviewRepository.findAllDeletedReviews();

        Map<String, Object> response = new HashMap<>();
        response.put("activeList", activeList);
        response.put("deletedList", deletedList);

        return ResponseEntity.ok(response);
    }

    // 삭제 취소 (복구)
    @GetMapping("/review/reviewCancel")
    public ResponseEntity<?> reviewCancel(@RequestParam Long reviewIdx, HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginMember") == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }

        reviewService.cancelDelete(reviewIdx);
        return ResponseEntity.ok(Map.of("message", "복구되었습니다."));
    }

    // 임시 삭제
    @PostMapping("/reviewDelete")
    public ResponseEntity<?> reviewDelete(@RequestParam Long reviewIdx, HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginMember") == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }

        reviewService.tempDelete(reviewIdx);
        return ResponseEntity.ok(Map.of("message", "임시 삭제되었습니다."));
    }

    // 영구 삭제
    @GetMapping("/review/hardDelete")
    public ResponseEntity<?> hardDelete(@RequestParam Long reviewIdx, HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginMember") == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }

        reviewService.hardDelete(reviewIdx);
        return ResponseEntity.ok(Map.of("message", "영구 삭제되었습니다."));
    }

    // 키워드 백필 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 기존 리뷰 키워드 일괄 생성 (AI 도입 이전 리뷰 백필) - 관리자 전용
    @PostMapping("/admin/reviews/backfill-keywords")
    public ResponseEntity<?> backfillKeywords(HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginMember") == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }

        String memId = (String) session.getAttribute("loginMember");
        MemberEntity member = memberRepository.findByMemId(memId).orElseThrow();

        // 관리자(roleIdx=2)만 실행 가능
        if (member.getMemRoleIdx() != 2) {
            return ResponseEntity.status(403).body(Map.of("message", "권한이 없습니다."));
        }

        int count = reviewService.backfillKeywords();
        return ResponseEntity.ok(Map.of(
                "message", count + "건의 리뷰에 키워드가 생성되었습니다."
        ));
    }

}

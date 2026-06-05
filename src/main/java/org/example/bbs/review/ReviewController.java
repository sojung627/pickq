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

}

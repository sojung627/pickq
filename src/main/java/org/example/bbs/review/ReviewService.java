package org.example.bbs.review;

import lombok.RequiredArgsConstructor;
import org.example.bbs.auction.AuctionEntity;
import org.example.bbs.auction.AuctionRepository;
import org.example.bbs.bid.BidEntity;
import org.example.bbs.bid.BidRepository;
import org.example.bbs.gemini.GeminiService;
import org.example.bbs.grade.GradeService;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.example.bbs.memberPenalty.PenaltyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.example.bbs.notification.NotificationService;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BidRepository bidRepository;
    private final AuctionRepository auctionRepository;
    private final MemberRepository memberRepository;
    private final PenaltyService penaltyService;
    private final GradeService gradeService;
    private final NotificationService notificationService;
    private final GeminiService geminiService;


    // 리뷰 매니지먼트 페이지 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 전체 미작성 거래 조회
    public List<Map<String, Object>> findAllReviewTargets(Long buyerIdx) {
        return reviewRepository.findAllReviewTargets(buyerIdx);
    }

    // 리뷰 작성 페이지 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 낙찰된 입찰 중 리뷰 안 쓴 것 검색
    public List<Map<String, Object>> searchReviewTargets(Long buyerIdx, String searchType, String keyword) {
        return reviewRepository.findReviewTargets(buyerIdx, searchType, keyword);
    }

    // 리뷰 저장
    @Transactional
    public void saveReview(Long buyerIdx, Long bidderIdx, Long auctionIdx, Long bidIdx,
                           String reviewTitle, String content, int reviewStar) {

        MemberEntity buyer = memberRepository.findById(buyerIdx).orElseThrow();
        MemberEntity bidder = memberRepository.findById(bidderIdx).orElseThrow();
        AuctionEntity auction = auctionRepository.findById(auctionIdx).orElseThrow();
        BidEntity bid = bidRepository.findById(bidIdx).orElseThrow();

        // Gemini로 키워드 추출 (실패해도 저장은 정상 진행)
        String keywords = geminiService.extractKeywords(content);

        ReviewEntity review = ReviewEntity.builder()
                .buyer(buyer)
                .bidder(bidder)
                .auction(auction)
                .bid(bid)
                .reviewTitle(reviewTitle)
                .reviewContent(content)
                .reviewStar(reviewStar)
                .reviewKeywords(keywords)
                .build();

        reviewRepository.save(review);

        // 리뷰 작성자 크레딧 +10
        penaltyService.applyReviewWrite(buyerIdx);

        // 별점 받은 판매자 크레딧 조정
        penaltyService.applyStarReceived(bidderIdx, reviewStar);

        // 판매자 등급 재계산
        // gradeService.recalculateGrade(bidderIdx); // 이미 페널티 서비스에서 쓰는 중

        // 리뷰 알림 - bidder(판매자)에게 발송
        notificationService.notifyReviewReceived(bidder, buyer, review);
    }

    // 리뷰 관리자 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 삭제 취소 (복구)
    @Transactional
    public void cancelDelete(Long reviewIdx) {
        ReviewEntity review = reviewRepository.findById(reviewIdx).orElseThrow();
        review.setReviewIsDeleted("N");
        review.setReviewDeldate(null);
    }

    // 임시 삭제
    @Transactional
    public void tempDelete(Long reviewIdx) {
        ReviewEntity review = reviewRepository.findById(reviewIdx).orElseThrow();
        review.setReviewIsDeleted("Y");
        review.setReviewDeldate(java.time.LocalDateTime.now());
    }

    // 영구 삭제
    @Transactional
    public void hardDelete(Long reviewIdx) {
        reviewRepository.deleteById(reviewIdx);
    }

}
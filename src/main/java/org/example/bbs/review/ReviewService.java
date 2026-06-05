package org.example.bbs.review;

import lombok.RequiredArgsConstructor;
import org.example.bbs.auction.AuctionEntity;
import org.example.bbs.auction.AuctionRepository;
import org.example.bbs.bid.BidEntity;
import org.example.bbs.bid.BidRepository;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BidRepository bidRepository;
    private final AuctionRepository auctionRepository;
    private final MemberRepository memberRepository;

    // 리뷰 매니지먼트 페이지 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

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

        ReviewEntity review = ReviewEntity.builder()
                .buyer(buyer)
                .bidder(bidder)
                .auction(auction)
                .bid(bid)
                .reviewTitle(reviewTitle)
                .reviewContent(content)
                .reviewStar(reviewStar)
                .build();

        reviewRepository.save(review);
    }
}
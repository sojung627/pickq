package org.example.bbs.grade;

import lombok.RequiredArgsConstructor;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.example.bbs.review.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GradeService {

    private final MemberRepository memberRepository;
    private final GradeRepository gradeRepository;
    private final ReviewRepository reviewRepository;

    @Transactional
    public void recalculateGrade(Long memIdx) {
        MemberEntity member = memberRepository.findById(memIdx)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        // 거래 완료 수: 리뷰 수 기준 (리뷰가 bid_idx unique -> 거래 1건당 1리뷰)
        long tradeCount = reviewRepository.countByBidder_MemIdx(memIdx);

        // 평균 별점
        Double avgStar = reviewRepository.findAvgStarByBidderIdx(memIdx);
        double avg = (avgStar != null) ? avgStar : 0.0;

        int newGradeIdx;
        if (tradeCount >= 100 && avg >= 4.5) {
            newGradeIdx = 5; // vip
        } else if (tradeCount >= 30 && avg >= 4.0) {
            newGradeIdx = 4; // gold
        } else if (tradeCount >= 10 && avg >= 3.5) {
            newGradeIdx = 3; // silver
        } else if (tradeCount >= 3 && avg >= 3.0) {
            newGradeIdx = 2; // bronze
        } else {
            newGradeIdx = 1; // normal
        }

        member.setMemGradeIdx(newGradeIdx);
        memberRepository.save(member);
    }
}
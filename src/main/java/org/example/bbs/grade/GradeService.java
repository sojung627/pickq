package org.example.bbs.grade;

import lombok.RequiredArgsConstructor;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.example.bbs.review.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GradeService {

    private final MemberRepository memberRepository;
    private final GradeRepository gradeRepository;
    private final ReviewRepository reviewRepository;

    // 등급 재계산 (구매확정 또는 리뷰 작성 시 호출)
    @Transactional
    public void recalculateGrade(Long memIdx) {
        MemberEntity member = memberRepository.findById(memIdx)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        // 해당 회원이 판매자로서 완료된 거래 수 (리뷰 수 = 완료 거래 수)
        long tradeCount = reviewRepository.countByBidder_MemIdx(memIdx);

        // 해당 회원의 평균 별점
        Double avgStar = reviewRepository.findAvgStarByBidderIdx(memIdx);
        double avg = avgStar != null ? avgStar : 0.0;

        // 등급 결정
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
    }
}
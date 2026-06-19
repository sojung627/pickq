package org.example.bbs.grade;

import lombok.RequiredArgsConstructor;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.example.bbs.notification.NotificationService;
import org.example.bbs.payment.PaymentRepository;
import org.example.bbs.review.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GradeService {

    private final MemberRepository memberRepository;
    private final GradeRepository gradeRepository;
    private final ReviewRepository reviewRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;

    @Transactional
    public void recalculateGrade(Long memIdx) {
        MemberEntity member = memberRepository.findById(memIdx)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        // 관리자는 회원 거래 등급 자동 산정 대상에서 제외
        if (Integer.valueOf(2).equals(member.getMemRoleIdx())) {
            return;
        }

        long completedTradeCount = paymentRepository.countCompletedSalesBySeller(memIdx);
        Double avgStarValue = reviewRepository.findAvgStarByBidderIdx(memIdx);
        double avgStar = avgStarValue != null ? avgStarValue : 0.0;

        int newGradeIdx;
        if (completedTradeCount >= 100 && avgStar >= 4.5) {
            newGradeIdx = 5; // vip
        } else if (completedTradeCount >= 30 && avgStar >= 4.0) {
            newGradeIdx = 4; // gold
        } else if (completedTradeCount >= 5 && avgStar >= 4.0) {
            newGradeIdx = 3; // silver
        } else if (completedTradeCount >= 3 && avgStar >= 4.0) {
            newGradeIdx = 2; // bronze
        } else {
            newGradeIdx = 1; // normal
        }

        int oldGradeIdx = member.getMemGradeIdx() != null ? member.getMemGradeIdx() : 1;
        if (oldGradeIdx == newGradeIdx) {
            return;
        }

        String oldGradeName = gradeRepository.findById(oldGradeIdx)
                .map(GradeEntity::getGradeName)
                .orElse("normal");
        String newGradeName = gradeRepository.findById(newGradeIdx)
                .map(GradeEntity::getGradeName)
                .orElse("normal");

        member.setMemGradeIdx(newGradeIdx);
        memberRepository.save(member);

        notificationService.notifyGradeChanged(member, oldGradeName, newGradeName);
    }
}

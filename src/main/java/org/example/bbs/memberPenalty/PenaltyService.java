package org.example.bbs.memberPenalty;

import lombok.RequiredArgsConstructor;
import org.example.bbs.bid.BidEntity;
import org.example.bbs.bid.BidRepository;
import org.example.bbs.grade.GradeService;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.example.bbs.notification.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PenaltyService {

    private final MemberPenaltyRepository memberPenaltyRepository;
    private final MemberRepository memberRepository;
    private final GradeService gradeService;
    private final BidRepository bidRepository;
    private final NotificationService notificationService;

    private int getPenaltyScore(String penaltyCode) {
        return switch (penaltyCode) {
            case "NO_PAYMENT"    -> 30; // 낙찰 후 3일 내 미결제
            case "NO_SHIPMENT"   -> 30; // 결제 후 3일 내 미발송
            case "LATE_PAYMENT"  -> 10; // 낙찰 후 3일을 넘겨 결제
            case "LATE_SHIPMENT" -> 10; // 결제 후 3일을 넘겨 발송
            case "LATE_CANCEL"   -> 15; // 기존 코드 호환
            case "FRAUD_REPORT"  -> 50; // 기존 코드 호환
            default -> 5;
        };
    }

    @Transactional
    public void applyPenalty(Long memIdx, String penaltyCode, String reason) {
        applyPenalty(memIdx, null, penaltyCode, reason);
    }

    @Transactional
    public void applyPenalty(Long memIdx, Long bidIdx, String penaltyCode, String reason) {
        MemberEntity member = memberRepository.findById(memIdx)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        // 스케줄러가 여러 번 실행되어도 같은 회원/거래/사유는 한 번만 반영
        if (bidIdx != null && memberPenaltyRepository
                .existsByMember_MemIdxAndBid_BidIdxAndPenaltyCode(memIdx, bidIdx, penaltyCode)) {
            return;
        }

        int penaltyScore = getPenaltyScore(penaltyCode);
        int beforeCredit = member.getMemCredit() != null ? member.getMemCredit() : 50;
        int afterCredit = beforeCredit - penaltyScore; // 음수 점수도 정책상 허용

        MemberPenaltyEntity.MemberPenaltyEntityBuilder builder = MemberPenaltyEntity.builder()
                .member(member)
                .penaltyCode(penaltyCode)
                .penaltyReason(reason)
                .penaltyScore(penaltyScore);

        if (bidIdx != null) {
            BidEntity bid = bidRepository.findById(bidIdx).orElse(null);
            if (bid != null) {
                builder.bid(bid);
                builder.auction(bid.getAuction());
            }
        }

        // 이력을 먼저 저장한 뒤 누적 페널티를 이력 합계로 재동기화
        memberPenaltyRepository.saveAndFlush(builder.build());
        long totalPenalty = memberPenaltyRepository.sumPenaltyScoreByMemberIdx(memIdx);

        member.setMemCredit(afterCredit);
        member.setMemPenalty(Math.toIntExact(totalPenalty));
        memberRepository.save(member);

        notificationService.notifyPenaltyIssued(
                member, penaltyScore, beforeCredit, afterCredit, reason);
        gradeService.recalculateGrade(memIdx);
    }

    // 거래 완료(구매확정): 구매자와 판매자 각각 +30
    @Transactional
    public void applyTradeComplete(Long memIdx) {
        changeCredit(memIdx, 30, "거래 완료(구매확정)");
    }

    // 리뷰 작성: 작성자 +10
    @Transactional
    public void applyReviewWrite(Long memIdx) {
        changeCredit(memIdx, 10, "리뷰 작성");
    }

    // 리뷰 별점 수신: 5점 +5 / 1~2점 -5 / 3~4점 변동 없음
    @Transactional
    public void applyStarReceived(Long memIdx, int star) {
        if (star == 5) {
            changeCredit(memIdx, 5, "리뷰 별점 5점 수신");
            return;
        }
        if (star <= 2) {
            changeCredit(memIdx, -5, "리뷰 별점 " + star + "점 수신");
            return;
        }

        // 점수 변동은 없어도 평균 별점이 달라졌으므로 등급은 재계산
        gradeService.recalculateGrade(memIdx);
    }

    private void changeCredit(Long memIdx, int delta, String reason) {
        MemberEntity member = memberRepository.findById(memIdx)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        int beforeCredit = member.getMemCredit() != null ? member.getMemCredit() : 50;
        int afterCredit = beforeCredit + delta;

        member.setMemCredit(afterCredit);
        memberRepository.save(member);

        notificationService.notifyCreditChanged(
                member, delta, beforeCredit, afterCredit, reason);
        gradeService.recalculateGrade(memIdx);
    }
}

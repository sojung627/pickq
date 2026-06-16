package org.example.bbs.memberPenalty;

import lombok.RequiredArgsConstructor;
import org.example.bbs.grade.GradeService;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PenaltyService {

    private final MemberPenaltyRepository memberPenaltyRepository;
    private final MemberRepository memberRepository;
    private final GradeService gradeService; // [추가] 크레딧 변경 후 등급 자동 재계산

    private int getPenaltyScore(String penaltyCode) {
        return switch (penaltyCode) {
            case "NO_PAYMENT"    -> 10;
            case "NO_SHIPMENT"   -> 10;
            case "LATE_CANCEL"   -> 5;
            case "LATE_PAYMENT"  -> 3;
            case "LATE_SHIPMENT" -> 3;
            case "FRAUD_REPORT"  -> 20;
            default -> 1;
        };
    }

    private int getCreditDeduction(String penaltyCode) {
        return switch (penaltyCode) {
            case "NO_PAYMENT"    -> 30;
            case "NO_SHIPMENT"   -> 30;
            case "LATE_CANCEL"   -> 15;
            case "LATE_PAYMENT"  -> 10;
            case "LATE_SHIPMENT" -> 10;
            case "FRAUD_REPORT"  -> 50;
            default -> 5;
        };
    }

    @Transactional
    public void applyPenalty(Long memIdx, String penaltyCode, String reason) {
        MemberEntity member = memberRepository.findById(memIdx)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        int penaltyScore = getPenaltyScore(penaltyCode);
        int creditDeduction = getCreditDeduction(penaltyCode);

        member.setMemPenalty(member.getMemPenalty() + penaltyScore);
        member.setMemCredit(Math.max(0, member.getMemCredit() - creditDeduction));
        memberRepository.save(member); // [수정] DB 반영

        MemberPenaltyEntity penalty = MemberPenaltyEntity.builder()
                .member(member)
                .penaltyCode(penaltyCode)
                .penaltyReason(reason)
                .penaltyScore(penaltyScore)
                .build();
        memberPenaltyRepository.save(penalty);

        gradeService.recalculateGrade(memIdx); // [추가] 등급 자동 재계산
    }

    @Transactional
    public void applyTradeComplete(Long memIdx) {
        MemberEntity member = memberRepository.findById(memIdx)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        member.setMemCredit(member.getMemCredit() + 30);
        member.setMemPenalty(Math.max(0, member.getMemPenalty() - 1));
        memberRepository.save(member); // [수정] DB 반영

        gradeService.recalculateGrade(memIdx); // [추가] 등급 자동 재계산
    }

    @Transactional
    public void applyReviewWrite(Long memIdx) {
        MemberEntity member = memberRepository.findById(memIdx)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        member.setMemCredit(member.getMemCredit() + 10);
        memberRepository.save(member); // [수정] DB 반영

        gradeService.recalculateGrade(memIdx); // [추가] 등급 자동 재계산
    }

    @Transactional
    public void applyStarReceived(Long memIdx, int star) {
        MemberEntity member = memberRepository.findById(memIdx)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        if (star == 5) {
            member.setMemCredit(member.getMemCredit() + 5);
        } else if (star <= 2) {
            member.setMemCredit(Math.max(0, member.getMemCredit() - 5));
        }
        memberRepository.save(member); // [수정] DB 반영

        gradeService.recalculateGrade(memIdx); // [추가] 등급 자동 재계산
    }
}
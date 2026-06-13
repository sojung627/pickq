package org.example.bbs.memberPenalty;

import lombok.RequiredArgsConstructor;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PenaltyService {

    private final MemberPenaltyRepository memberPenaltyRepository;
    private final MemberRepository memberRepository;

    // 페널티 코드별 점수
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

    // 페널티 코드별 크레딧 감점
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

    // 페널티 부과
    @Transactional
    public void applyPenalty(Long memIdx, String penaltyCode, String reason) {
        MemberEntity member = memberRepository.findById(memIdx)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        int penaltyScore = getPenaltyScore(penaltyCode);
        int creditDeduction = getCreditDeduction(penaltyCode);

        // mem_penalty 누적
        member.setMemPenalty(member.getMemPenalty() + penaltyScore);

        // mem_credit 감점 (0 미만 방지)
        member.setMemCredit(Math.max(0, member.getMemCredit() - creditDeduction));

        // 이력 저장
        MemberPenaltyEntity penalty = MemberPenaltyEntity.builder()
                .member(member)
                .penaltyCode(penaltyCode)
                .penaltyReason(reason)
                .penaltyScore(penaltyScore)
                .build();

        memberPenaltyRepository.save(penalty);
    }

    // 정상 거래 완료 시 크레딧 +30, 페널티 -1 (최소 0)
    @Transactional
    public void applyTradeComplete(Long memIdx) {
        MemberEntity member = memberRepository.findById(memIdx)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        member.setMemCredit(member.getMemCredit() + 30);
        member.setMemPenalty(Math.max(0, member.getMemPenalty() - 1));
    }

    // 리뷰 작성 시 크레딧 +10
    @Transactional
    public void applyReviewWrite(Long memIdx) {
        MemberEntity member = memberRepository.findById(memIdx)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        member.setMemCredit(member.getMemCredit() + 10);
    }

    // 별점 받았을 때 크레딧 조정
    @Transactional
    public void applyStarReceived(Long memIdx, int star) {
        MemberEntity member = memberRepository.findById(memIdx)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        if (star == 5) {
            member.setMemCredit(member.getMemCredit() + 5);
        } else if (star <= 2) {
            member.setMemCredit(Math.max(0, member.getMemCredit() - 5));
        }
    }
}
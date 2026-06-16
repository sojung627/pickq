package org.example.bbs.memberPenalty;

import lombok.RequiredArgsConstructor;
import org.example.bbs.bid.BidEntity;
import org.example.bbs.bid.BidRepository;
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
    private final GradeService gradeService;
    private final BidRepository bidRepository;

    /*
     * penalty_score: member_penalty 테이블에 기록되는 패널티 누적 점수
     * 사진 기준 크레딧 변동 수치와 동일하게 맞춤
     * (기존 코드는 별도의 getPenaltyScore()를 사용해 잘못된 값이 DB에 저장되고 있었음)
     */
    private int getPenaltyScore(String penaltyCode) {
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

    /*
     * mem_credit에서 차감할 크레딧 값
     * 사진의 크레딧 변동 기준과 동일
     */
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

    // 페널티 부과 (bidIdx 없는 경우 - 수동 부과 등)
    @Transactional
    public void applyPenalty(Long memIdx, String penaltyCode, String reason) {
        applyPenalty(memIdx, null, penaltyCode, reason);
    }

    // 페널티 부과 (bidIdx 있는 경우 - 스케줄러 자동 부과)
    @Transactional
    public void applyPenalty(Long memIdx, Long bidIdx, String penaltyCode, String reason) {
        MemberEntity member = memberRepository.findById(memIdx)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        int penaltyScore = getPenaltyScore(penaltyCode);
        int creditDeduction = getCreditDeduction(penaltyCode);

        member.setMemPenalty(member.getMemPenalty() + penaltyScore);
        member.setMemCredit(Math.max(0, member.getMemCredit() - creditDeduction));
        memberRepository.save(member);

        MemberPenaltyEntity.MemberPenaltyEntityBuilder builder = MemberPenaltyEntity.builder()
                .member(member)
                .penaltyCode(penaltyCode)
                .penaltyReason(reason)
                .penaltyScore(penaltyScore);

        /*
         * bidIdx가 있을 경우 BidEntity를 조회하여 bid와 auction을 함께 설정
         * 기존 코드는 bid만 설정하고 auction을 누락하여 auction_idx가 항상 NULL로 저장됨
         * BidEntity.getAuction()을 통해 연관된 AuctionEntity를 가져와 함께 저장
         */
        if (bidIdx != null) {
            BidEntity bid = bidRepository.findById(bidIdx).orElse(null);
            if (bid != null) {
                builder.bid(bid);
                builder.auction(bid.getAuction());
            }
        }

        memberPenaltyRepository.save(builder.build());

        gradeService.recalculateGrade(memIdx);
    }

    // 거래 완료 크레딧 +30, 페널티 -1
    @Transactional
    public void applyTradeComplete(Long memIdx) {
        MemberEntity member = memberRepository.findById(memIdx)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        member.setMemCredit(member.getMemCredit() + 30);
        member.setMemPenalty(Math.max(0, member.getMemPenalty() - 1));
        memberRepository.save(member);

        gradeService.recalculateGrade(memIdx);
    }

    // 리뷰 작성 크레딧 +10
    @Transactional
    public void applyReviewWrite(Long memIdx) {
        MemberEntity member = memberRepository.findById(memIdx)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        member.setMemCredit(member.getMemCredit() + 10);
        memberRepository.save(member);

        gradeService.recalculateGrade(memIdx);
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
        memberRepository.save(member);

        gradeService.recalculateGrade(memIdx);
    }
}
package org.example.bbs.memberPenalty;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MemberPenaltyRepository extends JpaRepository<MemberPenaltyEntity, Long> {

    // 동일 회원에게 동일 거래/사유의 페널티가 중복 부과되는 것을 방지
    boolean existsByMember_MemIdxAndBid_BidIdxAndPenaltyCode(
            Long memIdx, Long bidIdx, String penaltyCode);

    // member.mem_penalty를 페널티 이력의 실제 합계와 동기화할 때 사용
    @Query("""
            SELECT COALESCE(SUM(mp.penaltyScore), 0)
            FROM MemberPenaltyEntity mp
            WHERE mp.member.memIdx = :memIdx
            """)
    Long sumPenaltyScoreByMemberIdx(@Param("memIdx") Long memIdx);
}

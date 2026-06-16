package org.example.bbs.memberPenalty;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberPenaltyRepository extends JpaRepository<MemberPenaltyEntity, Long> {

    // 결제 및 배송 등등에 대한 크레딧
    boolean existsByBid_BidIdxAndPenaltyCode(Long bidIdx, String penaltyCode);

}
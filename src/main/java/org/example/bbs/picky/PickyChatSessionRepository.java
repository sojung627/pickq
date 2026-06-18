package org.example.bbs.picky;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PickyChatSessionRepository extends JpaRepository<PickyChatSessionEntity, Long> {

    // 특정 회원의 삭제 안 된 세션 목록 (최신순)
    List<PickyChatSessionEntity> findByMemberMemIdxAndIsDeletedOrderByUpdatedAtDesc(Long memIdx, String isDeleted);

    // 세션 단건 조회 (회원 본인 소유 확인용)
    Optional<PickyChatSessionEntity> findBySessionIdxAndMemberMemIdxAndIsDeleted(Long sessionIdx, Long memIdx, String isDeleted);
}

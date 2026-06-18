package org.example.bbs.picky;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PickyChatMessageRepository extends JpaRepository<PickyChatMessageEntity, Long> {

    // 세션의 메시지 전체 조회 (시간순)
    List<PickyChatMessageEntity> findBySessionSessionIdxOrderByCreatedAtAsc(Long sessionIdx);

    // Gemini API에 넘길 최근 N개 메시지 (멀티턴용)
    List<PickyChatMessageEntity> findTop20BySessionSessionIdxOrderByCreatedAtAsc(Long sessionIdx);
}

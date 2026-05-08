package org.example.bbs.board;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BoardTypeRepository extends JpaRepository<BoardTypeEntity, Integer> {
    // 코드로 찾기 위해 추가
    Optional<BoardTypeEntity> findByBoardTypeCode(String boardTypeCode);
}

package org.example.bbs.board;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BoardLikeRepository extends JpaRepository<BoardLikeEntity, Long> {

    Optional<BoardLikeEntity> findByBoard_BoardIdxAndMember_MemId(
            Long boardIdx,
            String memId
    );

    long countByBoard_BoardIdx(Long boardIdx);
}

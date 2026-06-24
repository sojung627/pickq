package org.example.bbs.board;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface BoardLikeRepository extends JpaRepository<BoardLikeEntity, Long> {

    Optional<BoardLikeEntity> findByBoard_BoardIdxAndMember_MemId(
            Long boardIdx,
            String memId
    );

    long countByBoard_BoardIdx(Long boardIdx);

    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM BoardLikeEntity bl WHERE bl.board.boardIdx = :boardIdx")
    int deleteAllByBoardIdx(@Param("boardIdx") Long boardIdx);
}

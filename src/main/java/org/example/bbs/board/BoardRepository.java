package org.example.bbs.board;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BoardRepository extends JpaRepository<BoardEntity, Long> {

    @Query("SELECT b FROM BoardEntity b " +
            "JOIN FETCH b.member " +
            "JOIN FETCH b.boardType " +
            "WHERE (:typeCode IS NULL OR b.boardType.boardTypeCode = :typeCode) " +
            "AND (:keyword IS NULL OR b.boardTitle LIKE %:keyword% OR b.boardContent LIKE %:keyword%)")
    Page<BoardEntity> findBySearch(@Param("typeCode") String typeCode, @Param("keyword") String keyword, Pageable pageable);
}
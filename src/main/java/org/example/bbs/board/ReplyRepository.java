package org.example.bbs.board;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReplyRepository extends JpaRepository<ReplyEntity, Long> {
    // 댓글 리스트
    Page<ReplyEntity> findByBoard_BoardIdx(Long boardIdx, Pageable pageable);

    // 댓글 수
    long countByBoard_BoardIdxAndReplyIsDeleted(Long boardIdx, String replyIsDeleted);

    // 댓글 + 답글을 트리 순서로 조회 (최상위 댓글의 등록순 → 그 안에서 depth/등록순)
    @Query("SELECT r FROM ReplyEntity r " +
            "WHERE r.board.boardIdx = :boardIdx AND r.replyIsDeleted = 'N' " +
            "ORDER BY " +
            "CASE WHEN r.replyRef = 0 THEN r.replyIdx ELSE r.replyRef END ASC, " +
            "r.replyDepth ASC, r.replyRegdate ASC")
    List<ReplyEntity> findByBoard_BoardIdxOrderByTree(@Param("boardIdx") Long boardIdx);


}
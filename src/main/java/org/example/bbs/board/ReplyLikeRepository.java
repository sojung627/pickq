package org.example.bbs.board;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReplyLikeRepository extends JpaRepository<ReplyLikeEntity, Long> {

    Optional<ReplyLikeEntity> findByReply_ReplyIdxAndMember_MemId(
            Long replyIdx,
            String memId
    );

    long countByReply_ReplyIdx(Long replyIdx);

    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM ReplyLikeEntity rl WHERE rl.reply.board.boardIdx = :boardIdx")
    int deleteAllByBoardIdx(@Param("boardIdx") Long boardIdx);
}

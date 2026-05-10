package org.example.bbs.board;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReplyLikeRepository extends JpaRepository<ReplyLikeEntity, Long> {

    Optional<ReplyLikeEntity> findByReply_ReplyIdxAndMember_MemId(
            Long replyIdx,
            String memId
    );

    long countByReply_ReplyIdx(Long replyIdx);
}

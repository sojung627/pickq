package org.example.bbs.board;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReplyRepository extends JpaRepository<ReplyEntity, Long> {
    // 댓글 리스트
    Page<ReplyEntity> findByBoard_BoardIdx(Long boardIdx, Pageable pageable);
}
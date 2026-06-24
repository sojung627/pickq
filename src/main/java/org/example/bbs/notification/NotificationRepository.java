package org.example.bbs.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    List<NotificationEntity> findByReceiver_MemIdOrderByCreatedAtDesc(String memId);

    List<NotificationEntity> findTop3ByReceiver_MemIdOrderByCreatedAtDesc(String memId);

    long countByReceiver_MemIdAndIsRead(String memId, String isRead);

    List<NotificationEntity> findByReply_ReplyIdx(Long replyIdx);

    /** 게시글 삭제 전, 그 게시글의 댓글/답글을 가리키는 알림 FK를 해제한다. */
    @Modifying(flushAutomatically = true)
    @Query("""
            UPDATE NotificationEntity n
               SET n.reply = null
             WHERE n.reply.replyIdx IN (
                   SELECT r.replyIdx
                     FROM ReplyEntity r
                    WHERE r.board.boardIdx = :boardIdx
             )
            """)
    int clearReplyReferencesByBoardIdx(@Param("boardIdx") Long boardIdx);

    /** 게시글 삭제 전, 게시글을 직접 가리키는 알림 FK를 해제한다. */
    @Modifying(flushAutomatically = true)
    @Query("""
            UPDATE NotificationEntity n
               SET n.board = null
             WHERE n.board.boardIdx = :boardIdx
            """)
    int clearBoardReferencesByBoardIdx(@Param("boardIdx") Long boardIdx);

    @Modifying
    @Query("UPDATE NotificationEntity n SET n.isRead = 'Y', n.readAt = CURRENT_TIMESTAMP WHERE n.receiver.memId = :memId")
    void markAllAsRead(@Param("memId") String memId);
}

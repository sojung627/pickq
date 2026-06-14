package org.example.bbs.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    // 내 알림 전체 목록 (최신순, 알림 페이지용)
    List<NotificationEntity> findByReceiver_MemIdOrderByCreatedAtDesc(String memId);

    // 최근 알림 3건 (드롭다운용)
    List<NotificationEntity> findTop3ByReceiver_MemIdOrderByCreatedAtDesc(String memId);

    // 안읽은 알림 수
    long countByReceiver_MemIdAndIsRead(String memId, String isRead);

    // 특정 댓글을 참조하는 알림 목록 (댓글 삭제 시 FK 해제용)
    List<NotificationEntity> findByReply_ReplyIdx(Long replyIdx);

    // 전체 읽음 처리
    @Modifying
    @Query("UPDATE NotificationEntity n SET n.isRead = 'Y', n.readAt = CURRENT_TIMESTAMP WHERE n.receiver.memId = :memId")
    void markAllAsRead(@Param("memId") String memId);
}
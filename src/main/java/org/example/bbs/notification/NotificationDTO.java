package org.example.bbs.notification;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long notificationIdx;
    private String senderName;  // 보낸 사람 이름
    private String notificationType;
    private String notificationTitle;
    private String notificationMessage;
    private String targetUrl;
    private String isRead;
    private LocalDateTime createdAt;

    public static NotificationDTO from(NotificationEntity e) {
        return NotificationDTO.builder()
                .notificationIdx(e.getNotificationIdx())
                .senderName(e.getSender() != null ? e.getSender().getMemName() : null)
                .notificationType(e.getNotificationType())
                .notificationTitle(e.getNotificationTitle())
                .notificationMessage(e.getNotificationMessage())
                .targetUrl(e.getTargetUrl())
                .isRead(e.getIsRead())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
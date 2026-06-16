package org.example.bbs.notification;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class NotificationController {

    private final NotificationService notificationService;

    // 전체 알림 목록 (NotificationPage용)
    @GetMapping
    public ResponseEntity<?> getAll(HttpSession session) {
        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) return ResponseEntity.status(401).body("로그인 필요");
        return ResponseEntity.ok(notificationService.getAll(memId));
    }

    // 최근 3건 (드롭다운용)
    @GetMapping("/recent")
    public ResponseEntity<?> getRecent(HttpSession session) {
        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) return ResponseEntity.status(401).body("로그인 필요");
        return ResponseEntity.ok(notificationService.getRecent3(memId));
    }

    // 안읽은 수 (헤더 빨간 점)
    @GetMapping("/unread-count")
    public ResponseEntity<?> unreadCount(HttpSession session) {
        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) return ResponseEntity.ok(Map.of("count", 0));
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(memId)));
    }

    // 개별 읽음 처리
    @PostMapping("/{idx}/read")
    public ResponseEntity<?> read(@PathVariable Long idx, HttpSession session) {
        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) return ResponseEntity.status(401).body("로그인 필요");
        notificationService.markAsRead(idx, memId);
        return ResponseEntity.ok(Map.of("result", "success"));
    }

    // 전체 읽음 처리
    @PostMapping("/read-all")
    public ResponseEntity<?> readAll(HttpSession session) {
        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) return ResponseEntity.status(401).body("로그인 필요");
        notificationService.markAllAsRead(memId);
        return ResponseEntity.ok(Map.of("result", "success"));
    }

    // 개별 알림 삭제
    @DeleteMapping("/{idx}")
    public ResponseEntity<?> delete(@PathVariable Long idx, HttpSession session) {
        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) return ResponseEntity.status(401).body("로그인 필요");
        notificationService.deleteNotification(idx, memId);
        return ResponseEntity.ok(Map.of("result", "success"));
    }
}
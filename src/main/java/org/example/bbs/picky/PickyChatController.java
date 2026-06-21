package org.example.bbs.picky;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/picky")
@RequiredArgsConstructor
public class PickyChatController {

    private final PickyChatService pickyChatService;

    // POST /picky/chat — 메시지 전송 (비로그인/로그인 통합)
    @PostMapping("/chat")
    public ResponseEntity<PickyChatResponseDTO> chat(
            @RequestBody PickyChatRequestDTO request,
            HttpServletRequest httpRequest) {

        // 세션에서 loginMember(memId) 꺼내기 — 없으면 null (비로그인 허용)
        String memId = getLoginMemId(httpRequest);

        PickyChatResponseDTO response = pickyChatService.chat(request, memId);
        return ResponseEntity.ok(response);
    }

    // GET /picky/sessions — 내 세션 목록 (로그인 필수)
    @GetMapping("/sessions")
    public ResponseEntity<?> getSessions(HttpServletRequest httpRequest) {
        String memId = getLoginMemId(httpRequest);
        if (memId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        }

        List<PickySessionDTO> sessions = pickyChatService.getSessions(memId);
        return ResponseEntity.ok(sessions);
    }

    // GET /picky/sessions/{sessionIdx}/messages — 세션 메시지 조회 (로그인 필수)
    @GetMapping("/sessions/{sessionIdx}/messages")
    public ResponseEntity<?> getMessages(
            @PathVariable Long sessionIdx,
            HttpServletRequest httpRequest) {

        String memId = getLoginMemId(httpRequest);
        if (memId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        }

        List<PickyMessageDTO> messages = pickyChatService.getMessages(sessionIdx, memId);
        return ResponseEntity.ok(messages);
    }

    // DELETE /picky/sessions/{sessionIdx} — 세션 삭제 (로그인 필수)
    @DeleteMapping("/sessions/{sessionIdx}")
    public ResponseEntity<?> deleteSession(
            @PathVariable Long sessionIdx,
            HttpServletRequest httpRequest) {

        String memId = getLoginMemId(httpRequest);
        if (memId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        }

        pickyChatService.deleteSession(sessionIdx, memId);
        return ResponseEntity.ok(Map.of("result", "deleted"));
    }

    // 세션에서 memId 추출 헬퍼
    private String getLoginMemId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return null;
        return (String) session.getAttribute("loginMember");
    }
}

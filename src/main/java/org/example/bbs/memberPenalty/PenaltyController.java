package org.example.bbs.memberPenalty;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/penalty")
public class PenaltyController {

    private final PenaltyService penaltyService;

    // 관리자용 수동 페널티 부과
    @PostMapping("/apply")
    public ResponseEntity<?> applyPenalty(
            @RequestBody Map<String, Object> body,
            HttpSession session) {

        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) return ResponseEntity.status(401).build();
        // TODO: 관리자 권한 체크 추가

        Long memIdx = Long.valueOf(body.get("memIdx").toString());
        String penaltyCode = (String) body.get("penaltyCode");
        String reason = (String) body.getOrDefault("reason", "");

        penaltyService.applyPenalty(memIdx, penaltyCode, reason);
        return ResponseEntity.ok(Map.of("message", "페널티가 부과되었습니다."));
    }
}
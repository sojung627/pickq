package org.example.bbs.grade;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/grade")
public class GradeController {

    private final GradeService gradeService; 

    // 관리자용 수동 등급 재계산
    @PostMapping("/recalculate/{memIdx}")
    public ResponseEntity<?> recalculate(
            @PathVariable Long memIdx,
            HttpSession session) {

        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) return ResponseEntity.status(401).build();

        gradeService.recalculateGrade(memIdx);
        return ResponseEntity.ok(Map.of("message", "등급이 재계산되었습니다."));
    }
}
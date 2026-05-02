package org.example.bbs.memberUpdate;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/mypage")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class MemberUpdateController {

    private final MemberUpdateService memberService;

    @PostMapping("/info")
    public ResponseEntity<?> updateInfo(@RequestBody MemberUpdateDTO memberUpdateDTO) {
        boolean isUpdated = memberService.updateMemberInfo(memberUpdateDTO);

        if (isUpdated) {
            return ResponseEntity.ok(Map.of("message", "회원정보가 수정 되었습니다."));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "기존 비밀번호와 동일하여 변경할 수 없습니다."));
        }
    }
}
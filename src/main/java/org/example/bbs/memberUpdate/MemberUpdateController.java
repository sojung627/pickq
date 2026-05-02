package org.example.bbs.memberUpdate;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/mypage")
@RequiredArgsConstructor
public class MemberUpdateController {

    private final MemberService memberService;

    @PostMapping("/info")
    public ResponseEntity<?> updateInfo(@RequestBody MemberUpdateDTO memberUpdateDTO) {
        boolean isUpdated = memberService.updateMemberInfo(memberUpdateDTO);

        if (isUpdated) {
            return ResponseEntity.ok(Map.of("message", "정보 업데이트 완료!"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "기존 비밀번호와 동일하여 변경할 수 없습니다."));
        }
    }
}
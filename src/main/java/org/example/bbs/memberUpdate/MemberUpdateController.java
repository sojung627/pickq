package org.example.bbs.memberUpdate;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.example.bbs.member.MemberEntity;
import jakarta.servlet.http.HttpSession;

import java.util.Map;

@RestController
@RequestMapping("/mypage")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class MemberUpdateController {

    private final MemberUpdateService memberService;
    private final MemberUpdateRepository memberUpdateRepository;

    // 회원정보 불러오기
    @GetMapping("/info")
    public ResponseEntity<?> getMemberInfo(
            @SessionAttribute(name = "loginMember") String memId) {
        MemberEntity member = memberUpdateRepository.findByMemId(memId)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        return ResponseEntity.ok(Map.of(
                "memId", member.getMemId(),
                "memName", member.getMemName() != null ? member.getMemName() : "",
                "memEmail", member.getMemEmail() != null ? member.getMemEmail() : "",
                "memTel", member.getMemTel() != null ? member.getMemTel() : "",
                "memBday", member.getMemBday() != null ? member.getMemBday().toString() : "",
                "memLoginType", member.getMemLoginType() != null ? member.getMemLoginType() : "LOCAL"
        ));
    }

    // 회원정보 수정
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
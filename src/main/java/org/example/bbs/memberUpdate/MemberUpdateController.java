package org.example.bbs.memberUpdate;

import lombok.RequiredArgsConstructor;
//import org.springframework.beans.factory.annotation.Autowired;
import org.example.bbs.grade.GradeEntity;
import org.example.bbs.grade.GradeRepository;
import org.springframework.http.ResponseEntity;
//import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import org.example.bbs.member.MemberEntity;

import java.util.Map;

@RestController
@RequestMapping("/mypage")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class MemberUpdateController {

    private final MemberUpdateService memberService;
    private final MemberUpdateRepository memberUpdateRepository;
    private final GradeRepository gradeRepository;

    // 회원정보 불러오기
    @GetMapping("/info")
    public ResponseEntity<?> getMemberInfo(
            @SessionAttribute(name = "loginMember") String memId) {
        MemberEntity member = memberUpdateRepository.findByMemId(memId)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        String gradeName = gradeRepository.findById(member.getMemGradeIdx())
                .map(GradeEntity::getGradeName)
                .orElse("normal");  // 추가

        return ResponseEntity.ok(Map.of(
                "memIdx", member.getMemIdx(),
                "memId", member.getMemId(),
                "memName", member.getMemName() != null ? member.getMemName() : "",
                "memEmail", member.getMemEmail() != null ? member.getMemEmail() : "",
                "memTel", member.getMemTel() != null ? member.getMemTel() : "",
                "memBday", member.getMemBday() != null ? member.getMemBday().toString() : "",
                "memLoginType", member.getMemLoginType() != null ? member.getMemLoginType() : "LOCAL",
                "memPenalty", member.getMemPenalty() != null ? member.getMemPenalty() : 0,
                "memCredit", member.getMemCredit() != null ? member.getMemCredit() : 0,
                "gradeName", gradeName
        ));
    }


    // 회원정보 수정
    @PostMapping("/info")
    public ResponseEntity<?> updateInfo(@RequestBody MemberUpdateDTO memberUpdateDTO) {
        memberService.updateMemberInfo(memberUpdateDTO);
        return ResponseEntity.ok(Map.of("message", "회원정보가 수정 되었습니다."));
    }

    // 이전 비밀번호 동일 여부 확인
    @PostMapping("/checkPwd")
    public ResponseEntity<?> checkPwd(
            @SessionAttribute(name = "loginMember") String memId,
            @RequestBody Map<String, String> body) {
        MemberEntity member = memberUpdateRepository.findByMemId(memId)
                .orElseThrow(() -> new RuntimeException("회원 없음"));
        boolean isSame = memberService.isSamePassword(body.get("newPwd"), member.getMemPwd());
        return ResponseEntity.ok(Map.of("isSame", isSame));
    }
}
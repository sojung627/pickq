package org.example.bbs.member;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    // 비밀번호 인증 API용 Controller

    private final MemberService memberService;

    // 인증번호 일치 여부 확인
    @PostMapping("/verifyCode")
    public String verifyCode(
            @RequestParam("userCode") String userCode,
            HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return "fail";

        String savedCode = (String) session.getAttribute("pwdFindAuthCode");
        if (savedCode != null && savedCode.equals(userCode)) {
            // 인증 성공 시 세션에 인증 완료 표시
            session.setAttribute("pwdFindVerified", true);
            return "success";
        }
        return "fail";
    }

    // 새 비밀번호가 현재 비밀번호와 동일한지 확인
    @PostMapping("/checkSamePwd")
    public String checkSamePwd(
            @RequestParam("newPwd") String newPwd,
            HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return "different";

        String memId = (String) session.getAttribute("pwdFindMemId");
        if (memId == null) return "different";

        return memberService.isSameAsCurrent(memId, newPwd) ? "same" : "different";
    }
}
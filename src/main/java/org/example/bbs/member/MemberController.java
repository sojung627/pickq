package org.example.bbs.member;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/members")
@RequiredArgsConstructor
public class MemberController {

    // 회원가입 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    private final MemberRepository memberRepository;
    private final MemberService memberService;
    private final NaverAuthService naverAuthService;

    // 아이디 중복 확인 (DB 연결)
    @GetMapping("/check_id")
    public String checkId(@RequestParam("memId") String memId) {
        boolean isExist = memberRepository.findByMemId(memId).isPresent();
        return isExist ? "fail" : "ok";
    }

    // 회원가입 처리 (DB 저장)
    @PostMapping("/signUp")
    public String signUpProcess(@RequestBody MemberEntity member) {
        memberService.signUp(member);
        return "success";
    }

    // 로그인 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 로그인 유무에 따라 헤더 수정
    // 사실상 HomeController.java에 넣어도 되는 애임 -> 즉 로그인에서 에러뜨면 이 코드는 안봐도 됨
    @GetMapping("/auth/check")
    public Map<String, Object> checkLogin(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        HttpSession session = request.getSession(false);

        if (session != null && session.getAttribute("loginMember") != null) {
            String memId = (String) session.getAttribute("loginMember");
            MemberEntity member = memberRepository.findByMemId(memId).orElse(null);

            response.put("isLoggedIn", true);

            if (member != null) {
                Map<String, Object> memberInfo = new HashMap<>();
                memberInfo.put("memIdx", member.getMemIdx());
                memberInfo.put("memId", member.getMemId());
                memberInfo.put("memName", member.getMemName());
                memberInfo.put("memRoleIdx", member.getMemRoleIdx());
                response.put("member", memberInfo);
            }
        } else {
            response.put("isLoggedIn", false);
        }

        return response;
    }

    // 로그인 처리
    @PostMapping("/login")
    public Map<String, Object> loginProcess(@RequestBody LoginRequestDTO loginRequest, HttpServletRequest request) {
        Map<String, Object> result = memberService.loginWithLock(loginRequest.getMemId(), loginRequest.getMemPwd());

        if ("success".equals(result.get("status"))) {
            MemberEntity loginMember = (MemberEntity) result.get("member");
            if ("Y".equals(loginMember.getMemIsDeleted())) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "withdrawn");
                response.put("message", "탈퇴한 회원입니다.");
                return response;
            }
            HttpSession session = request.getSession();
            session.setAttribute("loginMember", loginMember.getMemId());
        }

        return result;
    }

    // 로그아웃 및 탈퇴 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 로그아웃
    @PostMapping("/logout")
    public Map<String, Object> logout(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate(); // 세션 완전 삭제!
        }

        response.put("status", "success");
        return response;
    }

    // 탈퇴
    @DeleteMapping("/withdraw")
    public Map<String, Object> withdraw(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("loginMember") == null) {
            response.put("status", "fail");
            response.put("message", "로그인이 필요합니다.");
            return response;
        }

        String memId = (String) session.getAttribute("loginMember");
        memberService.withdraw(memId);

        session.invalidate(); // 세션 삭제
        response.put("status", "success");
        return response;
    }

    // 그 외 다른 페이지 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 경매 리스트 페이지 new버튼용
    @GetMapping("/api/session")
    public ResponseEntity<Map<String, Object>> getSession(HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        String loginMember = (String) session.getAttribute("loginMember");
        if (loginMember != null) {
            result.put("loginUser", loginMember);
        }
        return ResponseEntity.ok(result);
    }

    // 리뷰 관리자 페이지 버튼용
    @GetMapping("/me")
    @ResponseBody
    public ResponseEntity<?> getLoginMember(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("loginMember") == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        String memId = (String) session.getAttribute("loginMember");
        MemberEntity member = memberRepository.findByMemId(memId).orElseThrow();

        Map<String, Object> response = new HashMap<>();
        response.put("memId", member.getMemId());
        response.put("memName", member.getMemName());
        response.put("memRoleIdx", member.getMemRoleIdx());

        return ResponseEntity.ok(response);
    }

    // 비밀번호 찾기 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 아이디 + 전화번호 검증 후 SMS 인증번호 발송
    @PostMapping("/pwdFind")
    public Map<String, Object> pwdFind(
            @RequestParam("memId") String memId,
            @RequestParam("memTel") String memTel,
            HttpServletRequest request) {
        return memberService.sendPwdFindAuthCode(memId, memTel, request.getSession());
    }

    // 인증 완료 후 새 비밀번호로 변경
    @PostMapping("/newPwdFind")
    public String newPwdFind(
            @RequestParam("authCode") String authCode,
            @RequestParam("newPassword") String newPassword,
            HttpServletRequest request) {
        return memberService.resetPassword(authCode, newPassword, request.getSession(false));
    }

    // 네이버 로그인 api ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    @GetMapping("/naverLogin")
    public void naverLogin(
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        String state = UUID.randomUUID().toString();
        HttpSession session = request.getSession(true);
        session.setAttribute("naverOauthState", state);

        response.sendRedirect(naverAuthService.createAuthorizationUrl(state));
    }

    @GetMapping("/naverCallback")
    public void naverCallback(
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "error", required = false) String error,
            @RequestParam(value = "error_description", required = false) String errorDescription,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        if (error != null) {
            redirectToLogin(response,
                    "네이버 로그인이 취소되었거나 실패했습니다. "
                            + (errorDescription == null ? "" : errorDescription));
            return;
        }

        HttpSession session = request.getSession(false);
        String savedState = session == null
                ? null
                : (String) session.getAttribute("naverOauthState");

        if (session != null) {
            session.removeAttribute("naverOauthState");
        }

        if (code == null || state == null || savedState == null || !savedState.equals(state)) {
            redirectToLogin(response, "네이버 로그인 인증 정보가 일치하지 않습니다.");
            return;
        }

        try {
            String accessToken = naverAuthService.getAccessToken(code, state);
            MemberEntity member = naverAuthService.processNaverLoginByToken(accessToken);

            if ("Y".equals(member.getMemIsDeleted())) {
                redirectToLogin(response, "탈퇴한 회원입니다.");
                return;
            }

            session.setAttribute("loginMember", member.getMemId());

            // Nginx를 통해 접속한 현재 프론트 origin의 메인 페이지로 이동
            response.sendRedirect("/");
        } catch (Exception e) {
            redirectToLogin(response, "네이버 로그인 처리에 실패했습니다.");
        }
    }

    private void redirectToLogin(HttpServletResponse response, String message) throws IOException {
        String encodedMessage = URLEncoder.encode(message, StandardCharsets.UTF_8);
        response.sendRedirect("/members/login?msg=" + encodedMessage);
    }

}
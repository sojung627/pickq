package org.example.bbs.member;

import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/members")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class MemberController {

    // 회원가입 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    private final MemberRepository memberRepository;

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

    // 로그인 처리
    private final MemberService memberService;

    // 로그인 유무에 따라 헤더 수정
    @GetMapping("/auth/check")
    public Map<String, Object> checkLogin(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        HttpSession session = request.getSession(false); // 세션 없으면 null

        if (session != null && session.getAttribute("loginMember") != null) {
            response.put("isLoggedIn", true);
        } else {
            response.put("isLoggedIn", false);
        }
        return response;
    }

    // 로그인 처리
    @PostMapping("/login")
    public Map<String, Object> loginProcess(@RequestBody LoginRequestDTO loginRequest, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();

        // loginRequest에서 아이디와 비번을 꺼내서 서비스에 전달!
        MemberEntity loginMember = memberService.login(loginRequest.getMemId(), loginRequest.getMemPwd());

        if (loginMember != null) {
            HttpSession session = request.getSession();
            session.setAttribute("loginMember", loginMember.getMemId());
            response.put("status", "success");
            response.put("message", "로그인 되었습니다.");
            // 확인용
            System.out.println("로그인 성공 아이디: " + loginMember.getMemId());
            System.out.println("로그인 성공 이름: " + loginMember.getMemName());
        } else {
            response.put("status", "fail");
            response.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
            // 확인용
            System.out.println("로그인 실패 시도 아이디: " + loginRequest.getMemId());
        }
        return response;
    }

    // 로그인 API ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 수정할 확률 매우 높음
    // 네이버 로그인 콜백 (Login.jsx의 callbackUrl 대응)
    @GetMapping("/naverCallback")
    public String naverCallback(@RequestParam("code") String code, @RequestParam("state") String state) {
        // 네이버 인증 후 돌아오는 로직 처리 지점
        return "naver_success";
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

}
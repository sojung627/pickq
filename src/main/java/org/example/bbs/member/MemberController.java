package org.example.bbs.member;

import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/members")
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
    // 사실상 HomeController.java에 넣어도 되는 애임 -> 즉 로그인에서 에러뜨면 이 코드는 안봐도 됨
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

    // 로그인 API ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 수정할 확률 매우 높음
    // 네이버 로그인 콜백 (Login.jsx의 callbackUrl 대응)
    @GetMapping("/naverCallback")
    public Map<String, Object> naverCallback(
            @RequestParam("code") String code,
            @RequestParam("state") String state) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        return response;
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

}
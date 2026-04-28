package org.example.bbs.member;

import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/members")
@CrossOrigin(origins = "http://localhost:5173") // 프론트 포트 5173 허용
public class MemberController {

    // 회원가입 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 1. 아이디 중복 확인
    @GetMapping("/check_id")
    public String checkId(@RequestParam("memId") String memId) {
        // DB 조회 로직 (예시: "admin"이면 중복)
        boolean isExist = "admin".equals(memId);

        return isExist ? "fail" : "ok";
    }

    // 2. 회원가입 처리
    @PostMapping("/signUp")
    public String register(@RequestParam Map<String, String> params) {
        // 쩡이가 React에서 보낸 formData가 params에 싹 다 들어올 거야
        System.out.println("가입 요청 아이디: " + params.get("memId"));
        System.out.println("가입 요청 이름: " + params.get("memName"));

        // 서비스 레이어 호출해서 DB 저장 로직 짜면 끝!
        return "success";
    }

    // 로그인 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 로그인 처리
    @PostMapping("/login")
    public Map<String, Object> loginProcess(@RequestParam("memId") String memId,
                                            @RequestParam("memPwd") String memPwd,
                                            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        // DB 조회 로직이 들어갈 자리

        // 로그인 값 체크
        System.out.println("프론트(5173)에서 넘어온 아이디: " + memId);
        System.out.println("프론트(5173)에서 넘어온 비번: " + memPwd);

        // 세션에 저장
        if ("admin".equals(memId)) { // 테스트용 조건
            HttpSession session = request.getSession();
            session.setAttribute("loginMember", memId);

            response.put("status", "success");
            response.put("message", "로그인 성공");
        } else {
            response.put("status", "fail");
            response.put("message", "아이디 또는 비밀번호를 확인해주세요.");
        }

        return response;
    }

    // 수정할 확률 매우 높음
    // 네이버 로그인 콜백 (Login.jsx의 callbackUrl 대응)
    @GetMapping("/naverCallback")
    public String naverCallback(@RequestParam("code") String code, @RequestParam("state") String state) {
        // 네이버 인증 후 돌아오는 로직 처리 지점
        return "naver_success";
    }

    // 회원가입 / 비밀번호 찾기 등 추가 경로
    @PostMapping("/signUp")
    public String signUpProcess(MemberEntity member) {
        // MemberEntity 구조 그대로 파라미터 받기 가능
        return "register_ok";
    }
}
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
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
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
    public String signUpProcess(@RequestBody MemberEntity member) {
        // @RequestBody를 붙여야 React에서 보낸 JSON 데이터를 Entity로 찰떡같이 받아!
        System.out.println("회원가입 시도 아이디: " + member.getMemId());
        System.out.println("회원가입 시도 이름: " + member.getMemName());

        // 여기서 서비스 호출해서 DB 저장하면 끝!

        return "success";
    }

    // 로그인 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 로그인 처리
    private final MemberService memberService;

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

//    @PostMapping("/login")
//    public Map<String, Object> loginProcess(@RequestBody MemberEntity member, HttpServletRequest request) {
//
//        Map<String, Object> response = new HashMap<>();
//
//        MemberEntity loginMember = memberService.login(member.getMemId(), member.getMemPwd());
//
//        if (loginMember != null) {
//            HttpSession session = request.getSession();
//            session.setAttribute("loginMember", loginMember.getMemId());
//            response.put("status", "success");
//            response.put("message", "로그인 되었습니다.");
//        } else {
//            response.put("status", "fail");
//            response.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
//        }
//
//        System.out.println("로그인 시도 아이디: " + member.getMemId());
//        System.out.println("로그인 시도 이름: " + member.getMemName());
//
//        return response;
//    }


    // 수정할 확률 매우 높음
    // 네이버 로그인 콜백 (Login.jsx의 callbackUrl 대응)
    @GetMapping("/naverCallback")
    public String naverCallback(@RequestParam("code") String code, @RequestParam("state") String state) {
        // 네이버 인증 후 돌아오는 로직 처리 지점
        return "naver_success";
    }

}
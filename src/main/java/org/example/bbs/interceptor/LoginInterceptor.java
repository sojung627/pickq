package org.example.bbs.interceptor;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class LoginInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        HttpSession session = request.getSession();

        // MemberController에서 "loginMember"라는 이름으로 아이디를 저장했길래 똑같이 맞췄어!
        if (session.getAttribute("loginMember") == null) {
            // 메시지를 한글로 보내기 위해 인코딩 처리
            String message = URLEncoder.encode("로그인이 필요한 서비스 입니다.", StandardCharsets.UTF_8);

            // 리액트 로그인 페이지로 리다이렉트 (URL 파라미터 포함)
            response.sendRedirect("/members/login?msg=" + message);
            return false; // 더 이상 진행 안 함
        }

        return true; // 로그인 되어 있으면 통과
    }
}
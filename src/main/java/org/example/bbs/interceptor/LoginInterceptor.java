package org.example.bbs.interceptor;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
public class LoginInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        HttpSession session = request.getSession();

        // 세션 체크
        if (session.getAttribute("loginMember") == null) {

            // JSON으로 응답 - 401
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");

            // JSON 전송
            response.getWriter().write("{\"status\":\"unauthorized\",\"message\":\"로그인이 필요한 서비스입니다.\"}");

            // 컨트롤러 요청 차단
            return false;
        }

        // 로그인 된 사람만 통과 가능
        return true;
    }
}
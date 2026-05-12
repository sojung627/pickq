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

        // 1. 세션 체크
        if (session.getAttribute("loginMember") == null) {

            // 2. React 프로젝트니까 무조건 JSON으로 응답하기 (401 에러)
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 Unauthorized
            response.setContentType("application/json;charset=UTF-8");

            // JSON 메시지 전송
            response.getWriter().write("{\"status\":\"unauthorized\",\"message\":\"로그인이 필요한 서비스입니다.\"}");

            // 여기서 false를 리턴해야 컨트롤러로 요청이 안 넘어가!
            return false;
        }

        // 3. 로그인이 되어있다면 컨트롤러로 그대로 진행
        return true;
    }
}
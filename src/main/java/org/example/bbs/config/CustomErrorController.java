package org.example.bbs.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

// 에러 - 에러핸들링이 아닌 에러 확인용(개발자한테만 필요한 기능)

@RestController
public class CustomErrorController implements ErrorController {

    @RequestMapping("/api/error")
    public ResponseEntity<?> handleError(HttpServletRequest request) {
        Integer statusCode = (Integer) request.getAttribute("javax.servlet.error.status_code");
        Exception exception = (Exception) request.getAttribute("javax.servlet.error.exception");
        String message = exception != null ? exception.getMessage() : "알 수 없는 에러";
        return ResponseEntity.status(statusCode != null ? statusCode : 500)
                .body(Map.of("error", message));
    }
}

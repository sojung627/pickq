package org.example.bbs.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {
      // Docker 배포할 때만 주석
//    @Bean
//    public CorsFilter corsFilter() {
//        CorsConfiguration config = new CorsConfiguration();
//
//        config.setAllowCredentials(true);                          // 쿠키(세션) 허용
//        config.addAllowedOrigin("http://localhost:5173");          // 리액트 주소
//        config.addAllowedHeader("*");                              // 모든 헤더 허용
//        config.addAllowedMethod("*");                              // GET POST PUT DELETE 전부 허용
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", config);          // 모든 경로 적용
//
//        return new CorsFilter(source);
//    }
}

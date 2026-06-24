package org.example.bbs.config;

import org.example.bbs.interceptor.LoginInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final LoginInterceptor loginInterceptor;
    private final String uploadRootDir;

    public WebConfig(
            LoginInterceptor loginInterceptor,
            @Value("${app.upload.root-dir:./uploads}") String uploadRootDir
    ) {
        this.loginInterceptor = loginInterceptor;
        this.uploadRootDir = uploadRootDir;
    }

    /**
     * 사용자 업로드 파일을 /uploads/** URL로 노출한다.
     * Railway에서는 UPLOAD_ROOT_DIR=/app/uploads 로 지정하고
     * 같은 경로에 Volume을 마운트해야 재배포 후에도 파일이 유지된다.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadRootDir)
                .toAbsolutePath()
                .normalize();

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath.toUri().toString());
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginInterceptor)
                .addPathPatterns(
                        "/mypage/**",
                        "/boards/**/new",
                        "/boards/**/edit"
                )
                .excludePathPatterns(
                        "/members/login",
                        "/members/signUp",
                        // 다른 사용자의 프로필 모달은 비로그인 상태에서도 볼 수 있어야 한다.
                        "/mypage/profile/modal/**",
                        "/css/**",
                        "/js/**",
                        "/images/**",
                        "/uploads/**",
                        "/fragments/**",
                        "/error",
                        "/api/error"
                );
    }
}

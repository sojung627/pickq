package org.example.bbs.member;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Service
public class NaverAuthService {

    @Value("${naver.client-id}")
    private String clientId;

    @Value("${naver.client-secret}")
    private String clientSecret;

    @Value("${naver.redirect-uri}")
    private String redirectUri;

    private final MemberRepository memberRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public NaverAuthService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    // 네이버 인가 페이지 URL 생성
    public String createAuthorizationUrl(String state) {
        return UriComponentsBuilder
                .fromUriString("https://nid.naver.com/oauth2.0/authorize")
                .queryParam("response_type", "code")
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("state", state)
                .build()
                .encode()
                .toUriString();
    }

    // 네이버 액세스 토큰 발급
    public String getAccessToken(String code, String state) {
        URI uri = UriComponentsBuilder
                .fromUriString("https://nid.naver.com/oauth2.0/token")
                .queryParam("grant_type", "authorization_code")
                .queryParam("client_id", clientId)
                .queryParam("client_secret", clientSecret)
                .queryParam("code", code)
                .queryParam("state", state)
                .build()
                .encode()
                .toUri();

        ResponseEntity<String> response = restTemplate.getForEntity(uri, String.class);
        JsonNode json = readJson(response.getBody(), "네이버 액세스 토큰 응답 파싱 실패");

        if (!response.getStatusCode().is2xxSuccessful() || json.hasNonNull("error")) {
            String description = json.path("error_description").asText("알 수 없는 오류");
            throw new IllegalStateException("네이버 액세스 토큰 발급 실패: " + description);
        }

        JsonNode accessToken = json.get("access_token");
        if (accessToken == null || accessToken.asText().isBlank()) {
            throw new IllegalStateException("네이버 액세스 토큰이 응답에 없습니다.");
        }

        return accessToken.asText();
    }

    // 네이버 사용자 프로필 조회
    public JsonNode getNaverProfile(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                "https://openapi.naver.com/v1/nid/me",
                HttpMethod.GET,
                entity,
                String.class
        );

        JsonNode json = readJson(response.getBody(), "네이버 프로필 응답 파싱 실패");

        if (!response.getStatusCode().is2xxSuccessful()
                || !"00".equals(json.path("resultcode").asText())) {
            throw new IllegalStateException(
                    "네이버 프로필 조회 실패: " + json.path("message").asText("알 수 없는 오류")
            );
        }

        JsonNode profile = json.get("response");
        if (profile == null || profile.isNull()) {
            throw new IllegalStateException("네이버 프로필 정보가 응답에 없습니다.");
        }

        return profile;
    }

    // 네이버 로그인 처리: 신규 회원이면 자동 가입, 기존 회원이면 로그인
    public MemberEntity processNaverLoginByToken(String accessToken) {
        JsonNode profile = getNaverProfile(accessToken);

        String naverId = profile.path("id").asText();
        if (naverId.isBlank()) {
            throw new IllegalStateException("네이버 회원 식별값을 가져오지 못했습니다.");
        }

        String name = profile.path("name").asText("네이버유저");
        String email = profile.path("email").asText("");
        String tel = profile.path("mobile").asText("").replace("-", "");

        String memId = "naver_" + naverId;

        return memberRepository.findByMemId(memId).orElseGet(() -> {
            MemberEntity newMember = MemberEntity.builder()
                    .memId(memId)
                    .memPwd("NAVER_LOGIN_NO_PWD")
                    .memName(name)
                    .memEmail(email)
                    .memTel(tel)
                    .memIp("0.0.0.0")
                    .memRoleIdx(1)
                    .memGradeIdx(1)
                    .memLoginType("NAVER")
                    .memIsDeleted("N")
                    .memLocked("N")
                    .memLoginFailCount(0)
                    .memCredit(50)
                    .memPenalty(0)
                    .build();
            return memberRepository.save(newMember);
        });
    }

    private JsonNode readJson(String body, String errorMessage) {
        try {
            return objectMapper.readTree(body == null ? "{}" : body);
        } catch (Exception e) {
            throw new IllegalStateException(errorMessage, e);
        }
    }
}

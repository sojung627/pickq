package org.example.bbs.member;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class NaverAuthService {

    @Value("${naver.client-id}")
    private String clientId;

    @Value("${naver.client-secret}")
    private String clientSecret;

    private final MemberRepository memberRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public NaverAuthService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    // 네이버 액세스 토큰 발급
    public String getAccessToken(String code, String state) {
        String url = "https://nid.naver.com/oauth2.0/token"
                + "?grant_type=authorization_code"
                + "&client_id=" + clientId
                + "&client_secret=" + clientSecret
                + "&code=" + code
                + "&state=" + state;

        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        try {
            JsonNode json = objectMapper.readTree(response.getBody());
            return json.get("access_token").asText();
        } catch (Exception e) {
            throw new RuntimeException("네이버 액세스 토큰 발급 실패", e);
        }
    }

    // 네이버 사용자 프로필 조회
    public JsonNode getNaverProfile(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                "https://openapi.naver.com/v1/nid/me",
                HttpMethod.GET,
                entity,
                String.class
        );

        try {
            JsonNode json = objectMapper.readTree(response.getBody());
            return json.get("response");
        } catch (Exception e) {
            throw new RuntimeException("네이버 프로필 조회 실패", e);
        }
    }

    // 네이버 로그인 처리: 신규 회원이면 자동 가입, 기존 회원이면 로그인
    public MemberEntity processNaverLoginByToken(String accessToken) {
        JsonNode profile = getNaverProfile(accessToken);

        String naverId = profile.get("id").asText();
        String name = profile.has("name") ? profile.get("name").asText() : "네이버유저";
        String email = profile.has("email") ? profile.get("email").asText() : "";
        String tel = profile.has("mobile") ? profile.get("mobile").asText().replace("-", "") : "";

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

}

package org.example.bbs.gemini;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 리뷰 내용에서 핵심 키워드를 추출합니다.
     * @param reviewContent 리뷰 본문
     * @return 쉼표로 구분된 키워드 문자열 (예: "친절,빠른배송,좋은품질")
     *         실패 시 빈 문자열 반환
     */
    public String extractKeywords(String reviewContent) {
        if (reviewContent == null || reviewContent.trim().isEmpty()) {
            return "";
        }

        try {
            String prompt = "다음 스포츠 거래 리뷰에서 핵심 키워드를 최대 5개 추출해줘. " +
                    "쉼표로만 구분하고 키워드만 반환해. 설명이나 번호는 절대 붙이지 마. " +
                    "예시: 친절,빠른배송,정품,소통원활,포장꼼꼼\n\n리뷰: " + reviewContent;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            String urlWithKey = apiUrl + "?key=" + apiKey;

            ResponseEntity<Map> response = restTemplate.postForEntity(urlWithKey, request, Map.class);

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                log.warn("[GeminiService] 응답 상태 이상: {}", response.getStatusCode());
                return "";
            }

            // 응답 파싱: candidates[0].content.parts[0].text
            List<?> candidates = (List<?>) response.getBody().get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                return "";
            }

            Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
            Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
            List<?> parts = (List<?>) content.get("parts");
            Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);

            String rawText = (String) firstPart.get("text");
            if (rawText == null) return "";

            // 불필요한 공백, 개행 제거 후 반환
            return rawText.trim().replace("\n", "").replace(" ", "");

        } catch (Exception e) {
            log.error("[GeminiService] 키워드 추출 실패: {}", e.getMessage());
            return "";
        }
    }
}
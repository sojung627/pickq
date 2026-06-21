package org.example.bbs.gemini;

import lombok.extern.slf4j.Slf4j;
import org.example.bbs.picky.PickyChatMessageEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
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

    public String extractKeywords(String reviewContent) {
        // 제미나이 일하는지 확인용
        log.info("[GeminiService] API KEY 앞 5자리: {}",
                apiKey != null ? apiKey.substring(0, 5) : "NULL");

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

    // 피키 챗봇 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    /**
     * 피키 챗봇 메시지 전송
     * @param userMessage   사용자가 보낸 현재 메시지
     * @param history       DB에서 불러온 이전 대화 히스토리 (없으면 빈 리스트)
     * @return              피키의 응답 텍스트
     */
    public String chat(String userMessage, List<PickyChatMessageEntity> history) {
        try {
            List<Map<String, Object>> contents = new ArrayList<>();

            // 시스템 프롬프트 — 피키 캐릭터 + PickQ 도메인 지식 주입
            // Gemini는 system role이 없으므로 첫 user 메시지로 주입
            contents.add(Map.of(
                    "role", "user",
                    "parts", List.of(Map.of("text",
                            "너는 스포츠 역경매 플랫폼 'PickQ'의 AI 어시스턴트 '피키'야. " +
                                    "PickQ는 구매자가 원하는 스포츠 용품을 경매 글로 올리면 판매자들이 입찰하는 역경매 플랫폼이야. " +
                                    "피키의 역할: 사이트 이용 가이드, 경매 프로세스 설명, 경매 제목/내용 추천, 카테고리 추천, 리뷰 작성 도움, 입찰 금액 조언, 일반 대화. " +
                                    "말투는 친근하고 활발하게, 이모지를 적절히 써줘. 답변은 간결하게 3~5문장 이내로 해줘. " +
                                    "모르는 건 솔직하게 모른다고 해줘."
                    ))
            ));
            contents.add(Map.of(
                    "role", "model",
                    "parts", List.of(Map.of("text",
                            "안녕하세요! 저는 PickQ의 AI 어시스턴트 피키예요 🏆 " +
                                    "경매 관련 궁금한 점이나 도움이 필요한 거 있으면 뭐든 물어보세요!"
                    ))
            ));

            // 이전 대화 히스토리 추가 (DB에서 불러온 것)
            for (PickyChatMessageEntity msg : history) {
                String geminiRole = msg.getRole().equals("user") ? "user" : "model";
                contents.add(Map.of(
                        "role", geminiRole,
                        "parts", List.of(Map.of("text", msg.getContent()))
                ));
            }

            // 현재 사용자 메시지 추가
            contents.add(Map.of(
                    "role", "user",
                    "parts", List.of(Map.of("text", userMessage))
            ));

            Map<String, Object> requestBody = Map.of("contents", contents);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            String urlWithKey = apiUrl + "?key=" + apiKey;

            ResponseEntity<Map> response = restTemplate.postForEntity(urlWithKey, request, Map.class);

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                log.warn("[GeminiService] chat 응답 이상: {}", response.getStatusCode());
                return "피키가 잠깐 생각 중이에요. 다시 한번 말해줄래요? 🤔";
            }

            return parseGeminiText(response.getBody());

        } catch (Exception e) {
            log.error("[GeminiService] chat 실패: {}", e.getMessage());
            return "피키가 잠깐 자리를 비웠어요. 잠시 후 다시 시도해 주세요! 😅";
        }
    }

    // 공동 응답 파싱 헬퍼
    private String parseGeminiText(Map<?, ?> body) {
        try {
            List<?> candidates = (List<?>) body.get("candidates");
            if (candidates == null || candidates.isEmpty()) return null;

            Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
            Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
            List<?> parts = (List<?>) content.get("parts");
            Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);

            return (String) firstPart.get("text");
        } catch (Exception e) {
            log.error("[GeminiService] 응답 파싱 실패: {}", e.getMessage());
            return null;
        }
    }


}
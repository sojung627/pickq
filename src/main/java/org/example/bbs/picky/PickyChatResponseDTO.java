package org.example.bbs.picky;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PickyChatResponseDTO {

    private String answer;       // 피키 응답 텍스트
    private Long sessionIdx;     // 로그인 사용자면 세션 ID 반환 (프론트에서 저장), 비로그인이면 null
}

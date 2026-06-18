package org.example.bbs.picky;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PickyMessageDTO {

    private Long messageIdx;
    private String role;          // "user" or "assistant"
    private String content;
    private LocalDateTime createdAt;

    public static PickyMessageDTO from(PickyChatMessageEntity entity) {
        return PickyMessageDTO.builder()
                .messageIdx(entity.getMessageIdx())
                .role(entity.getRole())
                .content(entity.getContent())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}

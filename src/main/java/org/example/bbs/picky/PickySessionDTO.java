package org.example.bbs.picky;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PickySessionDTO {

    private Long sessionIdx;
    private String sessionTitle;
    private LocalDateTime updatedAt;

    public static PickySessionDTO from(PickyChatSessionEntity entity) {
        return PickySessionDTO.builder()
                .sessionIdx(entity.getSessionIdx())
                .sessionTitle(entity.getSessionTitle())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}

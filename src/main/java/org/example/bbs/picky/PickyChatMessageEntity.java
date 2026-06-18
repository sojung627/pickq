package org.example.bbs.picky;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "picky_chat_message")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PickyChatMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_idx")
    private Long messageIdx;

    // 세션 FK
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_idx", nullable = false)
    private PickyChatSessionEntity session;

    // "user" 또는 "assistant"
    @Column(name = "role", length = 10, nullable = false)
    private String role;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // 정적 팩토리 메서드
    public static PickyChatMessageEntity of(PickyChatSessionEntity session, String role, String content) {
        return PickyChatMessageEntity.builder()
                .session(session)
                .role(role)
                .content(content)
                .build();
    }
}

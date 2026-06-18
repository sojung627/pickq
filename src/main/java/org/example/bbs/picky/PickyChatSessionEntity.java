package org.example.bbs.picky;

import jakarta.persistence.*;
import lombok.*;
import org.example.bbs.member.MemberEntity;

import java.time.LocalDateTime;

@Entity
@Table(name = "picky_chat_session")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PickyChatSessionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_idx")
    private Long sessionIdx;

    // 로그인 사용자 FK
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mem_idx", nullable = false)
    private MemberEntity member;

    // 세션 제목 (첫 메시지 앞 20자 자동 설정)
    @Column(name = "session_title", length = 200)
    private String sessionTitle;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted", length = 1, nullable = false)
    @Builder.Default
    private String isDeleted = "N";

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // 정적 팩토리 메서드
    public static PickyChatSessionEntity of(MemberEntity member, String firstMessage) {
        String title = firstMessage.length() > 20
                ? firstMessage.substring(0, 20) + "..."
                : firstMessage;

        return PickyChatSessionEntity.builder()
                .member(member)
                .sessionTitle(title)
                .isDeleted("N")
                .build();
    }
}

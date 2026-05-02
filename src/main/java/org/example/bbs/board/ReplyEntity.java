package org.example.bbs.board;

import jakarta.persistence.*;
import lombok.*;
import org.example.bbs.member.MemberEntity;
import java.time.LocalDateTime;

@Entity
@Table(name = "reply")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ReplyEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reply_idx")
    private Long replyIdx;

    // 게시글 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_idx", nullable = false)
    private BoardEntity board;

    // 작성자 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mem_idx", nullable = false)
    private MemberEntity member;

    @Column(name = "reply_content", length = 1000)
    private String replyContent;

    @Column(name = "reply_ip", length = 40)
    private String replyIp;

    @Column(name = "reply_like", nullable = false)
    private Integer replyLike;

    @Column(name = "reply_regdate", updatable = false)
    private LocalDateTime replyRegdate;

    @Column(name = "reply_moddate")
    private LocalDateTime replyModdate;

    @Column(name = "reply_is_deleted", nullable = false, length = 1)
    private String replyIsDeleted;

    @Column(name = "reply_deldate")
    private LocalDateTime replyDeldate;

    @Column(name = "reply_ref", nullable = false)
    private Integer replyRef; // 원댓글 번호

    @Column(name = "reply_step")
    private Integer replyStep; // 댓글 순서

    @Column(name = "reply_depth")
    private Integer replyDepth; // 댓글 깊이

    @PrePersist
    public void prePersist() {
        if (this.replyRegdate == null) {
            this.replyRegdate = LocalDateTime.now();
        }
        if (this.replyLike == null) {
            this.replyLike = 0;
        }
        if (this.replyIsDeleted == null) {
            this.replyIsDeleted = "N";
        }
    }
}
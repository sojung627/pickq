package org.example.bbs.board;

import jakarta.persistence.*;
import lombok.*;
import org.example.bbs.member.MemberEntity;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "reply_like",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"reply_idx", "mem_idx"})
        }
)
public class ReplyLikeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long replyLikeIdx;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_idx")
    private ReplyEntity reply;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mem_idx")
    private MemberEntity member;
}

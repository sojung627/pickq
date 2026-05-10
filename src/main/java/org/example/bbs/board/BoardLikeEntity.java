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
        name = "board_like",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"board_idx", "mem_idx"})
        }
)
public class BoardLikeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long boardLikeIdx;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_idx")
    private BoardEntity board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mem_idx")
    private MemberEntity member;
}

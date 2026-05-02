package org.example.bbs.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.bbs.member.MemberEntity; // MemberEntity 위치 확인 필요
import java.time.LocalDateTime;

@Entity
@Table(name = "board")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class BoardEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "board_idx")
    private Long boardIdx;

    // 작성자 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mem_idx", nullable = false)
    private MemberEntity member;

    @Column(name = "board_title", nullable = false, length = 200)
    private String boardTitle;

    @Column(name = "board_content", columnDefinition = "TEXT")
    private String boardContent;

    @Column(name = "board_ip", nullable = false, length = 40)
    private String boardIp;

    @Column(name = "board_thumbnail", length = 200)
    private String boardThumbnail;

    @Column(name = "board_view_count", nullable = false)
    private Long boardViewCount;

    @Column(name = "board_like", nullable = false)
    private Integer boardLike;

    // 게시판 타입 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_type_idx", nullable = false)
    private BoardTypeEntity boardType;

    @Column(name = "board_regdate", updatable = false)
    private LocalDateTime boardRegdate;

    @Column(name = "board_moddate")
    private LocalDateTime boardModdate;

    @Column(name = "board_is_deleted", nullable = false, length = 1)
    private String boardIsDeleted;

    @Column(name = "board_deldate")
    private LocalDateTime boardDeldate;

    @PrePersist
    public void prePersist() {
        if (this.boardRegdate == null) {
            this.boardRegdate = LocalDateTime.now();
        }
        if (this.boardViewCount == null) {
            this.boardViewCount = 0L;
        }
        if (this.boardLike == null) {
            this.boardLike = 0;
        }
        if (this.boardIsDeleted == null) {
            this.boardIsDeleted = "N";
        }
    }
}
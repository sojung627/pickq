package org.example.bbs.board;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "board_type")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class BoardTypeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "board_type_idx")
    private Integer boardTypeIdx;

    @Column(name = "board_type_code", nullable = false, length = 50, unique = true)
    private String boardTypeCode; // GOLF_BOARD 등

    @Column(name = "board_type_name", nullable = false, length = 100)
    private String boardTypeName;

    @Column(name = "board_can_comment", nullable = false, length = 1)
    private String boardCanComment; // Y / N

    @Column(name = "board_min_role", nullable = false)
    private Long boardMinRole; // 최소 권한 (role_idx)

    @PrePersist
    public void prePersist() {
        if (this.boardCanComment == null) {
            this.boardCanComment = "Y";
        }
        if (this.boardMinRole == null) {
            this.boardMinRole = 1L;
        }
    }

    @OneToMany(mappedBy = "boardType")
    @JsonIgnore
    private List<BoardEntity> boards;
}
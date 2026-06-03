package org.example.bbs.board;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class BoardListDTO {
    private Long boardIdx;
    private String boardTitle;
    private Long boardViewCount;
    private Integer boardLike;
    private LocalDateTime boardRegdate;
    private String boardTypeCode;
    private String memId;
    private String memNickname;
    // 추가
    private String boardTypeName;
    private int replyCount;
}

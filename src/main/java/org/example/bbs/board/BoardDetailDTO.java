package org.example.bbs.board;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class BoardDetailDTO {
    private Long boardIdx;
    private String boardTitle;
    private String boardContent;
    private String boardTypeCode;
    private String boardTypeName;
    private Long memIdx;
    private String memId;
    private Long boardViewCount;
    private Integer boardLike;
    private LocalDateTime boardRegdate;
    private boolean isLiked;
    // 프사용
    private String memNickname;
    private String memProfileImg;
}

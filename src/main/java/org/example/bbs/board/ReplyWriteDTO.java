package org.example.bbs.board;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReplyWriteDTO {
    private String replyContent;
    private Long replyParentIdx;
}
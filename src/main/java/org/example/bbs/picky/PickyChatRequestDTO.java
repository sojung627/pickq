package org.example.bbs.picky;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PickyChatRequestDTO {

    private String message;      // 사용자가 보낸 메시지
    private Long sessionIdx;     // null이면 새 세션 생성 (비로그인도 null)
}

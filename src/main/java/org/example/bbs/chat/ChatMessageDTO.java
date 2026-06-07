package org.example.bbs.chat;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageDTO {
    private Long chatroomIdx;
    private Long senderIdx;
    private String messageContent;
}
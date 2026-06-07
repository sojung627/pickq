package org.example.bbs.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatMessageController {

    private final SimpMessagingTemplate messagingTemplate;

    // 프론트에서 /app/chat/send 로 발행하면 여기서 받음
    @MessageMapping("/chat/send")
    public void sendMessage(ChatMessageDTO dto) {
        messagingTemplate.convertAndSend(
                "/topic/chatroom/" + dto.getChatroomIdx(),
                Map.of(
                        "chatroomIdx", dto.getChatroomIdx(),
                        "senderIdx", dto.getSenderIdx(),
                        "messageContent", dto.getMessageContent()
                )
        );
    }
}
package org.example.bbs.chat;

import lombok.RequiredArgsConstructor;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatMessageController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatroomRepository chatroomRepository;
    private final MemberRepository memberRepository;

    @MessageMapping("/chat/send")
    public void sendMessage(ChatMessageDTO dto) {

        ChatroomEntity chatroom = chatroomRepository.findById(dto.getChatroomIdx())
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        MemberEntity sender = memberRepository.findById(dto.getSenderIdx())
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        ChatMessageEntity saved = chatMessageRepository.save(
                ChatMessageEntity.builder()
                        .chatroom(chatroom)
                        .sender(sender)
                        .messageContent(dto.getMessageContent())
                        .build()
        );

        // 브로드캐스트
        messagingTemplate.convertAndSend(
                "/topic/chatroom/" + dto.getChatroomIdx(),
                Map.of(
                        "chatroomIdx",    dto.getChatroomIdx(),
                        "senderIdx",      dto.getSenderIdx(),
                        "messageContent", dto.getMessageContent(),
                        "isRead",         saved.getIsRead()
                )
        );
    }
}
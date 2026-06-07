package org.example.bbs.chat;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatroomRepository chatroomRepository;
    private final MemberRepository memberRepository;
    private final ChatMessageRepository chatMessageRepository;

    // 채팅방 목록 조회
    @GetMapping("/chatRoom")
    public ResponseEntity<?> getChatRooms(HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginMember") == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }

        String memId = (String) session.getAttribute("loginMember");
        MemberEntity member = memberRepository.findByMemId(memId).orElseThrow();

        List<Map<String, Object>> roomList = chatroomRepository.findMyRooms(member.getMemIdx());

        return ResponseEntity.ok(Map.of("roomList", roomList));
    }

    // 채팅 메시지 목록 조회
    @GetMapping("/chats/{chatroomIdx}/messages")
    public ResponseEntity<?> getMessages(
            @PathVariable Long chatroomIdx,
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginMember") == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }

        List<ChatMessageEntity> messages = chatMessageRepository
                .findByChatroom_ChatroomIdxOrderBySentAtAsc(chatroomIdx);

        List<Map<String, Object>> messageList = messages.stream()
                .map(msg -> Map.<String, Object>of(
                        "senderIdx", msg.getSender().getMemIdx(),
                        "messageContent", msg.getMessageContent(),
                        "sentAt", msg.getSentAt().toString()
                ))
                .toList();

        return ResponseEntity.ok(Map.of("messageList", messageList));
    }

    // 세션 유저 정보 반환
    @GetMapping("/mypage/session")
    public ResponseEntity<?> getSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginMember") == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }

        String memId = (String) session.getAttribute("loginMember");
        MemberEntity member = memberRepository.findByMemId(memId).orElseThrow();

        return ResponseEntity.ok(Map.of("memIdx", member.getMemIdx()));
    }

}
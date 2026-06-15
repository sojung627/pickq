package org.example.bbs.chat;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.notification.NotificationService;
import org.example.bbs.member.MemberRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatroomRepository chatroomRepository;
    private final MemberRepository memberRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;

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

    // 메시지 조회 응답에 isRead 필드 추가
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
                        "senderIdx",      msg.getSender().getMemIdx(),
                        "messageContent", msg.getMessageContent(),
                        "sentAt",         msg.getSentAt().toString(),
                        "isRead",         msg.getIsRead()  // 추가: 프론트 읽음 표시에 사용
                ))
                .toList();

        return ResponseEntity.ok(Map.of("messageList", messageList));
    }

    // 채팅 읽음 유무 체크
    @Transactional
    @PatchMapping("/chats/{chatroomIdx}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long chatroomIdx,
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginMember") == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }

        String memId = (String) session.getAttribute("loginMember");
        MemberEntity member = memberRepository.findByMemId(memId).orElseThrow();

        chatMessageRepository.markMessagesAsRead(chatroomIdx, member.getMemIdx());

        // 읽음 처리 완료 후 같은 채팅방 구독자들에게 읽음 이벤트 브로드캐스트
        // 상대방(메시지 발신자)의 화면에서 안읽음 표시를 제거하기 위해 전송
        messagingTemplate.convertAndSend(
                "/topic/chatroom/" + chatroomIdx + "/read",
                Map.of("readerIdx", member.getMemIdx())
        );

        return ResponseEntity.ok(Map.of("result", "ok"));
    }

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

    // 플로팅 버튼 - 채팅 얼마나 쌓였는지 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    @GetMapping("/chats/unread-count")
    public ResponseEntity<?> getUnreadCount(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginMember") == null) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }
        String memId = (String) session.getAttribute("loginMember");
        MemberEntity member = memberRepository.findByMemId(memId).orElseThrow();
        long count = chatMessageRepository.countUnreadMessages(member.getMemIdx());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

}
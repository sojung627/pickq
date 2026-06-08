package org.example.bbs.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {

    List<ChatMessageEntity> findByChatroom_ChatroomIdxOrderBySentAtAsc(Long chatroomIdx);

    // 특정 채팅방에서 상대방(내가 보낸 것 제외)이 보낸 미읽음 메시지를 읽음 처리
    @Transactional
    @Modifying
    @Query("UPDATE ChatMessageEntity m SET m.isRead = 'Y', m.readAt = CURRENT_TIMESTAMP " +
            "WHERE m.chatroom.chatroomIdx = :chatroomIdx " +
            "AND m.sender.memIdx != :readerIdx " +
            "AND m.isRead = 'N'")
    void markMessagesAsRead(@Param("chatroomIdx") Long chatroomIdx,
                            @Param("readerIdx") Long readerIdx);

    @Query(value = """
    SELECT
        c.chatroom_idx AS chatroomIdx,
        CASE
            WHEN c.buyer_idx = :memIdx THEN bidder.mem_name
            ELSE buyer.mem_name
        END AS opponentName,
        COALESCE(last_msg.message_content, '대화를 시작해보세요') AS lastMessage
    FROM chatroom c
    JOIN member buyer ON c.buyer_idx = buyer.mem_idx
    JOIN member bidder ON c.bidder_idx = bidder.mem_idx
    LEFT JOIN (
        SELECT chatroom_idx, message_content, message_idx
        FROM chatmessage
        WHERE message_idx IN (
            SELECT MAX(message_idx) FROM chatmessage GROUP BY chatroom_idx
        )
    ) last_msg ON last_msg.chatroom_idx = c.chatroom_idx
    WHERE (c.buyer_idx = :memIdx OR c.bidder_idx = :memIdx)
      AND c.chatroom_idx = (
          SELECT MIN(c2.chatroom_idx)
          FROM chatroom c2
          WHERE (c2.buyer_idx = c.buyer_idx AND c2.bidder_idx = c.bidder_idx)
             OR (c2.buyer_idx = c.bidder_idx AND c2.bidder_idx = c.buyer_idx)
      )
    ORDER BY CONVERT(
        CASE
            WHEN c.buyer_idx = :memIdx THEN bidder.mem_name
            ELSE buyer.mem_name
        END USING utf8mb4
    ) COLLATE utf8mb4_unicode_ci ASC
""", nativeQuery = true)
    List<Map<String, Object>> findMyRooms(@Param("memIdx") Long memIdx);

    // 플로팅 버튼 - 채팅 얼마나 쌓였는지 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    @Query("SELECT COUNT(m) FROM ChatMessageEntity m " +
            "JOIN ChatroomEntity c ON m.chatroom.chatroomIdx = c.chatroomIdx " +
            "WHERE (c.buyer.memIdx = :memIdx OR c.bidder.memIdx = :memIdx) " +
            "AND m.sender.memIdx != :memIdx " +
            "AND m.isRead = 'N'")
    long countUnreadMessages(@Param("memIdx") Long memIdx);



}
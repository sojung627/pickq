package org.example.bbs.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface ChatroomRepository extends JpaRepository<ChatroomEntity, Long> {

    // 이미 채팅방이 있으면 채팅 목록 생성 방지(중복 x)
    Optional<ChatroomEntity> findByBuyer_MemIdxAndBidder_MemIdx(Long buyerMemIdx, Long bidderMemIdx);

    // 채팅방 쿼리
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
            SELECT chatroom_idx, message_content
            FROM chatmessage
            WHERE message_idx IN (
                SELECT MAX(message_idx) FROM chatmessage GROUP BY chatroom_idx
            )
        ) last_msg ON last_msg.chatroom_idx = c.chatroom_idx
        WHERE c.buyer_idx = :memIdx OR c.bidder_idx = :memIdx
        ORDER BY COALESCE(last_msg.message_idx, 0) DESC
    """, nativeQuery = true)
    List<Map<String, Object>> findMyRooms(@Param("memIdx") Long memIdx);


}
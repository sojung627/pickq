package org.example.bbs.chat;

import jakarta.persistence.*;
import lombok.*;
import org.example.bbs.auction.AuctionEntity;
import org.example.bbs.member.MemberEntity;
import java.time.LocalDateTime;

@Entity
@Table(name = "chatroom", uniqueConstraints = {
        @UniqueConstraint(
                name = "ux_chatroom_unique",
                columnNames = {"buyer_idx", "bidder_idx"}
        )
})
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ChatroomEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chatroom_idx")
    private Long chatroomIdx;

    // 관련 경매 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_idx", nullable = false)
    private AuctionEntity auction;

    // 구매자 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_idx", nullable = false)
    private MemberEntity buyer;

    // 입찰자 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bidder_idx", nullable = false)
    private MemberEntity bidder;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    // 추가 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 맨 아래에 정적 팩토리 메서드 추가
    public static ChatroomEntity of(AuctionEntity auction, MemberEntity buyer, MemberEntity bidder) {
        return ChatroomEntity.builder()
                .auction(auction)
                .buyer(buyer)
                .bidder(bidder)
                .build();
    }



}
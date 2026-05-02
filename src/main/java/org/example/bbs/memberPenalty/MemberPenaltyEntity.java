package org.example.bbs.memberPenalty;

import jakarta.persistence.*;
import lombok.*;
import org.example.bbs.auction.AuctionEntity;
import org.example.bbs.bid.BidEntity;
import org.example.bbs.member.MemberEntity;
import java.time.LocalDateTime;

@Entity
@Table(name = "member_penalty")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class MemberPenaltyEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "penalty_idx")
    private Long penaltyIdx;

    // 패널티 받은 회원 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mem_idx", nullable = false)
    private MemberEntity member;

    // 관련 경매 (FK - SET NULL 대응을 위해 nullable 허용)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_idx")
    private AuctionEntity auction;

    // 관련 입찰 (FK - SET NULL 대응을 위해 nullable 허용)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_idx")
    private BidEntity bid;

    @Column(name = "penalty_code", nullable = false, length = 50)
    private String penaltyCode; // NO_PAYMENT, NO_SHIPMENT 등

    @Column(name = "penalty_reason", length = 255)
    private String penaltyReason;

    @Column(name = "penalty_score", nullable = false)
    private Integer penaltyScore;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.penaltyScore == null) {
            this.penaltyScore = 1;
        }
    }
}
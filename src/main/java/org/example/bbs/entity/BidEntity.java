package org.example.bbs.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.bbs.member.MemberEntity; // MemberEntity 위치에 따라 수정 필요할 수 있음
import java.time.LocalDateTime;

@Entity
@Table(name = "bid")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class BidEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bid_idx")
    private Long bidIdx;

    // 경매 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_idx", nullable = false)
    private AuctionEntity auction;

    // 입찰자 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bidder_idx", nullable = false)
    private MemberEntity bidder;

    // 제안 상품 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_idx", nullable = false)
    private ItemEntity item;

    @Column(name = "bid_price", nullable = false)
    private Long bidPrice;

    @Column(name = "bid_quantity", nullable = false)
    private Integer bidQuantity;

    @Lob
    @Column(name = "bid_message", columnDefinition = "LONGTEXT")
    private String bidMessage;

    // 입찰 상태 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_status_idx", nullable = false)
    private BidStatusEntity bidStatus;

    @Column(name = "bid_regdate", updatable = false)
    private LocalDateTime bidRegdate;

    @Column(name = "bid_moddate")
    private LocalDateTime bidModdate;

    @PrePersist
    public void prePersist() {
        if (this.bidRegdate == null) {
            this.bidRegdate = LocalDateTime.now();
        }
        if (this.bidQuantity == null) {
            this.bidQuantity = 1;
        }
    }
}
package org.example.bbs.review;

import jakarta.persistence.*;
import lombok.*;
import org.example.bbs.auction.AuctionEntity;
import org.example.bbs.bid.BidEntity;
import org.example.bbs.member.MemberEntity; // MemberEntity 위치 확인 필요
import java.time.LocalDateTime;

@Entity
@Table(name = "review", uniqueConstraints = {
        @UniqueConstraint(name = "ux_review_unique", columnNames = {"bid_idx"})
})
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ReviewEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_idx")
    private Long reviewIdx;

    // 구매자 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_idx", nullable = false)
    private MemberEntity buyer;

    // 판매자/입찰자 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bidder_idx", nullable = false)
    private MemberEntity bidder;

    // 경매 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_idx", nullable = false)
    private AuctionEntity auction;

    // 선택된 입찰 정보 (FK) - 1:1 관계에 가까운 Unique 제약
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_idx", nullable = false)
    private BidEntity bid;

    @Column(name = "review_title", nullable = false, length = 200)
    private String reviewTitle;

    @Column(name = "review_content", nullable = false, columnDefinition = "TEXT")
    private String reviewContent;

    @Column(name = "review_star", nullable = false)
    private Integer reviewStar; // 1~5점

    @Column(name = "review_regdate", updatable = false)
    private LocalDateTime reviewRegdate;

    @Column(name = "review_is_deleted", nullable = false, length = 1)
    private String reviewIsDeleted;

    @Column(name = "review_deldate")
    private LocalDateTime reviewDeldate;

    @PrePersist
    public void prePersist() {
        if (this.reviewRegdate == null) {
            this.reviewRegdate = LocalDateTime.now();
        }
        if (this.reviewIsDeleted == null) {
            this.reviewIsDeleted = "N";
        }
    }
}
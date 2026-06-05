package org.example.bbs.auction;

import jakarta.persistence.*;
import lombok.*;
import org.example.bbs.auction.AuctionStatusEntity;
import org.example.bbs.bid.BidEntity;
import org.example.bbs.item.ItemCategoryEntity;
import org.example.bbs.member.MemberEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "auction")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class AuctionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "auction_idx")
    private Long auctionIdx;

    // 구매자 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_idx", nullable = false)
    private MemberEntity buyer;  // buyer_idx는 auction 컬럼임

    // 카테고리 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_category_idx", nullable = false)
    private ItemCategoryEntity itemCategory;

    @Column(name = "auction_thumbnail_img", length = 200)
    private String auctionThumbnailImg;

    @Column(name = "auction_title", nullable = false, length = 200)
    private String auctionTitle;

    @Column(name = "auction_desc", nullable = false, columnDefinition = "TEXT")
    private String auctionDesc;

    @Column(name = "auction_target_price")
    private Long auctionTargetPrice;

    @Column(name = "auction_view_count", nullable = false)
    private Long auctionViewCount = 0L;

    @Column(name = "auction_start_at", nullable = false)
    private LocalDateTime auctionStartAt;

    @Column(name = "auction_end_at", nullable = false)
    private LocalDateTime auctionEndAt;

    @Column(name = "auction_decision_deadline", nullable = false)
    private LocalDateTime auctionDecisionDeadline;

    // 경매 상태 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_status_idx", nullable = false)
    private AuctionStatusEntity auctionStatus;

    @Column(name = "auction_regdate", updatable = false)
    private LocalDateTime auctionRegdate;

    @Column(name = "auction_moddate")
    private LocalDateTime auctionModdate;

    @Column(name = "auction_is_deleted", nullable = false, length = 1)
    private String auctionIsDeleted = "N";

    @Column(name = "auction_deldate")
    private LocalDateTime auctionDeldate;

    // 추가
    @Column(name="auction_item_brand", length=100)
    private String itemBrand;

    @PrePersist
    public void prePersist() {
        if (auctionRegdate == null) auctionRegdate = LocalDateTime.now();
        if (auctionStartAt == null) auctionStartAt = LocalDateTime.now();
        if (auctionViewCount == null) auctionViewCount = 0L;
        if (auctionIsDeleted == null) auctionIsDeleted = "N";
    }

    // bid 연관성 추가
    @OneToMany(mappedBy = "auction", fetch = FetchType.LAZY)
    private List<BidEntity> bids = new ArrayList<>();

}
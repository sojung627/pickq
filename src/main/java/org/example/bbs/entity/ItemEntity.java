package org.example.bbs.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "item")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_idx")
    private Long itemIdx;

    @Column(name = "item_name", nullable = false, length = 200)
    private String itemName;

    // 카테고리 정보 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_category_idx", nullable = false)
    private ItemCategoryEntity itemCategory;

    @Column(name = "item_brand", length = 100)
    private String itemBrand;

    @Column(name = "item_condition", nullable = false, length = 50)
    private String itemCondition; // NEW, USED_A, USED_B 등

    @Column(name = "item_thumbnail_img", length = 255)
    private String itemThumbnailImg;

    @Column(name = "item_detail_img", length = 255)
    private String itemDetailImg;

    @Column(name = "item_regdate", updatable = false)
    private LocalDateTime itemRegdate;

    @Column(name = "item_is_deleted", nullable = false, length = 1)
    private String itemIsDeleted; // Y / N

    @PrePersist
    public void prePersist() {
        if (this.itemRegdate == null) {
            this.itemRegdate = LocalDateTime.now();
        }
        if (this.itemIsDeleted == null) {
            this.itemIsDeleted = "N";
        }
    }
}
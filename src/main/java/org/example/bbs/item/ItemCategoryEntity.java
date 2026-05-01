package org.example.bbs.item;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "item_category")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ItemCategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_category_idx")
    private Integer itemCategoryIdx;

    @Column(name = "item_category_code", nullable = false, length = 50, unique = true)
    private String itemCategoryCode;

    @Column(name = "item_category_name", nullable = false, length = 100)
    private String itemCategoryName;

    @PrePersist
    public void prePersist() {
        // 기본값 방어 로직
        if (itemCategoryCode == null) itemCategoryCode = "ETC";
        if (itemCategoryName == null) itemCategoryName = "기타";
    }
}

package org.example.bbs.auction;

import org.example.bbs.item.ItemCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemCategoryRepository
        extends JpaRepository<ItemCategoryEntity, Long> {


}


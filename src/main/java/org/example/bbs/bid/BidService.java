package org.example.bbs.bid;

import lombok.RequiredArgsConstructor;
import org.example.bbs.auction.AuctionEntity;
import org.example.bbs.auction.AuctionRepository;
import org.example.bbs.auction.ItemCategoryRepository;
import org.example.bbs.item.ItemCategoryEntity;
import org.example.bbs.item.ItemEntity;
import org.example.bbs.item.ItemRepository;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;
    private final BidStatusRepository bidStatusRepository;
    private final AuctionRepository auctionRepository;
    private final MemberRepository memberRepository;
    private final ItemRepository itemRepository;
    private final ItemCategoryRepository itemCategoryRepository;

    @Transactional
    public void registerBid(Long auctionIdx, BidRequestDTO dto, MultipartFile imageFile, String memId) throws IOException {

        // 로그인 회원 조회
        MemberEntity bidder = memberRepository.findByMemId(memId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        // 경매 조회 + 진행중 상태 검증
        AuctionEntity auction = auctionRepository.findById(auctionIdx)
                .orElseThrow(() -> new IllegalArgumentException("경매를 찾을 수 없습니다."));

        if (auction.getAuctionStatus().getAuctionStatusIdx() != 1) {
            throw new IllegalStateException("진행 중인 경매에만 입찰할 수 있습니다.");
        }

        // 구매자 본인은 입찰 불가
        if (auction.getBuyer().getMemIdx().equals(bidder.getMemIdx())) {
            throw new IllegalStateException("본인 경매에는 입찰할 수 없습니다.");
        }

        // 카테고리 조회
        ItemCategoryEntity itemCategory = itemCategoryRepository.findById((long) dto.getItemCategoryIdx())
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));

        // 이미지 저장
        String imagePath = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imagePath = saveFile(imageFile);
        }

        // Item 저장
        ItemEntity item = ItemEntity.builder()
                .itemName(dto.getItemName())
                .itemBrand(dto.getItemBrand())
                .itemCategory(itemCategory)
                .itemCondition("USED_A") // 기본값, 추후 폼에서 받을 수 있음
                .itemThumbnailImg(imagePath)
                .build();
        itemRepository.save(item);

        // 입찰 상태 조회 (1 = 일반/진행중)
        BidStatusEntity bidStatus = bidStatusRepository.findById(1)
                .orElseThrow(() -> new IllegalArgumentException("입찰 상태를 찾을 수 없습니다."));

        // Bid 저장
        BidEntity bid = BidEntity.builder()
                .auction(auction)
                .bidder(bidder)
                .item(item)
                .bidPrice(dto.getBidPrice())
                .bidQuantity(dto.getBidQuantity() != null ? dto.getBidQuantity() : 1)
                .bidMessage(dto.getBidMessage())
                .bidStatus(bidStatus)
                .build();
        bidRepository.save(bid);
    }

    private String saveFile(MultipartFile file) throws IOException {
        String uploadDir = System.getProperty("user.dir") + "/uploads/bid/";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf("."))
                : ".jpg";
        String savedName = UUID.randomUUID() + ext;

        file.transferTo(new File(uploadDir + savedName));
        return "/uploads/bid/" + savedName;
    }
}
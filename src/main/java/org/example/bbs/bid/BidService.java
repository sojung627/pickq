package org.example.bbs.bid;

import lombok.RequiredArgsConstructor;
import org.example.bbs.auction.*;
import org.example.bbs.chat.ChatroomEntity;
import org.example.bbs.chat.ChatroomRepository;
import org.example.bbs.item.ItemCategoryEntity;
import org.example.bbs.item.ItemEntity;
import org.example.bbs.item.ItemRepository;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.example.bbs.notification.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;
    private final BidStatusRepository bidStatusRepository;
    private final AuctionRepository auctionRepository;
    private final MemberRepository memberRepository;
    private final ItemRepository itemRepository;
    private final ItemCategoryRepository itemCategoryRepository;
    private final AuctionStatusRepository auctionStatusRepository;
    private final ChatroomRepository chatroomRepository;
    private final NotificationService notificationService;

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
        notificationService.notifyAuctionBid(auction, bid);

        // 채팅방 자동 생성 (중복 방지)
        chatroomRepository.findByBuyer_MemIdxAndBidder_MemIdx(
                auction.getBuyer().getMemIdx(),
                bidder.getMemIdx()
        ).orElseGet(() ->
                chatroomRepository.save(
                        ChatroomEntity.of(auction, auction.getBuyer(), bidder)
                )
        );
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

    // 낙찰
    @Transactional
    public void winBid(Long auctionIdx, Long bidIdx, String memId) {

        // 경매 조회
        AuctionEntity auction = auctionRepository.findById(auctionIdx)
                .orElseThrow(() -> new IllegalArgumentException("경매를 찾을 수 없습니다."));

        // 요청자가 구매자인지 검증
        if (!auction.getBuyer().getMemId().equals(memId)) {
            throw new IllegalStateException("낙찰 권한이 없습니다.");
        }

        // 경매 상태 검증 (진행중 or 결정대기중만 가능)
        int statusIdx = auction.getAuctionStatus().getAuctionStatusIdx();
        if (statusIdx != 1 && statusIdx != 2) {
            throw new IllegalStateException("낙찰 처리할 수 없는 경매 상태입니다.");
        }

        // 낙찰 입찰 조회
        BidEntity winBid = bidRepository.findById(bidIdx)
                .orElseThrow(() -> new IllegalArgumentException("입찰을 찾을 수 없습니다."));

        // 해당 경매의 입찰인지 검증
        if (!winBid.getAuction().getAuctionIdx().equals(auctionIdx)) {
            throw new IllegalStateException("해당 경매의 입찰이 아닙니다.");
        }

        // 낙찰 상태 조회 (bid_status_idx = 2 = 낙찰)
        BidStatusEntity wonStatus =
                bidStatusRepository.findByBidStatusCode("won")
                        .orElseThrow(() ->
                                new IllegalArgumentException("낙찰 상태를 찾을 수 없습니다."));

        // 유찰 상태 조회 (bid_status_idx = 4 = 유찰)
        BidStatusEntity lostStatus =
                bidStatusRepository.findByBidStatusCode("lost")
                        .orElseThrow(() ->
                                new IllegalArgumentException("유찰 상태를 찾을 수 없습니다."));

        // 낙찰 입찰 상태 변경
        winBid.setBidStatus(wonStatus);
        winBid.setWonAt(LocalDateTime.now());

        // 나머지 입찰 유찰 처리
        List<BidEntity> allBids = bidRepository.findByAuction_AuctionIdxOrderByBidRegdateDesc(auctionIdx);
        allBids.stream()
                .filter(b -> !b.getBidIdx().equals(bidIdx) && "normal".equals(b.getBidStatus().getBidStatusCode()))
                .forEach(b -> b.setBidStatus(lostStatus));

        // 경매 상태를 마감(3)으로 변경
        AuctionStatusEntity closedStatus =
                auctionStatusRepository.findByAuctionStatusCode("closed")
                        .orElseThrow(() ->
                                new IllegalArgumentException("경매 상태를 찾을 수 없습니다."));
        auction.setAuctionStatus(closedStatus);
        notificationService.notifyAuctionDecided(auction, winBid);
    }

    // 마이페이지 입찰 목록 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    public List<Map<String, Object>> getMyBids(String memId) {
        List<BidEntity> bids = bidRepository.findAllByBidder_MemIdOrderByBidRegdateDesc(memId);

        return bids.stream().map(bid -> {
            Map<String, Object> b = new HashMap<>();
            b.put("bidIdx", bid.getBidIdx());
            b.put("auctionIdx", bid.getAuction().getAuctionIdx());
            b.put("auctionTitle", bid.getAuction().getAuctionTitle());
            b.put("itemName", bid.getItem().getItemName());
            b.put("itemBrand", bid.getItem().getItemBrand());
            b.put("bidPrice", bid.getBidPrice());
            b.put("bidQuantity", bid.getBidQuantity());
            b.put("bidStatusIdx", bid.getBidStatus().getBidStatusIdx());
            b.put("bidStatusName", bid.getBidStatus().getBidStatusName());
            b.put("bidRegdate", bid.getBidRegdate());
            return b;
        }).collect(Collectors.toList());
    }

}
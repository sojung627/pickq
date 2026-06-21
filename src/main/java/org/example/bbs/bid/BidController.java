package org.example.bbs.bid;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
//@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class BidController {

    private final BidService bidService;
    private final BidRepository bidRepository;
    private final BidStatusRepository bidStatusRepository;

    // 입찰 띄우기
    @PostMapping(value = "/auctions/{auctionIdx}/bids", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> registerBid(
            @PathVariable Long auctionIdx,
            @RequestParam(value = "bidImageFile", required = false) MultipartFile imageFile,
            @RequestParam("itemName") String itemName,
            @RequestParam(value = "itemBrand", required = false) String itemBrand,
            @RequestParam("bidPrice") Long bidPrice,
            @RequestParam(value = "bidQuantity", defaultValue = "1") Integer bidQuantity,
            @RequestParam(value = "bidMessage", required = false) String bidMessage,
            @RequestParam("itemCategoryIdx") Long itemCategoryIdx,
            @SessionAttribute(name = "loginMember", required = false) String memId
    ) {
        if (memId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "로그인이 필요합니다."));
        }

        try {
            BidRequestDTO dto = BidRequestDTO.builder()
                    .itemName(itemName)
                    .itemBrand(itemBrand)
                    .bidPrice(bidPrice)
                    .bidQuantity(bidQuantity)
                    .bidMessage(bidMessage)
                    .itemCategoryIdx(itemCategoryIdx)
                    .build();

            bidService.registerBid(auctionIdx, dto, imageFile, memId);
            return ResponseEntity.ok(Map.of("success", true));

        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "이미지 저장 중 오류가 발생했습니다."));
        }
    }

    // 낙찰
    @PostMapping("/auctions/{auctionIdx}/bids/{bidIdx}/win")
    public ResponseEntity<Map<String, Object>> winBid(
            @PathVariable Long auctionIdx,
            @PathVariable Long bidIdx,
            @SessionAttribute(name = "loginMember", required = false) String memId
    ) {
        if (memId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "로그인이 필요합니다."));
        }
        try {
            bidService.winBid(auctionIdx, bidIdx, memId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    // 입찰 취소
    @PostMapping("/bids/{bidIdx}/cancel")
    public ResponseEntity<?> cancelBid(
            @PathVariable Long bidIdx,
            HttpSession session) {

        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        }

        BidEntity bid = bidRepository.findById(bidIdx)
                .orElseThrow(() -> new RuntimeException("입찰을 찾을 수 없습니다."));

        if (!bid.getBidder().getMemId().equals(memId)) {
            return ResponseEntity.status(403).body(Map.of("error", "본인의 입찰만 취소할 수 있습니다."));
        }

        BidStatusEntity canceledStatus = bidStatusRepository.findByBidStatusCode("canceled")
                .orElseThrow(() -> new RuntimeException("취소 상태를 찾을 수 없습니다."));

        bid.setBidStatus(canceledStatus);
        bidRepository.save(bid);

        return ResponseEntity.ok(Map.of("result", "canceled"));
    }

    // 마이페이지 입찰 목록 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    @GetMapping("/mypage/bids")
    public ResponseEntity<?> getMyBids(HttpSession session) {

        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "로그인이 필요합니다."));
        }

        return ResponseEntity.ok(bidService.getMyBids(memId));
    }



}
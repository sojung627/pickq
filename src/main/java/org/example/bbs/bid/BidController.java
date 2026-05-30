package org.example.bbs.bid;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class BidController {

    private final BidService bidService;

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



}
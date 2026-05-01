package org.example.bbs.auction;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuctionController {

    private final AuctionService auctionService;

    @GetMapping("/mypage/auctions")
    public ResponseEntity<List<AuctionDTO>> getMyAuctions(
            @SessionAttribute(name = "loginMember", required = false) String memId) {

        List<AuctionDTO> auctions = auctionService.findAuctionsByMemId(memId);
        return ResponseEntity.ok(auctions);
    }
}
package org.example.bbs.auction;

import ch.qos.logback.core.model.Model;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.example.bbs.member.MemberEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuctionController {

    // 마이페이지 파트 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    private final AuctionService auctionService;

    @GetMapping("/mypage/auctions")
    public ResponseEntity<List<AuctionDTO>> getMyAuctions(
            @SessionAttribute(name = "loginMember", required = false) String memId) {

        List<AuctionDTO> auctions = auctionService.findAuctionsByMemId(memId);
        return ResponseEntity.ok(auctions);
    }

    // 경매 파트 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 경매 목록 조회
    @GetMapping("/auctions")
    public ResponseEntity<List<AuctionListDTO>> getAuctionList(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "latest") String sortBy,
            @RequestParam(defaultValue = "open") String statusFilter,
            @RequestParam(required = false) String keyword) {

        // 서비스에서 DTO 리스트를 받아와서 반환
        List<AuctionListDTO> list = auctionService.findAllAuctions(category, sortBy, statusFilter, keyword);
        return ResponseEntity.ok(list);
    }
//    @GetMapping("/auctions")
//    public ResponseEntity<Map<String, Object>> getAuctionList(
//            @RequestParam(required = false) String categoryCode,
//            @RequestParam(defaultValue = "open") String statusFilter,
//            @RequestParam(defaultValue = "latest") String sortBy,
//            @RequestParam(defaultValue = "") String keyword,
//            @RequestParam(defaultValue = "1") int page) {
//
//        Map<String, Object> result = auctionService.getAuctionList(categoryCode, statusFilter, sortBy, keyword, page);
//        return ResponseEntity.ok(result);
//    }





}
package org.example.bbs.auction;

import ch.qos.logback.core.model.Model;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.example.bbs.member.MemberEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuctionController {

    private final AuctionService auctionService;

    // 마이페이지 파트 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    @GetMapping("/mypage/auctions")
    public ResponseEntity<List<AuctionDTO>> getMyAuctions(
            @SessionAttribute(name = "loginMember", required = false) String memId) {

        List<AuctionDTO> auctions = auctionService.findAuctionsByMemId(memId);
        return ResponseEntity.ok(auctions);
    }

    // 경매 파트 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 경매 리스트 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

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

    // 경매 글 작성 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 경매 등록
    @PostMapping(value = "/auctions", consumes = "multipart/form-data")
    public ResponseEntity<?> registerAuction(
            @RequestPart(value = "thumbnailFile", required = false)
            MultipartFile thumbnailFile,
            @RequestParam("itemCategoryIdx")         Long   itemCategoryIdx,
            @RequestParam("auctionTitle")            String auctionTitle,
            @RequestParam(value = "itemBrand", required = false)
            String itemBrand,
            @RequestParam("auctionTargetPrice")      Long   auctionTargetPrice,
            @RequestParam("auctionEndAt")            String auctionEndAt,
            @RequestParam("auctionDecisionDeadline") String auctionDecisionDeadline,
            @RequestParam("auctionDesc")             String auctionDesc,
            @SessionAttribute(name = "loginMember", required = false)
            String memId
    ) throws IOException {

        if (memId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("로그인이 필요합니다.");
        }

        AuctionWriteRequestDTO dto = AuctionWriteRequestDTO.builder()
                .itemCategoryIdx(itemCategoryIdx)
                .auctionTitle(auctionTitle)
                .itemBrand(itemBrand)
                .auctionTargetPrice(auctionTargetPrice)
                .auctionEndAt(auctionEndAt)
                .auctionDecisionDeadline(auctionDecisionDeadline)
                .auctionDesc(auctionDesc)
                .build();

        auctionService.registerAuction(dto, thumbnailFile, memId);
        return ResponseEntity.ok().build();
    }

    // 경매 글 상세보기 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    @GetMapping("/auctions/{auctionIdx}")
    public ResponseEntity<Map<String, Object>> getAuctionDetail(
            @PathVariable Long auctionIdx,
            HttpSession session) {

        String memId = (String) session.getAttribute("loginMember");
        Map<String, Object> result = auctionService.getAuctionDetail(auctionIdx, memId);
        return ResponseEntity.ok(result);
    }

}
package org.example.bbs.order;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.example.bbs.order.SalesResponseDTO;
import org.example.bbs.order.ShipRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // 마이페이지 - 판매내역 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 판매 내역 조회
    @GetMapping("/api/mypage/sales")
    public ResponseEntity<List<SalesResponseDTO>> getSales(HttpSession session) {
        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(orderService.getSales(memId));
    }

    // 운송장 등록
    // MySales.jsx → fetch('http://localhost:8080/api/payment/ship')
    @PostMapping("/api/payment/ship")
    public ResponseEntity<SalesResponseDTO> registerShipping(
            @RequestBody ShipRequestDTO dto,
            HttpSession session) {

        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(orderService.registerShipping(dto, memId));
    }

    /*
     * 구매 내역 조회 (MyPurchases.jsx 만들 때 여기에 추가)
     *
     * @GetMapping("/mypage/purchases")
     * public ResponseEntity<List<PurchaseResponseDto>> getPurchases(HttpSession session) { ... }
     */

    // 마이페이지 - 구매내역 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    //
    @GetMapping("/api/mypage/orders")
    public ResponseEntity<List<PurchaseResponseDTO>> getPurchases(HttpSession session) {
        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(orderService.getPurchases(memId));
    }

    // 구매확정
    @PostMapping("/api/payment/confirm-receipt")
    public ResponseEntity<PurchaseResponseDTO> confirmReceipt(
            @RequestBody ConfirmReceiptRequestDTO dto,
            HttpSession session) {

        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(orderService.confirmReceipt(dto, memId));
    }

    // 마이페이지 - 결제 대기 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 결제 대기 낙찰 건 조회
    @GetMapping("/api/mypage/pending-bids")
    public ResponseEntity<List<PendingBidResponseDTO>> getPendingBids(HttpSession session) {
        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(orderService.getPendingBids(memId));
    }

}
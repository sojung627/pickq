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

    // ── 판매 내역 조회 ────────────────────────────────────
    // MySales.jsx → fetch('http://localhost:8080/mypage/sales')
    @GetMapping("/mypage/sales")
    public ResponseEntity<List<SalesResponseDTO>> getSales(HttpSession session) {
        // 임시 디버그 - 확인 후 삭제
        session.getAttributeNames().asIterator()
                .forEachRemaining(k -> System.out.println("세션키: " + k + " = " + session.getAttribute(k)));
        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(orderService.getSales(memId));
    }

    // ── 운송장 등록 ───────────────────────────────────────
    // MySales.jsx → fetch('http://localhost:8080/api/payment/ship')
    @PostMapping("/api/payment/ship")
    public ResponseEntity<SalesResponseDTO> registerShipping(
            @RequestBody ShipRequestDTO dto,
            HttpSession session) {

        String memId = (String) session.getAttribute("memId");
        if (memId == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(orderService.registerShipping(dto, memId));
    }

    /*
     * 구매 내역 조회 (MyPurchases.jsx 만들 때 여기에 추가)
     *
     * @GetMapping("/mypage/purchases")
     * public ResponseEntity<List<PurchaseResponseDto>> getPurchases(HttpSession session) { ... }
     */
}
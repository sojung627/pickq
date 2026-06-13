package org.example.bbs.payment;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;

    // 결제 위젯에 필요한 주문 정보(orderId, amount, orderName 등) 발급
    @GetMapping("/order-info")
    public ResponseEntity<PaymentOrderInfoResponseDTO> getOrderInfo(
            @RequestParam Long bidIdx,
            HttpSession session) {

        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(paymentService.getOrderInfo(bidIdx, memId));
    }

    // 결제 승인 (successUrl에서 호출)
    @PostMapping("/confirm")
    public ResponseEntity<PaymentConfirmResponseDTO> confirmPayment(
            @RequestBody PaymentConfirmRequestDTO dto,
            HttpSession session) {

        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(paymentService.confirmPayment(dto, memId));
    }
}
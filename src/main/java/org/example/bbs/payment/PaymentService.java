package org.example.bbs.payment;

import lombok.RequiredArgsConstructor;
import org.example.bbs.bid.BidEntity;
import org.example.bbs.bid.BidRepository;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.memberAddr.MemberAddrEntity;
import org.example.bbs.memberAddr.MemberAddrRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BidRepository bidRepository;
    private final MemberAddrRepository memberAddrRepository;

    @Value("${toss.secret-key}")
    private String secretKey;

    private static final String TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

    @Transactional
    public PaymentOrderInfoResponseDTO getOrderInfo(Long bidIdx, String memId) {
        BidEntity bid = bidRepository.findById(bidIdx)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "낙찰 정보를 찾을 수 없습니다."));

        // 역경매 구조: auction.buyer = 결제할 사람(구매자)
        MemberEntity buyer = bid.getAuction().getBuyer();
        if (!buyer.getMemId().equals(memId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "결제 권한이 없습니다.");
        }

        PaymentEntity payment = paymentRepository.findByBid_BidIdx(bidIdx)
                .orElseGet(() -> createReadyPayment(bid, buyer));

        if ("DONE".equals(payment.getPayStatus()) || "CONFIRMED".equals(payment.getPayStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 결제가 완료된 주문입니다.");
        }

        return PaymentOrderInfoResponseDTO.builder()
                .orderId(payment.getOrderId())
                .orderName(bid.getAuction().getAuctionTitle())
                .amount(payment.getPayAmount())
                .customerName(buyer.getMemName())
                .customerEmail(buyer.getMemEmail())
                .build();
    }

    private PaymentEntity createReadyPayment(BidEntity bid, MemberEntity buyer) {
        // TODO: 배송지 선택 UI가 생기면 선택한 주소를 받아서 넣도록 변경
        List<MemberAddrEntity> addrs = memberAddrRepository.findByMember_MemId(buyer.getMemId());
        MemberAddrEntity addr = addrs.stream()
                .filter(a -> "Y".equals(a.getIsPrimary()))
                .findFirst()
                .orElse(addrs.isEmpty() ? null : addrs.get(0));

        long amount = bid.getBidPrice() * bid.getBidQuantity();
        String orderId = UUID.randomUUID().toString();

        PaymentEntity payment = PaymentEntity.builder()
                .bid(bid)
                .member(buyer)
                .orderId(orderId)
                .paymentKey("PENDING_" + orderId)   // 결제 전 임시값 (confirm 시 실제 paymentKey로 교체)
                .payMethod("")
                .payAmount(amount)
                .payStatus("READY")
                .buyerName(Objects.requireNonNullElse(buyer.getMemName(), ""))
                .buyerTel(Objects.requireNonNullElse(buyer.getMemTel(), ""))
                .buyerAddr(addr != null ? (addr.getMemAddr() + " " + addr.getMemAddrDetail()) : "")
                .buyerZipcode(addr != null ? addr.getMemZipcode() : "")
                .build();

        return paymentRepository.save(payment);
    }

    @Transactional
    public PaymentConfirmResponseDTO confirmPayment(PaymentConfirmRequestDTO dto, String memId) {
        PaymentEntity payment = paymentRepository.findByOrderId(dto.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "주문 정보를 찾을 수 없습니다."));

        if (!payment.getMember().getMemId().equals(memId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "결제 권한이 없습니다.");
        }

        if (!payment.getPayAmount().equals(dto.getAmount())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "결제 금액이 일치하지 않습니다.");
        }

        if ("DONE".equals(payment.getPayStatus())) {
            return PaymentConfirmResponseDTO.builder()
                    .success(true)
                    .orderId(payment.getOrderId())
                    .payStatus(payment.getPayStatus())
                    .build();
        }

        // ------ 토스페이먼츠 결제 승인 API 호출 ------
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Basic " + Base64.getEncoder().encodeToString((secretKey + ":").getBytes()));

        Map<String, Object> body = Map.of(
                "paymentKey", dto.getPaymentKey(),
                "orderId", dto.getOrderId(),
                "amount", dto.getAmount()
        );

        ResponseEntity<Map> response;
        try {
            response = restTemplate.postForEntity(TOSS_CONFIRM_URL, new HttpEntity<>(body, headers), Map.class);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "결제 승인 중 오류가 발생했습니다.");
        }

        Map<String, Object> result = response.getBody();
        if (!response.getStatusCode().is2xxSuccessful() || result == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "결제 승인에 실패했습니다.");
        }

        payment.setPaymentKey(dto.getPaymentKey());
        payment.setPayMethod((String) result.getOrDefault("method", ""));
        payment.setPayStatus("DONE");

        return PaymentConfirmResponseDTO.builder()
                .success(true)
                .orderId(payment.getOrderId())
                .payStatus(payment.getPayStatus())
                .build();
    }
}
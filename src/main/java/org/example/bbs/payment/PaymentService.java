package org.example.bbs.payment;

import lombok.RequiredArgsConstructor;
import org.example.bbs.bid.BidEntity;
import org.example.bbs.bid.BidRepository;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.memberAddr.MemberAddrEntity;
import org.example.bbs.memberAddr.MemberAddrRepository;
import org.example.bbs.notification.NotificationService;
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
    private final NotificationService notificationService;

    @Value("${toss.secret-key}")
    private String secretKey;

    private static final String TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

    /**
     * 포트폴리오 시연용 Mock 모드 플래그.
     * true: 토스 실결제 API를 호출하지 않고 성공 응답을 시뮬레이션한다.
     * false: 실제 토스페이먼츠 승인 API를 호출한다.
     * application.yml의 toss.mock-mode 값으로 제어 (기본값 true).
     */
    @Value("${toss.mock-mode:true}")
    private boolean mockMode;

    // ── 결제 정보 조회 (읽기 전용, DB에 아무것도 저장하지 않음) ──────────────────
    @Transactional(readOnly = true)
    public PaymentOrderInfoResponseDTO getOrderInfo(Long bidIdx, String memId) {
        BidEntity bid = bidRepository.findById(bidIdx)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "낙찰 정보를 찾을 수 없습니다."));

        MemberEntity buyer = bid.getAuction().getBuyer();
        if (!buyer.getMemId().equals(memId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "결제 권한이 없습니다.");
        }

        if (bid.getBidStatus() == null
                || !"won".equals(bid.getBidStatus().getBidStatusCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "낙찰된 입찰만 결제할 수 있습니다.");
        }

        paymentRepository.findByBid_BidIdx(bidIdx).ifPresent(p -> {
            if ("DONE".equals(p.getPayStatus()) || "CONFIRMED".equals(p.getPayStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 결제가 완료된 주문입니다.");
            }
        });

        long amount = bid.getBidPrice() * bid.getBidQuantity();
        // orderId에 bidIdx를 포함시켜서 confirm 단계에서 다시 꺼내 쓴다 (DB 미저장 상태이므로)
        String orderId = bidIdx + "_" + UUID.randomUUID();

        return PaymentOrderInfoResponseDTO.builder()
                .orderId(orderId)
                .orderName(bid.getAuction().getAuctionTitle())
                .amount(amount)
                .customerName(buyer.getMemName())
                .customerEmail(buyer.getMemEmail())
                .build();
    }

    // ── 결제 승인 (이 시점에만 PaymentEntity가 생성/갱신됨) ──────────────────────
    @Transactional
    public PaymentConfirmResponseDTO confirmPayment(PaymentConfirmRequestDTO dto, String memId) {
        Long bidIdx = parseBidIdx(dto.getOrderId());

        BidEntity bid = bidRepository.findById(bidIdx)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "낙찰 정보를 찾을 수 없습니다."));

        MemberEntity buyer = bid.getAuction().getBuyer();
        if (!buyer.getMemId().equals(memId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "결제 권한이 없습니다.");
        }

        if (bid.getBidStatus() == null
                || !"won".equals(bid.getBidStatus().getBidStatusCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "낙찰된 입찰만 결제할 수 있습니다.");
        }

        long expectedAmount = bid.getBidPrice() * bid.getBidQuantity();
        if (expectedAmount != dto.getAmount()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "결제 금액이 일치하지 않습니다.");
        }

        // 이미 승인된 건이면 토스 API 재호출 없이 그대로 응답 (중복 클릭 방지)
        PaymentEntity existing = paymentRepository.findByBid_BidIdx(bidIdx).orElse(null);
        if (existing != null
                && ("DONE".equals(existing.getPayStatus()) || "CONFIRMED".equals(existing.getPayStatus()))) {
            return PaymentConfirmResponseDTO.builder()
                    .success(true)
                    .orderId(existing.getOrderId())
                    .payStatus(existing.getPayStatus())
                    .build();
        }

        // ------ 토스페이먼츠 결제 승인 처리 ------
        // mockMode=true: 포트폴리오 시연용으로 토스 실결제 API를 호출하지 않고 성공 응답을 시뮬레이션한다.
        // mockMode=false: application.yml에서 toss.mock-mode=false 설정 시 실제 API가 호출된다.
        Map<String, Object> result;
        if (mockMode) {
            result = Map.of("method", "카드");
        } else {
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

            result = response.getBody();
            if (!response.getStatusCode().is2xxSuccessful() || result == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "결제 승인에 실패했습니다.");
            }
        }

        PaymentEntity payment = (existing != null) ? existing : buildNewPayment(bid, buyer, expectedAmount);

        payment.setOrderId(dto.getOrderId());
        payment.setPaymentKey(dto.getPaymentKey());
        payment.setPayMethod((String) result.getOrDefault("method", "카드"));
        payment.setPayAmount(expectedAmount);
        payment.setPayStatus("DONE");

        paymentRepository.save(payment);

        // 결제 완료 알림: 판매자(낙찰 입찰자)에게 배송을 시작해달라는 알림 전송
        MemberEntity seller = bid.getBidder();
        notificationService.notifyPaymentDone(seller, buyer, bid.getAuction());

        return PaymentConfirmResponseDTO.builder()
                .success(true)
                .orderId(payment.getOrderId())
                .payStatus(payment.getPayStatus())
                .build();
    }

    private PaymentEntity buildNewPayment(BidEntity bid, MemberEntity buyer, long amount) {
        // TODO: 배송지 선택 UI가 생기면 선택한 주소를 받아서 넣도록 변경
        List<MemberAddrEntity> addrs = memberAddrRepository.findByMember_MemId(buyer.getMemId());
        MemberAddrEntity addr = addrs.stream()
                .filter(a -> "Y".equals(a.getIsPrimary()))
                .findFirst()
                .orElse(addrs.isEmpty() ? null : addrs.get(0));

        return PaymentEntity.builder()
                .bid(bid)
                .member(buyer)
                .payAmount(amount)
                .buyerName(Objects.requireNonNullElse(buyer.getMemName(), ""))
                .buyerTel(Objects.requireNonNullElse(buyer.getMemTel(), ""))
                .buyerAddr(addr != null ? (addr.getMemAddr() + " " + addr.getMemAddrDetail()) : "")
                .buyerZipcode(addr != null ? addr.getMemZipcode() : "")
                .build();
    }

    private Long parseBidIdx(String orderId) {
        try {
            return Long.parseLong(orderId.split("_")[0]);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 주문번호입니다.");
        }
    }
}
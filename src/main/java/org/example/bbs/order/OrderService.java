package org.example.bbs.order;

import lombok.RequiredArgsConstructor;
import org.example.bbs.order.SalesResponseDTO;
import org.example.bbs.order.ShipRequestDTO;
import org.example.bbs.payment.PaymentEntity;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    // 마이페이지 - 판매내역 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 판매 내역 조회
    @Transactional(readOnly = true)
    public List<SalesResponseDTO> getSales(String memId) {
        return orderRepository.findSalesBySellerMemId(memId)
                .stream()
                .map(SalesResponseDTO::from)
                .collect(Collectors.toList());
    }

    // 운송장 등록
    @Transactional
    public SalesResponseDTO registerShipping(ShipRequestDTO dto, String memId) {
        PaymentEntity payment = orderRepository
                .findByBidIdxAndSellerMemId(dto.getBidIdx(), memId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "해당 결제 건을 찾을 수 없거나 권한이 없습니다."));

        // 이미 배송 처리된 경우 재처리 방지
        if (payment.getDeliveryStatus() != null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "이미 배송 처리된 주문입니다.");
        }

        payment.setDeliveryStatus("SHIPPING");
        payment.setCourierCompany(dto.getCourierCompany());
        payment.setTrackingNumber(dto.getTrackingNumber());
        payment.setShippedAt(LocalDateTime.now());

        return SalesResponseDTO.from(payment);
    }

    // 마이페이지 - 구매내역 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 구매내역 조회
    @Transactional(readOnly = true)
    public List<PurchaseResponseDTO> getPurchases(String memId) {
        return orderRepository.findPurchasesByBuyerMemId(memId)
                .stream()
                .map(PurchaseResponseDTO::from)
                .collect(Collectors.toList());
    }

    // 구매확정
    @Transactional
    public PurchaseResponseDTO confirmReceipt(ConfirmReceiptRequestDTO dto, String memId) {
        PaymentEntity payment = orderRepository
                .findByBidIdxAndBuyerMemId(dto.getBidIdx(), memId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "해당 결제 건을 찾을 수 없거나 권한이 없습니다."));

        if ("CONFIRMED".equals(payment.getPayStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "이미 구매확정된 주문입니다.");
        }

        if (!"SHIPPING".equals(payment.getDeliveryStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "배송중 상태일 때만 구매확정이 가능합니다.");
        }

        payment.setPayStatus("CONFIRMED");
        payment.setConfirmedAt(LocalDateTime.now());

        return PurchaseResponseDTO.from(payment);
    }

}
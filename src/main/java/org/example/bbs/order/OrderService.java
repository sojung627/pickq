package org.example.bbs.order;

import lombok.RequiredArgsConstructor;
import org.example.bbs.bid.BidRepository;
import org.example.bbs.memberPenalty.PenaltyService;
import org.example.bbs.notification.NotificationService;
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
    private final BidRepository bidRepository;
    private final PenaltyService penaltyService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<SalesResponseDTO> getSales(String memId) {
        return orderRepository.findSalesBySellerMemId(memId)
                .stream()
                .map(SalesResponseDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public SalesResponseDTO registerShipping(ShipRequestDTO dto, String memId) {
        PaymentEntity payment = orderRepository
                .findByBidIdxAndSellerMemId(dto.getBidIdx(), memId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "해당 결제 건을 찾을 수 없거나 권한이 없습니다."));

        if (!"DONE".equals(payment.getPayStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "결제가 완료된 주문만 배송할 수 있습니다.");
        }

        if (payment.getDeliveryStatus() != null
                && !"READY".equals(payment.getDeliveryStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "이미 배송 처리된 주문입니다.");
        }

        payment.setDeliveryStatus("SHIPPING");
        payment.setCourierCompany(dto.getCourierCompany());
        payment.setTrackingNumber(dto.getTrackingNumber());
        payment.setShippedAt(LocalDateTime.now());
        orderRepository.saveAndFlush(payment);

        notificationService.notifyDeliveryStarted(
                payment.getMember(), payment.getBid().getBidder(), payment.getBid().getAuction());

        return SalesResponseDTO.from(payment);
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponseDTO> getPurchases(String memId) {
        return orderRepository.findPurchasesByBuyerMemId(memId)
                .stream()
                .map(PurchaseResponseDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public PurchaseResponseDTO confirmReceipt(ConfirmReceiptRequestDTO dto, String memId) {
        PaymentEntity payment = orderRepository
                .findByBidIdxAndBuyerMemId(dto.getBidIdx(), memId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "해당 결제 건을 찾을 수 없거나 권한이 없습니다."));

        // 예전에 pay_status만 CONFIRMED로 저장된 데이터는 점수 중복 지급 없이 배송상태만 복구
        if ("CONFIRMED".equals(payment.getPayStatus())) {
            orderRepository.synchronizeConfirmedDeliveryStatus(payment.getPayIdx());
            return orderRepository.findByBidIdxAndBuyerMemId(dto.getBidIdx(), memId)
                    .map(PurchaseResponseDTO::from)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "구매확정 주문을 다시 조회할 수 없습니다."));
        }

        if (!"DONE".equals(payment.getPayStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "결제가 완료된 주문만 구매확정할 수 있습니다.");
        }

        if (!"SHIPPING".equals(payment.getDeliveryStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "배송중 상태일 때만 구매확정이 가능합니다.");
        }

        int updated = orderRepository.confirmReceiptAtomically(
                payment.getPayIdx(), LocalDateTime.now());
        if (updated != 1) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "주문 상태가 변경되었습니다. 새로고침 후 다시 시도해주세요.");
        }

        PaymentEntity confirmedPayment = orderRepository
                .findByBidIdxAndBuyerMemId(dto.getBidIdx(), memId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "구매확정 주문을 다시 조회할 수 없습니다."));

        Long buyerIdx = confirmedPayment.getMember().getMemIdx();
        Long sellerIdx = confirmedPayment.getBid().getBidder().getMemIdx();
        penaltyService.applyTradeComplete(buyerIdx);
        penaltyService.applyTradeComplete(sellerIdx);

        notificationService.notifyDeliveryConfirmed(
                confirmedPayment.getBid().getBidder(),
                confirmedPayment.getMember(),
                confirmedPayment.getBid().getAuction());

        return PurchaseResponseDTO.from(confirmedPayment);
    }

    @Transactional(readOnly = true)
    public List<PendingBidResponseDTO> getPendingBids(String memId) {
        return bidRepository.findPendingBidsByBuyerMemId(memId)
                .stream()
                .map(PendingBidResponseDTO::from)
                .collect(Collectors.toList());
    }
}

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import "./style.css";

const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY || "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

export function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bidIdx = searchParams.get("bidIdx");

  const [orderInfo, setOrderInfo] = useState(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState(null);
  const paymentMethodWidgetRef = useRef(null);

  // 1) 백엔드에서 결제 주문 정보(orderId, amount, orderName 등) 발급받기
  useEffect(() => {
    if (!bidIdx) {
      setError("잘못된 접근입니다.");
      return;
    }

    fetch(`/api/payment/order-info?bidIdx=${bidIdx}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) return res.text().then((text) => { throw new Error(text); });
        return res.json();
      })
      .then((data) => setOrderInfo(data))
      .catch(() => setError("결제 정보를 불러오지 못했습니다."));
  }, [bidIdx]);

  // 2) 토스페이먼츠 위젯 SDK 로드
  useEffect(() => {
    if (!orderInfo) return;

    async function fetchPaymentWidgets() {
      const tossPayments = await loadTossPayments(clientKey);
      const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
      setWidgets(widgets);
    }

    fetchPaymentWidgets();
  }, [orderInfo]);

  // 3) 결제 UI 렌더링
  useEffect(() => {
    async function renderPaymentWidgets() {
      if (widgets == null || orderInfo == null) return;

      await widgets.setAmount({ currency: "KRW", value: orderInfo.amount });

      const [paymentMethodWidget] = await Promise.all([
        widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        }),
        widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        }),
      ]);

      paymentMethodWidgetRef.current = paymentMethodWidget;
      setReady(true);
    }

    renderPaymentWidgets();
  }, [widgets, orderInfo]);

  const handlePay = async () => {
    try {
      await widgets?.requestPayment({
        orderId: orderInfo.orderId,
        orderName: orderInfo.orderName,
        customerName: orderInfo.customerName,
        customerEmail: orderInfo.customerEmail,
        successUrl: window.location.origin + "/payment/success",
        failUrl: window.location.origin + "/payment/fail",
      });
    } catch (err) {
      // 사용자가 결제창을 닫거나 취소한 경우 등
      console.error(err);
    }
  };

  if (error) {
    return (
      <div className="wrapper w-100">
        <p>{error}</p>
        <div className="btn-wrapper w-100">
          <div className="btn w-100" onClick={() => navigate("/mypage/orders")}>
            주문 목록으로
          </div>
        </div>
      </div>
    );
  }

  if (!orderInfo) {
    return <div className="wrapper w-100">결제 정보를 불러오는 중...</div>;
  }

  return (
    <div className="wrapper w-100">
      <div className="max-w-540 w-100">
        <div id="payment-method" className="w-100" />
        <div id="agreement" className="w-100" />
        <div className="btn-wrapper w-100">
          <button className="btn primary w-100" disabled={!ready} onClick={handlePay}>
            {orderInfo.amount.toLocaleString("ko-KR")}원 결제하기
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function SuccessPage() {
  const navigate = useNavigate();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState(null);

  const searchParams = new URLSearchParams(window.location.search);
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  async function confirmPayment() {
    try {
      const response = await fetch("/api/payment/confirm", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount: Number(amount),
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }
      setIsConfirmed(true);
    } catch (err) {
      setError("결제 승인에 실패했습니다. 고객센터에 문의해 주세요.");
    }
  }

  return (
    <div className="wrapper w-100">
      {isConfirmed ? (
        <div className="flex-column align-center confirm-success w-100 max-w-540" style={{ display: "flex" }}>
          <h2 className="title">결제를 완료했어요</h2>
          <div className="response-section w-100">
            <div className="flex justify-between">
              <span className="response-label">결제 금액</span>
              <span className="response-text">{Number(amount).toLocaleString("ko-KR")}원</span>
            </div>
            <div className="flex justify-between">
              <span className="response-label">주문번호</span>
              <span className="response-text">{orderId}</span>
            </div>
          </div>
          <div className="w-100 button-group">
            <div className="btn primary w-100" onClick={() => navigate("/mypage/orders")}>
              주문 내역으로
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-column align-center confirm-loading w-100 max-w-540">
          <h2 className="title text-center">결제 요청까지 성공했어요.</h2>
          <h4 className="text-center description">결제 승인하고 완료해보세요.</h4>
          {error && <p style={{ color: "#D64545" }}>{error}</p>}
          <div className="w-100">
            <button className="btn primary w-100" onClick={confirmPayment}>
              결제 승인하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
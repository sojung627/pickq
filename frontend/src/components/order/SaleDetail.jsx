import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// 상태 텍스트 변환 (실제 API 답 기반)
export default function SaleDetail() {
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order ?? null);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  useEffect(() => {
    if (!order) {
      navigate("/mypage/orders", { replace: true });
    }
  }, [order, navigate]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleConfirm = () => {
    if (!window.confirm("구매확정을 진행하시겠습니까?")) return;

    fetch("/api/payment/confirm-receipt", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bidIdx: order.bidIdx }),
    })
      .then((res) => {
        if (!res.ok) return res.text().then((text) => { throw new Error(text); });
        showToast("success", "구매가 확정되었습니다.");
        setOrder((prev) => ({
          ...prev,
          orderStatusCode: "CONFIRMED",
          orderStatusName: "거래완료",
          confirmedAt: new Date().toISOString(),
        }));
      })
      .catch(() => showToast("error", "구매 확정에 실패했습니다."));
  };

  const fmt = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  const fmtPrice = (n) =>
    n != null ? Number(n).toLocaleString("ko-KR") + "원" : "-";

  if (!order) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        불러오는 중...
      </div>
    );
  }

  const isBuyer = order.userRole === "BUYER";
  const isSeller = order.userRole === "SELLER";

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* 토스트 */}
      {toast && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-[#7CBD00] text-white"
              : "bg-[#D64545] text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* 헤더 */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-[#222222]">
            거래 상세
          </h2>
          <div
            onClick={() => navigate("/mypage/orders")}
            className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-200 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            목록
          </div>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-[#767676]">
          거래 상태와 결제/배송 진행 정보를 확인할 수 있습니다.
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* 경고 메시지 */}
        {order.warningMessage && (
          <div className="px-4 py-3 rounded-lg bg-[#FFF7ED] text-[#9A3412] text-sm">
            {order.warningMessage}
          </div>
        )}

        {/* 기본 정보 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs">경매 제목</p>
            <p className="mt-1 font-semibold text-[#222222]">
              {order.auctionTitle}
            </p>
            {order.itemName && (
              <span className="mt-2 inline-flex items-center rounded-full bg-[#F3FAE8] px-2.5 py-1 text-[11px] font-semibold text-[#4C7C00]">
                낙찰 상품: {order.itemName}
              </span>
            )}
          </div>
          <div>
            <p className="text-gray-400 text-xs">주문 상태</p>
            <p className="mt-1 font-semibold text-[#222222]">
              {order.orderStatusName}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">거래 금액</p>
            <p className="mt-1 font-semibold text-[#222222]">
              {fmtPrice(order.orderAmount)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">내 역할</p>
            <p className="mt-1 font-semibold text-[#222222]">
              {order.userRole === "BUYER"
                ? "구매자"
                : order.userRole === "SELLER"
                ? "판매자"
                : "구매/판매"}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">결제 상태</p>
            <p className="mt-1 text-[#222222]">{order.paymentStatusName}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">배송 상태</p>
            <p className="mt-1 text-[#222222]">{order.shippingStatusName}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">택배사</p>
            <p className="mt-1 text-[#222222]">
              {order.courierCompany || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">운송장번호</p>
            <p className="mt-1 text-[#222222]">
              {order.trackingNumber || "-"}
            </p>
          </div>
        </div>

        {/* 거래 상대 정보 */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-[#222222] mb-2">
            거래 상대 정보
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs">구매자</p>
              <p className="mt-1 font-semibold text-[#222222]">
                {order.buyerMemIdMasked || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">판매자</p>
              <p className="mt-1 font-semibold text-[#222222]">
                {order.sellerMemIdMasked || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* 타임라인 */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-[#222222] mb-2">
            타임라인
          </h3>
          <div className="space-y-1 text-xs text-gray-600">
            <div>주문 생성:<span>{fmt(order.orderRegdate)}</span></div>
            <div>결제 완료: <span>{fmt(order.paidAt)}</span></div>
            <div>배송 시작: <span>{fmt(order.shippedAt)}</span></div>
            <div>구매확정: <span>{fmt(order.confirmedAt)}</span></div>
          </div>
        </div>

        {/* 액션 버튼 영역 */}
        <div className="border-t border-gray-100 pt-4 flex justify-end gap-2 flex-wrap">
          {/* 결제하기 */}
          {isBuyer && order.orderStatusCode === "CREATED" && order.auctionIdx && (
            <div
              onClick={() =>
                navigate(`/payment/pay?bidIdx=${order.bidIdx}`)
              }
              className="px-3 py-1.5 rounded-lg bg-[#7CBD00] text-white text-xs font-semibold hover:bg-[#6AA500] cursor-pointer"
            >
              결제하기
            </div>
          )}

          {/* 구매확정 */}
          {isBuyer && order.shippingStatusCode === "SHIPPING" && order.orderStatusCode !== "CONFIRMED" && (
            <div
              onClick={handleConfirm}
              className="px-3 py-1.5 rounded-lg bg-[#7CBD00] text-white text-xs font-semibold hover:bg-[#6AA500] cursor-pointer"
            >
              구매확정
            </div>
          )}

          {/* 배송시작 (판매자, 결제완료) */}
          {isSeller && order.orderStatusCode === "PAID" && (
            <div
              onClick={() => navigate("/mypage/sales")}
              className="px-3 py-1.5 rounded-lg bg-[#222222] text-white text-xs font-semibold hover:bg-[#444444] cursor-pointer"
            >
              배송시작
            </div>
          )}
        </div>

        {/* 배송 중 구매자 문의 유도 */}
        {isBuyer &&
          order.shippingStatusCode === "SHIPPING" &&
          order.orderStatusCode !== "CONFIRMED" &&
          order.orderStatusCode !== "CANCELED" && (
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <p className="text-sm font-semibold text-[#222222]">
                문제가 발생했나요?
              </p>
              <p className="mt-1 text-xs text-[#767676]">
                배송이 시작된 거래는 취소 대신 고객센터로 문의해 주세요.
              </p>
              <div
                onClick={() => navigate("/support/inquiry")}
                className="mt-2 inline-flex items-center px-3 py-2 rounded-lg bg-[#222222] text-white text-xs font-semibold hover:bg-[#333333] cursor-pointer"
              >
                고객센터 문의하기
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
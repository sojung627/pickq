import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MyOrders() {
  const navigate = useNavigate();

  // 주석: 합쳐진 전체 거래 목록 (구매 + 판매)
  const [orders, setOrders] = useState([]);
  const [viewType, setViewType] = useState("all"); // 주석: 'all', 'buy', 'sell'
  const [isLoading, setIsLoading] = useState(true);

  // 주석: 토스트 및 알림 메시지 상태 관리
  const [toast, setToast] = useState({ success: null, error: null });

  // 주석: 배송 상태 코드 -> 한글 라벨
  const getShippingName = (deliveryStatus) => {
    if (!deliveryStatus) return "배송준비중";
    if (deliveryStatus === "SHIPPING") return "배송중";
    if (deliveryStatus === "DELIVERED") return "배송완료";
    return deliveryStatus;
  };

  // 주석: 주문 상태 코드 -> 한글 라벨
  const getStatusName = (statusCode) => {
    if (statusCode === "CREATED") return "결제대기";
    if (statusCode === "PAID") return "결제완료";
    if (statusCode === "SHIPPED") return "배송중";
    if (statusCode === "CONFIRMED") return "거래완료";
    return "결제대기";
  };

  // 주석: 구매내역(PurchaseResponseDTO) -> 화면용 거래 객체로 정규화
  // TODO: 백엔드에 실제 거래(order) 식별자, auctionIdx, sellerIdx, reviewIdx가 추가되면
  //       아래 null 처리된 필드들을 채워서 리뷰 작성 / 결제 이동 기능을 완성할 것
  const mapPurchase = (p) => {
    let orderStatusCode = "PAID";
    if (p.payStatus === "CONFIRMED") orderStatusCode = "CONFIRMED";
    else if (p.deliveryStatus === "SHIPPING") orderStatusCode = "SHIPPED";

    return {
      orderIdx: p.bidIdx,
      bidIdx: p.bidIdx,
      auctionTitle: p.itemName,
      itemName: null,
      userRole: "BUYER",
      orderAmount: p.payAmount,
      paymentStatusName: p.payStatus === "CONFIRMED" ? "구매확정" : "결제완료",
      shippingStatusName: getShippingName(p.deliveryStatus),
      shippingStatusCode: p.deliveryStatus,
      orderStatusCode,
      orderStatusName: getStatusName(orderStatusCode),
      courierCompany: p.courierCompany,
      trackingNumber: p.trackingNumber,
      orderRegdate: p.payRegdate,
      sellerMemIdMasked: p.sellerMemId ?? null,
      buyerMemIdMasked: p.buyerMemId ?? null,
      auctionIdx: null,
      sellerIdx: null,
      reviewIdx: null,
      paidAt: p.paidAt,
      shippedAt: p.shippedAt,
      confirmedAt: p.confirmedAt,
    };
  };

  // 주석: 판매내역(SalesResponseDTO) -> 화면용 거래 객체로 정규화
  const mapSale = (s) => {
    let orderStatusCode = "PAID";
    if (s.deliveryStatus === "DELIVERED") orderStatusCode = "CONFIRMED";
    else if (s.deliveryStatus === "SHIPPING") orderStatusCode = "SHIPPED";

    return {
      orderIdx: s.bidIdx,
      bidIdx: s.bidIdx,
      auctionTitle: s.itemName,
      itemName: null,
      userRole: "SELLER",
      orderAmount: s.payAmount,
      paymentStatusName: "결제완료",
      shippingStatusName: getShippingName(s.deliveryStatus),
      shippingStatusCode: s.deliveryStatus,
      orderStatusCode,
      orderStatusName: getStatusName(orderStatusCode),
      courierCompany: s.courierCompany,
      trackingNumber: s.trackingNumber,
      orderRegdate: s.payRegdate,
      sellerMemIdMasked: s.sellerMemId ?? null,
      buyerMemIdMasked: s.buyerMemId ?? null,
      auctionIdx: null,
      sellerIdx: null,
      reviewIdx: null,
      paidAt: s.paidAt,
      shippedAt: s.shippedAt,
      confirmedAt: s.confirmedAt,
    };
  };

  // 주석: 구매내역 + 판매내역을 같이 불러와서 하나의 리스트로 합치는 함수
  const fetchOrders = () => {
    setIsLoading(true);

    Promise.all([
      fetch("http://localhost:8080/api/mypage/orders", { credentials: "include" }).then((res) =>
        res.ok ? res.json() : []
      ),
      fetch("http://localhost:8080/api/mypage/sales", { credentials: "include" }).then((res) =>
        res.ok ? res.json() : []
      ),
    ])
      .then(([purchases, sales]) => {
        const merged = [
          ...(purchases || []).map(mapPurchase),
          ...(sales || []).map(mapSale),
        ];

        // 주석: 최신 거래가 위로 오도록 정렬
        merged.sort((a, b) => {
          if (!a.orderRegdate) return 1;
          if (!b.orderRegdate) return -1;
          return new Date(b.orderRegdate) - new Date(a.orderRegdate);
        });

        setOrders(merged);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("데이터 로드 실패:", err);
        setIsLoading(false);
      });
  };

  // 주석: 최초 1회만 전체 데이터를 불러오고, 탭 전환은 클라이언트에서 필터링으로 처리
  useEffect(() => {
    fetchOrders();
  }, []);

  // 주석: 현재 선택된 탭(viewType)에 맞춰 화면에 보여줄 목록 필터링
  const displayOrders = orders.filter((order) => {
    if (viewType === "buy") return order.userRole === "BUYER";
    if (viewType === "sell") return order.userRole === "SELLER";
    return true;
  });

  // 주석: 탭별 헤더 타이틀/설명/빈 목록 안내 문구
  const headerInfo = {
    all: {
      pageTitle: "나의 거래",
      pageDescription: "발생한 거래의 결제/배송 상태를 확인할 수 있습니다.",
      emptyMessage: "거래 내역이 없습니다.",
    },
    buy: {
      pageTitle: "나의 구매 내역",
      pageDescription: "내가 구매한 거래의 결제/배송 상태를 확인할 수 있습니다.",
      emptyMessage: "구매 내역이 없습니다.",
    },
    sell: {
      pageTitle: "나의 판매 내역",
      pageDescription: "내가 판매한 거래의 결제/배송 상태를 확인할 수 있습니다.",
      emptyMessage: "판매 내역이 없습니다.",
    },
  }[viewType];

  // 주석: 구매확정 div 이벤트 핸들러 (form 태그 대신 fetch 사용)
  const handleConfirmOrder = (e, bidIdx) => {
    e.stopPropagation(); // 주석: 카드 전체 클릭 이벤트(상세보기 이동) 전파 차단

    if (!window.confirm("구매확정을 진행하시겠습니까?")) return;

    fetch("http://localhost:8080/api/payment/confirm-receipt", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bidIdx }),
    })
      .then((response) => {
        if (response.ok) {
          setToast({ success: "구매확정이 완료되었습니다.", error: null });
          fetchOrders();
        } else {
          setToast({ success: null, error: "구매확정 처리에 실패했습니다." });
        }
      })
      .catch((err) => {
        console.error("구매확정 요청 에러:", err);
        setToast({ success: null, error: "서버 통신 중 에러가 발생했습니다." });
      });
  };

  // 주석: 카드를 누르면 거래 상세 페이지(SaleDetail.jsx)로 이동
  //       이미 정규화해둔 order 객체를 state로 같이 넘겨서, SaleDetail에서 별도 API 호출 없이 바로 표시
  const goToDetail = (order) => {
    navigate(`/mypage/orders/${order.orderIdx}`, { state: { order } });
  };

  // 주석: 금액에 천 단위 쉼표 추가하는 함수
  const formatPrice = (price) => {
    if (price === undefined || price === null) return "0원";
    return `${price.toLocaleString()}원`;
  };

  // 주석: 주문 상태 코드별 배지 색상 반환 함수
  const getStatusBadgeClass = (statusCode) => {
    if (statusCode === "CREATED") return " bg-amber-50 text-amber-700";
    if (statusCode === "PAID") return " bg-[#E6F4D6] text-[#4C7C00]";
    if (statusCode === "SHIPPED") return " bg-blue-50 text-blue-700";
    if (statusCode === "CONFIRMED") return " bg-gray-100 text-gray-700";
    return " bg-gray-100 text-gray-500";
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">

      {/* 주석: 기존 타임리프의 토스트 메시지 조건을 리액트 상태 창으로 구현 */}
      {toast.success && (
        <div className="bg-green-50 text-green-800 p-3 text-sm border-b border-green-100">{toast.success}</div>
      )}
      {toast.error && (
        <div className="bg-red-50 text-red-800 p-3 text-sm border-b border-red-100">{toast.error}</div>
      )}

      {/* 헤더 */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg sm:text-xl font-semibold text-[#222222]">{headerInfo.pageTitle}</h2>
        <p className="mt-1 text-xs sm:text-sm text-[#767676]">{headerInfo.pageDescription}</p>

        {/* 주석: 탭 필터 네비게이션 */}
        <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setViewType("all")}
            className={`px-3 py-1.5 rounded-md border transition-colors ${
              viewType === "all" ? "bg-[#222222] text-white border-[#222222]" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            전체
          </button>
          <button
            type="button"
            onClick={() => setViewType("buy")}
            className={`px-3 py-1.5 rounded-md border transition-colors ${
              viewType === "buy" ? "bg-[#222222] text-white border-[#222222]" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            구매
          </button>
          <button
            type="button"
            onClick={() => setViewType("sell")}
            className={`px-3 py-1.5 rounded-md border transition-colors ${
              viewType === "sell" ? "bg-[#222222] text-white border-[#222222]" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            판매
          </button>
        </div>
      </div>

      {/* 본문: 주문 카드 리스트 */}
      <div className="px-4 py-4 sm:px-6 sm:py-5">
        {isLoading ? (
          <div className="py-10 text-center text-sm text-gray-500">로딩 중...</div>
        ) : displayOrders.length === 0 ? (
          /* 주석: 데이터가 비어있을 때 */
          <div className="py-10 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
            <span>{headerInfo.emptyMessage}</span>
          </div>
        ) : (
          /* 주석: 데이터가 있을 때 반복문 매핑 */
          <div className="space-y-3">
            {displayOrders.map((order) => (
              <div
                key={`${order.userRole}-${order.orderIdx}`}
                className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 sm:px-5 sm:py-4 hover:border-[#7CBD00] transition-colors"
                onClick={() => goToDetail(order)}
              >
                {/* 제목 + 상태 */}
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[#222222]">{order.auctionTitle}</div>

                    {order.itemName && (
                      <div className="mt-1">
                        <span className="inline-flex items-center rounded-full bg-[#F3FAE8] px-2.5 py-1 text-[11px] font-semibold text-[#4C7C00]">
                          낙찰 상품: {order.itemName}
                        </span>
                      </div>
                    )}

                    {order.userRole === "BUYER" && (
                      <div className="mt-1 text-[11px] text-[#999999]">
                        판매자 <span>{order.sellerMemIdMasked || "-"}</span>
                      </div>
                    )}
                    {order.userRole === "SELLER" && (
                      <div className="mt-1 text-[11px] text-[#999999]">
                        구매자 <span>{order.buyerMemIdMasked || "-"}</span>
                      </div>
                    )}
                    {order.userRole === "BOTH" && (
                      <div className="mt-1 text-[11px] text-[#999999]">
                        상대방 <span>{order.sellerMemIdMasked || "-"}</span>
                      </div>
                    )}
                  </div>

                  {/* 주문 상태 배지 */}
                  <div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusBadgeClass(order.orderStatusCode)}`}>
                      {order.orderStatusName || "결제대기"}
                    </span>
                  </div>
                </div>

                {/* 정보 6칸 그리드 구조 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                  <div>
                    <div className="text-[#9ca3af]">결제 금액</div>
                    <div className="mt-0.5 font-semibold text-[#222222]">{formatPrice(order.orderAmount)}</div>
                  </div>
                  <div>
                    <div className="text-[#9ca3af]">결제 상태</div>
                    <div className="mt-0.5 font-semibold text-[#222222]">{order.paymentStatusName}</div>
                  </div>
                  <div>
                    <div className="text-[#9ca3af]">배송 상태</div>
                    <div className="mt-0.5 text-[#222222]">{order.shippingStatusName}</div>
                  </div>
                  <div>
                    <div className="text-[#9ca3af]">택배사</div>
                    <div className="mt-0.5 text-[#222222]">{order.courierCompany || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[#9ca3af]">운송장번호</div>
                    <div className="mt-0.5 text-[#222222]">{order.trackingNumber || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[#9ca3af]">주문일</div>
                    <div className="mt-0.5 text-[#222222]">
                      {order.orderRegdate ? order.orderRegdate.substring(0, 10) : "-"}
                    </div>
                  </div>
                </div>

                {/* 하단 버튼 영역 */}
                <div className="mt-3 flex justify-end gap-2">
                  {/* 결제대기 버튼 (BUYER & CREATED)
                      TODO: 현재 구매내역 API는 결제 완료건만 반환하므로 이 분기는 사실상 동작하지 않음.
                      추후 결제 대기중인 낙찰건을 내려주는 API가 생기면 다시 활성화 */}
                  {order.userRole === "BUYER" && order.orderStatusCode === "CREATED" && order.auctionIdx && (
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-[#7CBD00] text-white text-[11px] sm:text-xs font-semibold hover:bg-[#6AA500]"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/payment/pay?auctionIdx=${order.auctionIdx}`);
                      }}
                    >
                      결제하기
                    </button>
                  )}

                  {/* 배송시작 버튼 (SELLER & PAID) */}
                  {order.userRole === "SELLER" && order.orderStatusCode === "PAID" && (
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-[#222222] text-white text-[11px] sm:text-xs font-semibold hover:bg-[#444444]"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/mypage/sales");
                      }}
                    >
                      배송시작
                    </button>
                  )}

                  {/* 주석: 기존 form 태그 구조를 지우고 요구사항에 맞춰 div 이벤트 기반 비동기 fetch로 변경 완료 */}
                  {order.userRole === "BUYER" && order.shippingStatusCode === "SHIPPING" && (
                    <div
                      role="button"
                      tabIndex={0}
                      className="px-3 py-1.5 rounded-lg bg-[#7CBD00] text-white text-[11px] sm:text-xs font-semibold hover:bg-[#6AA500] inline-block text-center cursor-pointer"
                      onClick={(e) => handleConfirmOrder(e, order.bidIdx)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") handleConfirmOrder(e, order.bidIdx);
                      }}
                    >
                      구매확정
                    </div>
                  )}

                  {/* 리뷰 작성 가능 상태
                      TODO: 구매내역 API에 auctionIdx, sellerIdx, reviewIdx가 추가되면
                      아래 블록을 다시 활성화해서 리뷰 작성/완료 상태를 보여줄 것

                  {order.userRole === "BUYER" && order.orderStatusCode === "CONFIRMED" && !order.reviewIdx && (
                    <a
                      href={`/mypage/reviews/reviewWrite(auctionIdx=${order.auctionIdx}, bidIdx=${order.bidIdx}, bidderIdx=${order.sellerIdx})`}
                      className="px-3 py-1.5 rounded-lg bg-[#222222] text-white text-[11px] sm:text-xs font-semibold hover:bg-[#444444]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      리뷰 작성하기
                    </a>
                  )}
                  {order.userRole === "BUYER" && order.orderStatusCode === "CONFIRMED" && order.reviewIdx && (
                    <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[11px] sm:text-xs font-semibold">
                      리뷰 작성 완료
                    </span>
                  )}
                  */}

                  {/* 상세보기 상시 버튼 */}
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] sm:text-xs text-gray-700 bg-white hover:bg-gray-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToDetail(order);
                    }}
                  >
                    상세보기
                    </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
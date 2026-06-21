import { useEffect, useState } from "react";

export default function MyBids() {
  // 입찰 목록 상태 관리
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 내 입찰 목록 API 호출
  useEffect(() => {
    fetch("/mypage/bids", {
      credentials: "include"
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("네트워크 응답이 올바르지 않습니다.");
        }
        return response.json();
      })
      .then((data) => {
        setBids(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("데이터를 가져오는 중 오류 발생:", error);
        setIsLoading(false);
      });
  }, []);

  // 숫자를 천 단위 콤마 포맷으로 변경하는 함수
  const formatPrice = (price) => {
    if (price === undefined || price === null) return "0원";
    return `${price.toLocaleString()}원`;
  };

  // 날짜 포맷팅 함수 (yyyy-MM-dd HH:mm 형식)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // 입찰 상태별 Tailwind CSS v4 스타일 클래스 반환 함수
  const getStatusClass = (statusIdx) => {
    if (statusIdx === 1) return " bg-[#E6F4D6] text-[#4C7C00]";
    if (statusIdx === 2) return " bg-blue-50 text-blue-700";
    if (statusIdx === 3) return " bg-gray-100 text-gray-600";
    return " bg-gray-100 text-gray-500";
  };

  if (isLoading) {
    return <div className="py-10 text-center text-sm text-gray-500">로딩 중...</div>;
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* 헤더 */}
      <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-[#222222]">내 입찰 목록</h2>
          <p className="mt-1 text-xs sm:text-sm text-[#767676]">내가 참여한 판매 제안(입찰) 목록</p>
        </div>
        <div>
          <a
            href="/mypage/sales"
            className="inline-flex items-center px-4 py-2.5 rounded-md border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            판매 내역 보기
          </a>
        </div>
      </div>

      {/* 본문 */}
      <div className="px-4 py-4 sm:px-6 sm:py-5">
        {/* 참여한 입찰 데이터가 없을 때 */}
        {bids.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
            참여한 입찰이 없습니다.
          </div>
        ) : (
          /* 참여한 입찰 데이터가 있을 때 */
          <div className="space-y-3">
            {/* 데스크탑: 헤더 */}
            <div className="hidden md:grid md:grid-cols-[3fr_2fr_1.5fr_1.5fr_1.5fr_2fr] text-[11px] text-gray-500 px-2 pb-2 border-b border-gray-100">
              <span>경매 제목</span>
              <span>상품명</span>
              <span>브랜드</span>
              <span className="text-right">제안 가격</span>
              <span className="text-center">입찰 상태</span>
              <span className="text-center">입찰일</span>
            </div>

            {/* 각 입찰 항목 루프 돌며 카드/행 렌더링 */}
            {bids.map((bid) => (
              <div
                key={bid.bidIdx}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 sm:px-5 sm:py-4 hover:border-[#7CBD00] transition-colors"
              >
                {/* 데스크탑 뷰 */}
                <div className="hidden md:grid md:grid-cols-[3fr_2fr_1.5fr_1.5fr_1.5fr_2fr] items-center text-xs sm:text-sm gap-2">
                  {/* 경매 제목 (링크) */}
                  <div className="truncate">
                    <a
                      href={`/auctions/${bid.auctionIdx}`}
                      className="text-[#222222] font-semibold hover:underline"
                    >
                      {bid.auctionTitle}
                    </a>
                  </div>

                  {/* 상품명 */}
                  <div className="text-gray-700">{bid.itemName}</div>

                  {/* 브랜드 */}
                  <div className="text-gray-600">{bid.itemBrand ? bid.itemBrand : "-"}</div>

                  {/* 제안 가격 */}
                  <div className="text-right font-semibold text-[#222222]">
                    {formatPrice(bid.bidPrice)}
                  </div>

                  {/* 입찰 상태 */}
                  <div className="text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusClass(
                        bid.bidStatusIdx
                      )}`}
                    >
                      {bid.bidStatusName || "일반"}
                    </span>
                  </div>

                  {/* 입찰일 */}
                  <div className="text-center text-[11px] text-gray-500">
                    {formatDate(bid.bidRegdate)}
                  </div>
                </div>

                {/* 모바일 뷰 */}
                <div className="md:hidden space-y-2">
                  {/* 제목 + 상태 */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <a
                        href={`/auctions/${bid.auctionIdx}`}
                        className="text-sm font-semibold text-[#222222] hover:underline"
                      >
                        {bid.auctionTitle}
                      </a>
                      <div className="mt-0.5 text-[11px] text-gray-500">
                        {bid.itemBrand ? bid.itemBrand : "-"}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusClass(
                          bid.bidStatusIdx
                        )}`}
                      >
                        {bid.bidStatusName || "일반"}
                      </span>
                      <div className="text-[11px] text-gray-400">{formatDate(bid.bidRegdate)}</div>
                    </div>
                  </div>

                  {/* 가격 정보 */}
                  <div className="flex justify-between items-center text-[11px] text-gray-600">
                    <div>
                      <div className="text-gray-400">제안 가격</div>
                      <div className="font-semibold text-[#222222]">
                        {formatPrice(bid.bidPrice)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
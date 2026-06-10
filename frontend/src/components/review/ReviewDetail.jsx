import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

export default function ReviewDetail() {
  const navigate = useNavigate();
  const { reviewIdx: paramIdx } = useParams();
  const [searchParams] = useSearchParams();

  // 경로 파라미터 우선, 없으면 쿼리스트링에서 읽기 (마이페이지 라우트 대응)
  const reviewIdx = paramIdx || searchParams.get("reviewIdx");

  // 프로필 모달에서 진입했는지 여부
  const fromProfile = searchParams.get("fromProfile") === "true";

  const [review, setReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentIdx = reviewIdx || "1";

    fetch(`http://localhost:8080/mypage/reviews/api/detail?reviewIdx=${currentIdx}`, {
      credentials: "include"
    })
      .then((response) => {
        if (!response.ok) throw new Error("네트워크 응답이 올바르지 않습니다.");
        return response.json();
      })
      .then((data) => {
        setReview(data.review);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("리뷰 상세 데이터를 가져오는 중 오류 발생:", error);
        setIsLoading(false);
      });
  }, [reviewIdx]);

  const renderStars = (starCount) => {
    const stars = [];
    const totalStars = 5;
    const count = starCount || 0;
    for (let i = 1; i <= count; i++) {
      stars.push(<i key={`full-${i}`} className="bi bi-star-fill" style={{ color: "gold" }}></i>);
    }
    for (let i = 1; i <= totalStars - count; i++) {
      stars.push(<i key={`empty-${i}`} className="bi bi-star" style={{ color: "gold" }}></i>);
    }
    return stars;
  };

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

  const formatPrice = (price) => {
    if (price === undefined || price === null) return "0";
    return price.toLocaleString();
  };

  if (isLoading) {
    return <div className="py-10 text-center text-sm text-gray-500">로딩 중...</div>;
  }

  if (!review) {
    return <div className="py-10 text-center text-sm text-gray-500">리뷰 데이터를 찾을 수 없습니다.</div>;
  }

  return (
    // fromProfile일 때만 max-w 제한 + 패딩 추가, 마이페이지는 기존 디자인 유지
    <div className={fromProfile ? "max-w-xl mx-auto px-4 py-6 space-y-6" : "space-y-6"}>

      {/* 상단 제목 카드 */}
      <div className="border border-gray-200 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">리뷰 상세</h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">거래 정보와 리뷰 내용을 확인할 수 있습니다</p>
        </div>

        {/* 거래 정보 */}
        <div className="px-6 py-5 space-y-4">
          <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-lg">📦</span>
            <span>거래 정보</span>
          </div>

          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <th className="w-32 bg-gray-50 px-4 py-2 text-left text-gray-700 font-medium">경매 제목</th>
                  <td className="px-4 py-2 text-gray-900">{review.auctionTitle}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <th className="bg-gray-50 px-4 py-2 text-left text-gray-700 font-medium">최종 입찰가</th>
                  <td className="px-4 py-2 text-gray-900">
                    <span>{formatPrice(review.auctionTargetPrice)}</span>원
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <th className="bg-gray-50 px-4 py-2 text-left text-gray-700 font-medium">판매자</th>
                  <td className="px-4 py-2 text-gray-900">{review.bidderName}</td>
                </tr>
                <tr>
                  <th className="bg-gray-50 px-4 py-2 text-left text-gray-700 font-medium">거래 일자</th>
                  <td className="px-4 py-2 text-gray-900">{formatDate(review.bidRegdate)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 리뷰 상세 */}
          <div className="pt-4 space-y-3">
            <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-lg">💬</span>
              <span>리뷰 상세</span>
            </div>

            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <table className="w-full text-sm align-top">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <th className="w-32 bg-gray-50 px-4 py-2 text-left text-gray-700 font-medium">제목</th>
                    <td className="px-4 py-2 text-gray-900">{review.reviewTitle}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <th className="bg-gray-50 px-4 py-2 text-left text-gray-700 font-medium">작성자</th>
                    <td className="px-4 py-2 text-gray-900">{review.memName}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <th className="bg-gray-50 px-4 py-2 text-left text-gray-700 font-medium">별점</th>
                    <td className="px-4 py-2 text-yellow-500">
                      <div className="flex items-center gap-0.5">
                        {renderStars(review.reviewStar)}
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <th className="bg-gray-50 px-4 py-2 text-left text-gray-700 font-medium">작성 일자</th>
                    <td className="px-4 py-2 text-gray-900">{formatDate(review.reviewRegdate)}</td>
                  </tr>
                  <tr>
                    <th className="bg-gray-50 px-4 py-2 text-left text-gray-700 font-medium align-top">리뷰 내용</th>
                    <td className="px-4 py-2 text-gray-900 p-2.5 min-h-[100px] align-top whitespace-pre-wrap break-all">
                      {review.reviewContent}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 뒤로가기 버튼 */}
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2.5 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
        >
          뒤로가기
        </button>
      </div>
    </div>
  );
}
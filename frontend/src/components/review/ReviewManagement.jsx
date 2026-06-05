import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function ReviewManagement() {
  // 주석: 리뷰 데이터 및 로딩 상태 관리
  const [reviewList, setReviewList] = useState([]);
  const [receivedReviewList, setReceivedReviewList] = useState([]);
  const [avgRating, setAvgRating] = useState(0.0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 로그인 유저가 관리자인 경우에만 관리자 페이지로 갈 수 있는 버튼 뜸
  const [loginUser, setLoginUser] = useState(null); // ← null로 초기화

  useEffect(() => {
    fetch('/members/me', { credentials: 'include' })
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => setLoginUser(data))
      .catch(() => setLoginUser(null));
  }, []);

  // 주석: 컴포넌트 마운트 시 내가 남긴 리뷰와 받은 리뷰 데이터를 단 한 번의 fetch로 가져옴
  useEffect(() => {
    fetch("http://localhost:8080/mypage/reviews/api", {
      credentials: "include"
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("네트워크 응답이 올바르지 않습니다.");
        }
        return response.json();
      })
      .then((data) => {
        setReviewList(data.reviewList || []);
        setReceivedReviewList(data.receivedReviewList || []);
        setAvgRating(data.avgRating !== undefined ? data.avgRating : 0.0);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("리뷰 데이터를 가져오는 중 오류 발생:", error);
        setIsLoading(false);
      });
  }, []);

  // 주석: 관리자용 리뷰 삭제 처리 함수 (fetch 비동기 통신 사용)
  const handleDeleteReview = (reviewIdx) => {
    if (!window.confirm("정말로 이 리뷰를 삭제하시겠습니까?")) return;

    fetch(`http://localhost:8080/reviewDelete?reviewIdx=${reviewIdx}`, {
      method: "POST", // 주석: 기존 타임리프 location.href 방식을 안전한 비동기 POST 방식으로 처리
      credentials: "include"
    })
      .then((response) => {
        if (response.ok) {
          alert("리뷰가 성공적으로 삭제되었습니다.");
          // 주석: 삭제 완료 후 리스트 최신화를 위해 화면 상태 필터링 처리
          setReviewList(reviewList.filter((r) => r.reviewIdx !== reviewIdx));
          setReceivedReviewList(receivedReviewList.filter((r) => r.reviewIdx !== reviewIdx));
        } else {
          alert("리뷰 삭제에 실패했습니다.");
        }
      })
      .catch((error) => {
        console.error("리뷰 삭제 중 서버 통신 오류:", error);
      });
  };

  // 주석: 개별 리뷰의 꽉 찬 별과 빈 별 아이콘을 동적으로 생성하는 헬퍼 렌더러
  const renderStars = (starCount) => {
    const stars = [];
    const totalStars = 5;

    // 주석: 채워진 별점 렌더링
    for (let i = 1; i <= starCount; i++) {
      stars.push(<i key={`full-${i}`} className="bi bi-star-fill text-yellow-500"></i>);
    }
    // 주석: 남은 빈 별점 렌더링
    for (let i = 1; i <= totalStars - starCount; i++) {
      stars.push(<i key={`empty-${i}`} className="bi bi-star text-yellow-500"></i>);
    }
    return stars;
  };

  // 주석: 평균 별점 전용 컴포넌트 단위 동적 별점 계산기 (소수점 처리 포함)
  const renderAverageStars = (avg) => {
    const fullStars = Math.floor(avg);
    const hasHalf = avg - fullStars > 0;
    const halfStar = hasHalf ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    const stars = [];

    for (let i = 1; i <= fullStars; i++) {
      stars.push(<i key={`avg-full-${i}`} className="bi bi-star-fill" style={{ color: "gold" }}></i>);
    }
    if (halfStar === 1) {
      stars.push(<i key="avg-half" className="bi bi-star-half" style={{ color: "gold" }}></i>);
    }
    for (let i = 1; i <= emptyStars; i++) {
      stars.push(<i key={`avg-empty-${i}`} className="bi bi-star" style={{ color: "gold" }}></i>);
    }
    return stars;
  };

  // 주석: 날짜 포맷팅 함수 (yyyy-MM-dd HH:mm 형식)
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

  if (isLoading) {
    return <div className="py-10 text-center text-sm text-gray-500">로딩 중...</div>;
  }

  return (
    /* 주석: 요구사항 조건에 맞추어 기존 <form> 구조를 완전히 <div> 컨테이너로 리팩토링 진행 */
    <div className="review">
      {/* 내가 남긴 리뷰 영역 */}
      <div className="border border-gray-200 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] mb-6">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">리뷰관리</h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">거래 후 작성한 리뷰 목록</p>
          </div>
          {/* 관리자 전용 버튼 권한 분기 */}
          {loginUser && loginUser.memRoleIdx === 2 && (
            <div>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 rounded-md bg-[#222222] text-white text-xs sm:text-sm font-semibold hover:bg-black"
                onClick={() => {
                  window.location.href = "/reviewAdmin";
                }}
              >
                관리자 페이지
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-6 space-y-4">
          {/* 내가 남긴 리뷰 리스트 */}
          {reviewList.length > 0 ? (
            <div className="space-y-3">
              {reviewList.map((review) => (
                <div
                  key={review.reviewIdx}
                  className="border border-gray-100 rounded-lg px-4 py-3 hover:border-[#7CBD00] transition-colors"
                >
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{review.auctionTitle}</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        상품명: <span>{review.itemName}</span>
                      </p>
                    </div>
                    <div className="text-right text-xs text-yellow-500">
                      {/* 주석: 별점 루프 함수 호출 */}
                      <div className="flex items-center gap-0.5 justify-end">
                        {renderStars(review.reviewStar)}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {formatDate(review.reviewRegdate)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex gap-2 justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        window.location.href = `/mypage/reviews/reviewDetail?reviewIdx=${review.reviewIdx}`;
                      }}
                    >
                      상세보기
                    </button>
                    {loginUser && loginUser.memRoleIdx === 2 && (
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 rounded-md border border-red-300 text-xs sm:text-sm text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteReview(review.reviewIdx)}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 내가 남긴 리뷰가 비어있을 때 */
            <div className="py-10 text-center text-sm text-gray-500">작성한 리뷰가 없습니다</div>
          )}

          {/* 리뷰 남기기 버튼 링크 연동 */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/mypage/reviews/reviewWrite')}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-[#7CBD00] text-white rounded-md text-sm font-semibold hover:bg-[#6BAD00] cursor-pointer border-none"
            >
              리뷰 남기기
            </button>
          </div>
        </div>
      </div>

      {/* 내가 받은 리뷰 + 평균 별점 영역 */}
      <div className="border border-gray-200 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">거래 후 내가 받은 리뷰</h3>
          </div>

          <div className="starAverage flex items-center gap-2 text-sm">
            <span className="text-xs text-gray-500">평균 별점</span>
            <div className="flex items-center gap-0.5">
              {renderAverageStars(avgRating)}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              {avgRating.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="px-6 py-6">
          {/* 받은 리뷰 리스트 매핑 출력 */}
          {receivedReviewList.length > 0 ? (
            <div className="space-y-3">
              {receivedReviewList.map((review) => (
                <div
                  key={review.reviewIdx}
                  className="border border-gray-100 rounded-lg px-4 py-3 hover:border-[#7CBD00] transition-colors"
                >
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{review.auctionTitle}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        상품명: <span>{review.itemName}</span>
                      </p>
                    </div>
                    <div className="text-right text-xs text-yellow-500">
                      <div className="flex items-center gap-0.5 justify-end">
                        {renderStars(review.reviewStar)}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {formatDate(review.reviewRegdate)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex gap-2 justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        window.location.href = `/mypage/reviews/reviewDetail?reviewIdx=${review.reviewIdx}`;
                      }}
                    >
                      상세보기
                    </button>
                    {loginUser && loginUser.memRoleIdx === 2 && (
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 rounded-md border border-red-300 text-xs sm:text-sm text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteReview(review.reviewIdx)}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 받은 리뷰가 비어있을 때 */
            <div className="py-10 text-center text-sm text-gray-500">받은 리뷰가 없습니다</div>
          )}
        </div>
      </div>
    </div>
  );
}
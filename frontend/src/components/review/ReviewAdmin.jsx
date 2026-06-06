import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ReviewAdmin() {
  const [activeList, setActiveList] = useState([]);
  const [deletedList, setDeletedList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/mypage/reviews/admin/api", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        setActiveList(data.activeList || []);
        setDeletedList(data.deletedList || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleTempDelete = (reviewIdx) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    fetch(`http://localhost:8080/reviewDelete?reviewIdx=${reviewIdx}`, {
      method: "POST",
      credentials: "include"
    }).then(res => {
      if (res.ok) {
        const target = activeList.find(r => r.reviewIdx === reviewIdx);
        setActiveList(activeList.filter(r => r.reviewIdx !== reviewIdx));
        setDeletedList(prev => [...prev, { ...target, reviewIsDeleted: "Y" }]);
      }
    });
  };

  const handleCancelDelete = (reviewIdx) => {
    fetch(`http://localhost:8080/review/reviewCancel?reviewIdx=${reviewIdx}`, {
      credentials: "include"
    }).then(res => {
      if (res.ok) {
        const target = deletedList.find(r => r.reviewIdx === reviewIdx);
        setDeletedList(deletedList.filter(r => r.reviewIdx !== reviewIdx));
        setActiveList(prev => [...prev, { ...target, reviewIsDeleted: "N" }]);
      }
    });
  };

  const handleHardDelete = (reviewIdx) => {
    if (!window.confirm("⚠️ 정말 영구삭제 하시겠습니까?\n삭제된 리뷰는 되돌릴 수 없습니다")) return;
    fetch(`http://localhost:8080/review/hardDelete?reviewIdx=${reviewIdx}`, {
      credentials: "include"
    }).then(res => {
      if (res.ok) {
        setDeletedList(deletedList.filter(r => r.reviewIdx !== reviewIdx));
      }
    });
  };

  const renderStars = (starCount) => {
    const stars = [];
    for (let i = 1; i <= starCount; i++) {
      stars.push(<i key={`full-${i}`} className="bi bi-star-fill"></i>);
    }
    for (let i = 1; i <= 5 - starCount; i++) {
      stars.push(<i key={`empty-${i}`} className="bi bi-star"></i>);
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

  if (isLoading) {
    return <div className="py-10 text-center text-sm text-gray-500">로딩 중...</div>;
  }

  return (
    <div className="review">

      {/* 활성 리뷰 영역 */}
      <div className="border border-gray-200 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] mb-6">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">모든 유저의 리뷰 관리</h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">현재 노출 중인 리뷰 목록입니다.</p>
        </div>

        <div className="px-6 py-6 space-y-4">
          {activeList.length > 0 ? (
            <div className="space-y-3">
              {activeList.map((review) => (
                <div
                  key={review.reviewIdx}
                  className="border border-gray-100 rounded-lg px-4 py-3 hover:border-[#7CBD00] transition-colors"
                >
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">{review.auctionTitle}</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">
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
                      onClick={() => navigate(`/mypage/reviews/reviewDetail?reviewIdx=${review.reviewIdx}`)}
                    >
                      상세보기
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 rounded-md border border-red-300 text-xs sm:text-sm text-red-600 hover:bg-red-50"
                      onClick={() => handleTempDelete(review.reviewIdx)}
                    >
                      임시 삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-gray-500">관리할 리뷰가 없습니다</div>
          )}
        </div>
      </div>

      {/* 임시 삭제 리뷰 영역 */}
      <div className="border border-gray-200 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">임시 삭제 처리된 유저의 리뷰 관리</h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">숨김 처리된 리뷰를 복구하거나 영구 삭제할 수 있습니다.</p>
        </div>

        <div className="px-6 py-6 space-y-4">
          {deletedList.length > 0 ? (
            <div className="space-y-3">
              {deletedList.map((review) => (
                <div
                  key={review.reviewIdx}
                  className="border border-gray-100 rounded-lg px-4 py-3 hover:border-[#7CBD00] transition-colors"
                >
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900">{review.auctionTitle}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">
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

                  <div className="mt-2 flex flex-wrap gap-2 justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => navigate(`/mypage/reviews/reviewDetail?reviewIdx=${review.reviewIdx}`)}
                    >
                      상세보기
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 rounded-md border border-amber-300 text-xs sm:text-sm text-amber-700 hover:bg-amber-50"
                      onClick={() => handleCancelDelete(review.reviewIdx)}
                    >
                      삭제 취소
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 rounded-md border border-red-300 text-xs sm:text-sm text-red-600 hover:bg-red-50"
                      onClick={() => handleHardDelete(review.reviewIdx)}
                    >
                      영구 삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-gray-500">임시삭제 된 리뷰가 없습니다</div>
          )}
        </div>
      </div>

    </div>
  );
}
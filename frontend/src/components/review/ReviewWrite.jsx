import { useEffect, useState, useRef } from "react";

export default function ReviewWrite() {
  // API 연동 및 상태 데이터 관리
  const [reviewList, setReviewList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearched, setIsSearched] = useState(false);

  // 검색창 필드 상태 관리
  const [searchType, setSearchType] = useState("");
  const [keyword, setKeyword] = useState("");

  // 리뷰 양식 작성을 위한 데이터 필드 상태 관리
  const [selectedKeys, setSelectedKeys] = useState({
    bidIdx: "",
    auctionIdx: "",
    bidderIdx: ""
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewStar, setReviewStar] = useState(0);
  const [reviewContent, setReviewContent] = useState("");

  // 하단 작성 폼으로의 자동 부드러운 스크롤 이동을 위한 레퍼런스
  const formRef = useRef(null);

  // 초기 로드 시 전체 거래 목록 조회가 필요할 경우 주석을 해제하여 사용
  useEffect(() => {
    // fetchInitialTransactions();
  }, []);

  // 상단 검색 폼 div 액션 처리 함수 (fetch 사용)
  const handleSearch = () => {
    if (!searchType || !keyword.trim()) return;

    setIsLoading(true);
    setIsSearched(true);

    fetch(`http://localhost:8080/mypage/reviews/reviewSearch?searchType=${searchType}&keyword=${encodeURIComponent(keyword)}`, {
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
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("검색 중 오류 발생:", error);
        setIsLoading(false);
      });
  };

  // 리스트에서 특정 거래 선택 시 하단 작성 폼 활성화 핸들러
  const handleSelectItem = (bidIdx, auctionIdx, bidderIdx) => {
    setSelectedKeys({ bidIdx, auctionIdx, bidderIdx });
    setIsFormVisible(true);

    // 리액트의 렌더링 사이클 이후 돔 요소가 화면에 반영되면 스크롤 동작 지시
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
  };

  // 하단 리뷰 등록 div 액션 처리 함수 (fetch 사용)
  const handleSubmitReview = () => {
    if (!isSubmitDisabled) {
      const payload = {
        bid_idx: selectedKeys.bidIdx,
        auction_idx: selectedKeys.auctionIdx,
        bidder_idx: selectedKeys.bidderIdx,
        reviewTitle: reviewTitle,
        reviewStar: reviewStar,
        content: reviewContent
      };

      fetch("http://localhost:8080/mypage/reviews/reviewWrite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        credentials: "include"
      })
        .then((response) => {
          if (response.ok) {
            alert("리뷰 등록이 성공적으로 완료되었습니다.");
            // 주석: 등록 완료 후 입력 폼 데이터 초기화
            setReviewTitle("");
            setReviewStar(0);
            setReviewContent("");
            setIsFormVisible(false);
          } else {
            alert("리뷰 등록에 실패했습니다.");
          }
        })
        .catch((error) => {
          console.error("리뷰 등록 중 통신 오류:", error);
        });
    }
  };

  // 유효성 검사 분기 로직 정의 (검색 버튼 활성화 조건)
  const isSearchDisabled = !searchType || !keyword.trim();

  // 유효성 검사 분기 로직 정의 (리뷰 제출 버튼 활성화 조건)
  const isSubmitDisabled =
    reviewTitle.trim().length < 5 ||
    reviewContent.trim().length < 10 ||
    reviewContent.trim().length > 300 ||
    reviewStar === 0;

  return (
    <div className="space-y-6">
      {/* 상단 제목 + 검색 박스 카드 */}
      <div className="border border-gray-200 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">리뷰 작성하기</h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">리뷰를 남길 거래를 먼저 선택해주세요</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* 기존 검색 <form>을 요구사항 조건에 맞추어 <div> 구조로 전면 변경 완료 */}
          <div className="search-box flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full sm:w-40 border border-gray-300 rounded-md px-2.5 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
            >
              <option value="">선택하기</option>
              <option value="auctionTitle">경매 제목</option>
              <option value="itemName">상품명</option>
            </select>

            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="검색어를 입력하세요"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
            />

            <button
              type="button"
              disabled={isSearchDisabled}
              onClick={handleSearch}
              className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-[#7CBD00] hover:bg-[#6BAD00] disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
            >
              검색
            </button>
          </div>

          {/* 검색 결과 및 안내 메시지 구문 */}
          {isSearched && keyword && reviewList.length === 0 && (
            <div className="text-xs sm:text-sm text-gray-500">
              "<span>{keyword}</span>"(이)과 관련된 거래가 없습니다
            </div>
          )}

          {isSearched && keyword && reviewList.length > 0 && (
            <div className="text-xs sm:text-sm text-gray-700">
              "<span>{keyword}</span>"(이)과 관련된 거래입니다
            </div>
          )}

          {/* 거래 리스트 컨테이너 */}
          {(!isSearched || reviewList.length > 0) && (
            <div className="mt-2 space-y-3">
              {reviewList.length > 0 ? (
                <div className="space-y-2">
                  {reviewList.map((review) => (
                    <div
                      key={review.bidIdx}
                      className="border border-gray-100 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#7CBD00] transition-colors"
                    >
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{review.auctionTitle}</h3>
                        <p className="mt-0.5 text-[11px] text-gray-500">
                          상품명: <span>{review.itemName}</span>
                        </p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleSelectItem(review.bidIdx, review.auctionIdx, review.bidderIdx)}
                          className="px-3 py-1.5 rounded-md border border-gray-300 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                          리뷰 작성
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* 기본 거래 목록 데이터가 비어있을 때 명시 */
                <div className="py-6 text-center text-sm text-gray-500 border border-gray-100 rounded-lg">
                  리뷰할 거래가 없습니다
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        ref={formRef}
        className="border border-gray-200 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
        style={{ display: isFormVisible ? "block" : "none" }}
      >
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">리뷰 작성</h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">선택한 거래에 대한 리뷰를 작성해주세요</p>
        </div>

        <div className="px-6 py-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="reviewTitle" className="text-sm font-medium text-gray-900">
              리뷰 제목
            </label>
            <input
              type="text"
              id="reviewTitle"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="리뷰 제목(5글자 이상)"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
            />
          </div>

          {/* 별점 컴포넌트 구조 매핑 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-900">별점</label>
            <div id="stars" className="flex gap-1 text-2xl cursor-pointer select-none">
              {[1, 2, 3, 4, 5].map((num) => (
                <span key={num} onClick={() => setReviewStar(num)}>
                  <i
                    className={num <= reviewStar ? "bi bi-star-fill" : "bi bi-star"}
                    style={{ color: num <= reviewStar ? "gold" : "gray" }}
                  ></i>
                </span>
              ))}
            </div>
          </div>

          {/* 내용 및 실시간 자수 카운터 */}
          <div className="space-y-1.5">
            <label htmlFor="reviewContent" className="text-sm font-medium text-gray-900">
              리뷰 내용
            </label>
            <textarea
              id="reviewContent"
              rows={8}
              cols={60}
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="리뷰를 작성해주세요(10글자 이상)"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
            ></textarea>
            <div
              id="contentCount"
              style={{
                fontSize: "12px",
                color: reviewContent.length > 300 ? "red" : "gray"
              }}
            >
              {reviewContent.length} / 300자
            </div>
          </div>

          {/* 등록 비동기 액션 처리 버튼 */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isSubmitDisabled}
              onClick={handleSubmitReview}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-[#7CBD00] text-white rounded-md text-sm font-semibold hover:bg-[#6BAD00] disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
            >
              리뷰 남기기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
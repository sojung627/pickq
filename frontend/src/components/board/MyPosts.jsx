import { useEffect, useState } from "react";

export default function MyPosts() {
  // 주석: 게시글 목록 상태 관리
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 주석: 컴포넌트 마운트 시 백엔드 API에서 데이터 조회
  useEffect(() => {
    fetch("/mypage/boards")
      .then((response) => {
        if (!response.ok) {
          throw new Error("네트워크 응답이 올바르지 않습니다.");
        }
        return response.json();
      })
      .then((data) => {
        setBoards(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("데이터를 가져오는 중 오류 발생:", error);
        setIsLoading(false);
      });
  }, []);

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
    <div className="border border-gray-200 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
      {/* 헤더 */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">내가 쓴 글</h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-600">내가 작성한 커뮤니티 게시글</p>
      </div>

      {/* 내용 */}
      <div className="px-6 py-6">
        {/* 주석: 게시글이 없을 때 */}
        {boards.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">
            작성한 게시글이 없습니다.
          </div>
        ) : (
          /* 주석: 게시글 목록이 있을 때 */
          <div className="space-y-3">
            {/* 헤더 라인 (테이블 헤더 역할) */}
            <div className="hidden md:grid md:grid-cols-[1.5fr_3fr_1fr_1fr_1fr_1.7fr] text-[11px] text-gray-500 px-2 pb-2 border-b border-gray-100">
              <span>게시판</span>
              <span>제목</span>
              <span className="text-center">조회수</span>
              <span className="text-center">좋아요</span>
              <span className="text-center">댓글 수</span>
              <span className="text-right">작성일</span>
            </div>

            {/* 주석: 각 게시글 카드/행 반복 랜더링 */}
            {boards.map((board) => (
              <div
                key={board.boardIdx}
                className="border border-gray-100 rounded-lg px-3 sm:px-4 py-3 hover:border-[#7CBD00] transition-colors"
              >
                {/* 데스크탑: 테이블 형태 */}
                <div className="hidden md:grid md:grid-cols-[1.5fr_3fr_1fr_1fr_1fr_1.7fr] items-center text-sm">
                  <div className="text-gray-700 text-xs sm:text-sm">
                    {board.boardTypeName}
                  </div>
                  <div className="truncate">
                    <a
                      href={`/boards/${board.boardTypeCode}/${board.boardIdx}`}
                      className="text-gray-900 hover:underline"
                    >
                      {board.boardTitle}
                    </a>
                  </div>
                  <div className="text-center text-xs text-gray-600">
                    {board.boardViewCount}
                  </div>
                  <div className="text-center text-xs text-gray-600">
                    {board.boardLike}
                  </div>
                  <div className="text-center text-xs text-gray-600">
                    {board.replyCount}
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    {formatDate(board.boardRegdate)}
                  </div>
                </div>

                {/* 모바일: 카드 형태 */}
                <div className="md:hidden space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">
                      {board.boardTypeName}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {formatDate(board.boardRegdate)}
                    </span>
                  </div>
                  <div>
                    <a
                      href={`/boards/${board.boardTypeCode}/${board.boardIdx}`}
                      className="text-sm font-semibold text-gray-900 hover:underline"
                    >
                      {board.boardTitle}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-500">
                    <span>
                      조회 <span>{board.boardViewCount}</span>
                    </span>
                    <span>
                      좋아요 <span>{board.boardLike}</span>
                    </span>
                    <span>
                      댓글 <span>{board.replyCount}</span>
                    </span>
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
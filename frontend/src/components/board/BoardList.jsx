import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const BoardList = () => {
  const [boards, setBoards] = useState([]);
  const [boardTypes, setBoardTypes] = useState([]);
  const [currentType, setCurrentType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [blockStart, setBlockStart] = useState(1);
  const [blockEnd, setBlockEnd] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchType, setSearchType] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [member, setMember] = useState(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const typeCode = searchParams.get("typeCode");

  useEffect(() => {
    fetch("http://localhost:8080/mypage/info", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setMember(data))
      .catch(err => console.error("회원 조회 에러:", err));
    fetch("http://localhost:8080/boards/types")
      .then(res => res.json())
      .then(data => setBoardTypes(data))
      .catch(err => console.error("게시판 타입 조회 에러:", err));
      fetch(`http://localhost:8080/boards/?page=${currentPage}&searchType=${searchType}&keyword=${keyword}${typeCode ? `&typeCode=${typeCode}` : ''}`)
          .then(res => res.json())
      .then(data => {
        setBoards(data.boards);
        setCurrentType(data.currentType ?? null);
        setCurrentPage(data.currentPage);
        setBlockStart(data.blockStart);
        setBlockEnd(data.blockEnd);
        setTotalPages(data.totalPages);
      })
      .catch(err => console.error("게시글 조회 에러:", err));
  }, [currentPage, searchType, keyword, typeCode]);

  const toggleSidebarAccordion = () => {
    setIsAccordionOpen(prev => !prev);
  };
  const movePage = (page) => {
    setCurrentPage(page);
  };
  const submitSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
        {/* 상단 헤더 */}
        <header className="mb-4 py-3 px-3 sm:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] mb-1">
                커뮤니티
              </h1>
              <p className="text-sm text-[#767676]">
                커뮤니티에서 다양한 주제로 소통해 보세요.
              </p>
            </div>
          </div>
        </header>
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Left Sidebar */}
          <aside className="w-full lg:w-60 lg:flex-shrink-0">
            <div className="bg-white border border-gray-100 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] sticky top-24 overflow-hidden">
              {/* 모바일 */}
              <button
                type="button"
                onClick={toggleSidebarAccordion}
                className="lg:hidden w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 text-sm font-semibold text-[#222222]"
              >
                <span className="flex items-center gap-2">
                  <span>종목별 게시판</span>
                  {!isAccordionOpen && (
                    <span className="text-xs font-normal text-[#767676]">
                      · {currentType ? currentType.boardTypeName : '전체 게시판'}
                    </span>
                  )}
                </span>
                <i className={`bi bi-chevron-down text-[#767676] transition-transform duration-300 ${isAccordionOpen ? 'rotate-180' : ''}`}></i>
              </button>
              {/* Desktop */}
              <div className="hidden lg:block px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-[#222222]">
                  종목별 게시판
                </h3>
              </div>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out lg:max-h-none lg:overflow-visible ${isAccordionOpen ? 'max-h-[1000px]' : 'max-h-0 lg:max-h-none'}`}>
                <div className="px-2 py-2">
                  {/* 전체 게시판 */}
                  <button
                    type="button"
                    onClick={() => navigate('/boards')}
                    className={`w-full inline-flex items-center rounded-lg px-4 py-3 text-sm font-semibold leading-5 transition-colors ${!typeCode
                      ? 'bg-gray-100 text-[#222222]'
                      : 'text-[#767676] hover:bg-gray-50 hover:text-[#222222]'
                      }`}>
                    전체 게시판
                  </button>
                  {/* 게시판 목록 */}
                  <div>
                    {boardTypes.map((bt) => (
                      <button
                        key={bt.boardTypeCode}
                        type="button"
                        onClick={() => navigate(`/boards?typeCode=${bt.boardTypeCode}`)}
                        className={`w-full inline-flex items-center rounded-lg px-4 py-3 text-sm font-semibold leading-5 transition-colors ${typeCode === bt.boardTypeCode
                          ? 'bg-gray-100 text-[#222222]'
                          : 'text-[#767676] hover:bg-gray-50 hover:text-[#222222]'
                          }`}>
                        {bt.boardTypeName}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>
          {/* Right */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-gray-100 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#222222]">
                    {currentType ? currentType.boardTypeName : '전체 게시판'}
                  </h1>
                  {/* 글쓰기 */}
                  <div className="flex items-center justify-end">
                    {member ? (
                      <>
                        {typeCode ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/boards/${typeCode}/new`)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold bg-[#222222] text-white hover:bg-[#444444] transition-colors"
                          >
                            <i className="bi bi-plus-lg text-[0.8rem]"></i>
                            <span>글쓰기</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold bg-[#222222] text-white hover:bg-[#444444] transition-colors"
                          >
                            <i className="bi bi-plus-lg text-[0.8rem]"></i>
                            <span>글쓰기</span>
                          </button>

                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate('/members/login')}
                        className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold bg-[#222222] text-white hover:bg-[#444444] transition-colors"
                      >
                        <i className="bi bi-plus-lg text-[0.8rem]"></i>
                        <span>글쓰기</span>
                      </button>
                    )}
                  </div>
                </div>
                {/* Search */}
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select value={searchType} onChange={(e) => setSearchType(e.target.value)}
                    className="w-full sm:w-40 rounded-md border border-gray-300 bg-white px-2 py-2 text-xs sm:text-sm">
                    <option value="all">제목+내용</option>
                    <option value="title">제목</option>
                    <option value="content">내용</option>
                    <option value="writer">작성자</option>
                  </select>
                  <div className="relative flex-1">
                    <i className="bi bi-search text-gray-400 text-xs sm:text-sm absolute left-2.5 top-1/2 -translate-y-1/2"></i>
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setCurrentPage(1);
                        }
                      }}
                      placeholder="검색어를 입력하세요"
                      className="w-full rounded-md border border-gray-300 bg-white pl-7 pr-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-800"/>
                  </div>
                  <button type="button" onClick={() => setCurrentPage(1)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-gray-700">
                    <i className="bi bi-search text-[0.8rem]"></i>
                    <span>검색</span>
                  </button>
                </div>
              </div>
              {/* 리스트 헤더 */}
              <div className="grid grid-cols-12 gap-1 px-6 py-3 bg-gray-50 text-[11px] sm:text-xs font-semibold text-[#222222]">
                <div className="col-span-7 text-center">제목</div>
                <div className="col-span-2 text-center">작성자</div>
                <div className="col-span-1 text-center">조회</div>
                <div className="col-span-1 text-center">추천</div>
                <div className="col-span-1 text-center">작성일</div>
              </div>
              {/* Empty */}
              {boards.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-gray-500">
                  게시글이 없습니다.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {boards.map((b) => (
                    <div
                      key={b.boardIdx}
                      className="grid grid-cols-12 gap-1 px-6 py-3 text-[11px] sm:text-sm hover:bg-gray-50 transition-colors">
                      {/* 제목 */}
                      <div className="col-span-7">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => navigate(`/boards/${b.boardTypeCode}/${b.boardIdx}`)}
                            className="truncate text-[#222222] font-medium hover:text-[#7CBD00]">
                            {b.boardTitle}
                          </button>
                          {b.hasImage && (
                            <i className="bi bi-image-fill text-[10px] sm:text-xs text-[#999999] flex-shrink-0"></i>
                          )}
                          {b.replyCount > 0 && (
                            <span className="flex items-center gap-1 text-xs text-[#999999] flex-shrink-0">
                              <i className="bi bi-chat-dots text-[11px]"></i>
                              <span>{b.replyCount}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      {/* 작성자 */}
                      <div className="col-span-2 flex items-center justify-center">
                        <span className="truncate text-[10px] sm:text-xs text-[#767676]">
                          {b.memNickname ? b.memNickname : b.memId}
                        </span>
                      </div>
                      {/* 조회 */}
                      <div className="col-span-1 text-center text-[#767676]">
                        {b.boardViewCount}
                      </div>
                      {/* 추천 */}
                      <div className="col-span-1 text-center text-[#767676]">
                        {b.boardLike ?? 0}
                      </div>
                      {/* 작성일 */}
                      <div className="col-span-1 text-center text-[10px] sm:text-xs text-[#767676]">
                        {/* 타이머 끊어내기 */}
                        {b.boardRegdate ? b.boardRegdate.split('T')[0] : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* 모달 */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}>
          <div className="w-[90%] max-w-sm rounded-2xl border border-[#333] bg-[#1e1e1e] px-5 py-4">
            <div className="mb-3 text-sm font-bold text-[#c6f135]">
              게시판 선택
            </div>
            <div className="flex flex-col gap-1">
              {boardTypes.map((bt) => (
                <button
                  key={bt.boardTypeCode}
                  type="button"
                  onClick={() => navigate(`/boards/${bt.boardTypeCode}/new?from=all`)}
                  className="block rounded-lg bg-[#2a2a2a] px-3 py-2 text-xs text-[#e0e0e0] text-left hover:bg-[#c6f135] hover:text-[#121212]">
                  {bt.boardTypeName}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="mt-3 w-full rounded-lg border border-[#444] px-3 py-1.5 text-xs text-[#aaaaaa]">
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardList;
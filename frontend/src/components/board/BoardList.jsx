import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";

const BoardList = () => {
  const [boards, setBoards] = useState([]);
  const [boardTypes, setBoardTypes] = useState([]);
  const [currentType, setCurrentType] = useState(null);
  const [blockStart, setBlockStart] = useState(1);
  const [blockEnd, setBlockEnd] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [member, setMember] = useState(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const typeCode = searchParams.get("typeCode") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const searchType = searchParams.get("searchType") || "all";
  const keyword = searchParams.get("keyword") || "";
  const sortType = searchParams.get("sortType") || "latest";

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    setSearchParams(next);
  };

  useEffect(() => {
    fetch("http://localhost:8080/mypage/info", { credentials: "include" })
      .then(res => {
        if (res.status === 401) return null; // 비로그인이면 그냥 null
        return res.json();
      })
      .then(data => setMember(data))
      .catch(() => setMember(null));

    fetch("http://localhost:8080/boards/types")
      .then(res => res.json())
      .then(data => setBoardTypes(data))
      .catch(err => console.error("게시판 타입 조회 에러:", err));

    fetch(`http://localhost:8080/boards/?page=${currentPage}&searchType=${searchType}&keyword=${keyword}&sortType=${sortType}${typeCode ? `&typeCode=${typeCode}` : ''}`)
      .then(res => res.json())
      .then(data => {
        setBoards(data.boards ?? []);
        setCurrentType(data.currentType ?? null);
        setBlockStart(data.blockStart);
        setBlockEnd(data.blockEnd);
        setTotalPages(data.totalPages);
      })
      .catch(err => console.error("게시글 조회 에러:", err));
  }, [currentPage, searchType, keyword, typeCode, sortType]);

  const toggleSidebarAccordion = () => setIsAccordionOpen(prev => !prev);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
        <header className="mb-4 py-3 px-3 sm:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] mb-1">커뮤니티</h1>
              <p className="text-sm text-[#767676]">커뮤니티에서 다양한 주제로 소통해 보세요.</p>
            </div>
          </div>
        </header>

        {/* 정렬 버튼 */}
        <div className="flex justify-end items-center gap-2 px-6 py-2">
          {[{ value: "latest", label: "최신순" }, { value: "views", label: "조회수순" }].map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => updateParams({ sortType: s.value, page: "1" })}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm border transition-colors ${
                sortType === s.value
                  ? "bg-[#222222] border-[#222222] text-white"
                  : "border-gray-300 text-[#222222] bg-white hover:bg-gray-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Left Sidebar */}
          <aside className="w-full lg:w-60 lg:flex-shrink-0">
            <div className="bg-white border border-gray-100 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] sticky top-24 overflow-hidden">
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
              <div className="hidden lg:block px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-[#222222]">종목별 게시판</h3>
              </div>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out lg:max-h-none lg:overflow-visible ${isAccordionOpen ? 'max-h-[1000px]' : 'max-h-0 lg:max-h-none'}`}>
                <div className="px-2 py-2">
                  <button
                    type="button"
                    onClick={() => navigate('/boards')}
                    className={`w-full inline-flex items-center rounded-lg px-4 py-3 text-sm font-semibold leading-5 transition-colors ${!typeCode ? 'bg-gray-100 text-[#222222]' : 'text-[#767676] hover:bg-gray-50 hover:text-[#222222]'}`}>
                    전체 게시판
                  </button>
                  <div>
                    {boardTypes.map((bt) => (
                      <button
                        key={bt.boardTypeCode}
                        type="button"
                        onClick={() => navigate(`/boards?typeCode=${bt.boardTypeCode}`)}
                        className={`w-full inline-flex items-center rounded-lg px-4 py-3 text-sm font-semibold leading-5 transition-colors ${typeCode === bt.boardTypeCode ? 'bg-gray-100 text-[#222222]' : 'text-[#767676] hover:bg-gray-50 hover:text-[#222222]'}`}>
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
                  <div className="flex items-center justify-end">
                    {member ? (
                      typeCode ? (
                        <button type="button" onClick={() => navigate(`/boards/${typeCode}/new`)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold bg-[#222222] text-white hover:bg-[#444444] transition-colors">
                          <i className="bi bi-plus-lg text-[0.8rem]"></i><span>글쓰기</span>
                        </button>
                      ) : (
                        <button type="button" onClick={() => setIsModalOpen(true)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold bg-[#222222] text-white hover:bg-[#444444] transition-colors">
                          <i className="bi bi-plus-lg text-[0.8rem]"></i><span>글쓰기</span>
                        </button>
                      )
                    ) : (
                      <button type="button"
                        onClick={() => navigate('/members/login?msg=로그인이 필요한 서비스입니다.')}
                        className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold bg-[#222222] text-white hover:bg-[#444444] transition-colors">
                        <i className="bi bi-plus-lg text-[0.8rem]"></i><span>글쓰기</span>
                      </button>
                    )}
                  </div>
                </div>
                {/* Search */}
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select value={searchType} onChange={(e) => updateParams({ searchType: e.target.value, page: "1" })}
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
                      defaultValue={keyword}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") updateParams({ keyword: e.target.value, page: "1" });
                      }}
                      placeholder="검색어를 입력하세요"
                      id="keywordInput"
                      className="w-full rounded-md border border-gray-300 bg-white pl-7 pr-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-800"/>
                  </div>
                  <button type="button"
                    onClick={() => updateParams({ keyword: document.getElementById('keywordInput').value, page: "1" })}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-gray-700">
                    <i className="bi bi-search text-[0.8rem]"></i><span>검색</span>
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

              {/* 게시글 목록 */}
              {boards.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-gray-500">게시글이 없습니다.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {boards.map((b) => (
                    <div key={b.boardIdx} className="grid grid-cols-12 gap-1 px-6 py-3 text-[11px] sm:text-sm hover:bg-gray-50 transition-colors">
                      <div
                        className="col-span-7 cursor-pointer"
                        onClick={() => navigate(`/boards/${b.boardTypeCode}/${b.boardIdx}?page=${currentPage}`)}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="truncate text-[#222222] font-medium hover:text-[#7CBD00]">
                            {b.boardTitle}
                          </span>
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
                      <div className="col-span-2 flex items-center justify-center">
                        <span className="truncate text-[10px] sm:text-xs text-[#767676]">{b.memNickname ? b.memNickname : b.memId}</span>
                      </div>
                      <div className="col-span-1 text-center text-[#767676]">{b.boardViewCount}</div>
                      <div className="col-span-1 text-center text-[#767676]">{b.boardLike ?? 0}</div>
                      <div className="col-span-1 text-center text-[10px] sm:text-xs text-[#767676]">
                        {b.boardRegdate ? b.boardRegdate.split('T')[0] : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 px-6 py-4 border-t border-gray-100">
                  {blockStart > 1 && (
                    <button
                      type="button"
                      onClick={() => updateParams({ page: String(blockStart - 1) })}
                      className="px-2 py-1.5 rounded-md text-xs border border-gray-300 text-[#767676] hover:bg-gray-50">
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  )}
                  {Array.from({ length: blockEnd - blockStart + 1 }, (_, i) => blockStart + i).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => updateParams({ page: String(p) })}
                      className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${
                        currentPage === p
                          ? 'bg-[#222222] border-[#222222] text-white'
                          : 'border-gray-300 text-[#222222] bg-white hover:bg-gray-50'
                      }`}>
                      {p}
                    </button>
                  ))}
                  {blockEnd < totalPages && (
                    <button
                      type="button"
                      onClick={() => updateParams({ page: String(blockEnd + 1) })}
                      className="px-2 py-1.5 rounded-md text-xs border border-gray-300 text-[#767676] hover:bg-gray-50">
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="w-[90%] max-w-sm rounded-2xl border border-[#333] bg-[#1e1e1e] px-5 py-4">
            <div className="mb-3 text-sm font-bold text-[#c6f135]">게시판 선택</div>
            <div className="flex flex-col gap-1">
              {boardTypes.map((bt) => (
                <button key={bt.boardTypeCode} type="button"
                  onClick={() => navigate(`/boards/${bt.boardTypeCode}/new?from=all`)}
                  className="block rounded-lg bg-[#2a2a2a] px-3 py-2 text-xs text-[#e0e0e0] text-left hover:bg-[#c6f135] hover:text-[#121212]">
                  {bt.boardTypeName}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setIsModalOpen(false)}
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
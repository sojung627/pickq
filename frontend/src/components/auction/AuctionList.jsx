import React, { useState, useEffect, useRef } from 'react';

const AuctionList = ({
  selectedCategory,
  statusFilter,
  sortBy,
  keyword,
  successMessage,
  errorMessage
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [auctionList, setAuctionList] = useState([]);
  const [session, setSession] = useState(null);
  const sidebarBodyRef = useRef(null);

  // 경매 목록 fetch
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (sortBy) params.append('sortBy', sortBy);
    if (statusFilter) params.append('statusFilter', statusFilter);
    if (keyword) params.append('keyword', keyword);

    fetch(`http://localhost:8080/auctions?${params.toString()}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setAuctionList(data))
      .catch(err => console.error('경매 목록 fetch 실패:', err));
  }, [selectedCategory, sortBy, statusFilter, keyword]);

  // 세션 fetch
  useEffect(() => {
    fetch('http://localhost:8080/members/api/session', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setSession(data))
      .catch(() => setSession({}));
  }, []);

  // 사이드바 토글
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const categories = [
    { code: null, name: '전체', path: '/auctions' },
    { code: 'ball', name: '공/볼', path: '/auctions/category/ball' },
    { code: 'racket', name: '라켓/배트/클럽', path: '/auctions/category/racket' },
    { code: 'protective', name: '보호대/보호장비', path: '/auctions/category/protective' },
    { code: 'apparel', name: '의류/신발', path: '/auctions/category/apparel' },
    { code: 'fitness', name: '헬스/홈트 용품', path: '/auctions/category/fitness' },
    { code: 'outdoor', name: '아웃도어/캠핑', path: '/auctions/category/outdoor' },
    { code: 'swim', name: '수영/수상 스포츠', path: '/auctions/category/swim' },
    { code: 'accessory', name: '액세서리/잡화', path: '/auctions/category/accessory' },
  ];

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">

        {/* 상단 헤더 */}
        <header className="mb-4 py-3 px-3 sm:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] mb-1">경매 요청</h1>
              <p className="text-sm text-[#767676]">원하는 조건으로 경매를 등록해 보세요. 여러 판매자가 제안합니다</p>
            </div>

            {/* 로그인 시: 경매 등록하기 */}
            {session?.loginUser && (
              <div className="mt-4 sm:mt-0">
                <button
                  type="button"
                  onClick={() => window.location.href = '/auctions/new'}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#8BC34A] px-5 py-2 text-sm font-bold text-white hover:bg-[#7CB342] transition-colors shadow-sm"
                >
                  <span className="text-xl leading-none">+</span>
                  <span>경매 등록하기</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">

          {/* 왼쪽: 카테고리 사이드바 */}
          <aside className="w-full lg:w-60 lg:flex-shrink-0">
            <div className="sticky top-24 bg-white border border-gray-100 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">

              {/* Mobile header */}
              <button
                className="lg:hidden w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 text-sm font-semibold text-[#222222]"
                aria-expanded={isSidebarOpen}
                onClick={toggleSidebar}
              >
                <span className="flex items-center gap-2">
                  <span>카테고리</span>
                  <span className="text-xs font-normal text-[#767676]">
                    {selectedCategory ? '· 선택됨' : '· 전체'}
                  </span>
                </span>
                <i className={`bi bi-chevron-down text-[#767676] transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {/* Desktop header */}
              <div className="hidden lg:block px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-[#222222]">카테고리</h3>
              </div>

              {/* Body */}
              <nav
                ref={sidebarBodyRef}
                className="overflow-hidden transition-[max-height] duration-300 ease-in-out lg:max-h-none lg:overflow-visible"
                style={{ maxHeight: window.innerWidth < 1024 ? (isSidebarOpen ? `${sidebarBodyRef.current?.scrollHeight}px` : '0px') : 'none' }}
              >
                <div className="px-2 py-2 text-sm">
                  {categories.map((cat) => (
                    <a
                      key={cat.code || 'all'}
                      href={`${cat.path}?sortBy=${sortBy || 'latest'}&statusFilter=${statusFilter || 'open'}`}
                      className={`block rounded-lg px-4 py-3 text-sm font-semibold leading-5 transition-colors ${
                        selectedCategory === cat.code
                          ? 'bg-gray-100 text-[#222222] font-semibold'
                          : 'text-[#767676] hover:bg-gray-50 hover:text-[#222222]'
                      }`}
                    >
                      {cat.name}
                    </a>
                  ))}
                </div>
              </nav>
            </div>
          </aside>

          {/* 오른쪽: 컨텐츠 영역 */}
          <main className="flex-1">

            {/* 검색 폼 */}
            <div className="mb-6">
              <form
                action={selectedCategory ? `/auctions/category/${selectedCategory}` : "/auctions"}
                method="get"
                className="flex items-center gap-2"
              >
                <input type="hidden" name="sortBy" value={sortBy || ''} />
                <input type="hidden" name="statusFilter" value={statusFilter || ''} />
                <div className="relative flex-1">
                  <i className="bi bi-search text-[#767676] text-sm absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                  <input
                    type="text"
                    name="keyword"
                    defaultValue={keyword}
                    placeholder="관심있는 키워드를 검색해보세요."
                    className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-[#222222] focus:outline-none focus:ring-1 focus:ring-gray-800"
                  />
                </div>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-lg bg-[#222222] text-[#FFFFFF] text-sm font-semibold hover:bg-[#444444] transition-colors whitespace-nowrap"
                >
                  검색
                </button>
              </form>
            </div>

            {/* 상단 카운트 / 정렬 버튼 */}
            <div className="mb-5 pb-3 border-b border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs sm:text-sm text-[#767676]">
                  총 <span className="font-semibold text-[#222222]">{auctionList.length}</span>개
                </span>
                <div className="flex items-center gap-2">
                  {['open', 'closed'].map((filter) => (
                    <a
                      key={filter}
                      href={
                        selectedCategory
                          ? `/auctions/category/${selectedCategory}?sortBy=${sortBy || 'latest'}&statusFilter=${filter}`
                          : `/auctions?sortBy=${sortBy || 'latest'}&statusFilter=${filter}`
                      }
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs sm:text-sm font-medium border transition-colors ${
                        statusFilter === filter || (filter === 'open' && !statusFilter)
                          ? 'bg-[#222222] text-white border-[#222222]'
                          : 'bg-white text-[#767676] border-gray-200 hover:border-[#222222] hover:text-[#222222]'
                      }`}
                    >
                      {filter === 'open' ? '진행중' : '마감된 경매'}
                    </a>
                  ))}
                </div>
              </div>

              {/* 정렬 버튼 */}
              <div className="flex items-center justify-end gap-1 text-xs sm:text-sm">
                {[
                  { id: 'latest', label: '📅 최신순' },
                  { id: 'views', label: '👀 조회수순' },
                  { id: 'deadline', label: '⏰ 마감임박순' },
                ].map((sort) => (
                  <a
                    key={sort.id}
                    href={
                      selectedCategory
                        ? `/auctions/category/${selectedCategory}?sortBy=${sort.id}&keyword=${keyword || ''}&statusFilter=${statusFilter || 'open'}`
                        : `/auctions?sortBy=${sort.id}&keyword=${keyword || ''}&statusFilter=${statusFilter || 'open'}`
                    }
                    className={`px-2.5 py-1 rounded transition-colors ${
                      sortBy === sort.id || (sort.id === 'latest' && !sortBy)
                        ? 'bg-gray-100 font-semibold text-[#222222]'
                        : 'text-[#767676] hover:text-[#222222]'
                    }`}
                  >
                    {sort.label}
                  </a>
                ))}
              </div>
            </div>

            {/* 경매 카드 그리드 */}
            {auctionList.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {auctionList.map((item) => (
                  <div
                    key={item.auctionIdx}
                    className={`bg-white ${item.auctionStatusIdx !== 1 ? 'opacity-70' : ''}`}
                  >
                    <a href={`/auctions/${item.auctionIdx}`} className="block group">

                      {/* 썸네일 */}
                      <div className="relative aspect-square mb-3 overflow-hidden bg-gray-100">
                        <img
                          src={item.auctionThumbnailImg || '/images/auction/auction_default.png'}
                          alt="썸네일"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* 상태 배지 */}
                        <div className="absolute left-2 top-2">
                          {item.auctionStatusIdx === 1 && (
                            <span className="inline-flex items-center rounded-full bg-[#222222] px-2 py-0.5 text-[11px] font-medium text-white">진행중</span>
                          )}
                          {item.auctionStatusIdx === 2 && (
                            <span className="inline-flex items-center rounded-full bg-gray-800 px-2 py-0.5 text-[11px] font-medium text-white">결정대기</span>
                          )}
                          {item.auctionStatusIdx === 3 && (
                            <span className="inline-flex items-center rounded-full bg-gray-500 px-2 py-0.5 text-[11px] font-medium text-white">마감</span>
                          )}
                          {item.auctionStatusIdx === 4 && (
                            <span className="inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-medium text-white">유찰</span>
                          )}
                          {item.auctionStatusIdx === 5 && (
                            <span className="inline-flex items-center rounded-full bg-gray-400 px-2 py-0.5 text-[11px] font-medium text-white">취소</span>
                          )}
                        </div>
                      </div>

                      {/* 텍스트 영역 */}
                      <div>
                        <p className="text-xs text-[#767676] mb-1">{item.itemCategoryName}</p>
                        <h3 className="text-sm font-medium text-[#222222] mb-1 line-clamp-1">{item.auctionTitle}</h3>
                        <div className="flex items-center gap-2 text-xs text-[#767676] mt-2 mb-2">
                          <span>제안 {item.bidCount}건</span>
                          <span>•</span>
                          <span className="timer-display">{item.timeDisplay}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#767676]">희망 예산</span>
                            <span className="text-base font-bold text-[#222222]">
                              {item.auctionTargetPrice?.toLocaleString()}원
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#767676]">최저 제안가</span>
                            <span className={`text-sm font-semibold ${item.minBidPrice === 0 ? 'text-[#999999]' : 'text-[#222222]'}`}>
                              {item.minBidPrice === 0 ? '제안 없음' : `${item.minBidPrice?.toLocaleString()}원`}
                            </span>
                          </div>
                        </div>
                      </div>

                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-sm text-[#999999]">조회된 경매 데이터가 없습니다.</div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AuctionList;

import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const MyPageLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarBodyRef = useRef(null);

  // 화면 크기에 따른 초기 설정 (데스크탑은 열림, 모바일은 닫힘)
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

   const handleDeleteAccount = (e) => {
      e.preventDefault();
      if (window.confirm('정말 탈퇴하시겠습니까?')) {
        fetch('/members/withdraw', {
          method: 'DELETE',
          credentials: 'include',
        })
          .then(res => res.json())
          .then(data => {
            if (data.status === 'success') {
              alert('탈퇴가 완료되었습니다.');
              window.location.href = '/';
            } else {
              alert('탈퇴 처리 중 오류가 발생했습니다.');
            }
          })
          .catch(() => alert('서버 오류가 발생했습니다.'));
      }
    };

  // 활성화 메뉴 스타일 (기본 디자인과 동일)
  const getNavClass = ({ isActive }) =>
    `w-full inline-flex items-center rounded-lg px-4 py-3 text-base font-semibold transition-colors ${
      isActive
        ? 'bg-gray-100 text-[#222222]'
        : 'text-[#767676] hover:bg-gray-50 hover:text-[#222222]'
    }`;

  return (
    <div className="min-h-screen bg-white">
      {/* Header 위치 (기본 container 클래스 유지) */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">

        {/* 상단 헤더 */}
        <header className="mb-4 py-3 px-3 sm:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#222222] mb-1">마이 페이지</h1>
              <p className="text-base text-[#767676]">내 정보와 활동 내역을 관리하세요.</p>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* 사이드바 */}
          <aside className="w-full lg:w-60 lg:flex-shrink-0">
            <div className="bg-white border border-gray-100 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] sticky top-24 overflow-hidden">

              {/* 모바일 토글 버튼 */}
              <button
                type="button"
                className="lg:hidden w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 text-base font-semibold text-[#222222]"
                onClick={toggleSidebar}>
                <span>마이페이지 메뉴</span>
                <i className={`bi bi-chevron-down text-[#767676] transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {/* 데스크탑 타이틀 */}
              <div className="hidden lg:block px-4 py-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-[#222222]">마이페이지 메뉴</h3>
              </div>

              {/* 메뉴 본문 (v4에서도 transition은 동일하게 동작) */}
              <div
                ref={sidebarBodyRef}
                style={{
                  maxHeight: isSidebarOpen ? `${sidebarBodyRef.current?.scrollHeight}px` : '0px',
                }}
                className={`overflow-hidden transition-[max-height] duration-300 ease-in-out lg:!max-h-none lg:overflow-visible`}>
                {/* MY 경매 */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-xs font-semibold tracking-[0.06em] text-[#8C8F95]">MY 경매</h3>
                </div>
                <div className="px-2 py-2 space-y-1">
                  <NavLink to="/mypage/auctions" className={getNavClass}>내 경매 내역</NavLink>
                  <NavLink to="/mypage/bids" className={getNavClass}>내 입찰 내역</NavLink>
                  <NavLink to="/mypage/orders" className={getNavClass}>내 거래 내역</NavLink>
                </div>

                {/* MY 활동 */}
                <div className="px-4 py-3 border-y border-gray-100 bg-gray-50 mt-1">
                  <h3 className="text-xs font-semibold tracking-[0.06em] text-[#8C8F95]">MY 활동</h3>
                </div>
                <div className="px-2 py-2 space-y-1">
                  <NavLink to="/mypage/profile" className={getNavClass}>나의 프로필</NavLink>
                  <NavLink to="/mypage/boards" className={getNavClass}>내가 쓴 글</NavLink>
                  <NavLink to="/mypage/reviews" className={getNavClass}>내 리뷰 관리</NavLink>
                </div>

                {/* MY 정보 */}
                <div className="px-4 py-3 border-y border-gray-100 bg-gray-50 mt-1">
                  <h3 className="text-xs font-semibold tracking-[0.06em] text-[#8C8F95]">MY 정보</h3>
                </div>
                <div className="px-2 py-2 space-y-1 mb-2">
                  <NavLink to="/mypage/info" className={getNavClass}>개인정보확인/수정</NavLink>
                  <NavLink to="/mypage/addresses" className={getNavClass}>배송지 관리</NavLink>

                  {/* 회원탈퇴 */}
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full inline-flex items-center rounded-lg px-4 py-3 text-base font-semibold transition-colors text-[#D64545] hover:bg-[#FFF5F5]"
                  >
                    <span>회원탈퇴</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* 메인 콘텐츠 영역 */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
      {/* Footer 및 FloatingButtons 위치 */}
    </div>
  );
};

export default MyPageLayout;
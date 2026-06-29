import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Profile from '../profile/Profile';
import NotificationDropdown from '../notification/NotificationDropdown';

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loginUser, setLoginUser] = useState(null);
  const [loginProfile, setLoginProfile] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [reviewData, setReviewData] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 모바일 사이드 메뉴 열림 상태 관리 추가
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/members/auth/check", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setIsLoggedIn(data.isLoggedIn);
        if (data.isLoggedIn) {
          setLoginUser(data.member);
          setLoginProfile(data.profile);
        }
      });
  }, []);

  const handleLogout = () => {
    fetch("/members/logout", {
      method: "POST",
      credentials: "include"
    })
    .then(() => {
      window.location.href = "/";
    });
  };

  const fetchUnreadCount = () => {
    fetch("/api/notifications/unread-count", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUnreadCount(data.count || 0))
      .catch(() => {});
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchUnreadCount();

    const handleRefresh = () => fetchUnreadCount();
    window.addEventListener("notification-read", handleRefresh);
    window.addEventListener("notification-created", handleRefresh);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchUnreadCount();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
        window.removeEventListener("notification-read", handleRefresh);
        window.removeEventListener("notification-created", handleRefresh);
        document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isLoggedIn]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto px-4 h-16 flex items-center">

        {/* 데스크톱 화면 레이아웃 (md 이상에서만 그리드 적용) */}
        <div className="hidden md:grid grid-cols-12 w-full items-center">
          {/* 로고 (3칸) */}
          <div className="col-span-3 flex items-center">
            <Link to="/" className="flex items-center no-underline">
              <img
                src="/images/pickq_logo.png"
                alt="PickQ 로고"
                className="h-[100px] w-auto cursor-pointer"
              />
            </Link>
          </div>

          {/* 메뉴 (6칸) */}
          <nav className="col-span-6 flex justify-center gap-2">
            <Link to="/auctions" className="px-4 py-2 text-[16px] font-medium text-[#222] no-underline hover:text-green-600 transition-colors">경매</Link>
            <Link to="/boards" className="px-4 py-2 text-[16px] font-medium text-[#222] no-underline hover:text-green-600 transition-colors">커뮤니티</Link>
            <Link to="/mypage/auctions" className="px-4 py-2 text-[16px] font-medium text-[#222] no-underline hover:text-green-600 transition-colors">마이페이지</Link>
            <Link to="/support/guide" className="px-4 py-2 text-[16px] font-medium text-[#222] no-underline hover:text-green-600 transition-colors">고객지원</Link>
          </nav>

          {/* 우측 액션 (3칸) */}
          <div className="col-span-3 flex justify-end items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationOpen((prev) => !prev)}
                    className="relative p-2 bg-transparent border-none cursor-pointer flex items-center">
                    <i className="bi bi-bell text-[22px] text-[#222]"></i>
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                  {isNotificationOpen && (
                    <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
                  )}
                </div>

                <button
                  onClick={async () => {
                    const res = await fetch(
                      `/mypage/profile/modal/${loginUser.memIdx}`,
                      { credentials: "include" }
                    );
                    const data = await res.json();
                    setProfileData(data.profile);
                    setReviewData(data.reviews);
                    setIsProfileOpen(true);
                  }}
                  className="p-2 bg-transparent border-none cursor-pointer flex items-center"
                >
                  <i className="bi bi-person text-2xl text-[#222]"></i>
                </button>

                <button
                  onClick={handleLogout}
                  className="bg-[#333] text-white px-3 py-1.5 rounded text-sm font-semibold flex items-center gap-1.5 hover:bg-black transition-colors cursor-pointer"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/members/login')}
                  className="bg-transparent border-none text-[16px] text-[#222] cursor-pointer font-medium"
                >
                  로그인
                </button>
                <button
                  onClick={() => navigate('/members/signUp')}
                  className="bg-[#7CBD00] text-white px-4 py-2 rounded text-[16px] font-bold hover:bg-[#6aa600] transition-colors cursor-pointer"
                >
                  회원가입
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 모바일 화면 레이아웃 (md 미만 모바일에서만 노출) */}
        <div className="flex md:hidden w-full items-center justify-between">
          {/* 모바일 햄버거 메뉴 버튼 */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-transparent border-none cursor-pointer flex items-center"
          >
            <i className="bi bi-list text-2xl text-[#222]"></i>
          </button>

          {/* 모바일 로고 (중앙 정렬을 위해 여백 조절) */}
          <Link to="/" className="flex items-center no-underline h-16 overflow-hidden">
            <img
              src="/images/pickq_logo.png"
              alt="PickQ 로고"
              className="h-[80px] w-auto cursor-pointer"
            />
          </Link>

          {/* 모바일 우측 알림 아이콘 (로그인했을 때만 노출) */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen((prev) => !prev)}
                  className="relative p-2 bg-transparent border-none cursor-pointer flex items-center">
                  <i className="bi bi-bell text-xl text-[#222]"></i>
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  )}
                </button>
                {isNotificationOpen && (
                  <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
                )}
              </div>
            ) : (
              // 로그인 안 되어 있을 때는 공간 맞추기용 더미 div
              <div className="w-9"></div>
            )}
          </div>
        </div>

      </div>

      {/* 모바일 사이드 메뉴 서랍장 (Drawer) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* 배경 어둡게 처리 */}
          <div className="fixed inset-0 bg-black/40" onClick={() => setIsMobileMenuOpen(false)}></div>

          {/* 메뉴 컨텐츠 */}
          <div className="fixed top-0 left-0 bottom-0 w-[270px] bg-white p-6 shadow-xl flex flex-col justify-between">
            <div>
              {/* 닫기 버튼 */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-transparent border-none cursor-pointer p-1"
                >
                  <i className="bi bi-x-lg text-xl text-[#222]"></i>
                </button>
              </div>

              {/* 모바일 네비게이션 링크 */}
              <nav className="flex flex-col gap-4">
                <Link to="/auctions" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-lg font-medium text-[#222] no-underline hover:text-green-600">경매</Link>
                <Link to="/boards" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-lg font-medium text-[#222] no-underline hover:text-green-600">커뮤니티</Link>
                <Link to="/mypage/auctions" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-lg font-medium text-[#222] no-underline hover:text-green-600">마이페이지</Link>
                <Link to="/support/guide" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-lg font-medium text-[#222] no-underline hover:text-green-600">고객지원</Link>
              </nav>
            </div>

            {/* 모바일 하단 로그인/로그아웃 섹션 */}
            <div className="border-t border-gray-100 pt-4">
              {isLoggedIn ? (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={async () => {
                      setIsMobileMenuOpen(false);
                      const res = await fetch(
                        `/mypage/profile/modal/${loginUser.memIdx}`,
                        { credentials: "include" }
                      );
                      const data = await res.json();
                      setProfileData(data.profile);
                      setReviewData(data.reviews);
                      setIsProfileOpen(true);
                    }}
                    className="w-full py-2 bg-gray-50 border border-gray-200 rounded-lg text-[#222] text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="bi bi-person text-lg"></i>
                    내 프로필 보기
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-2 bg-[#333] text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-black cursor-pointer"
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/members/login');
                    }}
                    className="w-full py-2.5 bg-transparent border border-gray-300 rounded-lg text-[#222] text-sm font-medium cursor-pointer"
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/members/signUp');
                    }}
                    className="w-full py-2.5 bg-[#7CBD00] text-white rounded-lg text-sm font-bold hover:bg-[#6aa600] cursor-pointer"
                  >
                    회원가입
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 기존 프로필 모달 (반응형 대응 포함) */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsProfileOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Profile
              profile={profileData}
              reviews={reviewData}
              loginUser={loginUser}
              onClose={() => setIsProfileOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
}
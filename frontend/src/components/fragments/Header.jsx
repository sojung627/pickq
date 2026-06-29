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
  // 모바일 드로어 상태
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
    }).then(() => {
      window.location.href = "/";
    });
  };

  const fetchUnreadCount = () => {
    fetch("/api/notifications/unread-count", { credentials: "include" })
      .then(res => res.json())
      .then(data => setUnreadCount(data.count || 0))
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

  // 드로어 열릴 때 body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isDrawerOpen]);

  const handleProfileOpen = async () => {
    const res = await fetch(`/mypage/profile/modal/${loginUser.memIdx}`, {
      credentials: "include"
    });
    const data = await res.json();
    setProfileData(data.profile);
    setReviewData(data.reviews);
    setIsProfileOpen(true);
  };

  const NAV_LINKS = [
    { to: "/auctions",       label: "경매" },
    { to: "/boards",         label: "커뮤니티" },
    { to: "/mypage/auctions",label: "마이페이지" },
    { to: "/support/guide",  label: "고객지원" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto px-4 h-16 flex items-center justify-between">

        {/* 로고 */}
        <Link to="/" className="flex items-center no-underline flex-shrink-0">
          <img
            src="/images/pickq_logo.png"
            alt="PickQ 로고"
            className="h-10 w-auto cursor-pointer"
          />
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="px-4 py-2 text-[16px] font-medium text-[#222] no-underline hover:text-green-600 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* 데스크탑 우측 액션 */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {/* 알림 아이콘 */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(prev => !prev)}
                  className="relative p-2 bg-transparent border-none cursor-pointer flex items-center"
                >
                  <i className="bi bi-bell text-[22px] text-[#222]"></i>
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  )}
                </button>
                {isNotificationOpen && (
                  <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
                )}
              </div>

              {/* 프로필 아이콘 */}
              <button
                onClick={handleProfileOpen}
                className="p-2 bg-transparent border-none cursor-pointer flex items-center"
              >
                <i className="bi bi-person text-2xl text-[#222]"></i>
              </button>

              {/* 로그아웃 */}
              <button
                onClick={handleLogout}
                className="bg-[#333] text-white px-3 py-1.5 rounded text-sm font-semibold flex items-center gap-1.5 hover:bg-black transition-colors cursor-pointer"
              >
                <i className="bi bi-box-arrow-right"></i>
                로그아웃
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* 모바일 우측: 알림 + 햄버거 */}
        <div className="flex md:hidden items-center gap-1">
          {isLoggedIn && (
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(prev => !prev)}
                className="relative p-2 bg-transparent border-none cursor-pointer flex items-center"
              >
                <i className="bi bi-bell text-[22px] text-[#222]"></i>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                )}
              </button>
              {isNotificationOpen && (
                <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
              )}
            </div>
          )}

          {/* 햄버거 / X 토글 버튼 */}
          <button
            onClick={() => setIsDrawerOpen(prev => !prev)}
            className="p-2 bg-transparent border-none cursor-pointer flex items-center"
            aria-label="메뉴 열기"
          >
            <i className={`bi ${isDrawerOpen ? 'bi-x-lg' : 'bi-list'} text-[24px] text-[#222]`}></i>
          </button>
        </div>
      </div>

      {/* 모바일 드로어 오버레이 */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsDrawerOpen(false)}
        >
          {/* 드로어 패널 (오른쪽에서 슬라이드) */}
          <div
            className="absolute top-0 right-0 h-full w-64 bg-white shadow-xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* 드로어 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="text-base font-semibold text-[#222]">메뉴</span>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 bg-transparent border-none cursor-pointer"
                aria-label="메뉴 닫기"
              >
                <i className="bi bi-x-lg text-[20px] text-[#222]"></i>
              </button>
            </div>

            {/* 네비게이션 링크 */}
            <nav className="flex flex-col py-2">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-5 py-3.5 text-[15px] font-medium text-[#222] no-underline hover:bg-gray-50 hover:text-green-600 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* 구분선 */}
            <div className="border-t border-gray-100 mx-5" />

            {/* 로그인/로그아웃 영역 */}
            <div className="px-5 py-4 flex flex-col gap-3 mt-auto">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={async () => {
                      setIsDrawerOpen(false);
                      await handleProfileOpen();
                    }}
                    className="w-full flex items-center gap-2 px-0 py-2 bg-transparent border-none cursor-pointer text-[15px] font-medium text-[#222] hover:text-green-600 transition-colors"
                  >
                    <i className="bi bi-person text-[18px]"></i>
                    내 프로필
                  </button>
                  <button
                    onClick={() => { setIsDrawerOpen(false); handleLogout(); }}
                    className="w-full bg-[#333] text-white py-2.5 rounded text-sm font-semibold flex items-center justify-center gap-2 hover:bg-black transition-colors cursor-pointer"
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setIsDrawerOpen(false); navigate('/members/login'); }}
                    className="w-full border border-gray-300 text-[#222] py-2.5 rounded text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer bg-transparent"
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => { setIsDrawerOpen(false); navigate('/members/signUp'); }}
                    className="w-full bg-[#7CBD00] text-white py-2.5 rounded text-sm font-bold hover:bg-[#6aa600] transition-colors cursor-pointer"
                  >
                    회원가입
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 프로필 모달 (공통) */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setIsProfileOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4"
            onClick={e => e.stopPropagation()}
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
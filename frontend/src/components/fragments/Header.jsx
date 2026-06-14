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
  // 프로필 모달용
  const [profileData, setProfileData] = useState(null);
  const [reviewData, setReviewData] = useState([]);
  // 알림 모달용
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("http://localhost:8080/members/auth/check", { credentials: "include" })
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
    fetch("http://localhost:8080/members/logout", {
      method: "POST",
      credentials: "include"
    })
    .then(() => {
      window.location.href = "/";
    });
  };

  // 알림 빨간색 점
  useEffect(() => {
    if (!isLoggedIn) return;
    fetch("http://localhost:8080/api/notifications/unread-count", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUnreadCount(data.count || 0))
      .catch(() => {});
  }, [isLoggedIn]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto px-4 h-16 flex items-center">
        <div className="grid grid-cols-12 w-full items-center">

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
                {/* 알림 아이콘 */}
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

                {/* 마이페이지 아이콘 */}
                <button
                  onClick={async () => {
                    const res = await fetch(
                      `http://localhost:8080/mypage/profile/modal/${loginUser.memIdx}`,
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

                {/* 로그아웃 버튼 */}
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

          {isProfileOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
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

        </div>
      </div>
    </header>
  );
}
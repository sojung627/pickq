import { useState, useEffect } from 'react';
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
    fetch("/members/logout", { method: "POST", credentials: "include" })
      .then(() => { window.location.href = "/"; });
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

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 clamp(4px, 1vw, 16px)',
          height: 'clamp(52px, 8vw, 64px)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', width: '100%', alignItems: 'center' }}>

          {/* 로고 */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img
                src="/images/pickq_logo.png"
                alt="PickQ 로고"
                style={{
                  height: 'clamp(42px, 9vw, 100px)',
                  width: 'auto',
                  cursor: 'pointer',
                }}
              />
            </Link>
          </div>

          {/* 메뉴 */}
          <nav style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(0px, 0.5vw, 8px)' }}>
            {[
              { to: "/auctions",        label: "경매" },
              { to: "/boards",          label: "커뮤니티" },
              { to: "/mypage/auctions", label: "마이페이지" },
              { to: "/support/guide",   label: "고객지원" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{
                  padding: 'clamp(4px, 0.8vw, 8px) clamp(4px, 1.2vw, 16px)',
                  fontSize: 'clamp(10px, 1.4vw, 16px)',
                  fontWeight: 500,
                  color: '#222',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#16a34a'}
                onMouseLeave={e => e.currentTarget.style.color = '#222'}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* 우측 액션 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'clamp(2px, 0.8vw, 16px)' }}>
            {isLoggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(2px, 0.8vw, 12px)' }}>

                {/* 알림 아이콘 */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setIsNotificationOpen(prev => !prev)}
                    style={{
                      position: 'relative',
                      padding: 'clamp(2px, 0.5vw, 8px)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <i
                      className="bi bi-bell text-[#222]"
                      style={{ fontSize: 'clamp(14px, 2vw, 22px)' }}
                    ></i>
                    {unreadCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '6px',
                        height: '6px',
                        background: '#ef4444',
                        borderRadius: '50%',
                      }}></span>
                    )}
                  </button>
                  {isNotificationOpen && (
                    <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
                  )}
                </div>

                {/* 프로필 아이콘 */}
                <button
                  onClick={async () => {
                    const res = await fetch(`/mypage/profile/modal/${loginUser.memIdx}`, { credentials: "include" });
                    const data = await res.json();
                    setProfileData(data.profile);
                    setReviewData(data.reviews);
                    setIsProfileOpen(true);
                  }}
                  style={{
                    padding: 'clamp(2px, 0.5vw, 8px)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <i
                    className="bi bi-person text-[#222]"
                    style={{ fontSize: 'clamp(16px, 2.2vw, 24px)' }}
                  ></i>
                </button>

                {/* 로그아웃 버튼 */}
                <button
                  onClick={handleLogout}
                  style={{
                    background: '#333',
                    color: '#fff',
                    padding: 'clamp(3px, 0.5vw, 6px) clamp(4px, 0.8vw, 12px)',
                    borderRadius: '4px',
                    fontSize: 'clamp(10px, 1.2vw, 14px)',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(2px, 0.4vw, 6px)',
                    whiteSpace: 'nowrap',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#000'}
                  onMouseLeave={e => e.currentTarget.style.background = '#333'}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  로그아웃
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 0.8vw, 12px)' }}>
                <button
                  onClick={() => navigate('/members/login')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: 'clamp(10px, 1.4vw, 16px)',
                    color: '#222',
                    cursor: 'pointer',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  로그인
                </button>
                <button
                  onClick={() => navigate('/members/signUp')}
                  style={{
                    background: '#7CBD00',
                    color: '#fff',
                    padding: 'clamp(4px, 0.6vw, 8px) clamp(6px, 1vw, 16px)',
                    borderRadius: '4px',
                    fontSize: 'clamp(10px, 1.4vw, 16px)',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#6aa600'}
                  onMouseLeave={e => e.currentTarget.style.background = '#7CBD00'}
                >
                  회원가입
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 프로필 모달 */}
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
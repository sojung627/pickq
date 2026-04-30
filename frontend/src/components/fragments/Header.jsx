import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  // 로그인 성공 여부에 따라 true/false로 테스트해봐!
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 초기값 false

  useEffect(() => {
      fetch("http://localhost:8080/members/auth/check", { credentials: "include" }) // 세션 쿠키 포함!
          .then(res => res.json())
          .then(data => setIsLoggedIn(data.isLoggedIn));
  }, []); // 컴포넌트 마운트될 때 한 번 실행

  // 로그아웃
  const handleLogout = () => {
      fetch("http://localhost:8080/members/logout", {
          method: "POST",
          credentials: "include"  // 세션 쿠키 포함!
      })
      .then(() => {
          window.location.href = "/"; // 로그인이랑 똑같이 새로 로드!
      });
  };

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
              // 로그인 후 (사진 2번: 알림, 마이페이지, 로그아웃)
              <div className="flex items-center gap-3">
                {/* 알림 아이콘 */}
                <button className="relative p-2 bg-transparent border-none cursor-pointer flex items-center">
                  <i className="bi bi-bell text-[22px] text-[#222]"></i>
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                </button>

                {/* 마이페이지 아이콘 */}
                <button
                  onClick={() => navigate('/mypage')}
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
              // 로그인 전 (사진 1번: 로그인, 회원가입)
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
      </div>
    </header>
  );
}
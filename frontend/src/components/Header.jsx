import React from 'react';

export default function Header() {
  const navLinkStyle = {
    padding: "8px 16px",
    fontSize: "16px",
    fontWeight: "500",
    color: "#222",
    textDecoration: "none",
    transition: "color 0.2s"
  };

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      backgroundColor: "#fff",
      borderBottom: "1px solid #eee",
      width: "100%"
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px", height: "64px", display: "flex", alignItems: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", width: "100%", alignItems: "center" }}>

          {/* 로고 (3칸) */}
          <div style={{ gridColumn: "span 3", display: "flex", alignItems: "center" }}>
              <img
                src="/images/pickq_logo.png"
                alt="PickQ 로고"
                style={{
                  height: "60px",
                  width: "auto",
                  cursor: "pointer"
                }} />
          </div>

          {/* 메뉴 (6칸) */}
          <nav style={{ gridColumn: "span 6", display: "flex", justifyContent: "center", gap: "8px" }}>
            <a href="/auctions" style={navLinkStyle}>경매</a>
            <a href="/boards" style={navLinkStyle}>커뮤니티</a>
            <a href="/mypage/auctions" style={navLinkStyle}>마이페이지</a>
            <a href="/support/guide" style={navLinkStyle}>고객지원</a>
          </nav>

          {/* 우측 액션 (3칸) */}
          <div style={{ gridColumn: "span 3", display: "flex", justifyContent: "flex-end", gap: "12px", alignItems: "center" }}>
            <button style={{ background: "none", border: "none", fontSize: "16px", color: "#222", cursor: "pointer" }}>로그인</button>
            <button style={{
              backgroundColor: "#7CBD00",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer"
            }}>회원가입</button>
          </div>

        </div>
      </div>
    </header>
  );
}
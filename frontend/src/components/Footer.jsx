import React from 'react';

export default function Footer() {
  const sectionTitleStyle = { fontSize: "14px", fontWeight: "bold", marginBottom: "12px", color: "#000" };
  const linkStyle = { fontSize: "13px", color: "#666", textDecoration: "none", display: "block", marginBottom: "4px" };
  const borderStyle = { borderTop: "1px solid #eee", paddingTop: "12px", paddingBottom: "8px" };

  return (
    <footer style={{ borderTop: "1px solid #eee", backgroundColor: "#fff", marginTop: "auto", padding: "20px 0" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>

        {/* 상단: 여백 줄임 */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", gap: "40px" }}>
            <div>
              <h3 style={sectionTitleStyle}>이용안내</h3>
              <a href="#" style={linkStyle}>검수기준</a>
              <a href="#" style={linkStyle}>이용정책</a>
              <a href="#" style={linkStyle}>페널티 정책</a>
              <a href="#" style={linkStyle}>커뮤니티 가이드라인</a>
            </div>
            <div>
              <h3 style={sectionTitleStyle}>고객지원</h3>
              <a href="#" style={linkStyle}>공지사항</a>
              <a href="#" style={linkStyle}>스토어 안내</a>
              <a href="#" style={linkStyle}>판매자 방문접수</a>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <h3 style={sectionTitleStyle}>고객센터 <span style={{ marginLeft: "8px", fontWeight: "800" }}>0000-0000</span></h3>
            <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.4" }}>
              운영시간 평일 10:00 - 18:00<br />
              점심시간 평일 13:00 - 14:00
            </p>
          </div>
        </div>

        {/* 중단: 약관 섹션 */}
        <div style={borderStyle}>
          <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#444" }}>
            <span>회사소개</span>
            <span>인재채용</span>
            <span>제휴제안</span>
            <span>이용약관</span>
            <span style={{ fontWeight: "bold" }}>개인정보처리방침</span>
          </div>
        </div>

        {/* 하단: 정보 섹션 간격 밀착 */}
        <div style={{ ...borderStyle, fontSize: "11px", color: "#999", lineHeight: "1.4" }}>
          <p>픽큐 주식회사 · 대표 디버근 | 사업자등록번호 : 000-00-00000 | 통신판매업 : 제 0000-가나다-0000호</p>
          <p>사업장소재지 : 대구광역시 어딘가 123, 4층 | 전화 : 0000-0000 | 이메일 : help@pickq.co.kr</p>
        </div>

        <div style={{ ...borderStyle, color: "#999", fontSize: "11px" }}>
          <p style={{ fontWeight: "bold", color: "#666", marginBottom: "2px" }}>가상 은행 채무지급보증 안내</p>
          <p>PickQ는 고객님의 현금 결제 금액에 대해 제휴 금융사와 채무지급보증 계약을 체결하여 안전거래를 보장합니다.</p>
        </div>

        <div style={{ marginTop: "12px", fontSize: "11px", color: "#bbb" }}>
          <p>PickQ(주)는 통신판매 중개자로서 통신판매의 당사자가 아닙니다. © PickQ Corp.</p>
        </div>

      </div>
    </footer>
  );
}
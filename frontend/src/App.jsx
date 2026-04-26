import { useEffect, useState } from "react";
import axios from "axios";
import Header from "./components/Header"; // 추가된 부분
import Footer from "./components/Footer"; // 추가된 부분

export default function App() {
  const [data, setData] = useState({ hotAuctions: [], deadlineAuctions: [], latestAuctions: [] });
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      img: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2000",
      title: "스포츠 용품 거래,\n여기서부터",
      desc: "온라인 발품은 그만! 픽큐로 한큐에 해결하세요."
    },
    {
      img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2000",
      title: "최저가는\n경쟁이 만듭니다",
      desc: "여러 판매자가 당신을 위해 경쟁합니다."
    },
    {
      img: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=2000",
      title: "원하는 장비를\n합리적인 가격에",
      desc: "스포츠 용품 구매의 새로운 기준"
    }
  ];

  useEffect(() => {
    axios.get("http://localhost:8080/")
      .then(res => setData(res.data))
      .catch(err => console.error(err));

    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const containerStyle = { maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "0 40px", boxSizing: "border-box" };

  return (
    // 전체를 감싸는 스타일 수정: flex와 column을 줘서 푸터가 아래로 가도록 설정
    <div style={{ display: "flex", flexDirection: "column", backgroundColor: "#fff", minHeight: "100vh", fontFamily: "sans-serif", width: "100%", margin: 0, padding: 0 }}>

      <Header /> {/* 추가된 부분: 상단 헤더 */}

      <main style={{ flex: 1 }}> {/* 추가된 부분: 메인 컨텐츠 영역 시작 */}
        {/* 1. 히어로 슬라이더 */}
        <section style={{ position: "relative", height: "450px", overflow: "hidden", width: "100%" }}>
          {slides.map((slide, index) => (
            <div key={index} style={{ position: "absolute", inset: 0, opacity: index === currentSlide ? 1 : 0, transition: "opacity 1s", zIndex: index === currentSlide ? 10 : 0 }}>
              <img src={slide.img} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.7)" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
                <div style={containerStyle}>
                  <div style={{ color: "#fff", textAlign: "left" }}>
                    <h1 style={{ fontSize: "48px", fontWeight: "800", marginBottom: "20px", whiteSpace: "pre-line", lineHeight: "1.2" }}>{slide.title}</h1>
                    <p style={{ fontSize: "18px", marginBottom: "40px", opacity: 0.9 }}>{slide.desc}</p>
                    <button style={{ backgroundColor: "#fff", color: "#222", border: "none", padding: "15px 40px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>지금 시작하기</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* 2. 카테고리 (8개 그리드) */}
        <section style={{ ...containerStyle, padding: "60px 40px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "40px" }}>카테고리</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "40px 20px" }}>
            {[
              { name: "공/볼", img: "https://images.unsplash.com/photo-1760177379323-2b22f8d41707?q=80&w=400" },
              { name: "라켓/배트/클럽", img: "https://images.unsplash.com/photo-1773452549497-05f51a391451?q=80&w=400" },
              { name: "보호대/보호장비", img: "https://images.unsplash.com/photo-1535031726088-dd46f73b68fa?q=80&w=400" },
              { name: "의류/신발", img: "https://images.unsplash.com/photo-1739132268718-53d64165d29a?q=80&w=400" },
              { name: "헬스/홈트 용품", img: "https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=400" },
              { name: "아웃도어/캠핑", img: "https://images.unsplash.com/photo-1771849316197-2b1f3f49b651?q=80&w=400" },
              { name: "수영/수상 스포츠", img: "https://images.unsplash.com/photo-1747494749385-c75103afc37d?q=80&w=400" },
              { name: "액세서리/잡화", img: "https://images.unsplash.com/photo-1758348844355-2ef28345979d?q=80&w=400" },
            ].map((cat, i) => (
              <div key={i} style={{ textAlign: "center", cursor: "pointer" }}>
                <div style={{ width: "120px", height: "120px", borderRadius: "50%", overflow: "hidden", margin: "0 auto 12px", border: "1px solid #eee" }}>
                  <img src={cat.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 인기 요청 / 마감 임박 / 최근 등록 */}
        <AuctionListSection title="지금 인기있는 요청" subtitle="많은 판매자가 제안한 핫한 경매" items={data.hotAuctions} />
        <AuctionListSection title="마감 임박" subtitle="곧 마감되는 경매를 확인하세요" items={data.deadlineAuctions} />
        <AuctionListSection title="최근 등록된 요청" subtitle="새로 올라온 경매에 참여해보세요" items={data.latestAuctions} isLarge={true} />
      </main> {/* 추가된 부분: 메인 컨텐츠 영역 끝 */}

      <Footer /> {/* 추가된 부분: 하단 푸터 */}
    </div>
  );
}

function AuctionListSection({ title, subtitle, items, isLarge = false }) {
  const sectionStyle = { maxWidth: "1200px", margin: "0 auto", padding: "60px 40px", borderTop: "1px solid #f5f5f5" };
  const gridStyle = { display: "grid", gridTemplateColumns: isLarge ? "repeat(5, 1fr)" : "repeat(4, 1fr)", gap: "24px" };

  return (
    <section style={sectionStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 4px 0" }}>{title}</h2>
          <p style={{ fontSize: "14px", color: "#767676", margin: 0 }}>{subtitle}</p>
        </div>
        <span style={{ fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>더보기</span>
      </div>

      <div style={gridStyle}>
        {items && items.length > 0 ? items.map((item) => (
          <div key={item.auctionIdx} style={{ cursor: "pointer" }}>
            <div style={{ width: "100%", aspectRatio: "1/1", overflow: "hidden", marginBottom: "12px", backgroundColor: "#f9f9f9" }}>
              <img src={item.auctionThumbnailImg || "https://via.placeholder.com/300"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <p style={{ fontSize: "12px", color: "#767676", margin: "0 0 4px 0" }}>{item.itemCategoryName}</p>
            <h3 style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 8px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.auctionTitle}</h3>
            <div style={{ fontSize: "12px", color: "#767676", marginBottom: "8px" }}>
              제안 {item.bidCount}건 • {item.timeDisplay}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#767676" }}>희망 예산</span>
              <span style={{ fontSize: "16px", fontWeight: "bold" }}>{Number(item.auctionTargetPrice).toLocaleString()}원</span>
            </div>
          </div>
        )) : <div style={{ color: "#aaa", fontSize: "14px" }}>등록된 경매가 없습니다.</div>}
      </div>
    </section>
  );
}
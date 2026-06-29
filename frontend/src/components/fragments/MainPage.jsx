import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EMPTY_AUCTION_MESSAGE = "등록된 경매가 없습니다.";

export default function MainPage() {
  const navigate = useNavigate();
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
    axios.get("/api/home")
      .then(res => setData(res.data))
      .catch(err => console.error(err));

    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="flex flex-col bg-white min-h-screen font-sans w-full m-0 p-0">
      <main className="flex-1">
        {/* 히어로 슬라이더 */}
        <section className="relative h-[450px] overflow-hidden w-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img src={slide.img} className="w-full h-full object-cover brightness-[0.7]" alt="slider" />
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-[1200px] mx-auto w-full px-10 box-border">
                  <div className="color-white text-left">
                    <h1 className="text-[48px] font-extrabold mb-5 whitespace-pre-line leading-[1.2] text-white">
                      {slide.title}
                    </h1>
                    <p className="text-[18px] mb-10 opacity-90 text-white">{slide.desc}</p>
                    <button
                      onClick={() => navigate("/auctions")}
                      className="bg-white text-[#222] border-none px-10 py-[15px] rounded-lg font-bold cursor-pointer"
                    >
                      지금 시작하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* 카테고리 */}
        <section className="max-w-[1200px] mx-auto w-full px-10 py-[60px] box-border">
          <h2 className="text-[20px] font-bold mb-10">카테고리</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-5">
            {[
              { name: "공/볼", img: "https://images.unsplash.com/photo-1760177379323-2b22f8d41707?q=80&w=400", path: "/auctions/category/ball?sortBy=latest&statusFilter=open" },
              { name: "라켓/배트/클럽", img: "https://images.unsplash.com/photo-1773452549497-05f51a391451?q=80&w=400", path: "/auctions/category/racket?sortBy=latest&statusFilter=open" },
              { name: "보호대/보호장비", img: "https://images.unsplash.com/photo-1535031726088-dd46f73b68fa?q=80&w=400", path: "/auctions/category/protective?sortBy=latest&statusFilter=open" },
              { name: "의류/신발", img: "https://images.unsplash.com/photo-1739132268718-53d64165d29a?q=80&w=400", path: "/auctions/category/apparel?sortBy=latest&statusFilter=open" },
              { name: "헬스/홈트 용품", img: "https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=400", path: "/auctions/category/fitness?sortBy=latest&statusFilter=open" },
              { name: "아웃도어/캠핑", img: "https://images.unsplash.com/photo-1771849316197-2b1f3f49b651?q=80&w=400", path: "/auctions/category/outdoor?sortBy=latest&statusFilter=open" },
              { name: "수영/수상 스포츠", img: "https://images.unsplash.com/photo-1747494749385-c75103afc37d?q=80&w=400", path: "/auctions/category/swim?sortBy=latest&statusFilter=open" },
              { name: "액세서리/잡화", img: "https://images.unsplash.com/photo-1758348844355-2ef28345979d?q=80&w=400", path: "/auctions/category/accessory?sortBy=latest&statusFilter=open" },
            ].map((cat, i) => (
              <div key={i} onClick={() => navigate(cat.path)} className="text-center cursor-pointer">
                <div className="w-[120px] h-[120px] rounded-full overflow-hidden mx-auto mb-3 border border-[#eee]">
                  <img src={cat.img} className="w-full h-full object-cover" alt={cat.name} />
                </div>
                <span className="text-[14px] font-medium">{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 경매 리스트 섹션들 */}
        <AuctionListSection
          title="지금 인기있는 요청"
          subtitle="많은 판매자가 제안한 핫한 경매"
          items={data.hotAuctions}
          morePath="/auctions?sortBy=views&keyword=&statusFilter=open"
          emptyMessage="지금 인기있는 요청이 없습니다."
        />
        <AuctionListSection
          title="마감 임박"
          subtitle="곧 마감되는 경매를 확인하세요"
          items={data.deadlineAuctions}
          morePath="/auctions?sortBy=deadline&keyword=&statusFilter=open"
          emptyMessage="마감 임박 경매가 없습니다."
        />
        <AuctionListSection
          title="최근 등록된 요청"
          subtitle="새로 올라온 경매에 참여해보세요"
          items={data.latestAuctions}
          morePath="/auctions?sortBy=latest&keyword=&statusFilter=open"
          emptyMessage="최근 등록된 요청이 없습니다."
        />
      </main>
    </div>
  );
}

function AuctionListSection({ title, subtitle, items, morePath, emptyMessage = EMPTY_AUCTION_MESSAGE }) {
  const navigate = useNavigate();

  return (
    <section className="max-w-[1200px] mx-auto px-10 py-[60px] border-t border-[#f5f5f5] box-border">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-[24px] font-bold m-0 mb-1">{title}</h2>
          <p className="text-[14px] text-[#767676] m-0">{subtitle}</p>
        </div>
        <span onClick={() => navigate(morePath)} className="text-[14px] font-medium cursor-pointer">더보기</span>
      </div>

      <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
        {items && items.length > 0 ? items.map((item, index) => (
          <div
            key={item.auctionIdx}
            onClick={() => navigate(`/auctions/${item.auctionIdx}`)}
            className={`cursor-pointer ${index >= 2 ? "hidden md:block" : "block"}`}
          >
            <div className="w-full aspect-square overflow-hidden mb-3 bg-[#f9f9f9] rounded-xl">
              <img src={item.auctionThumbnailImg || "https://via.placeholder.com/300"} className="w-full h-full object-cover" alt="thumb" />
            </div>
            <p className="text-[12px] text-[#767676] m-0 mb-1">{item.itemCategoryName}</p>
            <h3 className="text-[14px] font-semibold m-0 mb-2 whitespace-nowrap overflow-hidden text-ellipsis">{item.auctionTitle}</h3>
            <div className="text-[12px] text-[#767676] mb-2">
              제안 {item.bidCount}건 • {item.timeDisplay}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-[#767676]">희망 예산</span>
              <span className="text-[16px] font-bold">{Number(item.auctionTargetPrice).toLocaleString()}원</span>
            </div>
          </div>
        )) : <div className="text-[#aaa] text-[14px]">{emptyMessage}</div>}
      </div>
    </section>
  );
}
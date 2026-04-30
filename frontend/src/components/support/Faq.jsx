import React, { useState } from 'react';

const FAQPage = () => {
  // 아코디언 상태 관리 (어떤 질문이 열려있는지 저장)
  const [openId, setOpenId] = useState(1); // 기본으로 첫 번째 질문 열어둠

  // FAQ 데이터 리스트 (나중에 백엔드 API랑 연결하기 딱 좋지!)
  const faqData = [
    {
      id: 1,
      category: '일반',
      question: '역경매 방식이란 무엇인가요?',
      answer: '역경매는 구매자가 원하는 상품과 조건을 먼저 제시하면, 여러 판매자가 경쟁적으로 가격을 제안하는 방식입니다. 일반 경매와 달리 가격이 낮아지는 방향으로 진행되어 구매자에게 유리한 거래 방식입니다.'
    },
    {
      id: 2,
      category: '일반',
      question: 'pickQ는 어떤 서비스인가요?',
      answer: 'pickQ는 스포츠 용품 전문 역경매 플랫폼입니다. 운동화, 의류, 운동기구 등 모든 종류의 스포츠 용품을 역경매 방식으로 거래할 수 있습니다. 구매자는 원하는 상품을 요청하고, 판매자는 경쟁적으로 최적의 조건을 제안합니다.'
    },
    {
      id: 3,
      category: '구매',
      question: '구매 요청은 어떻게 등록하나요?',
      answer: '로그인 후 ‘경매’ 메뉴에서 ‘요청 등록’ 버튼을 클릭합니다. 원하는 상품의 브랜드, 모델명, 사이즈, 상태, 희망가격 등을 상세히 작성하고, 참고 이미지를 첨부하면 더 정확한 제안을 받을 수 있습니다.'
    }
  ];

  const categories = ['전체', '일반', '구매', '판매', '거래', '회원', '수수료'];

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">

      {/* 헤더 */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg sm:text-xl font-semibold text-[#222222]">자주 묻는 질문</h2>
        <p className="mt-1 text-xs sm:text-sm text-[#767676]">PickQ 이용 중 궁금한 사항을 확인하세요.</p>
      </div>

      {/* 본문 */}
      <div className="px-4 py-6 sm:px-6">

        {/* 검색바 */}
        <section className="mb-6">
          <div className="relative max-w-xl">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="7" strokeWidth="2" />
                <line x1="16" y1="16" x2="21" y2="21" strokeWidth="2" />
              </svg>
            </span>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CBD00]/50 focus:border-[#7CBD00] transition-all"
              placeholder="질문 검색..."
            />
          </div>
        </section>

        {/* 카테고리 필터 */}
        <section className="mb-8 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                type="button"
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  cat === '전체'
                  ? 'bg-[#7CBD00] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* FAQ 리스트 */}
        <section className="space-y-4">
          {faqData.map((faq) => (
            <div
              key={faq.id}
              className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                openId === faq.id ? 'border-[#7CBD00] shadow-sm' : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className={`w-full flex items-center justify-between p-5 text-left transition-colors ${
                  openId === faq.id ? 'bg-white' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-[#7CBD00]/10 text-[#7CBD00] text-[11px] font-bold rounded-md uppercase">
                    {faq.category}
                  </span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">
                    {faq.question}
                  </span>
                </div>
                <span className={`text-gray-400 transition-transform duration-300 ${openId === faq.id ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>

              {/* 아코디언 답변 영역 */}
              <div
                className={`transition-all duration-300 ease-in-out ${
                  openId === faq.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-5 pb-5 pt-1 text-gray-600 leading-relaxed text-sm bg-white">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Contact CTA */}
        <section className="mt-12 mb-4">
          <div className="bg-[#7CBD00]/5 rounded-2xl p-8 border border-[#7CBD00]/10 text-center">
            <h4 className="text-gray-900 font-bold mb-2">원하는 답변을 찾지 못하셨나요?</h4>
            <p className="text-gray-500 mb-6 text-sm">고객센터로 문의해주시면 친절하게 안내해 드리겠습니다.</p>
            <button className="bg-[#7CBD00] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#6BAD00] shadow-lg shadow-[#7CBD00]/20 transition-all hover:-translate-y-0.5">
              고객문의 하기
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default FAQPage;
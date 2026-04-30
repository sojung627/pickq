import React from 'react';
import SupportLayout from './SupportLayout';

const UsageGuide = () => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">

      {/* 헤더 */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg sm:text-xl font-semibold text-[#222222]">이용안내</h2>
        <p className="mt-1 text-xs sm:text-sm text-[#767676]">
          PickQ 역경매 플랫폼 이용 방법을 안내해드립니다.
        </p>
      </div>

      {/* 본문 */}
      <div className="px-4 py-6 sm:px-6 sm:py-8">

        {/* PickQ란? */}
        <section className="mb-12">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 text-left">PickQ란?</h3>
          <div className="bg-[#7CBD00]/10 rounded-lg p-5 sm:p-6 border border-[#7CBD00]/20 text-left">
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              PickQ는 스포츠 용품 전문 <strong className="text-[#7CBD00]">역경매 플랫폼</strong> 입니다. 구매자가 원하는 상품을 요청하면, 여러 판매자가 경쟁적으로 가격을 제안하여 구매자가 최적의 조건을 선택할 수 있습니다.
            </p>
            <p className="text-gray-700 mt-4 leading-relaxed text-sm sm:text-base">
              <strong>"당신을 위한 모든 제안"</strong> - 구매자 중심의 새로운 거래 방식을 경험하세요.
            </p>
          </div>
        </section>

        {/* 이용 방법 */}
        <section className="mb-12">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-6 text-left">이용 방법</h3>

          {/* 구매자 가이드 */}
          <div className="mb-10">
            <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-[#7CBD00] text-xl">🛒</span> <span>구매자 가이드</span>
            </h4>

            <div className="space-y-6">
              {[
                { step: 1, title: '구매 요청 등록', desc: '원하는 스포츠 용품의 브랜드, 모델명, 상태, 희망가격 등을 상세히 작성합니다. 사진을 첨부하면 더욱 정확한 제안을 받을 수 있습니다.' },
                { step: 2, title: '판매자 제안 받기', desc: '여러 판매자가 가격과 상품 상태를 제안합니다. 제안 마감 시간까지 다양한 옵션을 비교해보세요.' },
                { step: 3, title: '최적의 제안 선택', desc: '가격, 상품 상태, 판매자 평점 등을 고려하여 최적의 제안을 선택합니다.' },
                { step: 4, title: '거래 완료', desc: '선택된 판매자와 채팅으로 거래 상세 내용을 협의하고 안전하게 거래를 완료합니다.' }
              ].map((item) => (
                <div key={item.step} className="flex gap-4 text-left">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#7CBD00] text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                    {item.step}
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{item.title}</h5>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 판매자 가이드 */}
          <div>
            <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-6 flex items-center gap-2 text-left">
              <span className="text-[#7CBD00] text-xl">👥</span> <span>판매자 가이드</span>
            </h4>

            <div className="space-y-6">
              {[
                { step: 1, title: '구매 요청 탐색', desc: '경매 페이지에서 내가 판매 가능한 상품의 구매 요청을 찾습니다.' },
                { step: 2, title: '판매 제안하기', desc: '경쟁력 있는 가격과 상품 상태, 거래 가능 장소 등을 제안합니다. 사진과 상세 설명을 추가하면 선택 확률이 높아집니다.' },
                { step: 3, title: '낙찰 대기', desc: '구매자가 마감 시간 내에 최적의 제안을 선택합니다. 낙찰 시 알림이 발송됩니다.' },
                { step: 4, title: '거래 진행', desc: '낙찰되면 구매자와 채팅으로 거래 일정과 장소를 협의합니다.' }
              ].map((item) => (
                <div key={item.step} className="flex gap-4 text-left">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                    {item.step}
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{item.title}</h5>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 주요 특징 */}
        <section className="mb-12">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-6 text-left">주요 특징</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {[
              { icon: '✅', title: '투명한 가격 경쟁', desc: '여러 판매자의 제안을 한눈에 비교하여 최적의 가격으로 구매할 수 있습니다.' },
              { icon: '📈', title: '구매자 중심', desc: '구매자가 원하는 조건을 먼저 제시하고, 판매자가 경쟁적으로 제안하는 방식입니다.' },
              { icon: '🤝', title: '신뢰 평가 시스템', desc: '거래 후기와 평점을 통해 신뢰할 수 있는 판매자를 선택할 수 있습니다.' },
              { icon: '🛍️', title: '스포츠 용품 전문', desc: '운동화, 의류, 장비 등 모든 스포츠 용품을 취급하는 전문 플랫폼입니다.' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-[#7CBD00]/50 transition-colors">
                <div className="text-2xl mb-3">{feature.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{feature.title}</h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 이용 팁 */}
        <section className="text-left">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-6">이용 팁</h3>
          <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
            <ul className="space-y-4 text-xs sm:text-sm text-gray-700">
              {[
                { label: '상세한 설명', text: '브랜드, 모델명, 사이즈, 원하는 상태를 구체적으로 작성하면 더 정확한 제안을 받을 수 있습니다.' },
                { label: '사진 첨부', text: '참고 이미지를 첨부하면 판매자가 정확히 이해하고 제안할 수 있습니다.' },
                { label: '적정 마감 시간', text: '3-7일 정도가 가장 많은 제안을 받을 수 있는 기간입니다.' },
                { label: '판매자 평가 확인', text: '거래 전 판매자의 평점과 후기를 꼼꼼히 확인하세요.' },
                { label: '안전거래', text: '직거래 시 공공장소에서 만나고, 택배 거래 시 안전결제를 이용하세요.' }
              ].map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#7CBD00] font-bold mt-0.5">•</span>
                  <span><strong>{tip.label}:</strong> {tip.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
};

export default UsageGuide;
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Auctions = ({ auctions = [] }) => {
  const navigate = useNavigate();

  // 숫자 포맷팅 함수 (Thymeleaf의 numbers.formatInteger 대체)
  const formatPrice = (price) => {
    return price ? price.toLocaleString() + '원' : '-';
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden font-pretendard">

      {/* 헤더 */}
      <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-[#222222]">나의 경매 목록</h2>
          <p className="mt-1 text-xs sm:text-sm text-[#767676]">내가 등록한 구매 요청 목록</p>
        </div>
        <div>
          <button
            onClick={() => navigate('/mypage/payments')}
            className="inline-flex items-center px-4 py-2.5 rounded-md border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            구매 내역 보기
          </button>
        </div>
      </div>

      {/* 본문 */}
      <div className="px-4 py-4 sm:px-6 sm:py-5">

        {/* 비어있을 때 (auctions.length === 0) */}
        {auctions.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
            등록한 경매가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">

            {/* 데스크탑: 헤더 라인 */}
            <div className="hidden md:grid md:grid-cols-[2.8fr_1.6fr_1.3fr_1.1fr_1.3fr_1.4fr_1.5fr] text-[11px] text-gray-500 px-2 pb-2 border-b border-gray-100">
              <span>경매 제목</span> <span>카테고리</span> <span className="text-right">희망 최대가</span>
              <span className="text-center">입찰 수</span> <span className="text-right">최저 입찰가</span>
              <span className="text-center">상태</span> <span className="text-center">마감일</span>
            </div>

            {/* 각 경매 카드/행 */}
            {auctions.map((auction) => (
              <div
                key={auction.auctionIdx}
                className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 sm:px-5 sm:py-4 hover:border-[#7CBD00] transition-colors"
                onClick={() => navigate(`/auctions/${auction.auctionIdx}`)}
              >
                {/* 데스크탑 뷰 */}
                <div className="hidden md:grid md:grid-cols-[2.8fr_1.6fr_1.3fr_1.1fr_1.3fr_1.4fr_1.5fr] items-center text-xs sm:text-sm gap-2">
                  <div className="truncate font-semibold text-[#222222] hover:underline">
                    {auction.auctionTitle}
                  </div>
                  <div className="text-[11px] sm:text-xs text-gray-600">{auction.itemCategoryName}</div>
                  <div className="text-right font-semibold text-[#222222]">{formatPrice(auction.auctionTargetPrice)}</div>
                  <div className="text-center text-gray-700">{auction.bidCount}</div>
                  <div className={`text-right font-semibold ${!auction.minBidPrice ? 'text-gray-500' : 'text-[#7CBD00]'}`}>
                    {formatPrice(auction.minBidPrice)}
                  </div>
                  <div className="text-center">
                    {auction.auctionStatusIdx === 1 ? (
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold" style={{background: '#E6F4D6', color: '#4C7C00'}}>
                        {auction.auctionStatusName}
                      </span>
                    ) : (
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${auction.auctionStatusIdx === 3 ? 'bg-gray-100 text-gray-600' : 'bg-gray-100 text-gray-500'}`}>
                        {auction.auctionStatusName}
                      </span>
                    )}
                  </div>
                  <div className="text-center text-[11px] text-[#555555]">
                    {auction.auctionEndAt ? auction.auctionEndAt.substring(0, 16).replace('T', ' ') : '-'}
                  </div>
                </div>

                {/* 낙찰 요약 (상태 3 & 낙찰자 있을 때) */}
                {auction.auctionStatusIdx === 3 && auction.winnerBidIdx && (
                  <div className="mt-3 pt-3 border-t border-gray-200 hidden md:block">
                    <div className="text-[11px] text-gray-500 mb-1">낙찰 요약</div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
                      <span className="inline-flex items-center rounded-full bg-[#F3FAE8] px-2.5 py-1 font-semibold text-[#4C7C00]">
                        낙찰 상품: {auction.winnerItemName || '-'}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-700">
                        낙찰가: {formatPrice(auction.winnerBidPrice)}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                        낙찰자: {auction.winnerBidderMemIdMasked || '-'}
                      </span>
                    </div>
                  </div>
                )}

                {/* 모바일 뷰 */}
                <div className="md:hidden space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="text-sm font-semibold text-[#222222]">{auction.auctionTitle}</div>
                      <div className="mt-0.5 text-[11px] text-[#999999]">{auction.itemCategoryName}</div>
                    </div>
                    <div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${auction.auctionStatusIdx === 1 ? '' : 'bg-gray-100'}`}
                            style={auction.auctionStatusIdx === 1 ? {background: '#E6F4D6', color: '#4C7C00'} : {}}>
                        {auction.auctionStatusName}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                    <div>
                      <div className="text-gray-400">희망 최대가</div>
                      <div className="font-semibold text-[#222222]">{formatPrice(auction.auctionTargetPrice)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">최저 입찰가</div>
                      <div className={`font-semibold ${!auction.minBidPrice ? 'text-gray-500' : 'text-[#7CBD00]'}`}>
                        {formatPrice(auction.minBidPrice)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">입찰 수</div>
                      <div className="text-[#222222]">{auction.bidCount}건</div>
                    </div>
                    <div>
                      <div className="text-gray-400">마감일</div>
                      <div className="text-[#222222]">{auction.auctionEndAt?.split('T')[0]}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-gray-500">
                    <span>등록일 {auction.auctionRegdate?.split('T')[0]}</span>
                  </div>

                  {auction.auctionStatusIdx === 3 && auction.winnerBidIdx && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-[11px] text-gray-500 mb-1">낙찰 요약</div>
                      <div className="space-y-1 text-[11px] text-gray-700">
                        <div>상품: {auction.winnerItemName || '-'}</div>
                        <div>낙찰가: {formatPrice(auction.winnerBidPrice)}</div>
                        <div>낙찰자: {auction.winnerBidderMemIdMasked || '-'}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Auctions;
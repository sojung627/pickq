import React from 'react';

const BidDetail = ({ auction, bid }) => {

  const handleWin = async () => {
    if (!window.confirm('이 입찰을 낙찰하시겠습니까?')) return;

    try {
      const res = await fetch(
        `http://localhost:8080/auctions/${auction.auctionIdx}/bids/${bid.bidIdx}/win`,
        { method: 'POST', credentials: 'include' }
      );
      if (res.ok) {
        alert('낙찰 처리 완료!');
        window.location.reload();
      } else {
        alert('낙찰 처리 실패!');
      }
    } catch (err) {
      console.error(err);
      alert('서버 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">📋 입찰 상세 정보</h2>

      <div className="bg-white p-4 rounded shadow-md space-y-2">
        <p><strong>경매 제목:</strong> {auction.auctionTitle}</p>
        <p><strong>판매자 이름:</strong> {bid.realMemName}</p>
        <p><strong>제안 가격:</strong> {bid.bidPrice.toLocaleString()}원</p>
        <p><strong>수량:</strong> {bid.bidQuantity}개</p>
        <p><strong>제안 메시지:</strong></p>
        <p className="p-2 border border-gray-200 rounded whitespace-pre-line">
          {bid.bidMessage || '메시지 내용'}
        </p>
        <p><strong>제안일:</strong> {new Date(bid.bidRegdate).toLocaleString()}</p>
        <p><strong>상태:</strong> {bid.bidStatusName}</p>

        {bid.itemThumbnailImg && (
          <div>
            <p><strong>제안 이미지:</strong></p>
            <img
              src={bid.itemThumbnailImg}
              alt="제안 이미지"
              className="max-w-[300px] border border-gray-200 rounded"
            />
          </div>
        )}

        {/* 낙찰 버튼 (진행중인 입찰만) */}
        {bid.bidStatusIdx === 1 && auction.auctionStatusIdx === 1 && (
          <div className="mt-4">
            <button
              onClick={handleWin}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              이 입찰 낙찰하기
            </button>
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={() => history.back()}
            className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-50"
          >
            경매로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default BidDetail;
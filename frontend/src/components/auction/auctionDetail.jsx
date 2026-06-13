import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AuctionDetail = () => {
  const { auctionIdx } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null);
  const [bidList, setBidList] = useState([]);
  const [selectedBid, setSelectedBid] = useState(null);
  const [mode, setMode] = useState('list');
  const [session, setSession] = useState(null);

  const [bidForm, setBidForm] = useState({
    itemName: '', itemBrand: '', bidPrice: '', bidQuantity: 1, bidMessage: '', bidImageFile: null
  });
  const [bidPreviewUrl, setBidPreviewUrl] = useState(null);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetch("http://localhost:8080/mypage/info", { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(data => setSession(data ? { loginUser: data } : null))
      .catch(() => setSession(null));

    fetch(`http://localhost:8080/auctions/${auctionIdx}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setDetail(data.detail);
        setBidList(data.bidList || []);
      })
      .catch(err => console.error("경매 상세 조회 에러:", err));
  }, [auctionIdx]);

  const handleBidClick = (bid) => {
    console.log('itemThumbnailImg:', bid.itemThumbnailImg);  // 추가
    setSelectedBid(bid);
    setMode('bidDetail');
  };

  const handleBidImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBidForm(prev => ({ ...prev, bidImageFile: file }));
      setBidPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleBidSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(bidForm).forEach(([k, v]) => {
      if (!v) return;
      if (k === 'bidPrice') {
        formData.append(k, String(v).replace(/,/g, ''));
      } else {
        formData.append(k, v);
      }
    });
    formData.append('itemCategoryIdx', detail.itemCategoryIdx);

    fetch(`http://localhost:8080/auctions/${auctionIdx}/bids`, {
      method: 'POST', credentials: 'include', body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // 입찰 목록 재fetch
          fetch(`http://localhost:8080/auctions/${auctionIdx}`, { credentials: 'include' })
            .then(res => res.json())
            .then(res => {
              setDetail(res.detail);
              setBidList(res.bidList || []);
            });
          setBidForm({ itemName: '', itemBrand: '', bidPrice: '', bidQuantity: 1, bidMessage: '', bidImageFile: null });
          setBidPreviewUrl(null);
          setMode('list');
        } else {
          setErrorMessage(data.error || '입찰에 실패했습니다.');
        }
      })
      .catch(() => setErrorMessage('서버 오류가 발생했습니다.'));
  };

  const handleWin = (bidIdx) => {
    if (!window.confirm('이 입찰을 낙찰하시겠습니까?')) return;
    fetch(`http://localhost:8080/auctions/${auctionIdx}/bids/${bidIdx}/win`, {
      method: 'POST', credentials: 'include'
    }).then(() => window.location.reload());
  };

  const handleCancel = () => {
    if (!window.confirm('정말 취소하시겠습니까?')) return;
    fetch(`http://localhost:8080/auctions/${auctionIdx}/delete`, {
      method: 'POST', credentials: 'include'
    }).then(() => navigate('/auctions'));
  };

  const handleClose = () => {
    if (!window.confirm('경매를 마감하시겠습니까?')) return;
    fetch(`http://localhost:8080/auctions/${auctionIdx}/close`, {
      method: 'POST', credentials: 'include'
    }).then(() => window.location.reload());
  };

  const handleBidCancel = (bidIdx) => {
    if (!window.confirm('입찰을 취소하시겠습니까?')) return;
    fetch(`http://localhost:8080/bids/${bidIdx}/cancel`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auctionIdx })
    }).then(() => window.location.reload());
  };

  const handleAdminBidDelete = (bidIdx) => {
    if (!window.confirm('[관리자] 이 입찰을 삭제하시겠습니까?')) return;
    fetch(`http://localhost:8080/bids/${bidIdx}/admin-cancel`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auctionIdx })
    }).then(() => window.location.reload());
  };

  const handleAdminDelete = () => {
    if (!window.confirm('[관리자] 이 경매를 삭제하시겠습니까?')) return;
    fetch(`http://localhost:8080/auctions/${auctionIdx}/admin-delete`, {
      method: 'POST', credentials: 'include'
    }).then(() => navigate('/auctions'));
  };

  if (!detail) return <div className="py-20 text-center">로딩 중...</div>;

  console.log('memIdx:', session?.loginUser?.memIdx);
  console.log('buyerIdx:', detail?.buyerIdx);
  console.log('타입 memIdx:', typeof session?.loginUser?.memIdx);
  console.log('타입 buyerIdx:', typeof detail?.buyerIdx);

  const isTerminal = detail.auctionStatusIdx >= 3;
  const isInactive = detail.auctionStatusIdx !== 1;

  const StatusBadge = ({ statusIdx }) => {
    const map = {
      1: ['bg-green-600', '진행중'],
      2: ['bg-blue-600', '결정대기중'],
      3: ['bg-gray-500', '마감'],
      4: ['bg-red-500', '유찰'],
      5: ['bg-gray-800', '취소'],
      6: ['bg-gray-800', '삭제됨'],
    };
    const [cls, label] = map[statusIdx] || ['bg-gray-400', '알수없음'];
    return <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold text-white ${cls}`}>{label}</span>;
  };

  const GradeBadge = ({ gradeName }) => {
    const grades = { bronze: '/images/common/icon_bronze.png', silver: '/images/common/icon_silver.png', gold: '/images/common/icon_gold.png', vip: '/images/common/icon_vip.png' };
    if (!grades[gradeName]) return null;
    return <img src={grades[gradeName]} alt={gradeName} className="inline-block w-5 h-5" />;
  };

  const BidStatusBadge = ({ statusIdx, statusName }) => {
    if (statusIdx === 3) return null;
    const cls = statusIdx === 2 ? 'bg-yellow-400 text-gray-900'
      : statusIdx === 4 ? 'bg-gray-400 text-white'
      : statusIdx === 5 ? 'bg-gray-800 text-white'
      : 'bg-blue-600 text-white';
    return <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>{statusName}</span>;
  };

  const canWin = (bid) =>
    Number(session?.loginUser?.memIdx) === Number(detail.buyerIdx) &&
    bid.bidStatusIdx === 1 &&
    (detail.auctionStatusIdx === 2 || (detail.auctionStatusIdx === 1 && detail.bidCount > 0));

  return (
    <div className="container mx-auto px-4 py-6" id="auction-page-root">

      <div className="mb-4 flex items-center gap-2 text-xs sm:text-sm text-gray-600">
        <button onClick={() => navigate('/')} className="hover:text-[#7CBD00]">홈</button>
        <span>/</span>
        <button onClick={() => navigate('/auctions')} className="hover:text-[#7CBD00]">경매</button>
        <span>/</span>
        <button onClick={() => navigate(`/auctions/category/${detail.itemCategoryCode}`)} className="hover:text-[#7CBD00]">{detail.itemCategoryName}</button>
        <span>/</span>
        <span className="text-gray-900">경매 상세</span>
      </div>

      <div className={`relative ${isInactive ? 'opacity-95' : ''}`}>
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${isTerminal ? 'pointer-events-none select-none' : ''}`}>

          {/* ── LEFT ── */}
          <div className="col-span-1">
            <div className={`bg-white shadow-sm rounded-2xl border-0 ${isTerminal ? 'grayscale' : ''}`}>
              <div className="p-4">

                {mode === 'list' && (
                  <>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full max-w-[220px]">
                        <div className="aspect-square rounded overflow-hidden bg-gray-100 border border-gray-100">
                          <img
                            src={detail.auctionThumbnailImg
                              ? `http://localhost:8080${detail.auctionThumbnailImg}`
                              : '/images/auction/auction_default.png'}
                            className="w-full h-full object-cover" alt="경매 이미지"
                          />
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-2 gap-2 flex-wrap">
                          <div className="flex items-center gap-1 flex-wrap">
                            <StatusBadge statusIdx={detail.auctionStatusIdx} />
                          </div>
                          <span className="font-bold text-gray-600 text-sm">{detail.timeDisplay}</span>
                        </div>

                        <h4 className="font-bold mb-3">{detail.auctionTitle}</h4>

                        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                          <div className="text-gray-500 text-sm">
                            구매자: <span className="font-semibold">{detail.buyerMemIdMasked}</span>
                          </div>
                          {detail.chatroomIdx && (
                            <button
                              type="button"
                              className="px-3 py-1.5 bg-gray-900 text-white text-sm rounded"
                              onClick={() => window.open(`/chat/${detail.chatroomIdx}`, 'chatPopup', 'width=400,height=600')}
                            >
                              <i className="bi bi-chat-dots me-1"></i> 대화하기
                            </button>
                          )}
                        </div>

                        <div className="text-right text-[11px] mb-4 sm:text-xs text-gray-500 space-y-1">
                          <span className="block">입찰 마감: {detail.auctionEndAt?.replace('T', ' ').slice(0, 16)}</span>
                          <span className="block">결정 마감: {detail.auctionDecisionDeadline?.replace('T', ' ').slice(0, 16)}</span>
                        </div>

                        <div className="mt-auto text-right">
                          <div className="text-gray-500 text-sm">희망 예산</div>
                          <div className="font-bold" style={{ fontSize: '1.75rem', lineHeight: 1.1 }}>
                            {detail.auctionTargetPrice?.toLocaleString()}원
                          </div>
                          <div className="text-gray-500 text-sm mt-2">현재 최저가</div>
                          <div className="font-bold text-red-500" style={{ fontSize: '1.65rem', lineHeight: 1.1 }}>
                            {!detail.minBidPrice || detail.minBidPrice === 0 ? '-' : `${detail.minBidPrice?.toLocaleString()}원`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-100 rounded p-4 bg-gray-50 mt-4">
                      <h6 className="font-bold mb-2">상세 요청</h6>
                      <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{detail.auctionDesc}</p>
                    </div>

                    {detail.auctionStatusIdx !== 1 && (
                      <div className="text-center mt-3 p-3 border border-gray-100 rounded text-gray-500">
                        {detail.auctionStatusIdx === 2 && '⏳ 결정 대기중인 경매입니다.'}
                        {detail.auctionStatusIdx === 3 && '⛔ 마감된 경매입니다.'}
                        {detail.auctionStatusIdx === 4 && '😢 유찰된 경매입니다.'}
                        {detail.auctionStatusIdx === 5 && '❌ 취소된 경매입니다.'}
                        {detail.auctionStatusIdx === 6 && '❌ 삭제된 경매입니다.'}
                      </div>
                    )}

                    {successMessage && <div className="mt-2 p-2 bg-green-100 text-green-700 rounded text-sm">{successMessage}</div>}
                    {errorMessage && <div className="mt-2 p-2 bg-red-100 text-red-700 rounded text-sm">{errorMessage}</div>}

                    <div className="flex gap-2 flex-wrap mt-3">
                      <button
                        onClick={() => navigate(detail.auctionStatusIdx === 1 ? '/auctions' : '/auctions?statusFilter=closed')}
                        className="px-3 py-1.5 border border-gray-400 rounded text-sm text-gray-700 hover:bg-gray-50"
                      >
                        ← 목록으로
                      </button>

                      {Number(session?.loginUser?.memIdx) === Number(detail.buyerIdx) && detail.auctionStatusIdx === 1 && (
                        <>
                          <button onClick={handleCancel} className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                            구매요청 취소
                          </button>
                          <button onClick={handleClose} className="px-3 py-1.5 border border-gray-800 text-sm rounded hover:bg-gray-50">
                            수동 마감
                          </button>
                        </>
                      )}

                      {session?.loginUser?.memRoleIdx === 2 && (
                        <button onClick={handleAdminDelete} className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                          🛡️ 관리자 삭제
                        </button>
                      )}
                    </div>
                  </>
                )}

                {mode === 'bidForm' && (
                  <>
                    <h5 className="font-bold mb-4">💰 입찰하기</h5>
                    <form onSubmit={handleBidSubmit} encType="multipart/form-data">

                      <div className="mb-3">
                        <label className="block text-sm font-semibold mb-1">제안 이미지 <span className="text-red-500">*</span></label>

                        {/* 기존 스타일 유지하면서 뒷문구만 투명하게 처리 */}
                        <input
                          type="file"
                          className="border border-gray-100 rounded p-2 w-full text-sm text-transparent file:text-gray-700 file:bg-transparent file:border-0 file:p-0 file:cursor-pointer"
                          accept="image/*"
                          onChange={handleBidImageChange}
                        />

                        <div className="text-xs text-gray-500 mt-1">판매할 상품 이미지를 등록해주세요 (필수)</div>
                        {bidPreviewUrl && (
                          <div className="mt-2">
                            <img src={bidPreviewUrl} style={{ maxWidth: 200, maxHeight: 150, border: '1px solid #ddd', borderRadius: 4 }} alt="미리보기" />
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-semibold mb-1">상품명 <span className="text-red-500">*</span></label>
                        <input type="text" className="border border-gray-100 rounded p-2 w-full text-sm" placeholder="제안할 상품명을 입력하세요" required
                          value={bidForm.itemName} onChange={e => setBidForm(p => ({ ...p, itemName: e.target.value }))} />
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-semibold mb-1">브랜드 <span className="text-gray-400 text-xs">(선택)</span></label>
                        <input type="text" className="border border-gray-100 rounded p-2 w-full text-sm" placeholder="예: NIKE, ADIDAS"
                          value={bidForm.itemBrand} onChange={e => setBidForm(p => ({ ...p, itemBrand: e.target.value }))} />
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-semibold mb-1">제안 가격 (₩) <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          className="border border-gray-100 rounded p-2 w-full text-sm"
                          placeholder="예: 50,000"
                          required
                          inputMode="numeric"
                          value={bidForm.bidPrice}
                          onChange={e => {
                            const raw = e.target.value.replace(/,/g, '');
                            if (!/^\d*$/.test(raw)) return;
                            const formatted = raw ? Number(raw).toLocaleString() : '';
                            setBidForm(p => ({ ...p, bidPrice: formatted }));
                          }}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          희망 최대가 {detail.auctionTargetPrice?.toLocaleString()}원 이하, 1000원 단위
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-semibold mb-1">수량 <span className="text-red-500">*</span></label>
                        <input type="number" className="border border-gray-100 rounded p-2 w-full text-sm" min="1" required
                          value={bidForm.bidQuantity} onChange={e => setBidForm(p => ({ ...p, bidQuantity: e.target.value }))} />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-semibold mb-1">제안 메시지 <span className="text-gray-400 text-xs">(선택)</span></label>
                        <textarea className="border border-gray-100 rounded p-2 w-full text-sm" rows={4} placeholder="상품 상태, 배송 조건 등을 입력하세요"
                          value={bidForm.bidMessage} onChange={e => setBidForm(p => ({ ...p, bidMessage: e.target.value }))} />
                      </div>

                      <div className="flex gap-2">
                        <button type="button" className="flex-1 border border-gray-400 rounded py-2 text-sm hover:bg-gray-50"
                          onClick={() => setMode('list')}>취소</button>
                        <button type="submit" className="flex-1 bg-green-600 text-white rounded py-2 text-sm font-bold hover:bg-green-700">
                          📦 입찰 제출
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {mode === 'bidDetail' && selectedBid && (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-bold mb-0">📋 입찰 상세</h5>
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-blue-600 text-white">
                        {selectedBid.bidStatusName}
                      </span>
                    </div>

                    <div className="mb-3">
                      <img
                        src={selectedBid.itemThumbnailImg
                          ? `http://localhost:8080${selectedBid.itemThumbnailImg}`
                          : '/images/bid/bid_default.png'}
                        className="rounded max-h-[300px] object-cover w-4/5" alt="입찰 이미지"
                      />
                    </div>

                    <div className="grid grid-cols-2 mb-3">
                      <div>
                        <small className="text-gray-500">판매자</small>
                        <div className="font-semibold flex items-center gap-1">
                          <GradeBadge gradeName={selectedBid.bidderGradeName} />
                          <span>{selectedBid.bidderMemIdMasked || '-'}</span>
                          {selectedBid.bidderAverageRating > 0 && (
                            <span className="text-sm"><span style={{ color: '#F5C542' }}>★</span>{selectedBid.bidderAverageRating?.toFixed(1)}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <small className="text-gray-500">제안 금액</small>
                        <div className="font-bold text-blue-600 text-xl">{selectedBid.bidPrice?.toLocaleString()}원</div>
                      </div>
                    </div>

                    {[
                      ['상품명', selectedBid.itemName],
                      ['브랜드', selectedBid.itemBrand],
                      ['카테고리', selectedBid.itemCategoryName],
                      ['수량', `${selectedBid.bidQuantity}개`],
                      ['제안일', selectedBid.bidRegdate?.replace('T', ' ').slice(0, 16)],
                    ].map(([label, value]) => (
                      <div className="mb-2" key={label}>
                        <small className="text-gray-500">{label}</small>
                        <div>{value || '-'}</div>
                      </div>
                    ))}

                    {selectedBid.bidMessage && (
                      <div className="border border-gray-100 rounded p-3 bg-gray-50 mb-3">
                        <small className="text-gray-500 block mb-1">제안 메시지</small>
                        <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{selectedBid.bidMessage}</p>
                      </div>
                    )}

                    {canWin(selectedBid) && (
                      <div className="mt-3">
                        <button
                          onClick={() => handleWin(selectedBid.bidIdx)}
                          className="w-full py-2 font-bold rounded"
                          style={{ background: '#FFC107', color: '#222', border: 'none' }}
                        >
                          🏆 낙찰하기
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => setMode('list')}
                      className="mt-3 w-full border border-gray-400 rounded py-2 text-sm hover:bg-gray-50"
                    >
                      ← 경매 상세 보기
                    </button>
                  </>
                )}

              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="col-span-1">
            <div className="bg-white shadow-sm border-0 rounded-2xl">
              <div className="p-4">

                {detail.auctionStatusIdx === 1 && session?.loginUser && session.loginUser.memIdx !== detail.buyerIdx && (
                  <button
                    className="w-full mb-4 text-white font-bold py-2 rounded"
                    style={{ background: '#ef6253' }}
                    onClick={() => setMode('bidForm')}
                  >
                    💰 입찰하기
                  </button>
                )}

                {detail.auctionStatusIdx === 1 && !session?.loginUser && (
                  <button
                    className="w-full mb-4 text-white font-bold py-2 rounded"
                    style={{ background: '#ef6253' }}
                    onClick={() => navigate(`/members/login?redirect=/auctions/${auctionIdx}/bids`)}
                  >
                    🔒 로그인 후 입찰하기
                  </button>
                )}

                <div className="flex justify-between items-center mb-2">
                  <h6 className="font-bold mb-0">📋 입찰 목록</h6>
                  <span className="text-gray-500 text-sm">({bidList.length}건)</span>
                </div>

                <div className="flex flex-col gap-2">
                  {bidList.length === 0 ? (
                    <div className="text-center p-4 text-gray-500 border border-gray-100 rounded-xl">아직 입찰 제안이 없습니다.</div>
                  ) : (
                    bidList.map((bid) => (
                      <div
                        key={bid.bidIdx}
                        onClick={() => handleBidClick(bid)}
                        className="p-3 rounded-xl border border-gray-100 cursor-pointer transition-colors hover:bg-gray-50"
                      >
                        <div className="flex justify-between mb-1">
                          <div className="font-semibold text-sm flex items-center gap-1">
                            <GradeBadge gradeName={bid.bidderGradeName} />

                            <a href={`/profile/${bid.bidderIdx}?from=auction&auctionId=${auctionIdx}`}
                              onClick={e => e.stopPropagation()}
                              className="no-underline text-gray-900 hover:text-[#7CBD00]">
                              {bid.bidderMemIdMasked || '-'}
                            </a>
                            {bid.bidderAverageRating > 0 && (
                              <span className="text-sm">&nbsp;&nbsp;<span style={{ color: '#F5C542' }}>★</span>{bid.bidderAverageRating?.toFixed(1)}</span>
                            )}
                          </div>
                          <div className="font-bold">{bid.bidPrice?.toLocaleString()}원</div>
                        </div>

                        <div className="text-gray-500 text-sm mb-1">{bid.itemName || '-'}</div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-sm">{bid.itemBrand || '-'}</span>
                          <BidStatusBadge statusIdx={bid.bidStatusIdx} statusName={bid.bidStatusName} />
                        </div>

                        {session?.loginUser && (
                          <div className="mt-2 flex gap-1" onClick={e => e.stopPropagation()}>
                            {canWin(bid) && (
                              <button
                                onClick={() => handleWin(bid.bidIdx)}
                                className="px-2 py-1 text-xs font-bold rounded"
                                style={{ background: '#FFC107', color: '#222', border: 'none' }}
                              >
                                낙찰
                              </button>
                            )}

                            {session.loginUser.memIdx === bid.bidderIdx && bid.bidStatusIdx === 1 && (
                              <button
                                onClick={() => handleBidCancel(bid.bidIdx)}
                                className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50"
                              >
                                취소
                              </button>
                            )}

                            {session.loginUser.memRoleIdx === 2 && bid.bidStatusIdx === 1 && (
                              <button
                                onClick={() => handleAdminBidDelete(bid.bidIdx)}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                🛡️ 관리자 삭제
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>
          </div>

        </div>

        {detail.auctionStatusIdx !== 1 && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none flex items-start justify-center pt-3 z-10"
            style={{
              background: 'linear-gradient(180deg, rgba(248,249,250,0.22), rgba(173,181,189,0.22))',
              backdropFilter: 'grayscale(18%)'
            }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-lg"
              style={{ background: 'rgba(52,58,64,0.82)' }}>
              {detail.auctionStatusIdx === 2 && '결정 대기중 경매'}
              {detail.auctionStatusIdx === 3 && '마감된 경매'}
              {detail.auctionStatusIdx === 4 && '유찰된 경매'}
              {detail.auctionStatusIdx === 5 && '취소된 경매'}
              {detail.auctionStatusIdx === 6 && '삭제된 경매'}
              {![2,3,4,5,6].includes(detail.auctionStatusIdx) && '진행이 종료된 경매'}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default AuctionDetail;
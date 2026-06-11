import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MySales() {
    const navigate = useNavigate();
    const [sales, setSales] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBidIdx, setSelectedBidIdx] = useState(null);
    const [courierCompany, setCourierCompany] = useState('CJ대한통운');
    const [trackingNumber, setTrackingNumber] = useState('');

    const fetchSales = () => {
        fetch('/mypage/sales', { credentials: 'include' })
            .then(res => {
                if (!res.ok) {
                    setSales([]);
                    return;
                }
                return res.json().then(data => setSales(data));
            })
            .catch(() => setSales([]));
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const openModal = (bidIdx) => {
        setSelectedBidIdx(bidIdx);
        setTrackingNumber('');
        setCourierCompany('CJ대한통운');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedBidIdx(null);
    };

    const submitShipping = () => {
        if (!trackingNumber.trim()) {
            alert('운송장번호를 입력해주세요.');
            return;
        }
        fetch('http://localhost:8080/api/payment/ship', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bidIdx: selectedBidIdx, courierCompany, trackingNumber })
        })
            .then(res => {
                if (!res.ok) return res.text().then(text => { throw new Error(text); });
                return res.json();
            })
            .then(() => {
                alert('배송 처리가 완료되었습니다!');
                closeModal();
                fetchSales();
            })
            .catch(err => alert('오류가 발생했습니다: ' + err.message));
    };

    const getStatusBadge = (status) => {
        if (status === 'SHIPPING') return 'bg-blue-100 text-blue-700';
        if (status === 'DELIVERED') return 'bg-gray-200 text-gray-700';
        return 'bg-[#e8f4cc] text-[#6ea800]';
    };

    const getStatusText = (status) => {
        if (status === 'SHIPPING') return '배송중';
        if (status === 'DELIVERED') return '구매확정 완료';
        return '배송준비중';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && modalOpen) closeModal();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [modalOpen]);

    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-semibold text-[#222222]">내 판매 내역</h2>
                <p className="mt-1 text-xs sm:text-sm text-[#767676]">역경매에서 판매한 거래의 결제/배송 상태를 확인하고 배송 처리를 할 수 있습니다.</p>
            </div>

            <div className="px-4 py-4 sm:px-6 sm:py-5">

                {sales.length === 0 && (
                    <div className="py-10 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
                        판매 내역이 없습니다.
                    </div>
                )}

                {sales.length > 0 && (
                    <div className="space-y-3">
                        {sales.map((sale) => (
                            <div key={sale.bidIdx} className="rounded-xl border border-gray-200 bg-white px-4 py-4 sm:px-5 sm:py-4">

                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm sm:text-lg font-semibold text-[#222222] leading-snug break-words">
                                            {sale.itemName}
                                        </h3>
                                        <p className="mt-0.5 text-[11px] text-gray-500">
                                            결제일 {formatDate(sale.payRegdate)}
                                        </p>
                                    </div>
                                    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] sm:text-xs font-semibold ${getStatusBadge(sale.deliveryStatus)}`}>
                                        {getStatusText(sale.deliveryStatus)}
                                    </span>
                                </div>

                                <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3">
                                    <div>
                                        <div className="text-[11px] text-gray-400">결제 금액</div>
                                        <div className="mt-0.5 text-sm sm:text-base font-bold text-[#222222]">
                                            {sale.payAmount?.toLocaleString()}원
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] text-gray-400">구매자 이름</div>
                                        <div className="mt-0.5 text-sm text-gray-700">{sale.buyerName}</div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] text-gray-400">연락처</div>
                                        <div className="mt-0.5 text-sm text-gray-700 break-words">{sale.buyerTel}</div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] text-gray-400">택배사</div>
                                        <div className="mt-0.5 text-sm text-gray-700">{sale.courierCompany ?? '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] text-gray-400">운송장번호</div>
                                        <div className="mt-0.5 text-sm text-gray-700 break-words">{sale.trackingNumber ?? '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] text-gray-400">배송 상태</div>
                                        <div className="mt-0.5 text-sm text-gray-700">{sale.deliveryStatus ?? '배송준비중'}</div>
                                    </div>
                                    <div className="col-span-2 lg:col-span-4">
                                        <div className="text-[11px] text-gray-400">배송지</div>
                                        <div className="mt-0.5 text-sm text-gray-700 break-words">
                                            {sale.buyerAddr} {sale.buyerZipcode}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div className="text-[11px] text-gray-500">판매자는 운송장 등록 후 배송을 시작할 수 있습니다.</div>
                                    <div className="flex justify-end">
                                        {!sale.deliveryStatus && (
                                            <button
                                                type="button"
                                                onClick={() => openModal(sale.bidIdx)}
                                                className="px-3 py-1.5 rounded-lg bg-[#7CBD00] text-white text-[11px] sm:text-xs font-semibold hover:bg-[#6BAD00] transition-colors">
                                                운송장 입력
                                            </button>
                                        )}
                                        {sale.deliveryStatus === 'SHIPPING' && (
                                            <span className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-blue-600">
                                                배송중
                                            </span>
                                        )}
                                        {sale.deliveryStatus === 'DELIVERED' && (
                                            <span className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-gray-700">
                                                구매확정 완료
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={closeModal}></div>
                    <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-200 p-5 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-[#222222] mb-4">운송장 정보 입력</h3>

                        <div className="mb-4">
                            <label className="block mb-1.5 text-sm text-gray-700">택배사</label>
                            <select
                                value={courierCompany}
                                onChange={(e) => setCourierCompany(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CBD00]">
                                <option value="CJ대한통운">CJ대한통운</option>
                                <option value="한진택배">한진택배</option>
                                <option value="롯데택배">롯데택배</option>
                                <option value="우체국택배">우체국택배</option>
                                <option value="로젠택배">로젠택배</option>
                            </select>
                        </div>

                        <div className="mb-5">
                            <label className="block mb-1.5 text-sm text-gray-700">운송장번호</label>
                            <input
                                type="text"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder="운송장번호 입력"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={submitShipping}
                                className="px-4 py-2 rounded-lg bg-[#7CBD00] text-white text-sm font-semibold hover:bg-[#6BAD00] transition-colors">
                                배송 시작
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
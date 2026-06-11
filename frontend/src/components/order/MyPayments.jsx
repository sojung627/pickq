import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MyPayments() {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);

    const fetchPayments = () => {
        fetch('/api/mypage/orders', { credentials: 'include' })
            .then(res => {
                if (!res.ok) { setPayments([]); return; }
                return res.json().then(data => setPayments(data));
            })
            .catch(() => setPayments([]));
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const confirmReceipt = (bidIdx) => {
        if (!window.confirm('구매확정 하시겠습니까? 확인 후 판매자에게 대금이 지급됩니다.')) return;

        fetch('/api/payment/confirm-receipt', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bidIdx })
        })
            .then(res => {
                if (!res.ok) return res.text().then(text => { throw new Error(text); });
                return res.json();
            })
            .then(() => {
                alert('구매확정이 완료되었습니다!');
                fetchPayments();
            })
            .catch(err => alert('오류가 발생했습니다: ' + err.message));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const getDeliveryLabel = (payment) => {
        if (payment.payStatus === 'CONFIRMED') return { text: '구매확정 완료', className: 'text-gray-600 font-medium text-[11px]' };
        if (payment.deliveryStatus === 'SHIPPING' && payment.payStatus === 'DONE') return null; // 버튼으로 처리
        if (!payment.deliveryStatus) return { text: '배송준비중', className: 'text-gray-400 text-[11px]' };
        return { text: payment.deliveryStatus, className: 'text-gray-600 text-[11px]' };
    };

    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-semibold text-[#222222]">내 결제 내역</h2>
                <p className="mt-1 text-xs sm:text-sm text-[#767676]">마감된 경매의 결제/배송 상태를 확인할 수 있습니다.</p>
            </div>

            <div className="px-4 py-4 sm:px-6 sm:py-5">

                {payments.length === 0 && (
                    <div className="py-10 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
                        결제 내역이 없습니다.
                    </div>
                )}

                {payments.length > 0 && (
                    <div className="space-y-3">

                        {/* 데스크탑 헤더 */}
                        <div className="hidden md:grid md:grid-cols-[2.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_2.2fr_2fr] text-[11px] text-gray-500 px-2 pb-2 border-b border-gray-100">
                            <span>상품명</span>
                            <span className="text-right">결제 금액</span>
                            <span>결제 수단</span>
                            <span>결제 상태</span>
                            <span>배송 상태</span>
                            <span>택배사</span>
                            <span>운송장번호</span>
                            <span className="text-center">결제일 / 구매확정</span>
                        </div>

                        {payments.map((payment) => {
                            const deliveryLabel = getDeliveryLabel(payment);
                            const showConfirmBtn = payment.deliveryStatus === 'SHIPPING' && payment.payStatus === 'DONE';

                            return (
                                <div key={payment.bidIdx} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 sm:px-5 sm:py-4">

                                    {/* 데스크탑 뷰 */}
                                    <div className="hidden md:grid md:grid-cols-[2.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_2.2fr_2fr] items-center text-xs sm:text-sm gap-2">
                                        <div className="truncate text-[#222222]">{payment.itemName}</div>
                                        <div className="text-right font-semibold text-[#222222]">{payment.payAmount?.toLocaleString()}원</div>
                                        <div className="text-gray-700">{payment.payMethod}</div>
                                        <div className="text-gray-700">{payment.payStatus}</div>
                                        <div className="text-gray-700">{payment.deliveryStatus ?? '배송준비중'}</div>
                                        <div className="text-gray-600">{payment.courierCompany ?? '-'}</div>
                                        <div className="text-gray-600">{payment.trackingNumber ?? '-'}</div>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[11px] text-gray-500">{formatDate(payment.payRegdate)}</span>
                                            <div className="text-[11px]">
                                                {showConfirmBtn && (
                                                    <button
                                                        type="button"
                                                        onClick={() => confirmReceipt(payment.bidIdx)}
                                                        className="px-3 py-1.5 rounded-md bg-[#7CBD00] text-white text-[11px] font-medium hover:bg-[#6BAD00] transition-colors">
                                                        구매확정
                                                    </button>
                                                )}
                                                {!showConfirmBtn && deliveryLabel && (
                                                    <span className={deliveryLabel.className}>{deliveryLabel.text}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 모바일 뷰 */}
                                    <div className="md:hidden space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <div className="text-sm font-semibold text-[#222222]">{payment.itemName}</div>
                                                <div className="mt-0.5 text-[11px] text-gray-500">
                                                    {payment.payMethod} · {payment.payStatus}
                                                </div>
                                            </div>
                                            <div className="text-right text-[11px] text-gray-400">{formatDate(payment.payRegdate)}</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                                            <div>
                                                <div className="text-gray-400">결제 금액</div>
                                                <div className="font-semibold text-[#222222]">{payment.payAmount?.toLocaleString()}원</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-400">배송 상태</div>
                                                <div className="text-[#222222]">{payment.deliveryStatus ?? '배송준비중'}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-400">택배사</div>
                                                <div>{payment.courierCompany ?? '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-400">운송장번호</div>
                                                <div>{payment.trackingNumber ?? '-'}</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            {showConfirmBtn && (
                                                <button
                                                    type="button"
                                                    onClick={() => confirmReceipt(payment.bidIdx)}
                                                    className="px-3 py-1.5 rounded-md bg-[#7CBD00] text-white text-[11px] font-medium hover:bg-[#6BAD00] transition-colors">
                                                    구매확정
                                                </button>
                                            )}
                                            {!showConfirmBtn && deliveryLabel && (
                                                <span className={deliveryLabel.className}>{deliveryLabel.text}</span>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
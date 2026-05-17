// useState = 저장 / useEffect = 특정상황 실행 / useRef = 몰래 저장
import React, { useState, useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { Korean } from 'flatpickr/dist/l10n/ko.js';

// PickQ 테마 flatpickr 커스텀 스타일 주입
const FLATPICKR_STYLE = `
.flatpickr-calendar {
  font-family: inherit;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.flatpickr-months {
  background: #7CBD00;
  border-radius: 11px 11px 0 0;
  padding: 4px 0;
}
.flatpickr-month {
  color: #fff;
  fill: #fff;
}
.flatpickr-prev-month, .flatpickr-next-month {
  color: #fff !important;
  fill: #fff !important;
}
.flatpickr-prev-month:hover svg, .flatpickr-next-month:hover svg {
  fill: rgba(255,255,255,0.7) !important;
}
.flatpickr-current-month input.cur-year,
.flatpickr-current-month .flatpickr-monthDropdown-months {
  color: #fff;
  font-weight: 500;
}
.flatpickr-monthDropdown-months option {
  color: #222;
}
.flatpickr-weekdays { background: #f8f8f8; }
span.flatpickr-weekday {
  color: #6b7280;
  font-weight: 500;
  font-size: 12px;
}
.flatpickr-day {
  border-radius: 8px;
  color: #222;
  font-size: 13px;
}
.flatpickr-day:hover {
  background: #f0f7e0;
  border-color: #f0f7e0;
}
.flatpickr-day.selected,
.flatpickr-day.selected:hover {
  background: #7CBD00;
  border-color: #7CBD00;
  color: #fff;
}
.flatpickr-day.today {
  border-color: #7CBD00;
  color: #7CBD00;
}
.flatpickr-day.today:hover {
  background: #7CBD00;
  color: #fff;
}
.flatpickr-day.disabled,
.flatpickr-day.disabled:hover {
  color: #d1d5db !important;
  background: transparent;
  cursor: not-allowed;
  text-decoration: line-through;
}
.flatpickr-time {
  border-top: 1px solid #e5e7eb;
}
.flatpickr-time input {
  color: #222;
  font-size: 14px;
  font-weight: 500;
}
.flatpickr-time input:hover,
.flatpickr-time input:focus {
  background: #f0f7e0;
}
.flatpickr-time .flatpickr-am-pm {
  color: #7CBD00;
  font-weight: 500;
}
.numInputWrapper span.arrowUp:after  { border-bottom-color: #7CBD00; }
.numInputWrapper span.arrowDown:after { border-top-color: #7CBD00; }
.numInputWrapper:hover { background: #f0f7e0; }
.flatpickr-input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  color: #111827;
  background: #fff;
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
}
.flatpickr-input:focus {
  border-color: #7CBD00;
  box-shadow: 0 0 0 2px rgba(124,189,0,0.2);
}
.flatpickr-input.disabled-input {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}
`;

const AuctionWrite = () => {

  // 상태관리를 위한 변수들
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [auctionTargetPrice, setAuctionTargetPrice] = useState('');
  const [auctionEndAt, setAuctionEndAt] = useState('');
  const [auctionDecisionDeadline, setAuctionDecisionDeadline] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const endAtRef = useRef(null);
  const decisionRef = useRef(null);

  const endAtInstance = useRef(null);
  const decisionInstance = useRef(null);

  // flatpickr 커스텀 스타일 주입
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.id = 'flatpickr-pickq-theme';
    if (!document.getElementById('flatpickr-pickq-theme')) {
      styleEl.textContent = FLATPICKR_STYLE;
      document.head.appendChild(styleEl);
    }
    return () => {
      const el = document.getElementById('flatpickr-pickq-theme');
      if (el) el.remove();
    };
  }, []);

  // 파일 핸들링
  const handleFileChange = (e) => {

    const file = e.target.files[0];

    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setThumbnailFile(null);
      setPreviewUrl('');
    }
  };

  // 가격 핸들링
  const handlePriceChange = (e) => {

    const value = e.target.value.replace(/[^0-9]/g, '');

    if (value) {
      setAuctionTargetPrice(Number(value).toLocaleString());
    } else {
      setAuctionTargetPrice('');
    }
  };

  // flatpickr 달력 초기화
  useEffect(() => {

      if (!endAtRef.current || !decisionRef.current) return;

      try {

        // 현재 시간 불러오기
        const minEndAt = new Date();

        // 현재시간의 24시간 뒤 생성
        minEndAt.setHours(minEndAt.getHours() + 24);

        // 경매 종료 달력 세팅
        endAtInstance.current = flatpickr(endAtRef.current, {
          locale: Korean,      // 한국어
          enableTime: true,    // 시간 선택 가능
          dateFormat: 'Y-m-d H:i', // 년월일 시 분
          minDate: minEndAt,   // 과거시간 선택 불가

          // 경매 종료일 설정
          onChange: (selectDates, dateStr) => {

            // 경매 종료일 저장
            setAuctionEndAt(dateStr);

            // 날짜 설정 시
            if (selectDates[0]) {

              // 구매 결정 종료일 저장
              const selectedEndAt = selectDates[0];

              // 경매마감일 이후 최소 24시간 이후 구매 결정 종료일
              const minDecision = new Date(selectedEndAt);
              minDecision.setHours(minDecision.getHours() + 24);

              // 경매마감일 이후 최대 3일 이후 구매 결정 종료일
              const maxDecision = new Date(selectedEndAt);
              maxDecision.setDate(maxDecision.getDate() + 3);

              // 달력이 존재한다면
              if (decisionInstance.current) {

                // 최소날짜 저장
                decisionInstance.current.set('minDate', minDecision);

                // 최대 날짜 저장
                decisionInstance.current.set('maxDate', maxDecision);

                // 버튼 활성화
                decisionInstance.current.element.disabled = false;

                // 비활성화 스타일 제거
                decisionInstance.current.element.classList.remove('disabled-input');

                // 안내 문구 변경
                decisionInstance.current.element.placeholder = '날짜와 시간을 선택하세요';
              }
            }
          }
        });

        // 구매 결정 달력 생성
        decisionInstance.current = flatpickr(decisionRef.current, {
          locale: Korean,
          enableTime: true,
          dateFormat: 'Y-m-d H:i',

          onChange: (selectDates, dateStr) => {
            setAuctionDecisionDeadline(dateStr);
          }
        });

      } catch (err) {
        console.error('flatpickr 초기화 실패:', err);
        console.log('endAtRef:', endAtRef.current);
        console.log('decisionRef:', decisionRef.current);
      }

      // 컴포넌트 사라지면 달력들도 사라질 것
      return () => {
        if (endAtInstance.current) endAtInstance.current.destroy();
        if (decisionInstance.current) decisionInstance.current.destroy();
      };

    }, []);

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const itemCategoryIdx = form.itemCategoryIdx.value;
    const auctionTitle = form.auctionTitle.value;
    const auctionDesc = form.auctionDesc.value;
    const itemBrand = form.itemBrand.value;

    if (
      !itemCategoryIdx ||
      !auctionTitle ||
      !auctionTargetPrice ||
      !auctionEndAt ||
      !auctionDecisionDeadline ||
      !auctionDesc
    ) {
      setErrorMessage('필수 항목을 모두 입력해 주세요.');
      return;
    }

    const formData = new FormData();

    if (thumbnailFile) {
      formData.append('thumbnailFile', thumbnailFile);
    }

    formData.append('itemCategoryIdx', itemCategoryIdx);
    formData.append('auctionTitle', auctionTitle);
    formData.append('itemBrand', itemBrand);
    formData.append('auctionTargetPrice', auctionTargetPrice.replace(/,/g, ''));
    formData.append('auctionEndAt', auctionEndAt);
    formData.append('auctionDecisionDeadline', auctionDecisionDeadline);
    formData.append('auctionDesc', auctionDesc);

    try {

      const response = await fetch('/auctions', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSuccessMessage('경매 요청이 정상적으로 등록되었습니다.');
        window.location.href = '/auctions';
      } else {
        setErrorMessage('등록 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }

    } catch (error) {
      console.error('Fetch Error:', error);
      setErrorMessage('서버와의 통신이 원활하지 않습니다.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#ffffff] py-8">
      <div className="mx-auto max-w-4xl px-4">

        {/* Header */}
        <div className="mb-8">
          <a href="/auctions" className="inline-flex items-center text-gray-600 hover:text-[#7CBD00] mb-4">
            <span className="mr-2 text-sm">←</span>
            <span className="text-sm">목록으로 돌아가기</span>
          </a>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            구매 요청 등록
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            원하는 스포츠 용품을 역경매로 구매해보세요
          </p>
        </div>

        {/* 토스트 메시지 */}
        {errorMessage && (
          <span id="toast-error" data-msg={errorMessage} className="hidden"></span>
        )}
        {successMessage && (
          <span id="toast-success" data-msg={successMessage} className="hidden"></span>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          id="registerForm"
          encType="multipart/form-data"
          className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6"
        >

          {/* 이미지 업로드 */}
          <div>
            <label className="text-base font-semibold text-gray-900 mb-3 block">
              상품 이미지 <span className="text-gray-400 text-xs">(선택)</span>
            </label>
            <p className="text-sm text-gray-500 mb-4">
              상품 이미지를 등록하면 더 많은 제안을 받을 수 있습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
              {/* 미리보기 */}
              <div
                id="previewBox"
                className="w-64 h-64 border border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden"
              >
                {previewUrl ? (
                  <img
                    id="previewImg"
                    src={previewUrl}
                    className="w-full h-full object-cover"
                    alt="미리보기"
                  />
                ) : (
                  <span id="previewPlaceholder" className="text-xs text-gray-400">
                    선택한 이미지 미리보기
                  </span>
                )}
              </div>

              {/* 파일 인풋 */}
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  name="thumbnailFile"
                  accept="image/*"
                  id="thumbnailFile"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer file:mr-3 file:px-3 file:py-1.5 file:border-0 file:text-sm file:font-medium file:bg-[#7CBD00] file:text-white hover:file:bg-[#6BAD00]"
                />
                <p className="text-xs text-gray-500">
                  이미지 파일을 선택해주세요 (선택사항), 1:1 비율 권장
                </p>
              </div>
            </div>
          </div>

          {/* 카테고리 */}
          <div>
            <label className="text-base font-semibold text-gray-900 mb-2 block">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              name="itemCategoryIdx"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
            >
              <option value="">카테고리를 선택하세요</option>
              <option value="1">공/볼</option>
              <option value="2">라켓/배트/클럽</option>
              <option value="3">보호대/보호장비</option>
              <option value="4">의류/신발</option>
              <option value="5">헬스/홈트 용품</option>
              <option value="6">아웃도어/캠핑 스포츠</option>
              <option value="7">수영/수상 스포츠 용품</option>
              <option value="8">액세서리/잡화</option>
            </select>
          </div>

          {/* 요청 제목 */}
          <div>
            <label className="text-base font-semibold text-gray-900 mb-2 block">
              요청 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="auctionTitle"
              placeholder="예: 요넥스 라켓 구해요"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
            />
          </div>

          {/* 브랜드명 */}
          <div>
            <label className="text-base font-semibold text-gray-900 mb-2 block">
              브랜드명
            </label>
            <input
              type="text"
              name="itemBrand"
              placeholder="예: 요넥스, 멜킨"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
            />
          </div>

          {/* 희망 최대가 */}
          <div>
            <label className="text-base font-semibold text-gray-900 mb-2 block">
              희망 최대가 (₩) <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-2">
              이 가격 이하로만 제안을 받고 싶다면 입력하세요. 1000원 단위 이상, 음수 불가.
            </p>
            <div className="relative">
              <input
                type="text"
                name="auctionTargetPrice"
                id="auctionTargetPrice"
                value={auctionTargetPrice}
                onChange={handlePriceChange}
                placeholder="예: 50,000"
                required
                inputMode="numeric"
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-12 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                원
              </span>
            </div>
          </div>

          {/* 입찰 / 결정 마감일 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-base font-semibold text-gray-900 mb-2 block">
                입찰 마감일 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="auctionEndAt"
                id="auctionEndAt"
                ref={endAtRef}
                placeholder="날짜와 시간을 선택하세요"
                required
                readOnly
              />
              <p className="mt-1 text-xs text-gray-500">
                현재 시각 기준 최소 24시간 이후부터 선택 가능합니다
              </p>
            </div>
            <div>
              <label className="text-base font-semibold text-gray-900 mb-2 block">
                결정 마감일 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="auctionDecisionDeadline"
                id="auctionDecisionDeadline"
                ref={decisionRef}
                placeholder="입찰 마감일 선택 후 활성화됩니다"
                required
                readOnly
                className="disabled-input"
              />
              <p className="mt-1 text-xs text-gray-500">
                입찰 마감일 기준 최소 24시간 이후 ~ 최대 3일 이내만 선택 가능합니다
              </p>
            </div>
          </div>

          {/* 상세 설명 */}
          <div>
            <label className="text-base font-semibold text-gray-900 mb-2 block">
              상세 설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="auctionDesc"
              rows={6}
              placeholder="원하는 상품의 상태나 조건을 적어주세요"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
            />
          </div>

          {/* 안내 박스 */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">안내사항</h3>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
              <li>• 경매 시작일부터 입찰 마감일까지 판매자들이 제안을 합니다.</li>
              <li>• 입찰 마감일 이후 결정 마감일까지 최적의 제안을 선택할 수 있습니다.</li>
              <li>• 결정 마감일까지 선택하지 않으면 자동으로 유찰 처리됩니다.</li>
            </ul>
          </div>

          {/* 버튼 영역 */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => history.back()}
              className="inline-flex items-center px-4 py-2.5 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2.5 rounded-md bg-[#7CBD00] text-white text-sm font-semibold hover:bg-[#6BAD00]"
            >
              요청 등록하기
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AuctionWrite;
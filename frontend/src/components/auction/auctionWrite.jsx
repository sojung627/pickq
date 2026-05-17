// useState = 저장 / useEffect = 특정상황 실행 / useRef = 몰래 저장
import React, { useState, useEffect, useRef } from 'react';
import flatpickr from 'flatpickr'; // 달력
import 'flatpickr/dist/flatpickr.min.css';
import { Korean } from 'flatpickr/dist/l10n/ko.js';

const AuctionWrite = () => {

  // 상태관리를 위한 변수들
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [itemCategoryIdx, setItemCategoryIdx] = useState('');
  const [auctionTitle, setAuctionTitle] = useState('');
  const [itemBrand, setItemBrand] = useState('');
  const [auctionTargetPrice, setAuctionTargetPrice] = useState('');
  const [auctionEndAt, setAuctionEndAt] = useState('');
  const [auctionDecisionDeadline, setAuctionDecisionDeadline] = useState('');
  const [auctionDesc, setAuctionDesc] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const endAtRef = useRef(null);
  const decisionRef = useRef(null);

  const endAtInstance = useRef(null);
  const decisionInstance = useRef(null);

  // 파일 핸들링
  const handleFileChange = (e) => {

    // 파일은 1개만 업로드
    const file = e.target.files[0];

    // 파일이 있는 경우 - 미리보기 o
    if (file) {

      setThumbnailFile(file);

      const reader = new FileReader();

      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };

      reader.readAsDataURL(file);

    // 파일이 없는 경우 - 미리보기 x
    } else {

      setThumbnailFile(null);
      setPreviewUrl('');

    }
  };

  // 가격 핸들링
  const handlePriceChange = (e) => {

    // 어떤 문자열이 들어와도 숫자만
    const value = e.target.value.replace(/[^0-9]/g, '');

    // 가격이 있는 경우 - 쉼표 넣을 것
    if (value) {

      setAuctionTargetPrice(Number(value).toLocaleString());

    // 가격이 없는 경우 - 빈칸으로 둘 것
    } else {

      setAuctionTargetPrice('');

    }
  };

  useEffect(() => {

    // 현재 시간 불러오기
    const minEndAt = new Date();

    // 현재시간의 24시간 뒤 생성
    minEndAt.setHours(minEndAt.getHours() + 24);

    // 경매 종료 달력 세팅
    endAtInstance.current = flatpickr(endAtRef.current, {

      locale: Korean,          // 한국어
      enableTime: true,        // 시간 선택 가능
      dateFormat: 'Y-m-d H:i', // 년월일 시 분
      minDate: minEndAt,       // 과거시간 선택 불가

      // 경매 종료일 설정
      onChange: (selectDates, dateStr) => {

        // 경매 종료일 저장
        setAuctionEndAt(dateStr);

        // 날짜 설정 시
        if (selectDates[0]) {

          // 구매 결졍 종료일 저장
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

    // 컴포넌트 사라지면 달력들도 사라질 것
    return () => {

      if (endAtInstance.current) {
        endAtInstance.current.destroy();
      }

      if (decisionInstance.current) {
        decisionInstance.current.destroy();
      }

    };

  }, []);

  // 하나라도 입력 안할 시 메시지 띄움
  const handleSubmit = async () => {

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
    formData.append(
      'auctionTargetPrice',
      auctionTargetPrice.replace(/,/g, '')
    );
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

        {errorMessage && (
          <span id="toast-error" data-msg={errorMessage} className="hidden"></span>
        )}
        {successMessage && (
          <span id="toast-success" data-msg={successMessage} className="hidden"></span>
        )}

        <div
          id="registerForm"
          className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6">

          <div>
            <label className="text-base font-semibold text-gray-900 mb-3 block">
              商品 이미지
              <span className="text-gray-400 text-xs"> (선택)</span>
            </label>
            <p className="text-sm text-gray-500 mb-4">
              상품 이미지를 등록하면 더 많은 제안을 받을 수 있습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
              <div
                id="previewBox"
                className="w-64 h-64 border border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                {previewUrl ? (
                  <img id="previewImg" src={previewUrl} className="w-full h-full object-cover" alt="미리보기" />
                ) : (
                  <span id="previewPlaceholder" className="text-xs text-gray-400">
                    선택한 이미지 미리보기
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  id="thumbnailFile"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer file:mr-3 file:px-3 file:py-1.5 file:border-0 file:text-sm file:font-medium file:bg-[#7CBD00] file:text-white hover:file:bg-[#6BAD00]" />
                <p className="text-xs text-gray-500">
                  이미지 파일을 선택해주세요 (선택사항), 1:1 비율 권장
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-base font-semibold text-gray-900 mb-2 block">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              value={itemCategoryIdx}
              onChange={(e) => setItemCategoryIdx(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7CBD00]">
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

          <div>
            <label className="text-base font-semibold text-gray-900 mb-2 block">
              요청 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={auctionTitle}
              onChange={(e) => setAuctionTitle(e.target.value)}
              placeholder="예: 요넥스 라켓 구해요"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7CBD00]" />
          </div>

          <div>
            <label className="text-base font-semibold text-gray-900 mb-2 block">
              브랜드명
            </label>
            <input
              type="text"
              value={itemBrand}
              onChange={(e) => setItemBrand(e.target.value)} placeholder="예: 요넥스, 멜킨"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7CBD00]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionWrite;
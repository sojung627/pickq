import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AddressUpdate = () => {
  const [searchParams] = useSearchParams();
  const addrIdx = searchParams.get('addrIdx');
  const navigate = useNavigate();
  const [member, setMember] = useState({});
  const [originalValues, setOriginalValues] = useState({});
  const [addressData, setAddressData] = useState({
    memZipcode: '', memAddr: '', memAddrDetail: '', isPrimary: false
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [showNoChangeMsg, setShowNoChangeMsg] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8080/mypage/info", { credentials: "include" })
      .then(res => res.json())
      .then(data => setMember(data));

    fetch(`http://localhost:8080/mypage/addresses/${addrIdx}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        const loaded = {
          memZipcode: data.memZipcode || '',
          memAddr: data.memAddr || '',
          memAddrDetail: data.memAddrDetail || '',
          isPrimary: data.isPrimary === 'Y'
        };
        setAddressData(loaded);
        setOriginalValues(loaded);
        setIsDirty(false);
      });
  }, [addrIdx]);

  useEffect(() => {
    const { memZipcode, memAddr, memAddrDetail, isPrimary } = addressData;
    const isFilled = memZipcode.trim() !== '' && memAddr.trim() !== '' && memAddrDetail.trim() !== '';
    const hasChanged =
      memZipcode !== originalValues.memZipcode ||
      memAddr !== originalValues.memAddr ||
      memAddrDetail !== originalValues.memAddrDetail ||
      isPrimary !== originalValues.isPrimary;

    if (!isFilled) {
      setIsButtonDisabled(true);
      setShowNoChangeMsg(false);
    } else if (hasChanged) {
      setIsButtonDisabled(false);
      setShowNoChangeMsg(false);
      setIsDirty(true);
    } else {
      setIsButtonDisabled(true);
      setShowNoChangeMsg(isDirty);
    }
  }, [addressData, originalValues, isDirty]);

  const findAddr = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        setAddressData(prev => ({
          ...prev,
          memZipcode: data.zonecode,
          memAddr: data.address,
          memAddrDetail: ''
        }));
      }
    }).open();
  };

  const saveAddr = () => {
    const { memZipcode, memAddr, memAddrDetail, isPrimary } = addressData;

    fetch(`http://localhost:8080/mypage/addresses/edit`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addrIdx: Number(addrIdx),
        memZipcode,
        memAddr,
        memAddrDetail,
        isPrimary: isPrimary ? "Y" : "N"
      })
    })
    .then(res => {
      if (res.ok) navigate("/mypage/addresses");
    })
    .catch(err => console.error("에러: ", err));
  };

  return (
    <div className="border border-gray-200 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
      {/* 헤더 */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">배송지 수정</h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-600">선택한 배송지 정보를 수정합니다.</p>
      </div>

      {/* 폼 내용 (div로 변경) */}
      <div className="px-6 py-6">
        <div className="space-y-5">
          {/* hidden input들은 상태값으로 관리하므로 생략 가능하나 구조 유지를 위해 유지 시 변수로 처리 */}

          {/* 대표 주소 체크 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrimary"
              checked={addressData.isPrimary}
              onChange={(e) => setAddressData(prev => ({ ...prev, isPrimary: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-[#7CBD00] focus:ring-[#7CBD00]"
            />
            <label htmlFor="isPrimary" className="text-sm text-gray-900">
              대표 주소지로 수정하기
            </label>
          </div>

          {/* 주소 입력 영역 */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="✉️ 우편번호"
                value={addressData.memZipcode}
                readOnly
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-gray-50 cursor-not-allowed"
              />
              <button
                type="button"
                onClick={findAddr}
                className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                우편번호 찾기
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="🏠 주소"
                value={addressData.memAddr}
                readOnly
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="🏠 상세주소"
                value={addressData.memAddrDetail}
                onChange={(e) => setAddressData(prev => ({ ...prev, memAddrDetail: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
              />
            </div>
          </div>

          {/* 저장 버튼 + 변경 없음 메시지 */}
          <div className="pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={saveAddr}
              disabled={isButtonDisabled}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-[#7CBD00] text-white rounded-md text-sm font-semibold hover:bg-[#6BAD00] disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
            >
              주소 저장
            </button>
            {showNoChangeMsg && (
              <span style={{ color: '#e74c3c', fontSize: '13px', marginLeft: '8px' }}>
                수정된 정보가 없습니다
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressUpdate;
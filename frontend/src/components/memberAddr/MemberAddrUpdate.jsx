import React, { useState, useEffect } from 'react';

const AddressUpdate = ({ member, addr }) => {
  // 초기값 저장 (변경 여부 체크용)
  const [originalValues] = useState({
    zipcode: addr?.memZipcode || '',
    addr: addr?.memAddr || '',
    addrDetail: addr?.memAddrDetail || '',
    isPrimary: addr?.isPrimary === 'Y'
  });

  // 입력 필드 상태 관리
  const [addressData, setAddressData] = useState({
    memZipcode: addr?.memZipcode || '',
    memAddr: addr?.memAddr || '',
    memAddrDetail: addr?.memAddrDetail || '',
    isPrimary: addr?.isPrimary === 'Y'
  });

  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [showNoChangeMsg, setShowNoChangeMsg] = useState(false);

  // 변경 여부 및 유효성 검사 (useEffect로 실시간 체크)
  useEffect(() => {
    const { memZipcode, memAddr, memAddrDetail, isPrimary } = addressData;

    // 필수 입력 체크
    const isFilled = memZipcode.trim() !== '' && memAddr.trim() !== '' && memAddrDetail.trim() !== '';

    // 원래 값과 비교
    const hasChanged =
      memZipcode !== originalValues.zipcode ||
      memAddr !== originalValues.addr ||
      memAddrDetail !== originalValues.addrDetail ||
      isPrimary !== originalValues.isPrimary;

    if (!isFilled) {
      setIsButtonDisabled(true);
      setShowNoChangeMsg(false);
    } else if (hasChanged) {
      setIsButtonDisabled(false);
      setShowNoChangeMsg(false);
    } else {
      setIsButtonDisabled(true);
      setShowNoChangeMsg(true);
    }
  }, [addressData, originalValues]);

  // 주소창 띄우기 (카카오/다음 우편번호 서비스)
  const findAddr = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        setAddressData(prev => ({
          ...prev,
          memZipcode: data.zonecode,
          memAddr: data.address,
          memAddrDetail: '' // 주소 변경 시 상세주소 초기화 및 포커스는 수동 제어 필요
        }));
      }
    }).open();
  };

  // 주소 저장 버튼 (기능 유지)
  const saveAddr = () => {
    if (!member || !member.memIdx || member.memIdx === "0") {
      alert("로그인 정보가 없습니다");
      window.location.href = "members/login";
      return;
    }

    const { memZipcode, memAddr, memAddrDetail, isPrimary } = addressData;
    const primaryValue = isPrimary ? "Y" : "N";

    fetch("/member/updateAddrAjax.do", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        addrIdx: addr.addrIdx,
        memZipcode,
        memAddr,
        memAddrDetail,
        memIdx: member.memIdx,
        isPrimary: primaryValue
      }).toString()
    })
      .then(res => res.text())
      .then(result => {
        if (result.trim() === "1") {
          alert("✓ 성공적으로 수정되었습니다!");
          window.location.href = "/mypage/addresses";
        } else {
          alert("✗ 저장 실패: 다시 시도해 주세요");
        }
      })
      .catch(err => console.log("에러 발생: ", err));
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
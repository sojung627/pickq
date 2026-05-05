import React, { useState, useEffect } from 'react';

// 주소 등록
const AddressInsert = ({ member = {}, redirectAfterSave = "" }) => {
  // 상태 관리: 주소 정보 및 버튼 활성화 여부
  const [addressData, setAddressData] = useState({
    memZipcode: "",
    memAddr: "",
    memAddrDetail: "",
    isPrimary: false
  });
  const [isBtnDisabled, setIsBtnDisabled] = useState(true);

  // 입력값 변경 핸들러
  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    const updatedData = {
      ...addressData,
      [id]: newValue
    };

    setAddressData(updatedData);
    checkAddrValid(updatedData);
  };

  // 버튼 disabled 제어 로직 (기능 유지)
  const checkAddrValid = (data) => {
    if (data.memZipcode.trim() !== "" &&
        data.memAddr.trim() !== "" &&
        data.memAddrDetail.trim() !== "") {
      setIsBtnDisabled(false);
    } else {
      setIsBtnDisabled(true);
    }
  };

  // 주소창 띄우기 (Daum Postcode API 활용)
  const findAddr = () => {
    new window.daum.Postcode({
      oncomplete: function(data) {
        const updatedData = {
          ...addressData,
          memZipcode: data.zonecode,
          memAddr: data.address,
          memAddrDetail: "" // 주소 선택 시 상세주소 초기화
        };
        setAddressData(updatedData);
        checkAddrValid(updatedData);
        // 상세주소 포커싱은 리액트에서 ref를 쓰거나 순수 JS 사용
        document.getElementById("memAddrDetail")?.focus();
      }
    }).open();
  };

  // 주소 저장 로직 (fetch 방식 유지)
  // 주소 저장 로직 수정
    const saveAddr = () => {
      const { memZipcode, memAddr, memAddrDetail, isPrimary } = addressData;
      const primaryValue = isPrimary ? "Y" : "N";

      if (!member.memIdx) { // memId가 필요한지 memIdx가 필요한지 체크 필요
        alert("로그인 정보가 없습니다.");
        return;
      }

      // 1. 전송 데이터 구성 (JSON 객체로 생성)
      const requestData = {
        memId: member.memId, // 컨트롤러 DTO 구조에 따라 memId 또는 memIdx 전달
        memZipcode,
        memAddr,
        memAddrDetail,
        isPrimary: primaryValue
      };

      // 2. 주소 수정: 컨트롤러의 @RequestMapping("/mypage/addresses") + @PostMapping("/new")
      fetch("/mypage/addresses/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json" // JSON 전송 명시
        },
        body: JSON.stringify(requestData) // 객체를 문자열로 변환
      })
        .then(res => {
          if (res.ok) return res.text();
          throw new Error("네트워크 응답 에러");
        })
        .then(result => {
          if (result === "success") {
            alert("✓ 성공적으로 저장되었습니다!");
            window.location.href = redirectAfterSave || "/mypage/addresses";
          }
        })
        .catch(err => {
          console.error("에러 발생: ", err);
          alert("저장 중 오류가 발생했습니다.");
        });
    };

  return (
    <div className="border border-gray-200 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
      {/* 헤더 */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">배송지 추가</h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-600">주문에 사용할 새 배송지를 등록하세요</p>
      </div>

      {/* 폼 내용 (form 대신 div 사용) */}
      <div className="px-6 py-6">
        <div className="space-y-5">
          {/* Hidden 데이터는 상태로 관리하므로 태그는 생략 가능하지만, 구조 유지를 위해 유지 */}
          <input type="hidden" id="memIdx" value={member.memIdx || ""} />
          <input type="hidden" id="redirectAfterSave" value={redirectAfterSave} />

          {/* 대표 주소 체크 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrimary"
              checked={addressData.isPrimary}
              onChange={handleInputChange}
              className="h-4 w-4 rounded border-gray-300 text-[#7CBD00] focus:ring-[#7CBD00]"
            />
            <label htmlFor="isPrimary" className="text-sm text-gray-900 cursor-pointer">
              대표 주소지로 등록하기
            </label>
          </div>

          {/* 우편번호 / 주소 / 상세주소 */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                id="memZipcode"
                value={addressData.memZipcode}
                placeholder="✉️ 우편번호"
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
                id="memAddr"
                value={addressData.memAddr}
                placeholder="🏠 주소"
                readOnly
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div>
              <input
                type="text"
                id="memAddrDetail"
                value={addressData.memAddrDetail}
                placeholder="🏠 상세주소"
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
              />
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="pt-1">
            <button
              type="button"
              id="saveBtn"
              onClick={saveAddr}
              disabled={isBtnDisabled}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-[#7CBD00] text-white rounded-md text-sm font-semibold hover:bg-[#6BAD00] disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
            >
              주소 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressInsert;
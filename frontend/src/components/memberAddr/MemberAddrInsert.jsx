import React, { useState, useEffect } from 'react';

const AddressInsert = ({ redirectAfterSave = "" }) => {
  const [member, setMember] = useState({});
  const [addressData, setAddressData] = useState({
    memZipcode: "",
    memAddr: "",
    memAddrDetail: "",
    isPrimary: false
  });
  const [isBtnDisabled, setIsBtnDisabled] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/mypage/info", { credentials: "include" })
      .then(res => res.json())
      .then(data => setMember(data));
  }, []);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    const updatedData = { ...addressData, [id]: newValue };
    setAddressData(updatedData);
    checkAddrValid(updatedData);
  };

  const checkAddrValid = (data) => {
    if (data.memZipcode.trim() !== "" &&
        data.memAddr.trim() !== "" &&
        data.memAddrDetail.trim() !== "") {
      setIsBtnDisabled(false);
    } else {
      setIsBtnDisabled(true);
    }
  };

  const findAddr = () => {
    new window.daum.Postcode({
      oncomplete: function(data) {
        const updatedData = {
          ...addressData,
          memZipcode: data.zonecode,
          memAddr: data.address,
          memAddrDetail: ""
        };
        setAddressData(updatedData);
        checkAddrValid(updatedData);
        document.getElementById("memAddrDetail")?.focus();
      }
    }).open();
  };

  const saveAddr = () => {
    const { memZipcode, memAddr, memAddrDetail, isPrimary } = addressData;
    const primaryValue = isPrimary ? "Y" : "N";

    if (!member.memId) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    const requestData = {
      memId: member.memId,
      memZipcode,
      memAddr,
      memAddrDetail,
      isPrimary: primaryValue
    };

    fetch("http://localhost:8080/mypage/addresses/new", {
      method: "POST",
      credentials: "include", // 400 에러 원인(f12가 알려줌)
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData)
    })
    .then(res => {
      if (res.ok) return res.text();
      throw new Error("네트워크 응답 에러");
    })
    .then(result => {
      if (result === "success") {
        window.location.href = redirectAfterSave || "/mypage/addresses";
      }
    })
    .catch(err => console.error("에러 발생: ", err));
  };

  return (
    <div className="border border-gray-200 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">배송지 추가</h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-600">주문에 사용할 새 배송지를 등록하세요</p>
      </div>

      <div className="px-6 py-6">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPrimary" checked={addressData.isPrimary}
              onChange={handleInputChange}
              className="h-4 w-4 rounded border-gray-300 text-[#7CBD00] focus:ring-[#7CBD00]" />
            <label htmlFor="isPrimary" className="text-sm text-gray-900 cursor-pointer">
              대표 주소지로 등록하기
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input type="text" id="memZipcode" value={addressData.memZipcode}
                placeholder="✉️ 우편번호" readOnly
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-gray-50 cursor-not-allowed" />
              <button type="button" onClick={findAddr}
                className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                우편번호 찾기
              </button>
            </div>

            <input type="text" id="memAddr" value={addressData.memAddr}
              placeholder="🏠 주소" readOnly
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-gray-50 cursor-not-allowed" />

            <input type="text" id="memAddrDetail" value={addressData.memAddrDetail}
              placeholder="🏠 상세주소" onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#7CBD00]" />
          </div>

          <div className="pt-1">
            <button type="button" id="saveBtn" onClick={saveAddr} disabled={isBtnDisabled}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-[#7CBD00] text-white rounded-md text-sm font-semibold hover:bg-[#6BAD00] disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer">
              주소 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressInsert;
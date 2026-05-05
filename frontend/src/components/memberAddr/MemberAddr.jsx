import React, { useState } from 'react';

/**
 * 배송지 관리 컴포넌트
 * (PickQ 프로젝트 마이페이지 주소 관리 섹션)
 */
const AddressManagement = ({ addrList = [], member = {} }) => {
  // 상태 관리가 필요한 경우를 대비해 초기 리스트 설정
  const [addresses, setAddresses] = useState(addrList);

  // 주소 삭제 핸들러 (기능 유지)
  const deleteAddr = (addrIdx) => {
    if (window.confirm("주소를 삭제하시겠습니까?")) {
      // API 호출 로직이 들어갈 자리 (기존: /mypage/addresses/delete)
      console.log(`주소 삭제 실행: ${addrIdx}`);
      // setAddresses(prev => prev.filter(addr => addr.addrIdx !== addrIdx));
    }
  };

  // 대표 배송지 설정 핸들러 (기능 유지)
  const setPrimary = (addrIdx) => {
    // API 호출 로직이 들어갈 자리 (기존: /mypage/addresses/primary)
    console.log(`대표 배송지 설정 실행: ${addrIdx}`);
  };

  // 페이지 이동 (수정/추가)
  const navigateTo = (url) => {
    window.location.href = url;
  };

  return (
    <div className="space-y-6">
      {/* 제목 영역 */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-[#222222]">배송지 관리</h2>
        <p className="mt-1 text-xs sm:text-sm text-[#767676]">주문 시 사용할 배송지를 관리하세요</p>
      </div>

      {/* 기존 form을 div로 변경 */}
      <div id="memberAddr" className="hidden">
        <input type="hidden" name="addrIdx" id="deleteAddrIdx" />
      </div>

      {/* 배송지 리스트 영역 */}
      {addresses && addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr.addrIdx}
              className={`border border-gray-200 bg-white rounded-xl ${
                addr.isPrimary === 'Y' ? 'ring-2 ring-[#7CBD00]' : ''
              }`}
            >
              {/* 카드 헤더 */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  {addr.isPrimary === 'Y' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#7CBD00] text-white text-[11px] font-medium">
                      대표 배송지
                    </span>
                  )}
                </div>
              </div>

              {/* 카드 내용 */}
              <div className="px-6 py-4 space-y-3">
                <div>
                  <div className="text-sm text-gray-500 mb-1">주소</div>
                  <div className="text-sm text-gray-900">{addr.memAddr}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">연락처</div>
                  <div className="text-sm text-gray-900">{member.memTel}</div>
                </div>

                {/* 버튼 영역 */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => navigateTo(`/mypage/addresses/edit?addrIdx=${addr.addrIdx}`)}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
                  >
                    수정
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteAddr(addr.addrIdx)}
                    className="inline-flex items-center px-3 py-1.5 rounded-md border border-red-300 text-xs sm:text-sm text-red-600 hover:bg-red-50"
                  >
                    삭제
                  </button>

                  {addr.isPrimary !== 'Y' && (
                    <button
                      type="button"
                      onClick={() => setPrimary(addr.addrIdx)}
                      className="inline-flex items-center px-3 py-1.5 rounded-md border border-[#7CBD00] text-xs sm:text-sm text-[#7CBD00] hover:bg-[#F4FCE3]"
                    >
                      대표 배송지로 설정
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 배송지 없을 때 */
        <div className="border border-gray-200 bg-white rounded-xl">
          <div className="px-6 py-6 text-center text-sm text-gray-500">등록된 배송지가 없습니다.</div>
        </div>
      )}

      {/* 새 배송지 추가 버튼 */}
      <div>
        <button
          type="button"
          onClick={() => navigateTo('/mypage/addresses/new')}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-[#7CBD00] text-white rounded-md text-sm font-semibold hover:bg-[#6BAD00]">
          새 배송지 추가
        </button>
      </div>
    </div>
  );
};

export default AddressManagement;
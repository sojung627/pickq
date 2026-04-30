import React, { useState } from 'react';

const SupportPage = () => {
  // 1. 회원가입/문의 폼 상태 관리 (아이디 중복, 비밀번호 일치 체크 로직용)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: '일반문의'
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">

      {/* 2. 메인 사이드 동글이 버튼 (고정 위치) */}
      <div className="fixed right-6 bottom-24 flex flex-col gap-3 z-50">
        <button className="w-14 h-14 bg-[#7CBD00] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#6BAD00] transition-all hover:scale-110">
          <span className="text-xl">💬</span>
        </button>
        <button className="w-14 h-14 bg-white text-[#7CBD00] border-2 border-[#7CBD00] rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-110">
          <span className="text-xl">🔝</span>
        </button>
      </div>

      <main className="max-w-4xl mx-auto pt-10 px-4">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#222222]">고객지원</h1>
          <p className="text-[#767676] mt-2">언제나 고객을 최우선으로 생각하겠습니다.</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          {/* 고객문의 타이틀 */}
          <div className="px-6 py-5 border-b border-gray-100 bg-white">
            <h2 className="text-xl font-semibold text-[#222222]">고객문의</h2>
            <p className="mt-1 text-sm text-[#767676]">궁금하신 사항을 남겨주시면 빠르게 답변드리겠습니다.</p>
          </div>

          <div className="px-6 py-8">
            {/* 상단 연락처 카드 3종 */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 flex items-center gap-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[#7CBD00]/10 text-[#7CBD00] text-lg">📧</div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">이메일</p>
                  <p className="text-sm font-semibold text-gray-900">support@pickq.com</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 flex items-center gap-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[#7CBD00]/10 text-[#7CBD00] text-lg">📞</div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">고객센터</p>
                  <p className="text-sm font-semibold text-gray-900">1588-0000</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 flex items-center gap-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[#7CBD00]/10 text-[#7CBD00] text-lg">⏰</div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">운영시간</p>
                  <p className="text-sm font-semibold text-gray-900">평일 09:00 - 18:00</p>
                </div>
              </div>
            </section>

            {/* 문의 폼 */}
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">문의 유형 <span className="text-red-500">*</span></label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CBD00] outline-none transition-all">
                    <option>일반문의</option>
                    <option>구매문의</option>
                    <option value="판매문의">판매문의</option>
                    <option value="거래문제">거래문제</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">이름 <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="이름을 입력하세요" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CBD00] outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">이메일 <span className="text-red-500">*</span></label>
                <input type="email" placeholder="example@email.com" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CBD00] outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">문의 내용 <span className="text-red-500">*</span></label>
                <textarea rows="6" placeholder="상세한 내용을 입력해주세요." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CBD00] outline-none transition-all resize-none"></textarea>
              </div>

              <div className="bg-[#7CBD00]/5 p-4 rounded-lg border border-[#7CBD00]/10">
                <p className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-bold text-gray-800">개인정보 수집 안내:</span> 문의 답변 목적으로만 사용되며, 완료 후 6개월 보관 후 파기됩니다.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-all">취소</button>
                <button type="submit" className="px-8 py-2.5 rounded-lg bg-[#7CBD00] text-white font-bold hover:bg-[#6BAD00] shadow-md transition-all">문의하기 ➤</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupportPage;
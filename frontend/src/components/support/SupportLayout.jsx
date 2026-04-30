import React from 'react';
import { Link } from "react-router-dom";

const SupportLayout = ({ children, currentTab }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 text-left">
      {/* 고객지원 공통 헤더 */}
      <div className="mb-8 pl-4">
        <h1 className="text-3xl font-bold text-[#222222]">고객지원</h1>
        <p className="text-[#767676] mt-2 font-medium">언제나 고객을 최우선으로 생각하겠습니다.</p>
      </div>

      <div className="flex gap-8 items-start">
        {/* 왼쪽 사이드바 메뉴 */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
              <h2 className="font-bold text-[#222222]">고객지원</h2>
            </div>
            <nav className="p-2">
              <Link to="/support/guide" className={`block px-4 py-3 text-sm rounded-lg transition-colors ${currentTab === 'guide' ? 'font-semibold bg-[#7CBD00]/10 text-[#7CBD00]' : 'text-gray-600 hover:bg-gray-50'}`}>이용안내</Link>
              <Link to="/support/faq" className={`block px-4 py-3 text-sm rounded-lg transition-colors ${currentTab === 'faq' ? 'font-semibold bg-[#7CBD00]/10 text-[#7CBD00]' : 'text-gray-600 hover:bg-gray-50'}`}>자주 묻는 질문</Link>
              <Link to="/support/inquiry" className={`block px-4 py-3 text-sm rounded-lg transition-colors ${currentTab === 'inquiry' ? 'font-semibold bg-[#7CBD00]/10 text-[#7CBD00]' : 'text-gray-600 hover:bg-gray-50'}`}>고객문의</Link>
            </nav>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <p className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-wider">문의하기</p>
              <div className="space-y-3">
                <p className="text-xs text-gray-600">📧 support@pickq.com</p>
                <p className="text-xs text-gray-600 font-bold">📞 1588-0000</p>
                <p className="text-[10px] text-gray-400">평일 09:00 - 18:00</p>
              </div>
            </div>
          </div>
        </aside>

        {/* 오른쪽 본문 영역 (여기에 각 페이지 내용이 들어감) */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SupportLayout;
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import UsageGuide from './Guide';
import FAQPage from './Faq';
import SupportPage from './Inquiry';

const SupportLayout = ({ children, currentTab }) => {
  const [mobileTab, setMobileTab] = useState(currentTab || 'guide');

  const menus = [
    { id: 'guide', label: '이용안내', path: '/support/guide' },
    { id: 'faq', label: '자주 묻는 질문', path: '/support/faq' },
    { id: 'inquiry', label: '고객문의', path: '/support/inquiry' },
  ];

  const renderMobileContent = () => {
    if (mobileTab === 'guide') return <UsageGuide />;
    if (mobileTab === 'faq') return <FAQPage />;
    if (mobileTab === 'inquiry') return <SupportPage />;
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 text-left">
      {/* 고객지원 공통 헤더 */}
      <div className="mb-8 pl-4">
        <h1 className="text-3xl font-bold text-[#222222]">고객지원</h1>
        <p className="text-[#767676] mt-2 font-medium">언제나 고객을 최우선으로 생각하겠습니다.</p>
      </div>

      {/* 데스크톱: 사이드바 + children (그대로 유지) */}
      <div className="hidden md:flex gap-8 items-start">
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
              <h2 className="font-bold text-[#222222]">고객지원</h2>
            </div>
            <nav className="p-2">
              {menus.map((m) => (
                <Link
                  key={m.id}
                  to={m.path}
                  className={`block px-4 py-3 text-sm rounded-lg transition-colors ${currentTab === m.id ? 'font-semibold bg-[#7CBD00]/10 text-[#7CBD00]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {m.label}
                </Link>
              ))}
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

        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* 모바일: 버튼 탭 + 아래에 내용 표시 */}
      <div className="md:hidden">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-[#222222] text-sm">고객지원</h2>
          </div>
          <nav className="flex gap-2 p-3 overflow-x-auto">
            {menus.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMobileTab(m.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                  mobileTab === m.id ? 'bg-[#7CBD00] text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {m.label}
              </button>
            ))}
          </nav>
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-[11px] text-gray-500">
            <span>📧 support@pickq.com</span>
            <span className="font-bold">📞 1588-0000</span>
          </div>
        </div>

        {renderMobileContent()}
      </div>
    </div>
  );
};

export default SupportLayout;
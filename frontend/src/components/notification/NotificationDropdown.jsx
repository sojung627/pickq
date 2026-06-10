import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function NotificationDropdown({ onClose }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-bold text-[#222]">최근 알림</p>
      </div>

      {/* 알림 목록 — 백엔드 연결 전 임시 빈 상태 */}
      <div className="divide-y divide-gray-100">
        <div className="px-4 py-6 text-center text-sm text-gray-400">
          알림이 없습니다
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-100">
        <button
          onClick={() => { navigate("/notifications"); onClose(); }}
          className="w-full py-2 bg-[#222] text-white text-sm font-semibold hover:bg-black transition-colors cursor-pointer rounded-lg"
        >
          알림 전체보기
        </button>
      </div>
    </div>
  );
}
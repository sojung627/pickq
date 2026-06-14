import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotificationDropdown({ onClose }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/notifications/recent', { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => Array.isArray(data) ? setNotifications(data) : null)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div ref={dropdownRef}
      className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-bold text-[#222]">최근 알림</p>
      </div>

      <div className="divide-y divide-gray-100">
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">알림이 없습니다</div>
        ) : (
          notifications.map(n => (
            <div key={n.notificationIdx}
              onClick={() => { navigate(n.targetUrl || '/notifications'); onClose(); }}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors
                ${n.isRead === 'N' ? 'bg-green-50' : ''}`}>
              <p className="text-sm font-semibold text-[#222] mb-0.5">{n.notificationTitle}</p>
              <p className="text-xs text-gray-500 truncate">{n.notificationMessage}</p>
              <p className="text-xs text-gray-300 mt-1">
                {n.createdAt?.substring(0, 16).replace('T', ' ')}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-100">
        <button onClick={() => { navigate('/notifications'); onClose(); }}
          className="w-full py-2 bg-[#222] text-white text-sm font-semibold hover:bg-black transition-colors cursor-pointer rounded-lg">
          알림 전체보기
        </button>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatOverlay from "../chat/ChatOverlay";

const FloatingButtons = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    // 안읽은 메시지 수 조회 (마운트 시 + 채팅 닫힐 때마다)
    useEffect(() => {
        fetch('/chats/unread-count', { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data) setUnreadCount(data.unreadCount); })
            .catch(() => {});
    }, [chatOpen]); // chatOpen이 false로 바뀔 때(닫힐 때)도 재조회


    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToBottom = () => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    };

    // 채팅 버튼 클릭 시 로그인 여부 확인 후 분기
    const handleChatOpen = async () => {
        try {
            const res = await fetch('/mypage/session', { credentials: 'include' });
            if (res.status === 401) {
                // 비로그인 시 쿼리 파라미터로 메시지 전달
                navigate('/members/login?msg=로그인이 필요한 서비스입니다.');
                return;
            }
            setUnreadCount(0); // 채팅 열면 뱃지 즉시 제거
            setChatOpen(true);
        } catch (error) {
            // 비로그인 시 쿼리 파라미터로 메시지 전달
            navigate('/members/login?msg=로그인이 필요한 서비스입니다.');
        }
    };

    return (
        <>
            <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
                {/* 채팅 버튼 */}
                <div className="relative">
                <button
                    className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg hover:bg-gray-50 transition-all"
                    onClick={handleChatOpen}
                >
                    <i className="bi bi-chat"></i>
                </button>
                {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </div>

                {/* 맨 위로 이동 버튼 */}
                <button
                    className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg hover:bg-gray-50 transition-all"
                    onClick={scrollToTop}
                >
                    <i className="bi bi-caret-up"></i>
                </button>

                {/* 맨 아래로 이동 버튼 */}
                <button
                    className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg hover:bg-gray-50 transition-all"
                    onClick={scrollToBottom}
                >
                    <i className="bi bi-caret-down"></i>
                </button>
            </div>

            {chatOpen && <ChatOverlay onClose={() => setChatOpen(false)} />}
        </>
    );
};

export default FloatingButtons;
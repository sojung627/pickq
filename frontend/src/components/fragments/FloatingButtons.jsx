import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatOverlay from "../chat/ChatOverlay";
import PickyChatOverlay from "../picky/PickyChatOverlay";

const FloatingButtons = ({ realtimeUnreadCount = 0, onChatOpen }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [pickyOpen, setPickyOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 피키 대화 저장용
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

    // 로그인 여부 확인 (피키 대화 저장 분기용)
    useEffect(() => {
        fetch('/members/auth/check', { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data) setIsLoggedIn(data.isLoggedIn); })
            .catch(() => {});
    }, []);

    // 마운트 시 + 채팅 닫힐 때 초기 unread 조회
    useEffect(() => {
        fetch('/chats/unread-count', { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data) setUnreadCount(data.unreadCount); })
            .catch(() => {});
    }, [chatOpen]);

    // 실시간으로 채팅 오면 카운트 +1
    useEffect(() => {
        if (realtimeUnreadCount > 0) {
            setUnreadCount(prev => prev + 1);
        }
    }, [realtimeUnreadCount]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToBottom = () => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    };

    const handleChatOpen = async () => {
        try {
            const res = await fetch('/mypage/session', { credentials: 'include' });
            if (res.status === 401) {
                navigate('/members/login?msg=로그인이 필요한 서비스입니다.');
                return;
            }
            setUnreadCount(0);
            onChatOpen?.();
            setChatOpen(true);
        } catch {
            navigate('/members/login?msg=로그인이 필요한 서비스입니다.');
        }
    };

    // 피키 열기 — 로그인 여부 무관하게 열림 (비로그인도 사용 가능)
    const handlePickyOpen = () => {
        setPickyOpen(true);
        setChatOpen(false); // 채팅창이 열려있으면 닫기
    };

    return (
        <>
            <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">

                {/* 피키 버튼 */}
                <button
                    className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 rounded-full shadow-lg hover:opacity-90 transition-all"
                    onClick={handlePickyOpen}
                    title="피키에게 물어보기"
                >
                    {/* ##수정 - 피키 로고 이미지 추가 예정 */}
                    {/* <img src="/images/picky-logo.png" alt="피키" className="w-6 h-6" /> */}
                    <span className="text-white font-bold text-sm">P</span>
                </button>

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

            {/* 피키 채팅창 */}
            {pickyOpen && (
                <PickyChatOverlay
                    onClose={() => setPickyOpen(false)}
                    isLoggedIn={isLoggedIn}
                />
            )}
        </>
    );
};

export default FloatingButtons;

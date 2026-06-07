import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatOverlay from "../chat/ChatOverlay";

const FloatingButtons = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
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
                <button
                    className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg hover:bg-gray-50 transition-all"
                    onClick={handleChatOpen}
                >
                    <i className="bi bi-chat"></i>
                </button>

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
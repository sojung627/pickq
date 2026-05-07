import React, { useState, useEffect } from  'react';

const FloatingButtons = () => {
    // 스크롤 유무에 따른 버튼 표시 / 미표시
    const [isVisible, setIsVisible] = useState(false);
        useEffect(() => {
            const toggleVisibility = () => {
              if (window.scrollY > 300) { // 스크롤 300px이상 내렸다면
                setIsVisible(true); // 300px 이상이면 보여라
              } else {
                setIsVisible(false); // 아니라면 숨겨라
              }
          };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
      }, []);

    // 맨 위로 이동
    const scrollToTop = () => {
        window.scrollToTop({
            top: 0,
            behavior: 'smooth', // 자연스레 넘어가라
        });
    };

    // 맨 아래로 이동
    const scrollToBottom = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight, // 아래로 보낼 땐 전체 페이지 계산해야함
            behavior: 'smooth', // 자연스레 넘어가라
        });
    };

    // 채팅 열기
    const openChat = () => {
        alert("기능 구현 필요");
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
            {/* 맨 위로 이동 버튼 */}
            <button className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg hover:bg-gray-50 transition-all"
            onClick={scrollToTop}>
                <i className="bi bi-caret-up"></i>
            </button>

            {/* 채팅 버튼 */}
            <button className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg hover:bg-gray-50 transition-all"
            onClick={openChat}>
                <i className="bi bi-chat"></i>
            </button>

            {/* 맨 아래로 이동 버튼 */}
            <button className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg hover:bg-gray-50 transition-all"
            onClick={scrollToBottom}>
                 <i className="bi bi-caret-down"></i>
            </button>
        </div>
    );
}; // end: return

export default FloatingButtons;
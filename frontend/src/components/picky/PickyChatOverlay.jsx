import React, { useState, useEffect, useRef } from 'react';

const BASE = 'http://localhost:8080';

// 피키 아바타 (로고 없을 때 텍스트 아바타로 대체)
const PickyAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
    P
  </div>
);

export default function PickyChatOverlay({ onClose, isLoggedIn }) {
  const [sessions, setSessions] = useState([]);          // 로그인 사용자 세션 목록
  const [currentSessionIdx, setCurrentSessionIdx] = useState(null);
  const [messages, setMessages] = useState([]);          // 현재 화면에 보이는 메시지
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // 세션 목록 사이드바
  const bottomRef = useRef(null);

  // 컴포넌트 마운트: 로그인 사용자면 세션 목록 불러오기
  useEffect(() => {
    if (isLoggedIn) {
      fetchSessions();
    }
    // 첫 인사 메시지 (항상)
    setMessages([{
      role: 'assistant',
      content: '안녕하세요! 저는 PickQ의 AI 어시스턴트 피키예요 ☺️\n경매 관련 궁금한 점이나 도움이 필요한 거 있으면 뭐든 물어보세요!',
    }]);
  }, [isLoggedIn]);

  // 메시지 추가될 때마다 스크롤 아래로
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 세션 목록 불러오기
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${BASE}/picky/sessions`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (e) {}
  };

  // 특정 세션 메시지 불러오기
  const loadSession = async (sessionIdx) => {
    try {
      const res = await fetch(`${BASE}/picky/sessions/${sessionIdx}/messages`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.map(m => ({ role: m.role, content: m.content })));
        setCurrentSessionIdx(sessionIdx);
        setShowSidebar(false);
      }
    } catch (e) {}
  };

  // 새 대화 시작
  const startNewChat = () => {
    setCurrentSessionIdx(null);
    setMessages([{
      role: 'assistant',
      content: '안녕하세요! 저는 PickQ의 AI 어시스턴트 피키예요 ☺️\n무엇이든 편하게 물어보세요 😊',
    }]);
    setShowSidebar(false);
  };

  // 세션 삭제
  const deleteSession = async (sessionIdx, e) => {
    e.stopPropagation();
    try {
      await fetch(`${BASE}/picky/sessions/${sessionIdx}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setSessions(prev => prev.filter(s => s.sessionIdx !== sessionIdx));
      if (currentSessionIdx === sessionIdx) startNewChat();
    } catch (e) {}
  };

  // 메시지 전송
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // 사용자 메시지 즉시 UI에 추가
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    // 로딩 말풍선
    setMessages(prev => [...prev, { role: 'assistant', content: '__loading__' }]);

    try {
      const res = await fetch(`${BASE}/picky/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionIdx: currentSessionIdx,
        }),
      });

      const data = await res.json();

      // 로딩 말풍선 제거 후 실제 답변 추가
      setMessages(prev => {
        const filtered = prev.filter(m => m.content !== '__loading__');
        return [...filtered, { role: 'assistant', content: data.answer }];
      });

      // 로그인 사용자: 세션 ID 업데이트 + 세션 목록 새로고침
      if (data.sessionIdx) {
        setCurrentSessionIdx(data.sessionIdx);
        fetchSessions();
      }
    } catch (e) {
      setMessages(prev => {
        const filtered = prev.filter(m => m.content !== '__loading__');
        return [...filtered, { role: 'assistant', content: '앗, 잠깐 오류가 났어요. 다시 시도해 주세요! 😅' }];
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 빠른 질문 버튼
  const quickQuestions = [
    '경매는 어떻게 올리나요?',
    '입찰 방법 알려줘',
    '카테고리 추천해줘',
  ];

  return (
    <div className="fixed bottom-28 right-8 z-50 flex flex-col"
         style={{ width: '360px', height: '540px' }}>

      {/* 메인 채팅창 */}
      <div className="flex flex-col w-full h-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600">
          <div className="flex items-center gap-2">
            <PickyAvatar />
            <div>
              <p className="text-white font-semibold text-sm leading-none">피키</p>
              <p className="text-violet-200 text-xs mt-0.5">PickQ AI 어시스턴트</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* 로그인 사용자만: 대화 내역 버튼 */}
            {isLoggedIn && (
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="text-white/80 hover:text-white transition-colors"
                title="대화 내역"
              >
                <i className="bi bi-clock-history text-sm"></i>
              </button>
            )}
            {/* 새 대화 */}
            {isLoggedIn && (
              <button
                onClick={startNewChat}
                className="text-white/80 hover:text-white transition-colors"
                title="새 대화"
              >
                <i className="bi bi-plus-lg text-sm"></i>
              </button>
            )}
            {/* 닫기 */}
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <i className="bi bi-x-lg text-sm"></i>
            </button>
          </div>
        </div>

        {/* 세션 사이드바 (슬라이드 패널) */}
        {showSidebar && (
          <div className="absolute top-14 left-0 w-full bg-white border-b border-gray-100 z-10 max-h-48 overflow-y-auto shadow-lg">
            <div className="px-3 py-2 text-xs text-gray-400 font-medium border-b border-gray-100">대화 내역</div>
            {sessions.length === 0 ? (
              <p className="px-3 py-3 text-xs text-gray-400">저장된 대화가 없어요</p>
            ) : (
              sessions.map(s => (
                <div
                  key={s.sessionIdx}
                  onClick={() => loadSession(s.sessionIdx)}
                  className={`flex items-center justify-between px-3 py-2 hover:bg-violet-50 cursor-pointer transition-colors ${currentSessionIdx === s.sessionIdx ? 'bg-violet-50' : ''}`}
                >
                  <span className="text-sm text-gray-700 truncate flex-1">{s.sessionTitle}</span>
                  <button
                    onClick={(e) => deleteSession(s.sessionIdx, e)}
                    className="ml-2 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <i className="bi bi-trash text-xs"></i>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.role === 'assistant' && <PickyAvatar />}
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap
                  ${msg.role === 'user'
                    ? 'bg-violet-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm'
                  }`}
              >
                {msg.content === '__loading__' ? (
                  <div className="flex gap-1 py-1 px-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                ) : msg.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* 빠른 질문 버튼 (메시지 1개일 때만 = 대화 시작 전) */}
        {messages.length === 1 && (
          <div className="px-3 py-2 flex gap-1.5 flex-wrap border-t border-gray-100 bg-white">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => { setInput(q); }}
                className="text-xs px-2.5 py-1.5 rounded-full border border-violet-200 text-violet-600 hover:bg-violet-50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* 입력창 */}
        <div className="flex items-end gap-2 px-3 py-3 border-t border-gray-100 bg-white">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="피키에게 물어보세요..."
            rows={1}
            className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400 transition-colors"
            style={{ maxHeight: '80px', overflowY: 'auto' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-full bg-violet-500 hover:bg-violet-600 disabled:bg-gray-200 text-white flex items-center justify-center transition-colors flex-shrink-0"
          >
            <i className="bi bi-send-fill text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

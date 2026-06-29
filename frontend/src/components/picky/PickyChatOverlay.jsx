import React, { useState, useEffect, useRef } from 'react';

const BASE = '';

const PickyAvatar = () => (
  <div style={{
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#e8e8e8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '600',
    color: '#555',
    flexShrink: 0,
  }}>
    P
  </div>
);

export default function PickyChatOverlay({ onClose, isLoggedIn }) {
  const [sessions, setSessions] = useState([]);
  const [currentSessionIdx, setCurrentSessionIdx] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileView, setMobileView] = useState(isLoggedIn ? 'list' : 'chat');
  const bottomRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMobileView(isLoggedIn ? 'list' : 'chat');

    if (isLoggedIn) {
      fetchSessions();
    }
    setMessages([{
      role: 'assistant',
      content: '안녕하세요! 저는 PickQ의 AI 어시스턴트 피키예요 ☺️\n경매 관련 궁금한 점이나 도움이 필요한 거 있으면 뭐든 물어보세요!',
    }]);
  }, [isLoggedIn]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${BASE}/picky/sessions`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (e) {}
  };

  const loadSession = async (sessionIdx) => {
    try {
      const res = await fetch(`${BASE}/picky/sessions/${sessionIdx}/messages`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.map(m => ({ role: m.role, content: m.content })));
        setCurrentSessionIdx(sessionIdx);
        setMobileView('chat');
      }
    } catch (e) {}
  };

  const startNewChat = () => {
    setCurrentSessionIdx(null);
    setMobileView('chat');
    setMessages([{
      role: 'assistant',
      content: '안녕하세요! 저는 PickQ의 AI 어시스턴트 피키예요 ☺️\n무엇이든 편하게 물어보세요!',
    }]);
  };

  const handleBackToList = () => {
    setMobileView('list');
  };

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

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
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

      setMessages(prev => {
        const filtered = prev.filter(m => m.content !== '__loading__');
        return [...filtered, { role: 'assistant', content: data.answer }];
      });

      if (data.sessionIdx) {
        setCurrentSessionIdx(data.sessionIdx);
        fetchSessions();
      }
    } catch (e) {
      setMessages(prev => {
        const filtered = prev.filter(m => m.content !== '__loading__');
        return [...filtered, { role: 'assistant', content: '앗, 잠깐 오류가 났어요. 다시 시도해 주세요!' }];
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

  const quickQuestions = [
    '경매는 어떻게 올리나요?',
    '입찰 방법 알려줘',
    '카테고리 추천해줘',
  ];

  /* 현재 세션 타이틀 */
  const currentTitle = sessions.find(s => s.sessionIdx === currentSessionIdx)?.sessionTitle || '피키';

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 50,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        inset: isMobile ? '80px 16px 16px' : 'auto 32px 112px auto',
        width: isMobile ? 'auto' : '750px',
        height: isMobile ? 'auto' : '500px',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        border: '1px solid #ddd',
        background: '#fff',
      }}
    >
      {/* 좌측 세션 패널 - 로그인 사용자만 표시 */}
      {isLoggedIn && (
        <div style={{
          width: isMobile ? '100%' : '200px',
          height: isMobile ? '100%' : 'auto',
          flexShrink: 0,
          borderRight: isMobile ? 'none' : '1px solid #e5e5e5',
          display: isMobile && mobileView === 'chat' ? 'none' : 'flex',
          flexDirection: 'column',
          background: '#fff',
        }}>
          {/* 패널 헤더 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid #e5e5e5',
          }}>
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#111' }}>채팅 목록</span>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#999', fontSize: '16px', lineHeight: 1 }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* 새 대화 버튼 */}
          <button
            onClick={startNewChat}
            style={{
              margin: '10px 12px 4px',
              padding: '8px 0',
              background: 'none',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#555',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <i className="bi bi-plus-lg"></i> 새 대화
          </button>

          {/* 세션 목록 */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sessions.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#aaa', padding: '12px 16px' }}>저장된 대화가 없어요</p>
            ) : (
              sessions.map(s => (
                <div
                  key={s.sessionIdx}
                  onClick={() => loadSession(s.sessionIdx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    background: currentSessionIdx === s.sessionIdx ? '#f4f4f4' : 'transparent',
                    borderLeft: currentSessionIdx === s.sessionIdx ? '5px solid #7CBD00' : '3px solid transparent',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#111', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.sessionTitle}
                    </p>
                  </div>
                  <button
                    onClick={(e) => deleteSession(s.sessionIdx, e)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: '6px', color: '#ccc', flexShrink: 0, fontSize: '12px' }}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 우측 채팅 영역 */}
      <div style={{
        flex: 1,
        display: isMobile && isLoggedIn && mobileView === 'list' ? 'none' : 'flex',
        flexDirection: 'column',
        background: '#f4f4f4',
        minWidth: 0,
        minHeight: 0,
        width: isMobile ? '100%' : 'auto',
      }}>

        {/* 채팅 헤더 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: '#fff',
          borderBottom: '1px solid #e5e5e5',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            {isMobile && isLoggedIn && (
              <button
                type="button"
                onClick={handleBackToList}
                aria-label="채팅 목록으로 돌아가기"
                style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  padding: 0,
                  color: '#666',
                  fontSize: '19px',
                  flexShrink: 0,
                }}
              >
                ←
              </button>
            )}
            <span style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#111',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {currentTitle}
            </span>
          </div>
          {/* 로그인 안 된 경우 닫기 버튼 헤더에 */}
          {!isLoggedIn && (
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#999', fontSize: '16px' }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>

        {/* 메시지 영역 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: '8px',
              }}
            >
              {msg.role === 'assistant' && <PickyAvatar />}

              <div style={{ maxWidth: '72%' }}>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '20px',
                    background: msg.role === 'user' ? '#222' : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#111',
                    fontSize: '13px',
                    lineHeight: '1.55',
                    whiteSpace: 'pre-wrap',
                    border: msg.role === 'assistant' ? '1px solid #e5e5e5' : 'none',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content === '__loading__' ? (
                    <div style={{ display: 'flex', gap: '4px', padding: '2px 2px' }}>
                      <span style={{ width: '7px', height: '7px', background: '#aaa', borderRadius: '50%', animation: 'bounce 1.2s infinite', animationDelay: '0ms', display: 'inline-block' }}></span>
                      <span style={{ width: '7px', height: '7px', background: '#aaa', borderRadius: '50%', animation: 'bounce 1.2s infinite', animationDelay: '150ms', display: 'inline-block' }}></span>
                      <span style={{ width: '7px', height: '7px', background: '#aaa', borderRadius: '50%', animation: 'bounce 1.2s infinite', animationDelay: '300ms', display: 'inline-block' }}></span>
                    </div>
                  ) : msg.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* 빠른 질문 버튼 */}
        {messages.length === 1 && (
          <div style={{
            padding: '8px 12px',
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            borderTop: '1px solid #e5e5e5',
            background: '#fff',
          }}>
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                style={{
                  fontSize: '12px',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: '1px solid #ddd',
                  background: '#fff',
                  color: '#444',
                  cursor: 'pointer',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* 입력창 */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
          padding: '10px 12px',
          borderTop: '1px solid #e5e5e5',
          background: '#fff',
          flexShrink: 0,
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요"
            rows={1}
            style={{
              flex: 1,
              resize: 'none',
              border: '1px solid #e0e0e0',
              borderRadius: '9999px',
              padding: '9px 16px',
              fontSize: '13px',
              outline: 'none',
              maxHeight: '80px',
              overflowY: 'auto',
              fontFamily: 'inherit',
              background: '#fafafa',
              color: '#111',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              padding: '9px 20px',
              background: input.trim() && !loading ? '#222' : '#e0e0e0',
              color: input.trim() && !loading ? '#fff' : '#aaa',
              border: 'none',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >
            전송
          </button>
        </div>
      </div>

      {/* 바운스 애니메이션 */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
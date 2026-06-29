import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import Profile from "../profile/Profile";

function ChatPanel({ chatroomIdx, currentUserIdx }) {
  const [messageList, setMessageList] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [websocketConnected, setWebsocketConnected] = useState(false);
  const chatContainerRef = useRef(null);
  const stompClientRef = useRef(null);
  const subscriptionsRef = useRef([]);

  useEffect(() => {
    setMessageList([]);
    if (!chatroomIdx) return;
    const loadMessages = async () => {
      try {
        await fetch(`/chats/${chatroomIdx}/read`, { method: "PATCH", credentials: "include" });
        const res = await fetch(`/chats/${chatroomIdx}/messages`, { credentials: "include", cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMessageList(data.messageList || []);
      } catch (err) {
        console.error("메시지 로드 실패:", err);
      }
    };
    loadMessages();
  }, [chatroomIdx]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messageList]);

  useEffect(() => {
    if (!chatroomIdx || !currentUserIdx) return;
    subscriptionsRef.current.forEach(sub => sub.unsubscribe());
    subscriptionsRef.current = [];
    const socket = new SockJS("/ws-chat");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: () => {},
      onConnect: () => {
        setWebsocketConnected(true);
        const sub1 = client.subscribe(`/topic/chatroom/${chatroomIdx}`, (frame) => {
          const data = JSON.parse(frame.body);
          setMessageList((prev) => [...prev, data]);
          if (Number(data.senderIdx) !== Number(currentUserIdx)) {
            fetch(`/chats/${chatroomIdx}/read`, { method: "PATCH", credentials: "include" });
          }
        });
        const sub2 = client.subscribe(`/topic/chatroom/${chatroomIdx}/read`, (frame) => {
          const { readerIdx } = JSON.parse(frame.body);
          if (Number(readerIdx) === Number(currentUserIdx)) return;
          setMessageList((prev) =>
            prev.map((msg) =>
              Number(msg.senderIdx) === Number(currentUserIdx)
                ? { ...msg, isRead: "Y" }
                : msg
            )
          );
        });
        subscriptionsRef.current = [sub1, sub2];
      },
      onDisconnect: () => setWebsocketConnected(false),
    });
    client.activate();
    stompClientRef.current = client;
    return () => {
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
      subscriptionsRef.current = [];
      client.deactivate();
    };
  }, [chatroomIdx, currentUserIdx]);

  function handleSend() {
    if (!websocketConnected || !stompClientRef.current) return;
    const content = messageContent.trim();
    if (!content) return;
    stompClientRef.current.publish({
      destination: "/app/chat/send",
      body: JSON.stringify({ chatroomIdx, senderIdx: currentUserIdx, messageContent: content }),
    });
    setMessageContent("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSend();
  }

  if (!chatroomIdx) {
    return <div className="flex-1 flex items-center justify-center text-sm text-gray-300">채팅방을 선택하세요</div>;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      <main ref={chatContainerRef} className="flex-1 overflow-auto p-4 bg-gray-50">
        {messageList.map((msg, idx) => {
          const isMine = Number(msg.senderIdx) === Number(currentUserIdx);
          return (
            <div key={idx} className={`flex mb-2 ${isMine ? "justify-end" : "justify-start"}`}>
              {isMine && msg.isRead === "N" && (
                <span className="self-end text-[10px] text-gray-400 mr-1 mb-0.5">안읽음</span>
              )}
              <div className={`px-3 py-2 rounded-2xl text-sm max-w-[70%] ${isMine ? "bg-[#222222] text-white" : "bg-white text-gray-800 border border-gray-100"}`}>
                {msg.messageContent}
              </div>
            </div>
          );
        })}
      </main>
      <footer className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-gray-400 bg-gray-50"
            placeholder="메시지를 입력하세요"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={handleSend}
            className="px-4 py-2 rounded-full bg-[#222222] text-white text-sm font-medium hover:bg-black transition-colors"
          >
            전송
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function ChatOverlay({ onClose }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentUserIdx, setCurrentUserIdx] = useState(null);
  const [roomList, setRoomList] = useState([]);
  const [profileModal, setProfileModal] = useState(null);

  useEffect(() => {
    fetch("/mypage/session", { credentials: "include" })
      .then((res) => { if (!res.ok) return null; return res.json(); })
      .then((data) => { if (data) setCurrentUserIdx(data.memIdx); })
      .catch(() => {});

    fetch("/chatRoom", { credentials: "include" })
      .then((res) => { if (!res.ok) return null; return res.json(); })
      .then((data) => {
        if (data) {
          const normalized = (data.roomList || []).map(room => ({
            chatroomIdx:  room.chatroomIdx  ?? room.chatroomidx,
            opponentIdx:  room.opponentIdx  ?? room.opponentidx,
            opponentName: room.opponentName ?? room.opponentname,
            lastMessage:  room.lastMessage  ?? room.lastmessage,
            unreadCount:  room.unreadCount  ?? room.unreadcount ?? 0,
          }));
          setRoomList(normalized);
        }
      })
      .catch(() => {});
  }, []);

  function handleSelectRoom(room) {
    setSelectedRoom(room);
    setRoomList(prev =>
      prev.map(r =>
        r.chatroomIdx === room.chatroomIdx
          ? { ...r, unreadCount: 0 }
          : r
      )
    );
  }

  function handleBackToList() {
    setSelectedRoom(null);
  }

  const openProfileModal = async (memIdx) => {
    if (!memIdx) return;
    try {
      const response = await fetch(`/mypage/profile/modal/${memIdx}`, { credentials: 'include' });
      if (!response.ok) throw new Error(`프로필 조회 실패: ${response.status}`);
      const data = await response.json();
      if (!data?.profile) throw new Error('프로필 데이터가 없습니다.');
      setProfileModal(data);
    } catch (error) {
      console.error('프로필 조회 에러:', error);
    }
  };

  return (
    <>
      <div
        className="
          fixed z-50 bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100
          flex flex-col
          inset-x-4 bottom-4 top-20
          md:inset-x-auto md:top-auto md:bottom-28 md:right-8
          md:flex-row md:w-[750px] md:h-[500px]
        "
      >
        {/* 방 목록: base에 "flex" 제거 — display는 조건부 한 군데서만 결정 */}
        <div
          className={`
            flex-col border-b md:border-b-0 md:border-r border-gray-100
            md:max-h-none md:h-auto md:w-[250px] flex-shrink-0
            ${selectedRoom ? "hidden md:flex" : "flex md:flex"}
          `}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <span className="text-base font-semibold text-gray-900">채팅 목록</span>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {roomList.map((room) => {
              const isSelected = selectedRoom?.chatroomIdx === room.chatroomIdx;
              return (
                <div
                  key={room.chatroomIdx}
                  onClick={() => handleSelectRoom(room)}
                  className={`px-5 py-4 cursor-pointer border-b border-gray-50 transition-colors ${
                    isSelected ? "bg-gray-50 border-l-[5px] border-l-[#7CBD00]" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-semibold truncate ${isSelected ? "text-gray-900" : "text-gray-800"}`}>
                      {room.opponentName}
                    </p>
                    {room.unreadCount > 0 && (
                      <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 flex-shrink-0 ml-2">
                        {room.unreadCount > 99 ? "99+" : room.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{room.lastMessage}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 채팅 영역: 기존대로 조건부 flex/hidden 그대로 (여긴 문제 없었음) */}
        <div
          className={`
            flex-1 flex-col overflow-hidden min-h-0
            ${selectedRoom ? "flex" : "hidden md:flex"}
          `}
        >
          {selectedRoom && (
            <div className="px-5 py-4 border-b border-gray-100 bg-white flex-shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={handleBackToList}
                className=" flex md:hidden w-7 h-7 items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 -ml-1"
                aria-label="채팅 목록으로 돌아가기"
              >
                ←
              </button>
              <span
                className="text-sm font-semibold text-gray-900 cursor-pointer hover:text-[#7CBD00]"
                onClick={() => openProfileModal(selectedRoom.opponentIdx)}
              >
                {selectedRoom.opponentName}
              </span>
            </div>
          )}
          <ChatPanel chatroomIdx={selectedRoom?.chatroomIdx} currentUserIdx={currentUserIdx} />
        </div>
      </div>

      {profileModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
          onClick={() => setProfileModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Profile
              profile={profileModal.profile}
              reviews={profileModal.reviews}
              onClose={() => setProfileModal(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
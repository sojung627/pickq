import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

function ChatPanel({ chatroomIdx, currentUserIdx }) {
  const [messageList, setMessageList] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [websocketConnected, setWebsocketConnected] = useState(false);
  const chatContainerRef = useRef(null);
  const stompClientRef = useRef(null);

  useEffect(() => {
    setMessageList([]);
    if (!chatroomIdx) return;
    fetch(`/chats/${chatroomIdx}/messages`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();                            // ← 여기서는 res만 처리
      })
      .then((data) => setMessageList(data.messageList || []))  // ← data는 여기서
      .catch((err) => console.error("메시지 로드 실패:", err));
  }, [chatroomIdx]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messageList]);

  useEffect(() => {
    if (!chatroomIdx) return;
    const socket = new SockJS("/ws-chat");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: () => {},
      onConnect: () => {
        setWebsocketConnected(true);
        client.subscribe(`/topic/chatroom/${chatroomIdx}`, (frame) => {
          const data = JSON.parse(frame.body);
          setMessageList((prev) => [...prev, data]);
        });
      },
      onDisconnect: () => setWebsocketConnected(false),
    });
    client.activate();
    stompClientRef.current = client;
    return () => client.deactivate();
  }, [chatroomIdx]);

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
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-300">
        채팅방을 선택하세요
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main ref={chatContainerRef} className="flex-1 overflow-auto p-4 bg-gray-50">
        {messageList.map((msg, idx) => {
          const isMine = Number(msg.senderIdx) === Number(currentUserIdx);
          return (
            <div key={idx} className={`flex mb-2 ${isMine ? "justify-end" : "justify-start"}`}>
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

     useEffect(() => {
       fetch("/mypage/session", { credentials: "include" })
         .then((res) => {
           if (!res.ok) return null;   // 401이면 무시
           return res.json();
         })
         .then((data) => {
           if (data) setCurrentUserIdx(data.memIdx);
         })
         .catch(() => {});

       fetch("/chatRoom", { credentials: "include" })
         .then((res) => {
           if (!res.ok) return null;
           return res.json();
         })
         .then((data) => {
           if (data) {
             const normalized = (data.roomList || []).map(room => ({
               chatroomIdx:  room.chatroomIdx  ?? room.chatroomidx,
               opponentName: room.opponentName ?? room.opponentname,
               lastMessage:  room.lastMessage  ?? room.lastmessage,
             }));
             setRoomList(normalized);  // ← setRoomList(data.roomList || []) 대신 이걸로
           }
         })
         .catch(() => {});
     }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="flex w-[750px] h-[500px] bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100">

        {/* 왼쪽: 채팅 목록 */}
        <div className="w-[250px] border-r border-gray-100 flex flex-col">
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
                  onClick={() => setSelectedRoom(room)}
                  className={`px-5 py-4 cursor-pointer border-b border-gray-50 transition-colors ${isSelected ? "bg-gray-50 border-l-[3px] border-l-gray-400" : "hover:bg-gray-50"}`}
                >
                  <p className={`text-sm font-semibold ${isSelected ? "text-gray-900" : "text-gray-800"}`}>{room.opponentName}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{room.lastMessage}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 오른쪽: 채팅창 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedRoom && (
            <div className="px-5 py-4 border-b border-gray-100 bg-white">
              <span className="text-sm font-semibold text-gray-900">{selectedRoom.opponentName}</span>
            </div>
          )}
          <ChatPanel chatroomIdx={selectedRoom?.chatroomIdx} currentUserIdx={currentUserIdx} />
         </div>

      </div>
    </div>
  );
}
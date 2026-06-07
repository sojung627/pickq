import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const DUMMY_ROOMS = [
  { chatroomIdx: 1, opponentName: "유저02", lastMessage: "ㅎㅇ" },
  { chatroomIdx: 2, opponentName: "닉넴", lastMessage: "대화를 시작해보세요" },
  { chatroomIdx: 3, opponentName: "닉넴", lastMessage: "대화를 시작해보세요" },
  { chatroomIdx: 4, opponentName: "유저01 수정", lastMessage: "대화를 시작해보세요" },
];

function ChatPanel({ chatroomIdx, currentUserIdx }) {
  const [messageList, setMessageList] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [websocketConnected, setWebsocketConnected] = useState(false);
  const chatContainerRef = useRef(null);
  const stompClientRef = useRef(null);

  useEffect(() => {
    setMessageList([]);
    if (!chatroomIdx) return;

    fetch(`/chats/${chatroomIdx}/messages`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setMessageList(data.messageList || []))
      .catch(() => {});
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
      body: JSON.stringify({
        chatroomIdx,
        senderIdx: currentUserIdx,
        messageContent: content,
      }),
    });

    setMessageContent("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSend();
  }

  if (!chatroomIdx) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
        채팅방을 선택하세요
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main ref={chatContainerRef} className="flex-1 overflow-auto p-3 bg-[#f5f5f5]">
        {messageList.length === 0 ? (
          <p className="text-sm text-gray-400">
            아직 대화가 없습니다.<br />대화를 시작해보세요.
          </p>
        ) : (
          messageList.map((msg, idx) => {
            const isMine = Number(msg.senderIdx) === Number(currentUserIdx);
            return (
              <div key={idx} className={isMine ? "text-right" : "text-left"}>
                <div className={`inline-block px-2 py-1 my-1 rounded text-sm ${isMine ? "bg-[#222222] text-white" : "bg-white"}`}>
                  {msg.messageContent}
                </div>
              </div>
            );
          })
        )}
      </main>

      <footer className="border-t bg-white px-2 py-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border rounded px-2 py-1 text-sm"
            placeholder="메시지를 입력하세요"
            autoComplete="off"
          />
          <button
            type="button"
            className="px-3 py-1 rounded bg-[#222222] text-white text-xs"
            onClick={handleSend}
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
  const [roomList, setRoomList] = useState(DUMMY_ROOMS);

  useEffect(() => {
    fetch("/mypage/session", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCurrentUserIdx(data.memIdx))
      .catch(() => {});

    // 백엔드 생기면 아래 주석 해제
    // fetch("/chatRoom", { credentials: "include" })
    //   .then((res) => res.json())
    //   .then((data) => setRoomList(data.roomList || []));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="flex w-[900px] h-[600px] bg-white rounded-xl overflow-hidden shadow-2xl">

        {/* 왼쪽: 채팅 목록 */}
        <div className="w-[280px] border-r flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="text-sm font-semibold text-[#222222]">채팅 목록</span>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
          </div>
          <div className="flex-1 overflow-auto">
            {roomList.map((room) => (
              <div
                key={room.chatroomIdx}
                onClick={() => setSelectedRoom(room)}
                className={`px-4 py-3 cursor-pointer border-b hover:bg-gray-50 ${selectedRoom?.chatroomIdx === room.chatroomIdx ? "bg-gray-100 border-l-2 border-l-[#222222]" : ""}`}
              >
                <p className="text-sm font-medium text-[#222222]">{room.opponentName}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{room.lastMessage}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 채팅창 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedRoom && (
            <div className="px-4 py-3 border-b bg-white">
              <span className="text-sm font-semibold text-[#222222]">{selectedRoom.opponentName}</span>
            </div>
          )}
          <ChatPanel
            chatroomIdx={selectedRoom?.chatroomIdx}
            currentUserIdx={currentUserIdx}
          />
        </div>

      </div>
    </div>
  );
}
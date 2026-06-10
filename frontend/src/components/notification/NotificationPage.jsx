import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NotificationPage() {
  const navigate = useNavigate();

  // 상태 관리: 알림 목록 및 현재 탭 필터 ('all' 또는 'unread')
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");

  // 백엔드 API로부터 알림 데이터 로드 (fetch 사용)
  useEffect(() => {
    fetch("http://localhost:8080/api/notifications", {
      credentials: "include", // 세션 쿠키 전달이 필요한 경우 유지
    })
      .then((res) => res.json())
      .then((data) => {
        // 백엔드 데이터 구조에 맞게 세팅 (배열 데이터 가정)
        setNotifications(data || []);
      })
      .catch((err) => console.error("알림 목록을 불러오는데 실패했습니다:", err));
  }, []);

  // 미개봉(읽지 않은) 알림 개수 계산
  const unreadCount = notifications.filter((n) => n.isRead === "N").length;

  // 필터링된 알림 목록
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return n.isRead === "N";
    return true;
  });

  // 개별 알림 읽음 처리 함수
  const handleMarkAsRead = (idx, e) => {
    e.stopPropagation(); // 카드 클릭 이벤트와 겹치지 않도록 방지

    fetch(`http://localhost:8080/api/notifications/${idx}/read`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          // 화면 상태 업데이트
          setNotifications((prev) =>
            prev.map((n) => (n.notificationIdx === idx ? { ...n, isRead: "Y" } : n))
          );
        }
      })
      .catch((err) => console.error("읽음 처리에 실패했습니다:", err));
  };

  // 모든 알림 읽음 처리 함수
  const handleMarkAllAsRead = () => {
    fetch("http://localhost:8080/api/notifications/read-all", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: "Y" })));
        }
      })
      .catch((err) => console.error("전체 읽음 처리에 실패했습니다:", err));
  };

  // 알림 카드 클릭 시 해당 targetUrl로 이동하는 함수
  const handleCardClick = (targetUrl) => {
    if (targetUrl) {
      navigate(targetUrl);
    }
  };

  return (
    <div className="min-h-[70vh] bg-white py-6">
      <div className="mx-auto max-w-4xl px-4">

        {/* 상단 헤더 영역 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#7CBD00]/10 text-[#7CBD00]">
                🔔
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">알림</h1>
            </div>

            {/* 읽지 않은 알림이 있을 때만 모두 읽음 버튼 표시 */}
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center text-sm px-3 py-1.5 rounded-full text-[#7CBD00] hover:text-[#6BAD00] hover:bg-[#7CBD00]/10 border border-transparent transition-colors cursor-pointer"
              >
                <span className="mr-1.5 text-xs">✔</span> 모두 읽음
              </button>
            )}
          </div>

          {/* 탭 메뉴 */}
          <div className="flex items-center gap-2 border-b border-gray-200 text-sm">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 border-b-2 font-medium transition-colors cursor-pointer ${
                filter === "all"
                  ? "border-[#7CBD00] text-[#7CBD00]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              전체 ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 border-b-2 font-medium transition-colors cursor-pointer ${
                filter === "unread"
                  ? "border-[#7CBD00] text-[#7CBD00]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              읽지 않음 ({unreadCount})
            </button>
          </div>
        </div>

        {/* 알림 리스트 섹션 */}
        <div className="mb-2">
          {filteredNotifications.length === 0 ? (
            /* 알림이 없을 때 (Empty State) */
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-300 text-2xl">
                🔔
              </div>
              <p className="text-sm text-gray-500">
                {filter === "unread" ? "읽지 않은 알림이 없습니다" : "알림이 없습니다"}
              </p>
            </div>
          ) : (
            /* 알림이 있을 때 리스트 렌더링 */
            <div className="space-y-4">
              {filteredNotifications.map((n) => (
                <div
                  key={n.notificationIdx}
                  onClick={() => handleCardClick(n.targetUrl)}
                  className={`rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                    n.isRead === "Y"
                      ? "bg-white border-gray-200"
                      : "bg-[#f5f5f5] border-gray-300"
                  }`}
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-4">

                      {/* 알림 아이콘 아이콘 배경 */}
                      <div
                        className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${
                          n.isRead === "Y" ? "bg-gray-100" : "bg-gray-200"
                        }`}
                      >
                        <span className={n.isRead === "Y" ? "text-gray-400" : "text-gray-700 text-lg"}>
                          ⏰
                        </span>
                      </div>

                      {/* 알림 콘텐츠 영역 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3
                            className={`text-sm sm:text-base font-semibold ${
                              n.isRead === "Y" ? "text-gray-700" : "text-gray-900"
                            }`}
                          >
                            {n.notificationTitle}
                          </h3>

                          {/* 알림 액션 버튼 (체크, 휴지통) */}
                          <div className="flex items-center gap-2 flex-shrink-0 text-gray-400">
                            {n.isRead === "N" && (
                              <button
                                type="button"
                                onClick={(e) => handleMarkAsRead(n.notificationIdx, e)}
                                className="inline-flex text-xs items-center hover:text-[#7CBD00] cursor-pointer"
                              >
                                ✔
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()} // 상세 페이지 이동 방지
                              className="hidden text-xs sm:inline-flex items-center hover:text-red-500 cursor-pointer"
                            >
                              🗑
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] font-semibold tracking-wide text-gray-400 mb-1">상세</p>
                        <p
                          className={`text-sm mb-2 leading-6 ${
                            n.isRead === "Y" ? "text-gray-500" : "text-gray-700"
                          }`}
                        >
                          {n.notificationMessage}
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <div>
                            {n.targetUrl ? (
                              <span className="inline-block text-sm text-[#7CBD00] hover:text-[#6BAD00] font-medium hover:underline">
                                관련 페이지로 이동 →
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">이동 가능한 페이지가 없습니다</span>
                            )}
                          </div>

                          <p className="text-xs text-gray-400">
                            {n.createdAt ? n.createdAt.substring(0, 16).replace("T", " ") : ""}
                          </p>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
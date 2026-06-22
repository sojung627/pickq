import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { ToastProvider, useToast } from "./components/notification/ToastContext";
import { useParams } from 'react-router-dom';

/* 헤더 푸터 메인 등등 */
import Header from "./components/fragments/Header";
import Footer from "./components/fragments/Footer";
import MainPage from "./components/fragments/MainPage";
import FloatingButtons from "./components/fragments/FloatingButtons";
import MyPageLayout from "./components/layout/MyPageLayout";

/* 경매 */
import AuctionList from "./components/auction/AuctionList";
import AuctionWrite from "./components/auction/AuctionWrite";

/* 입찰 */
import Mybids from "./components/bid/MyBids";

/* 구매 및 판매 */
import MyOrders from "./components/order/MyOrders";
import MySales from "./components/order/MySales";
import MyPayments from "./components/order/MyPayments";
import SaleDetail from "./components/order/SaleDetail";

/* 게시판 */
import BoardList from "./components/board/BoardList";
import BoardDetail from "./components/board/BoardDetail";
import BoardWrite from "./components/board/BoardWrite";
import BoardEdit from "./components/board/BoardEdit";
import MyPosts from "./components/board/MyPosts";

/* 회원가입 / 로그인 */
import Register from "./components/members/SignUp";
import Login from "./components/members/Login";
import PwdFind from "./components/members/PwdFind";

/* 회원 */
import MemberUpdate from "./components/members/MemberUpdate";
/* 회원 주소 */
import AddressManagement from "./components/memberAddr/MemberAddr";
import AddressInsert from "./components/memberAddr/MemberAddrInsert";
import AddressUpdate from "./components/memberAddr/MemberAddrUpdate";
/* 회원 프로필 */
import MemberProfileUpdate from "./components/memberProfile/MemberProfileUpdate";
/* 요약 프로필 */
import Profile from "./components/profile/Profile";

/* 마이페이지 경매(auction / bid) */
import Auctions from "./components/auction/Auctions";
import AuctionDetail from "./components/auction/AuctionDetail";

/* 리뷰 */
import ReviewManagement from "./components/review/ReviewManagement";
import ReviewWrite from "./components/review/ReviewWrite";
import ReviewDetail from "./components/review/ReviewDetail";
import ReviewAdmin from "./components/review/ReviewAdmin";

/* 고객지원 */
import Faq from "./components/support/Faq";
import Guide from "./components/support/Guide";
import Inquiry from "./components/support/Inquiry";
import SupportLayout from "./components/support/SupportLayout";

/* 채팅 */
import ChatOverlay from "./components/chat/ChatOverlay";

/* 알림 */
import NotificationPage from "./components/notification/NotificationPage";

/* 결제 */
import { CheckoutPage } from "./components/payment/CheckoutPage";
import { SuccessPage } from "./components/payment/SuccessPage";
import { FailPage } from "./components/payment/FailPage";

function AppInner() {
  const { addToast } = useToast();
  const stompRef = useRef(null);
  const [loginMemIdx, setLoginMemIdx] = useState(null);
  const [realtimeUnreadCount, setRealtimeUnreadCount] = useState(0); // ← 추가

  useEffect(() => {
    fetch("/members/auth/check", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        if (data.isLoggedIn) setLoginMemIdx(data.member.memIdx);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!loginMemIdx) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("/ws-chat"),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/notifications/${loginMemIdx}`, (frame) => {
          const noti = JSON.parse(frame.body);
          addToast(
              noti.notificationMessage,
              noti.targetUrl,
              noti.notificationTitle
          );
          window.dispatchEvent(new CustomEvent("notification-created"));
          // 채팅 메시지면 플로팅 버튼 카운트 +1 ← 추가
          if (noti.notificationType === 'CHAT_MESSAGE') {
            setRealtimeUnreadCount(prev => prev + 1);
          }
        });
      },
    });

    client.activate();
    stompRef.current = client;

    return () => client.deactivate();
  }, [loginMemIdx, addToast]);

  return (
    <div className="app-container">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/members/login" element={<Login />} />
          <Route path="/members/signUp" element={<Register />} />
          <Route path="/members/pwdFind" element={<PwdFind />} />
          <Route path="/auctions" element={
            <AuctionList
              statusFilter={new URLSearchParams(window.location.search).get('statusFilter') || 'open'}
              sortBy={new URLSearchParams(window.location.search).get('sortBy') || 'latest'}
              keyword={new URLSearchParams(window.location.search).get('keyword') || ''}
              selectedCategory={null}
            />
          } />
          <Route path="/auctions/new" element={<AuctionWrite />} />
          <Route path="/auctions/:auctionIdx" element={<AuctionDetail />} />
          <Route path="/auctions/category/:category" element={<AuctionCategoryPage />} />
          <Route path="/boards" element={<BoardList />} />
          <Route path="/boards/:typeCode/new" element={<BoardWrite />} />
          <Route path="/boards/:boardTypeCode/:boardIdx" element={<BoardDetail />} />
          <Route path="/boards/:boardTypeCode/:boardIdx/edit" element={<BoardEdit />} />
          <Route path="/mypage" element={<MyPageLayout />}>
            <Route path="auctions" element={<Auctions />} />
            <Route path="bids" element={<Mybids />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="info" element={<MemberUpdate />} />
            <Route path="addresses" element={<AddressManagement />} />
            <Route path="addresses/new" element={<AddressInsert />} />
            <Route path="addresses/edit" element={<AddressUpdate />} />
            <Route path="profile" element={<MemberProfileUpdate />} />
            <Route path="boards" element={<MyPosts />} />
            <Route path="reviews" element={<ReviewManagement />} />
            <Route path="reviews/ReviewWrite" element={<ReviewWrite />} />
            <Route path="reviews/reviewDetail" element={<ReviewDetail />} />
            <Route path="reviews/reviewAdmin" element={<ReviewAdmin />} />
            <Route path="sales" element={<MySales />} />
            <Route path="payments" element={<MyPayments />} />
            <Route path="orders/:orderIdx" element={<SaleDetail />} />
          </Route>
          <Route path="/support/guide" element={
            <SupportLayout currentTab="guide"><Guide /></SupportLayout>} />
          <Route path="/support/faq" element={
            <SupportLayout currentTab="faq"><Faq /></SupportLayout>} />
          <Route path="/support/inquiry" element={
            <SupportLayout currentTab="inquiry"><Inquiry /></SupportLayout>} />
          <Route path="/chatRoom" element={<ChatOverlay />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/reviews/detail/:reviewIdx" element={<ReviewDetail />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/payment/pay" element={<CheckoutPage />} />
          <Route path="/payment/success" element={<SuccessPage />} />
          <Route path="/payment/fail" element={<FailPage />} />
        </Routes>
      </main>
      {/* realtimeUnreadCount, onChatOpen props 추가 ← */}
      <FloatingButtons
        realtimeUnreadCount={realtimeUnreadCount}
        onChatOpen={() => setRealtimeUnreadCount(0)}
      />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </Router>
  );
}

function AuctionCategoryPage() {
  const { category } = useParams();
  return <AuctionList selectedCategory={category} />;
}

export default App;
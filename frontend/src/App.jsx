import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
import Mybids from "./components/bid/Mybids";

/* 게시판 */
import BoardList from "./components/board/BoardList";
import BoardDetail from "./components/board/BoardDetail";
import BoardWrite from "./components/board/BoardWrite";
import BoardEdit from "./components/board/BoardEdit"
import MyPosts from "./components/board/MyPosts"

/* 회원가입 / 로그인 */
import Register from "./components/members/SignUp";
import Login from "./components/members/Login";

/* 회원 */
import MemberUpdate from "./components/members/MemberUpdate";
/* 회원 주소 */
import AddressManagement from "./components/memberAddr/memberAddr";
import AddressInsert from "./components/memberAddr/memberAddrInsert";
import AddressUpdate from "./components/memberAddr/memberAddrUpdate";
/* 회원 프로필 */
import MemberProfileUpdate from "./components/memberProfile/MemberProfileUpdate";

/* 마이페이지 경매(auction / bid) */
import Auctions from "./components/auction/Auctions";
import AuctionDetail from "./components/auction/AuctionDetail";

/* 고객지원 */
import Faq from "./components/support/Faq";
import Guide from "./components/support/Guide";
import Inquiry from "./components/support/Inquiry";
import SupportLayout from "./components/support/SupportLayout";

function App() {

  return (
    <Router>
      <div className="app-container">
        {/* 언제나 위에 떠야 하는 것
            - main 밖이면 어디서든 뜸
        */}
        <Header />
        <main>
          <Routes>
            {/* 메인 */}
            <Route path="/" element={<MainPage />} />

            {/* 회원 파트 */}
            <Route path="/members/login" element={<Login />} />
            <Route path="/members/signUp" element={<Register />} />

            {/* 경매 */}
            <Route path="/auctions" element={
              <AuctionList
                statusFilter={new URLSearchParams(window.location.search).get('statusFilter') || 'open'}
                sortBy={new URLSearchParams(window.location.search).get('sortBy') || 'latest'}
                keyword={new URLSearchParams(window.location.search).get('keyword') || ''}
                selectedCategory={null}
              />
            } />

            {/* 경매 카테고리 */}
            <Route path="/auctions/category/:category" element={
              <AuctionList
                statusFilter={new URLSearchParams(window.location.search).get('statusFilter') || 'open'}
                sortBy={new URLSearchParams(window.location.search).get('sortBy') || 'latest'}
                keyword={new URLSearchParams(window.location.search).get('keyword') || ''}
                selectedCategory={window.location.pathname.split('/').pop()}
              />
            } />

            <Route path="/auctions/new" element={<AuctionWrite/> } />
            <Route path="/auctions/:auctionIdx" element={<AuctionDetail/> } />

            {/* 게시판 파트 */}
            <Route path="/boards" element={<BoardList />} />
            <Route path="/boards/:typeCode/new" element={<BoardWrite />} />
            <Route path="/boards/:boardTypeCode/:boardIdx" element={<BoardDetail />} />
            <Route path="/boards/:boardTypeCode/:boardIdx/edit" element={<BoardEdit />} />

            {/* 헤더의 마이페이지에서만 뜨는 것들 */}
            <Route path="/mypage" element={<MyPageLayout />}>
              <Route path="auctions" element={<Auctions />} />
              <Route path="bids" element={<Mybids />} />
              <Route path="info" element={<MemberUpdate />} />
              <Route path="addresses" element={<AddressManagement />} />
              <Route path="addresses/new" element={<AddressInsert />} />
              <Route path="addresses/edit" element={<AddressUpdate />} />
              <Route path="profile" element={<MemberProfileUpdate />} />
              <Route path="boards" element={<MyPosts />} />
            </Route>

            {/* 고객지원 파트 */}
            <Route path="/support/guide" element={
              <SupportLayout currentTab="guide"><Guide /></SupportLayout>} />
            <Route path="/support/faq" element={
              <SupportLayout currentTab="faq"><Faq /></SupportLayout>} />
            <Route path="/support/inquiry" element={
              <SupportLayout currentTab="inquiry"><Inquiry /></SupportLayout>} />
          </Routes>
        </main>
        {/* 언제나 아래에 떠야 하는 것들 */}
        <FloatingButtons />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
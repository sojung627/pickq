import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/fragments/Header";
import Footer from "./components/fragments/Footer";
import MainPage from "./components/fragments/MainPage";

import MyPageLayout from "./components/layout/MyPageLayout";

import Register from "./components/members/SignUp";
import Login from "./components/members/Login";

import Faq from "./components/support/Faq";
import Guide from "./components/support/Guide";
import Inquiry from "./components/support/Inquiry";
import SupportLayout from "./components/support/SupportLayout";

import Auctions from "./components/auction/Auctions";

function App() {

  return (
    <Router>
      <div className="app-container">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<MainPage />} />

            <Route path="/members/login" element={<Login />} />
            <Route path="/members/signUp" element={<Register />} />

            <Route path="/support/guide" element={
              <SupportLayout currentTab="guide"><Guide /></SupportLayout>} />
            <Route path="/support/faq" element={
              <SupportLayout currentTab="faq"><Faq /></SupportLayout>} />
            <Route path="/support/inquiry" element={
              <SupportLayout currentTab="inquiry"><Inquiry /></SupportLayout>} />

            <Route path="/mypage" element={<MyPageLayout />}>
              <Route path="auctions" element={<Auctions />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
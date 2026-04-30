import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/fragments/Header";
import Footer from "./components/fragments/Footer";
import MainPage from "./components/fragments/MainPage";

import Register from "./components/members/SignUp";
import Login from "./components/members/Login";

import Faq from "./components/support/Faq";
import Guide from "./components/support/Guide";
import Inquiry from "./components/support/Inquiry";

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

            <Route path="/support/guide" element={<Guide />} />
            <Route path="/support/inquiry" element={<Inquiry />} />
            <Route path="/support/faq" element={<Faq />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App; // 이거 안 써주면 main.jsx에서 못 읽어와!
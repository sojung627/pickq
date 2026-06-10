import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    memName: '', memTel: '', memEmail: '', emailDomain: '',
    memId: '', memPwd: '', memPwdCheck: '', agree: false,
    memIp: '127.0.0.1', memRoleIdx: 1, memGradeIdx: 1
  });
  const [idMsg, setIdMsg] = useState({ text: '', isError: false });
  const [pwdMsg, setPwdMsg] = useState({ text: '', isError: false });
  const [isIdDuplicate, setIsIdDuplicate] = useState(true);
  const [showPwd, setShowPwd] = useState(false);

  const handleNaverLogin = () => {
    const state = Math.random().toString(36).substring(2, 12);
    const params = new URLSearchParams({
      response_type: "code",
      client_id: "2Rk518jWd9bxOQoKuUnD",
      redirect_uri: "http://localhost:8080/members/naverCallback",
      state: state,
    });
    window.location.href =
      "https://nid.naver.com/oauth2.0/authorize?" + params.toString();
  };

  // 전화번호 포맷팅
  const formatTel = (val) => {
    const value = val.replace(/[^0-9]/g, "");
    if (value.length <= 3) return value;
    if (value.length <= 7) return `${value.slice(0, 3)}-${value.slice(3)}`;
    return `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
  };

  // 아이디 중복 체크
  const checkId = async () => {
    const idReg = /^[A-Za-z0-9]{5,}$/;
    if (!idReg.test(formData.memId)) {
      setIdMsg({
        text: (
          <>
            <i className="bi bi-exclamation-circle mr-1"></i>
            영문 + 숫자 5글자 이상으로 입력해주세요.
          </>
        ),
        isError: true
      });
      setIsIdDuplicate(true);
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/members/check_id?memId=${encodeURIComponent(formData.memId)}`);
      const data = await res.text();
      if (data.trim() === "ok") {
        setIdMsg({ text: "✔ 사용 가능한 아이디입니다.", isError: false });
        setIsIdDuplicate(false);
      } else {
        setIdMsg({
          text: (
            <>
              <i className="bi bi-exclamation-circle mr-1"></i>
              이미 사용 중인 아이디입니다.
            </>
          ),
          isError: true
        });
        setIsIdDuplicate(true);
      }
    } catch (err) {
      setIdMsg({
        text: (
          <>
            <i className="bi bi-exclamation-circle mr-1"></i>
            중복 확인 중 오류 발생
          </>
        ),
        isError: true
      });
    }
  };

  // 회원가입 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { memPwdCheck, emailDomain, agree, ...rest } = formData;
    const sendData = {
      ...rest,
      memEmail: formData.memEmail + formData.emailDomain
    };
    const res = await fetch("http://localhost:8080/members/signUp", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sendData)
    });
    const data = await res.text();
    if (data === "success") navigate("/members/login");
  };

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    if (name === 'memTel') finalValue = formatTel(value);
    if (name === 'memId') setIsIdDuplicate(true);
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  // 유효성 검사
  const isPwdOk = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/.test(formData.memPwd) && formData.memPwd === formData.memPwdCheck;
  const isValid = formData.memName && formData.memTel.length >= 12 && formData.memEmail &&
                  formData.emailDomain && formData.agree && !isIdDuplicate && isPwdOk;

  useEffect(() => {
    if (!formData.memPwd) return;
    const pwdReg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/;
    if (!pwdReg.test(formData.memPwd)) {
      setPwdMsg({ text: (<><i className="bi bi-exclamation-circle mr-1"></i>영문 + 숫자 포함 5글자 이상 입력해주세요.</>), isError: true });
      return;
    }
    if (!formData.memPwdCheck) {
      setPwdMsg({ text: (<><i className="bi bi-exclamation-circle mr-1"></i>비밀번호 확인을 입력해주세요.</>), isError: true });
      return;
    }
    if (formData.memPwd !== formData.memPwdCheck) {
      setPwdMsg({ text: (<><i className="bi bi-exclamation-circle mr-1"></i>비밀번호가 일치하지 않습니다.</>), isError: true });
      return;
    }
    if (!pwdReg.test(formData.memPwdCheck)) {
      setPwdMsg({ text: (<><i className="bi bi-exclamation-circle mr-1"></i>영문 + 숫자 포함 5글자 이상 입력해주세요.</>), isError: true });
      return;
    }
    setPwdMsg({ text: "✔ 비밀번호가 일치합니다.", isError: false });
  }, [formData.memPwd, formData.memPwdCheck]);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-10 bg-white">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7CBD00]">
              <i className="bi bi-lightning-fill text-white text-3xl"></i>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#222222] mb-1">회원가입</h1>
          <p className="text-sm text-[#767676]">스포츠 용품 역경매의 새로운 경험을 시작하세요</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
          <div className="px-6 pt-5 pb-2 border-b border-gray-100">
            <h2 className="text-base sm:text-lg font-semibold text-[#222222]">회원 정보 입력</h2>
            <p className="mt-1 text-xs sm:text-sm text-[#767676]">모든 항목을 정확히 입력해주세요</p>
          </div>

          <div className="px-6 py-5">
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#222222] mb-1">이름</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a7a7a7]">👤</span>
                    <input type="text" name="memName" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7CBD00] outline-none" placeholder="홍길동" onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#222222] mb-1">전화번호</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a7a7a7]">📞</span>
                    <input type="text" name="memTel" value={formData.memTel} maxLength="13" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7CBD00] outline-none" placeholder="010-1234-5678" onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222222] mb-1">이메일</label>
                <div className="flex flex-row gap-2">
                  <input type="text" name="memEmail" className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7CBD00] outline-none" placeholder="yourEmail" onChange={handleChange} />
                  <input type="text" name="emailDomain" value={formData.emailDomain} className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7CBD00] outline-none" placeholder="@email.com" onChange={handleChange} />
                  <select className="flex-1 min-w-0 px-2 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none cursor-pointer"
                    onChange={(e) => {
                      const domain = e.target.value === 'naver' ? '@naver.com' : e.target.value === 'google' ? '@gmail.com' : '';
                      setFormData(prev => ({ ...prev, emailDomain: domain }));
                    }}>
                    <option value="custom">직접입력</option>
                    <option value="naver">네이버</option>
                    <option value="google">구글</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222222] mb-1">아이디</label>
                <div className="flex gap-2 items-start">
                  <input
                    type="text"
                    name="memId"
                    className={`flex-[2] px-3 py-2 border rounded-lg text-sm outline-none transition-all
                      ${idMsg.isError
                        ? "border-red-500 focus:ring-2 focus:ring-red-500"
                        : "border-gray-200 focus:ring-2 focus:ring-[#7CBD00]"
                      }`}
                    placeholder="your ID"
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="flex-[1] py-2 rounded-lg bg-amber-400 text-sm font-bold text-white hover:bg-amber-500"
                    onClick={checkId}
                  >
                    중복확인
                  </button>
                </div>
                <span className={`block text-[11px] mt-1 ${idMsg.isError ? 'text-red-500' : 'text-gray-500'}`}>
                  {idMsg.text}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222222] mb-1">비밀번호</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a7a7a7]"><i className="bi bi-lock"></i></span>
                  <input
                    type={showPwd ? "text" : "password"}
                    name="memPwd"
                    className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm outline-none transition-all
                      ${pwdMsg.isError
                        ? "border-red-500 focus:ring-2 focus:ring-red-500"
                        : "border-gray-200 focus:ring-2 focus:ring-[#7CBD00]"
                      }`}
                    placeholder="••••••••"
                    onChange={handleChange}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer text-sm" onClick={() => setShowPwd(!showPwd)}>
                    <i className={showPwd ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222222] mb-1">비밀번호 확인</label>
                <input
                  type={showPwd ? "text" : "password"}
                  name="memPwdCheck"
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all
                    ${pwdMsg.isError
                      ? "border-red-500 focus:ring-2 focus:ring-red-500"
                      : "border-gray-200 focus:ring-2 focus:ring-[#7CBD00]"
                    }`}
                  placeholder="••••••••"
                  onChange={handleChange}
                />
                <span className={`block text-[11px] mt-1 ${pwdMsg.isError ? 'text-red-500' : 'text-green-500'}`}>
                  {pwdMsg.text}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="agree" className="mt-[3px] rounded border-gray-300" onChange={handleChange} />
                  <span className="text-xs sm:text-sm text-[#767676]">
                    <span className="font-bold text-[#222222]">이용약관</span> 및 <span className="font-bold text-[#222222]">개인정보 처리방침</span>에 동의합니다.
                  </span>
                </label>
              </div>

              <button type="submit" disabled={!isValid} style={{ opacity: isValid ? 1 : 0.5, cursor: isValid ? 'pointer' : 'not-allowed' }} className="w-full py-2.5 rounded-lg bg-[#7CBD00] text-white text-sm font-bold hover:bg-[#6BAD00] transition-opacity">
                ✔️ 회원가입 완료
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">또는</span>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-xs text-gray-500 mb-2 text-center">네이버 아이디로 간편 로그인</p>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleNaverLogin}
                    className="w-full flex justify-center cursor-pointer">
                    <img
                      src="/images/naver/NAVER_login_Light_KR_white_center_H48.png"
                      alt="네이버 로그인"
                      className="w-full h-[48px] object-contain"
                    />
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
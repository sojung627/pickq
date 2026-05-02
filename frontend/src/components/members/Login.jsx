import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [memId, setMemId] = useState('');
    const [memPwd, setMemPwd] = useState('');
    const [saveId, setSaveId] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [loginMsg, setLoginMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    // 1. 초기 로드 및 네이버 SDK
    useEffect(() => {
      const savedId = localStorage.getItem("savedId");
      if (savedId) {
        setMemId(savedId);
        setSaveId(true);
      }

      if (window.naver) {
        const naverLogin = new window.naver.LoginWithNaverId({
          clientId: "2Rk518jWd9bxOQoKuUnD",
          callbackUrl: "http://172.30.1.94:8080/members/naverCallback",
          isPopup: false,
          loginButton: { color: "green", type: 3, height: 60 }
        });
        naverLogin.init();
      }
    }, []);

    // 2. 타이머
    useEffect(() => {
      let interval;
      if (remainingSeconds > 0) {
        interval = setInterval(() => {
          setRemainingSeconds((prev) => prev - 1);
        }, 1000);
      } else if (remainingSeconds === 0 && interval) {
        clearInterval(interval);
      }
      return () => clearInterval(interval);
    }, [remainingSeconds]);

       // 3. 로그인 제출
       const handleLoginSubmit = (e) => {
         e.preventDefault();

         // 변수명과 키값이 같으므로 { memId: memId } 대신 단축 표기 사용
         const loginData = { memId, memPwd };

         fetch("http://localhost:8080/members/login", {
           method: "POST",
           credentials: "include",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(loginData),
           cache: "no-cache"
         })
         .then(res => {
           // 400, 500 에러 등이 발생하면 여기서 catch로 던짐
           if (!res.ok) throw new Error(`서버 응답 에러 (상태코드: ${res.status})`);
           return res.json();
         })
         .then(data => {
           // 백엔드에서 반환하는 status 값에 따른 처리
           if (data.status === "success") {
             navigate("/");
             window.location.href = "/";
           } else {
             setErrorMsg(data.message);
           }
         })
         .catch((err) => {
           console.error("로그인 요청 실패:", err); // 브라우저 콘솔에서 상세 에러 확인용
           setErrorMsg("로그인 처리 중 문제가 발생했습니다.");
         });
       };

    // 4. 유효성 검사
    const isValid = memId.trim() !== "" && memPwd.trim() !== "" && remainingSeconds === 0;

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-10 bg-white">
      <div className="w-full max-w-md">

        {/* 상단 헤더 */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7CBD00]">
              <i className="bi bi-lightning-fill text-white text-3xl"></i>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#222222] mb-1">로그인</h1>
          <p className="text-sm text-[#767676]">PickQ에 오신 것을 환영합니다.</p>
        </div>

        {/* 카드 */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
          <div className="px-6 pt-5 pb-2 border-b border-gray-100">
            <h2 className="text-base sm:text-lg font-semibold text-[#222222]">계정 정보 입력</h2>
            <p className="mt-1 text-xs sm:text-sm text-[#767676]">아이디와 비밀번호를 입력해주세요.</p>
          </div>

          <div className="px-6 py-6">
            <form action="/members/login" method="post" className="space-y-6" onSubmit={handleLoginSubmit}>

              {/* 인터셉터/서버 메시지 */}
              {loginMsg && (
                <div className="font-bold text-[#222222] text-sm">
                  <span>{loginMsg}</span>
                </div>
              )}

              {/* 아이디 */}
              <div className="space-y-1">
                <label htmlFor="memId" className="text-sm font-medium text-[#222222]">아이디</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 pl-10 text-sm text-[#222222] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
                    id="memId"
                    name="memId"
                    value={memId}
                    placeholder="your ID"
                    onChange={(e) => setMemId(e.target.value)}
                  />
                </div>
                <label className="flex items-center gap-2 mt-1 text-xs text-[#767676] cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    id="saveId"
                    checked={saveId}
                    onChange={(e) => setSaveId(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span>아이디 저장</span>
                </label>
              </div>

              {/* 비밀번호 */}
              <div className="space-y-1">
                <label htmlFor="memPwd" className="text-sm font-medium text-[#222222]">비밀번호</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 pl-10 pr-10 text-sm text-[#222222] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
                    id="memPwd"
                    name="memPwd"
                    type={showPwd ? "text" : "password"}
                    value={memPwd}
                    placeholder="••••••••"
                    onChange={(e) => setMemPwd(e.target.value)}/>
                  <span
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer text-sm">
                    <i className={showPwd ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                  </span>
                </div>
              </div>

              {/* 에러 메시지 및 타이머 */}
              {errorMsg && <div className="text-xs text-red-500">{errorMsg}</div>}
              {remainingSeconds > 0 && (
                <div className="text-[12px] text-gray-500 mt-1">
                  ⏳ 로그인 제한 중 ({remainingSeconds}초 남음)
                </div>
              )}
              {remainingSeconds === 0 && errorMsg?.includes("제한") && (
                <div className="text-[12px] text-gray-500 mt-1">다시 로그인을 시도해주세요.</div>
              )}

              {/* 로그인 버튼 */}
              <div className="mt-5 flex justify-center">
                <button type="submit" name="loginBtn" disabled={!isValid}
                  style={{ opacity: isValid ? 1 : 0.5, cursor: isValid ? 'pointer' : 'not-allowed' }}
                  className="w-full bg-[#7CBD00] text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-[#6BAD00] transition-colors">
                  로그인
                </button>
              </div>

              {/* 구분선 */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">또는</span>
                </div>
              </div>

              {/* 네이버 로그인 */}
              <div className="mb-5">
                <p className="text-xs text-gray-500 mb-2 text-center">네이버 아이디로 간편 로그인</p>
                <div className="flex justify-center">
                  <div id="naverIdLogin" className="w-full flex justify-center"></div>
                </div>
              </div>

              {/* 하단 링크 */}
              <div className="space-y-1 text-center text-sm text-gray-600">
                <div>
                  아직 계정이 없으신가요?{" "}
                  <a href="/members/signUp" className="text-[#7CBD00] hover:underline font-semibold">회원가입</a>
                </div>
                <div>
                  비밀번호를 잊으셨나요?{" "}
                  <a href="/members/pwdFind" className="text-[#7CBD00] hover:underline font-semibold">비밀번호 찾기</a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
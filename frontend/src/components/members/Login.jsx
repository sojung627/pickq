import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [memId, setMemId] = useState('');
    const [memPwd, setMemPwd] = useState('');
    const [saveId, setSaveId] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [wasLocked, setWasLocked] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [loginMsg, setLoginMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();
    const [welcomeMsg, setWelcomeMsg] = useState('PickQ에 오신 것을 환영합니다.');

    // 초기 로드
    useEffect(() => {
        const savedId = localStorage.getItem("savedId");
        if (savedId) {
            setMemId(savedId);
            setSaveId(true);
        }

        // 로그인 인터셉터용
        const params = new URLSearchParams(window.location.search);
            const msg = params.get('msg');
            if (msg) {
                setLoginMsg(msg);
            }
        }, []);

    // 네이버 로그인
    // state 생성/검증과 redirect_uri 관리는 백엔드에서 처리한다.
    const handleNaverLogin = () => {
        window.location.assign("/members/naverLogin");
    };

    // 시간 타이머 로직
    useEffect(() => {
        let interval;
        if (remainingSeconds > 0) {
            setWasLocked(true);
            interval = setInterval(() => {
                setRemainingSeconds((prev) => prev - 1);
            }, 1000);
        } else if (remainingSeconds === 0 && wasLocked) {
            // 타이머가 딱 끝나는 시점에 문구 교체
            setErrorMsg('다시 로그인을 시도할 수 있습니다.');
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [remainingSeconds, wasLocked]); // errorMsg 대신 wasLocked를 의존성에 추가

    // 초를 "03:33" 형식으로 변환하는 함수
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // 로그인 제출
    const handleLoginSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');

        const loginData = { memId, memPwd };

        fetch("/members/login", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData),
            cache: "no-cache"
        })
        .then(res => {
            if (!res.ok) throw new Error(`서버 응답 에러 (상태코드: ${res.status})`);
            return res.json();
        })
        .then(data => {
            if (data.status === "success") {
                if (saveId) {
                    localStorage.setItem("savedId", memId);
                } else {
                    localStorage.removeItem("savedId");
                }
                window.location.href = "/";
            } else if (data.status === "locked") {
                setErrorMsg(data.message);
                setRemainingSeconds(data.remainingSeconds);
            } else {
                setErrorMsg(data.message);
            }
        })
        .catch((err) => {
            console.error("로그인 요청 실패:", err);
            setErrorMsg("로그인 처리 중 문제가 발생했습니다.");
        });
    };

    // 유효성 검사 (타이머가 돌아가는 중에는 버튼 비활성화)
    const isValid = memId.trim() !== "" && memPwd.trim() !== "" && remainingSeconds === 0;

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-10 bg-white">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7CBD00]">
                            <i className="bi bi-lightning-fill text-white text-3xl"></i>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-[#222222] mb-1">로그인</h1>
                    <p className={`text-sm font-medium
                    ${welcomeMsg !== 'PickQ에 오신 것을 환영합니다.' ? 'text-red-500' : 'text-[#767676]'}`}>
                       {welcomeMsg}
                    </p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
                    <div className="px-6 pt-5 pb-2 border-b border-gray-100">
                        <h2 className="text-base sm:text-lg font-semibold text-[#222222]">계정 정보 입력</h2>
                        <p className="mt-1 text-xs sm:text-sm text-[#767676]">아이디와 비밀번호를 입력해주세요.</p>
                    </div>

                    <div className="px-6 py-6">
                        <form className="space-y-6" onSubmit={handleLoginSubmit}>
                            {loginMsg && (
                                <div className="font-bold text-[#222222] text-sm">
                                    <span>{loginMsg}</span>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label htmlFor="memId" className="text-sm font-medium text-[#222222]">아이디</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                                        <i className="bi bi-person"></i>
                                    </span>
                                    <input
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 pl-10 text-sm text-[#222222] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
                                        id="memId"
                                        value={memId}
                                        placeholder="your ID"
                                        onChange={(e) => setMemId(e.target.value)}
                                    />
                                </div>
                                <label className="flex items-center gap-2 mt-1 text-xs text-[#767676] cursor-pointer w-fit">
                                    <input
                                        type="checkbox"
                                        checked={saveId}
                                        onChange={(e) => setSaveId(e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <span>아이디 저장</span>
                                </label>
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="memPwd" className="text-sm font-medium text-[#222222]">비밀번호</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                                        <i className="bi bi-lock"></i>
                                    </span>
                                    <input
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 pl-10 pr-10 text-sm text-[#222222] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
                                        id="memPwd"
                                        type={showPwd ? "text" : "password"}
                                        value={memPwd}
                                        placeholder="••••••••"
                                        onChange={(e) => setMemPwd(e.target.value)}
                                    />
                                    <span
                                        onClick={() => setShowPwd(!showPwd)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer text-sm">
                                        <i className={showPwd ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                                    </span>
                                </div>
                            </div>

                            {/* 에러 메시지 영역 */}
                            <div className="min-h-[20px]">
                                {errorMsg && (
                                    <div className={`text-xs font-bold ${
                                        // 타이머 종료 문구일 때만 회색, 나머지는 모두 빨간색
                                        errorMsg === '다시 로그인을 시도할 수 있습니다.'
                                        ? "text-gray-500"
                                        : "text-red-600"
                                    }`}>
                                        <i className="bi bi-exclamation-circle mr-1"></i>
                                        {errorMsg}
                                    </div>
                                )}

                                {remainingSeconds > 0 && (
                                        <div className="bg-red-50 border border-red-100 rounded-lg p-3 mt-2 text-center">
                                            <p className="text-[11px] text-red-700 font-medium">5분 뒤에 다시 시도해주세요</p>
                                            <div className="text-lg font-bold text-red-600">
                                                ⌛ {formatTime(remainingSeconds)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                            <div className="mt-5 flex justify-center">
                                <button
                                    type="submit"
                                    disabled={!isValid}
                                    className={`w-full font-semibold py-2.5 rounded-lg text-sm transition-all
                                        ${isValid
                                            ? "bg-[#7CBD00] text-white hover:bg-[#6BAD00] cursor-pointer"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                                    로그인
                                </button>
                            </div>

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

                            <div className="space-y-1 text-center text-sm text-gray-600">
                                <div>
                                    아직 계정이 없으신가요?{" "}
                                    <Link to="/members/signUp" className="text-[#7CBD00] hover:underline font-semibold">회원가입</Link>
                                </div>
                                <div>
                                    비밀번호를 잊으셨나요?{" "}
                                    <Link to="/members/pwdFind" className="text-[#7CBD00] hover:underline font-semibold">비밀번호 찾기</Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
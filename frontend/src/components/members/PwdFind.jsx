import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PwdFind() {
  const navigate = useNavigate();

  const [memId, setMemId] = useState("");
  const [memTel, setMemTel] = useState("");
  const [idMsg, setIdMsg] = useState("");
  const [telMsg, setTelMsg] = useState("");
  const [verifyMsg, setVerifyMsg] = useState("");

  const [authCode, setAuthCode] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [isAuthOk, setIsAuthOk] = useState(false);
  const [isAuthError, setIsAuthError] = useState(false);

  const [newPwd, setNewPwd] = useState("");
  const [newPwdConfirm, setNewPwdConfirm] = useState("");
  const [pwdMsg, setPwdMsg] = useState({ text: "", isError: false });
  const [pwdConfirmMsg, setPwdConfirmMsg] = useState({ text: "", isError: false });
  const [isSamePwd, setIsSamePwd] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const formatTel = (value) => {
    const num = value.replace(/[^0-9]/g, "");
    if (num.length <= 3) return num;
    if (num.length <= 7) return `${num.slice(0, 3)}-${num.slice(3)}`;
    return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7, 11)}`;
  };

  const handleSendAuth = () => {
    setIdMsg("");
    setTelMsg("");
    setVerifyMsg("");

    fetch("/members/pwdFind", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ memId, memTel }),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setIdMsg(data.idMsg || "");
        setTelMsg(data.telMsg || "");
        setVerifyMsg(data.verifyMsg || "");
      })
      .catch(() => {
        setVerifyMsg("예기치 못한 오류가 발생하여 잠시 후 다시 시도해 주세요.");
      });
  };

  const handleCheckAuth = () => {
    fetch("/auth/verifyCode", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ userCode: authCode }),
      credentials: "include",
    })
      .then((res) => res.text())
      .then((result) => {
        if (result === "success") {
          setIsAuthOk(true);
          setIsAuthError(false);
        } else {
          setIsAuthOk(false);
          setIsAuthError(true);
          setAuthMsg("인증번호가 틀렸습니다.");
        }
      })
      .catch(() => {
        setIsAuthError(true);
        setAuthMsg("예기치 못한 오류가 발생하여 잠시 후 다시 시도해 주세요.");
      });
  };

  const handlePwdBlur = () => {
    fetch("/auth/checkSamePwd", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ newPwd }),
      credentials: "include",
    })
      .then((res) => res.text())
      .then((result) => {
        if (result === "same") {
          setIsSamePwd(true);
          setPwdMsg({ text: "이전 비밀번호와 동일합니다.", isError: true });
        } else {
          setIsSamePwd(false);
          validatePwd(newPwd, newPwdConfirm, false);
        }
      });
  };

  const validatePwd = (pwd1, pwd2, samePwd) => {
    const pwdReg = /^[A-Za-z0-9]{5,}$/;

    // 비밀번호 불일치 여부 체크 (확인 칸이 비어있지 않고 서로 다를 때)
    const isNotMatch = pwd2 !== "" && pwd1 !== pwd2;

    if (!pwdReg.test(pwd1)) {
      setPwdMsg({ text: "영문 + 숫자 5글자 이상으로 입력해주세요.", isError: true });
    } else if (isNotMatch) {
      // 불일치 시 테두리는 빨간색으로 만들되, 경고 텍스트는 노출하지 않음
      setPwdMsg({ text: "", isError: true });
    } else {
      setPwdMsg({ text: "", isError: false });
    }

    if (pwd2 === "") {
      setPwdConfirmMsg({ text: "", isError: false });
    } else if (pwd1 === pwd2) {
      if (samePwd) {
        setPwdConfirmMsg({ text: "이전 비밀번호와 동일합니다.", isError: true });
      } else {
        setPwdConfirmMsg({ text: "✔ 비밀번호가 일치하며 사용 가능합니다.", isError: false });
      }
    } else {
      // 맨 마지막란(비밀번호 확인)에만 불일치 경고문 노출 및 테두리 에러 처리
      setPwdConfirmMsg({ text: "비밀번호가 일치하지 않습니다.", isError: true });
    }
  };

  const handleNewPwdChange = (val) => {
    setNewPwd(val);
    validatePwd(val, newPwdConfirm, isSamePwd);
  };

  const handleNewPwdConfirmChange = (val) => {
    setNewPwdConfirm(val);
    validatePwd(newPwd, val, isSamePwd);
  };

  const handleSubmit = () => {
    fetch("/members/newPwdFind", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ authCode, newPassword: newPwd }),
      credentials: "include",
    })
      .then((res) => res.text())
      .then(() => {
        navigate("/members/login");
      })
      .catch(() => {
        alert("예기치 못한 오류가 발생하여 잠시 후 다시 시도해 주세요.");
      });
  };

  const pwdReg = /^[A-Za-z0-9]{5,}$/;
  const isSubmitOk =
    isAuthOk &&
    pwdReg.test(newPwd) &&
    newPwd === newPwdConfirm &&
    !isSamePwd;

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-b from-[#f6ffe8] to-white px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl">

        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d6e9a8] bg-white px-4 py-1.5 text-xs font-semibold text-[#5f7f00]">
            <i className="bi bi-shield-lock"></i>
            계정 보안
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-[#222222]">비밀번호 찾기</h1>
          <p className="mt-2 text-sm text-[#767676]">아이디와 전화번호 인증 후 새로운 비밀번호로 변경하세요.</p>
        </div>

        <div className="rounded-2xl border border-[#eef3df] bg-white p-5 sm:p-7 shadow-[0_8px_24px_rgba(124,189,0,0.08)]">
          <div className="grid gap-6 md:grid-cols-2">

            {/* 1단계: 본인 확인 */}
            <div className="rounded-xl border border-gray-100 bg-[#fafcf6] p-4 sm:p-5">
              <h2 className="text-base font-semibold text-[#222222]">1. 본인 확인</h2>
              <p className="mt-1 text-xs text-[#767676]">입력한 번호로 인증번호를 발송합니다.</p>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#444444] mb-1">아이디</label>
                  <input
                    type="text"
                    value={memId}
                    onChange={(e) => setMemId(e.target.value)}
                    placeholder="your ID"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
                  />
                  {idMsg && (
                    <p className="mt-1 text-xs text-red-500">
                      <i className="bi bi-exclamation-circle mr-1"></i>{idMsg}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#444444] mb-1">전화번호</label>
                  <input
                    type="text"
                    value={memTel}
                    onChange={(e) => setMemTel(formatTel(e.target.value))}
                    placeholder="010-1234-5678"
                    maxLength={13}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
                  />
                  {telMsg && (
                    <p className="mt-1 text-xs text-red-500">
                      <i className="bi bi-exclamation-circle mr-1"></i>{telMsg}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSendAuth}
                  className="w-full rounded-lg bg-[#7CBD00] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6BAD00] cursor-pointer"
                >
                  인증번호 받기
                </button>
                {verifyMsg && <p className="text-xs text-[#5f7f00]">{verifyMsg}</p>}
              </div>
            </div>

            {/* 2단계: 비밀번호 재설정 */}
            <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
              <h2 className="text-base font-semibold text-[#222222]">2. 비밀번호 재설정</h2>
              <p className="mt-1 text-xs text-[#767676]">인증 후 새 비밀번호를 입력하세요.</p>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#444444] mb-1">인증번호</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      placeholder="인증번호를 입력하세요"
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                        isAuthError
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-200 focus:ring-[#7CBD00]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleCheckAuth}
                      className="shrink-0 rounded-lg border border-[#cfe598] px-3 py-2 text-xs font-semibold text-[#5f7f00] hover:bg-[#f6ffe8] cursor-pointer"
                    >
                      확인
                    </button>
                  </div>
                  {authMsg && (
                    <p className={`mt-1 text-xs ${isAuthOk ? "text-gray-500" : "text-red-500"}`}>
                      {!isAuthOk && <i className="bi bi-exclamation-circle mr-1"></i>}
                      {authMsg}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#444444] mb-1">새 비밀번호</label>
                  <p className="mb-1 text-[11px] text-[#767676]">알파벳 + 숫자 조합, 5글자 이상</p>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      value={newPwd}
                      onChange={(e) => handleNewPwdChange(e.target.value)}
                      onBlur={handlePwdBlur}
                      placeholder="새 비밀번호를 입력하세요"
                      className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 ${
                        pwdMsg.isError
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-200 focus:ring-[#7CBD00]"
                      }`}
                    />
                    <span
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                    >
                      <i className={showPwd ? "bi bi-eye-slash" : "bi bi-eye"} ></i>
                    </span>
                  </div>
                  {pwdMsg.text && (
                    <p className={`mt-1 text-xs ${pwdMsg.isError ? "text-red-500" : "text-gray-500"}`}>
                      {pwdMsg.isError && <i className="bi bi-exclamation-circle mr-1"></i>}
                      {pwdMsg.text}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#444444] mb-1">비밀번호 확인</label>
                  <input
                    type={showPwd ? "text" : "password"}
                    value={newPwdConfirm}
                    onChange={(e) => handleNewPwdConfirmChange(e.target.value)}
                    placeholder="다시 한번 입력하세요"
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      pwdConfirmMsg.isError
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-200 focus:ring-[#7CBD00]"
                    }`}
                  />
                  {pwdConfirmMsg.text && (
                    <p className={`mt-1 text-xs ${pwdConfirmMsg.isError ? "text-red-500" : "text-gray-500"}`}>
                      {pwdConfirmMsg.isError && <i className="bi bi-exclamation-circle mr-1"></i>}
                      {pwdConfirmMsg.text}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isSubmitOk}
                  className={`w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-colors
                    ${isSubmitOk
                      ? "bg-[#7CBD00] hover:bg-[#6BAD00] cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  변경
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
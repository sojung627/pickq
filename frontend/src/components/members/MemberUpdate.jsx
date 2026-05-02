import React, { useState, useEffect } from 'react';

const MemberUpdate = ({ memberVO, gradeName }) => {
  // 1. 상태 관리
  const [formData, setFormData] = useState({
    memId: memberVO?.memId || '',
    memName: memberVO?.memName || '',
    memEmail: memberVO?.memEmail || '',
    memTel: memberVO?.memTel || '',
    memBday: memberVO?.memBday || '',
    newPwd: '',
    newPwdConfirm: '',
  });

  const [initialValues] = useState({ ...formData });
  const [pwdMsg, setPwdMsg] = useState({ text: '', color: 'text-gray-500' });
  const [showPwd, setShowPwd] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  // 2. 전화번호 포맷팅 (010-xxxx-xxxx)
  const formatTel = (value) => {
    const num = value.replace(/[^0-9]/g, '');
    if (num.length <= 3) return num;
    if (num.length <= 7) return `${num.slice(0, 3)}-${num.slice(3)}`;
    return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7, 11)}`;
  };

  // 3. 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'memTel' ? formatTel(value) : value,
    }));
  };

  // 업데이트 버튼 클릭 시 실행될 로직
  const handleUpdate = async () => {
      const res = await fetch("http://localhost:8080/mypage/info", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              memId: formData.memId,
              memName: formData.memName,
              memEmail: formData.memEmail,
              memTel: formData.memTel,
              memBday: formData.memBday,
              newPwd: formData.newPwd
          })
      });
      const data = await res.json();
      console.log(data.message);
  };

  // 4. 변경 감지 및 유효성 검사
  useEffect(() => {
    const fieldsChanged = Object.keys(initialValues).some(
      (key) => key !== 'newPwd' && key !== 'newPwdConfirm' && initialValues[key] !== formData[key]
    );

    const { newPwd, newPwdConfirm } = formData;
    const pwdReg = /^[A-Za-z0-9]{5,}$/;

    if (!newPwd && !newPwdConfirm) {
      setPwdMsg({ text: '', color: '' });
      setIsSubmitDisabled(!fieldsChanged);
      return;
    }

    if (!pwdReg.test(newPwd)) {
      setPwdMsg({ text: '✘ 영문 + 숫자 5글자 이상으로 입력해주세요.', color: 'text-red-500' });
      setIsSubmitDisabled(true);
      return;
    }

    if (newPwd !== newPwdConfirm) {
      setPwdMsg({ text: '✘ 비밀번호가 일치하지 않습니다.', color: 'text-red-500' });
      setIsSubmitDisabled(true);
      return;
    }

    setPwdMsg({ text: '✔ 비밀번호가 일치하며 사용 가능합니다.', color: 'text-gray-500' });
    setIsSubmitDisabled(false);
  }, [formData, initialValues]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Form 태그 대신 div 사용 */}
      <div className="border border-gray-100 bg-white rounded-xl shadow-sm">
        {/* 헤더 (스크린샷 2026-05-02 204238.png의 디자인 반영) */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-[#222222]">개인정보확인/수정</h2>
          <p className="mt-1 text-xs sm:text-sm text-[#767676]">회원 정보를 업데이트하세요</p>
        </div>

        {/* 내용 영역 */}
        <div className="px-6 py-6 space-y-5">
          {/* 아이디 / 회원등급 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-900">아이디</label>
              <input
                type="text"
                value={formData.memId}
                readOnly
                className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 h-10 text-sm text-gray-600 outline-none cursor-default"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-900">회원등급</label>
              <div className="flex items-center gap-2 h-10">
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-500 text-white text-xs font-semibold">
                  {gradeName || '골드'}
                </span>
              </div>
            </div>
          </div>

          {/* 이름 / 이메일 / 전화번호 / 생년월일 */}
          {[
            { label: '이름', name: 'memName', type: 'text' },
            { label: '이메일', name: 'memEmail', type: 'text' },
            { label: '전화번호', name: 'memTel', type: 'text', max: 13 },
            { label: '생년월일', name: 'memBday', type: 'date' },
          ].map((field) => (
            <div key={field.name} className="space-y-1.5">
              <label className="text-sm font-medium text-gray-900">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                maxLength={field.max}
                className="w-full bg-white border border-gray-300 rounded-md px-3 h-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7CBD00] transition-shadow"
              />
            </div>
          ))}

          {/* 비밀번호 변경 - 네이버 로그인이 아닐 때만 노출 */}
          {memberVO?.memLoginType !== 'NAVER' && (
            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium text-gray-900">새 비밀번호</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="newPwd"
                  value={formData.newPwd}
                  onChange={handleChange}
                  placeholder="🔒 변경할 비밀번호를 입력해주세요"
                  className="w-full bg-white border border-gray-300 rounded-md px-3 pr-10 h-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>

              <label className="text-sm font-medium text-gray-900 mt-2 block">비밀번호 확인</label>
              <input
                type={showPwd ? 'text' : 'password'}
                name="newPwdConfirm"
                value={formData.newPwdConfirm}
                onChange={handleChange}
                placeholder="🔒 변경할 비밀번호를 확인해주세요"
                className="w-full bg-white border border-gray-300 rounded-md px-3 h-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
              />
              {pwdMsg.text && <p className={`text-[11px] mt-1 ${pwdMsg.color}`}>{pwdMsg.text}</p>}
            </div>
          )}

          {/* 업데이트 버튼 */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleUpdate}
              disabled={isSubmitDisabled}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#7CBD00] text-white rounded-md text-sm font-semibold hover:bg-[#6BAD00] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              정보 업데이트
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberUpdate;
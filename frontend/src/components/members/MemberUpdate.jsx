import React, { useState, useEffect } from 'react';

const MemberUpdate = () => {
  const [formData, setFormData] = useState({
    memId: '', memName: '', memEmail: '',
    memTel: '', memBday: '', newPwd: '', newPwdConfirm: '',
  });
  const [initialValues, setInitialValues] = useState({});
  const [gradeName, setGradeName] = useState('골드');
  const [memLoginType, setMemLoginType] = useState('LOCAL');
  const [pwdMsg, setPwdMsg] = useState({ text: '', color: 'text-gray-500' });
  const [showPwd, setShowPwd] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [updateMsg, setUpdateMsg] = useState({ text: '', color: '' });

  useEffect(() => {
    fetch("http://localhost:8080/mypage/info", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        const loaded = {
          memId: data.memId || '',
          memName: data.memName || '',
          memEmail: data.memEmail || '',
          memTel: data.memTel || '',
          memBday: data.memBday || '',
          newPwd: '',
          newPwdConfirm: '',
        };
        setFormData(loaded);
        setInitialValues(loaded);
        setGradeName(data.gradeName || '골드');
        setMemLoginType(data.memLoginType || 'LOCAL');
      });
  }, []);

  const formatTel = (value) => {
    const num = value.replace(/[^0-9]/g, '');
    if (num.length <= 3) return num;
    if (num.length <= 7) return `${num.slice(0, 3)}-${num.slice(3)}`;
    return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7, 11)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'memTel' ? formatTel(value) : value,
    }));
  };

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
    setUpdateMsg({ text: '✔ 회원정보가 수정되었습니다.', color: 'text-green-600' });
  };

  useEffect(() => {
    if (Object.keys(initialValues).length === 0) return;

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
      setPwdMsg({
        text: (
          <span className="text-red-500">
            <i className="bi bi-exclamation-circle mr-1"></i>
            영문 + 숫자 5글자 이상으로 입력해주세요.
          </span>
        ),
        isError: true
      });
      setIsSubmitDisabled(true);
      return;
    }
    if (newPwd !== newPwdConfirm) {
      setPwdMsg({
        text: (
          <span className="text-red-500">
            <i className="bi bi-exclamation-circle mr-1"></i>
            비밀번호가 일치하지 않습니다.
          </span>
        ),
        isError: true
      });
      setIsSubmitDisabled(true);
      return;
    }
    fetch("http://localhost:8080/mypage/checkPwd", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPwd })
    })
    .then(res => res.json())
    .then(data => {
      if (data.isSame) {
        setPwdMsg({
          text: (
            <span className="text-red-500 text-[12px]">
              <i className="bi bi-exclamation-circle mr-1"></i>
              이전 비밀번호와 동일합니다.
            </span>
          ),
          isError: true
        });
        setIsSubmitDisabled(true);
      } else {
        setPwdMsg({ text: '✔ 비밀번호가 일치하며 사용 가능합니다.', color: 'text-gray-500' });
        setIsSubmitDisabled(!fieldsChanged);
      }
    });
  }, [formData, initialValues]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border border-gray-100 bg-white rounded-xl shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-[#222222]">개인정보확인/수정</h2>
          <p className="mt-1 text-xs sm:text-sm text-[#767676]">회원 정보를 업데이트하세요</p>
        </div>

        <div className="px-6 py-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-900">아이디</label>
              <input type="text" value={formData.memId} readOnly
                className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 h-10 text-sm text-gray-600 outline-none cursor-default" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-900">회원등급</label>
              <div className="flex items-center gap-2 h-10">
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-500 text-white text-xs font-semibold">
                  {gradeName}
                </span>
              </div>
            </div>
          </div>

          {[
            { label: '이름', name: 'memName', type: 'text' },
            { label: '이메일', name: 'memEmail', type: 'text' },
            { label: '전화번호', name: 'memTel', type: 'text', max: 13 },
            { label: '생년월일', name: 'memBday', type: 'date' },
          ].map((field) => (
            <div key={field.name} className="space-y-1.5">
              <label className="text-sm font-medium text-gray-900">{field.label}</label>
              <input type={field.type} name={field.name} value={formData[field.name]}
                onChange={handleChange} maxLength={field.max}
                className="w-full bg-white border border-gray-300 rounded-md px-3 h-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7CBD00] transition-shadow" />
            </div>
          ))}

          {memLoginType !== 'NAVER' && (
            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium text-gray-900">새 비밀번호</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="newPwd"
                  value={formData.newPwd}
                  onChange={handleChange}
                  placeholder="🔒 변경할 비밀번호를 입력해주세요"
                  /* ✅ 에러 시 border-red-500과 focus:ring-red-500 적용 */
                  className={`w-full bg-white border rounded-md px-3 pr-10 h-10 text-sm text-gray-900 focus:outline-none focus:ring-2 transition-all
                    ${pwdMsg.isError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-[#7CBD00]"
                    }`}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
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
                /* ✅ 확인란도 동일하게 빨간 테두리 적용 */
                className={`w-full bg-white border rounded-md px-3 h-10 text-sm text-gray-900 focus:outline-none focus:ring-2 transition-all
                  ${pwdMsg.isError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#7CBD00]"
                  }`}
              />

              {pwdMsg.text && (
                <p className={`text-[12px] mt-1 ${!pwdMsg.isError ? 'text-gray-500' : ''}`}>
                  {pwdMsg.text}
                </p>
              )}
            </div>
          )}

          <div className="pt-2">
            <button type="button" onClick={handleUpdate} disabled={isSubmitDisabled}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#7CBD00] text-white rounded-md text-sm font-semibold hover:bg-[#6BAD00] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
              정보 업데이트
            </button>
            {updateMsg.text && (
              <p className={`text-sm mt-2 ${updateMsg.color}`}>{updateMsg.text}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberUpdate;
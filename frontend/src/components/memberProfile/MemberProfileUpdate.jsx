import React, { useState, useEffect, useRef } from 'react';

const MemberProfileUpdate = () => {
  const fileInputRef = useRef(null);

  // 1. 상태 관리
  const [profile, setProfile] = useState({
    memNickname: '',
    memIntro: '',
    memImg: ''
  });

  const [originalData, setOriginalData] = useState(null); // ✨ 초기값을 null로 설정해서 로딩 확인
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [messages, setMessages] = useState({ nickname: '', intro: '' });
  const [isNicknameOk, setIsNicknameOk] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [wasModified, setWasModified] = useState(false); // 수정을 시도했는지 여부

  // 2. 초기 데이터 로드
  useEffect(() => {
    fetch("http://localhost:8080/mypage/profile/data", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        const defaultImages = [
          'profile_default_1.png', 'profile_default_2.png', 'profile_default_3.png',
          'profile_default_4.png', 'profile_default_5.png'
        ];

        const getRandomDefaultImg = () => {
          const randomIndex = Math.floor(Math.random() * defaultImages.length);
          return defaultImages[randomIndex];
        };

        const initial = {
          memNickname: data.memNickname || '',
          memIntro: data.memIntro || '',
          memImg: data.memImg || getRandomDefaultImg()
        };

        setProfile(initial);
        setOriginalData(initial); // ✨ 여기서 원본 데이터 확정
        setPreviewUrl(`http://localhost:8080/uploads/profile/${initial.memImg}`);
      });
  }, []);

  // 3. 닉네임 중복 체크 (기존과 동일)
  const checkNickname = async (nickname) => {
    if (originalData && nickname === originalData.memNickname) {
      setMessages(prev => ({ ...prev, nickname: '' }));
      setIsNicknameOk(true);
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/mypage/profile/members/checkNickname`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ memNickname: nickname })
      });
      const count = await response.json();
      setIsNicknameOk(count === 0);
      setMessages(prev => ({ ...prev, nickname: count > 0 ? '이미 사용중인 닉네임입니다.' : '' }));
    } catch (err) {
      setIsNicknameOk(false);
    }
  };

  // 4. 유효성 검사 및 변경 감지 (✨ 수정됨)
  useEffect(() => {
    // 원본 데이터가 아직 로딩 전이면 아무것도 하지 않음
    if (!originalData) return;

    const { memNickname, memIntro } = profile;

    const nicknameValid = memNickname.length >= 2 && memNickname.length <= 10;
    const introValid = memIntro.length >= 1 && memIntro.length <= 200;

    setMessages(prev => ({
      ...prev,
      nickname: nicknameValid || memNickname === "" ? (isNicknameOk ? "" : prev.nickname) : "닉네임은 2~10자 이내로 작성해주세요",
      intro: introValid || memIntro === "" ? "" : "자기소개는 1~200자 이내로 작성해주세요"
    }));

    // 현재 상태가 원본과 다른지 체크
    const hasChanged =
      memNickname !== originalData.memNickname ||
      memIntro !== originalData.memIntro ||
      selectedFile !== null;

    // ✨ 포인트: 실제로 값이 "다를 때"만 wasModified를 true로 만듦
    if (hasChanged && !wasModified) {
      setWasModified(true);
    }

    setIsValid(nicknameValid && introValid && isNicknameOk);
    setIsDirty(hasChanged);
  }, [profile, selectedFile, isNicknameOk, originalData, wasModified]);

  // 5. 이벤트 핸들러 (기존과 동일)
  const handleNicknameChange = (e) => {
    const val = e.target.value;
    setProfile(prev => ({ ...prev, memNickname: val }));
    if (val.length >= 2 && val.length <= 10) checkNickname(val);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('memNickname', profile.memNickname);
    formData.append('memIntro', profile.memIntro);
    if (selectedFile) formData.append('memImgFile', selectedFile);

    fetch("http://localhost:8080/mypage/profile", {
      method: "POST",
      credentials: "include",
      body: formData
    }).then(res => {
       if (res.ok) window.location.reload();
    });
  };

  return (
    <div className="border border-gray-100 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-xl sm:text-2xl font-bold text-[#222222]">나의 프로필</h2>
        <p className="mt-2 text-sm sm:text-base text-[#767676]">프로필 이미지, 닉네임, 자기소개를 수정하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 sm:py-7 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-start">
            <div className="w-[140px] h-[140px] sm:w-36 sm:h-36 aspect-square rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
              {previewUrl && <img src={previewUrl} alt="프로필" className="w-full h-full object-cover" />}
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <label className="text-base sm:text-lg font-medium text-gray-900 block">프로필 이미지</label>
            <p className="text-sm text-gray-500 mb-3">JPG, PNG 파일 (최대 100MB)</p>
            <button type="button" onClick={() => fileInputRef.current.click()} className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-md text-sm sm:text-base text-gray-700 hover:bg-gray-50 cursor-pointer">
              <i className="bi bi-upload mr-2"></i> 이미지 변경
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="memNickname" className="text-base sm:text-lg font-medium text-gray-900 block">닉네임</label>
          <input id="memNickname" type="text" value={profile.memNickname} onChange={handleNicknameChange} className="w-full bg-white border border-gray-300 rounded-md px-4 h-12 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7CBD00]" />
          {messages.nickname && <p className="text-sm text-red-500">{messages.nickname}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="memIntro" className="text-base sm:text-lg font-medium text-gray-900 block">자기소개</label>
          <textarea id="memIntro" rows="4" value={profile.memIntro} onChange={(e) => setProfile(prev => ({ ...prev, memIntro: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-md px-4 py-3 text-base text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#7CBD00]" />
          {messages.intro && <p className="text-sm text-red-500">{messages.intro}</p>}
        </div>

        <div className="flex items-center">
          <button
            type="submit"
            disabled={!(isValid && isDirty)}
            className="inline-flex items-center px-6 py-3 bg-[#7CBD00] text-white rounded-lg text-base font-semibold hover:bg-[#6BAD00] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            프로필 업데이트
          </button>

          {/* ✨ 조건: 수정을 한 번이라도 했었고(wasModified), 지금은 변경사항이 없을 때(isDirty가 false일 때) */}
          {wasModified && !isDirty && (
            <span className="ml-4 text-sm font-medium text-red-500 whitespace-nowrap">
              <i className="bi bi-exclamation-circle mr-1"></i>
              이전과 같습니다.
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default MemberProfileUpdate;
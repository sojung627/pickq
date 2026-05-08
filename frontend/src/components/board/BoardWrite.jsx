import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const BoardWrite = () => {
  const navigate = useNavigate();
  const { typeCode: initialTypeCode } = useParams();
  const [searchParams] = useSearchParams();

  // 상태 관리
  const [boardTitle, setBoardTitle] = useState('');
  const [boardContent, setBoardContent] = useState('');
  const [selectedTypeCode, setSelectedTypeCode] = useState(initialTypeCode || 'soccer');
  const [boardTypes, setBoardTypes] = useState([]); // 서버에서 받아올 카테고리 목록

  const from = searchParams.get('from') || '';

  // 목록으로 가기 경로 계산
  const listPath = from === 'all' ? '/boards' : `/boards/${selectedTypeCode}`;

  // 등록 핸들러 (기존의 form submit 역할)
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = () => {
      if (!boardTitle.trim()) {
          setErrorMsg('제목을 입력해주세요.');
          return;
      }
      setErrorMsg('');
      fetch(`http://localhost:8080/boards/${selectedTypeCode}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // 로그인용
          body: JSON.stringify({ boardTitle, boardContent })
      })
      .then(res => res.json())
      .then(data => {
          if (data.boardIdx) {
              navigate(`/boards/${data.typeCode}/${data.boardIdx}`);
          } else {
              setErrorMsg(data.error || '등록에 실패했습니다.');
          }
      })
      .catch(() => setErrorMsg('서버 오류가 발생했습니다.'));
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-white py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">

        {/* 상단 헤더 + 뒤로가기 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#222222] mb-1">
              ✏️ 게시글 작성
            </h1>
            <p className="text-xs sm:text-sm text-[#767676]">
              커뮤니티에 공유할 내용을 작성해주세요.
            </p>
          </div>
          <button
            onClick={() => navigate(listPath)}
            className="inline-flex items-center text-xs sm:text-sm px-3 py-1.5 rounded-full text-[#767676] hover:text-[#222222] hover:bg-gray-50 border border-transparent transition-colors cursor-pointer">
            <i className="bi bi-arrow-left-short me-1 text-[1rem]"></i>
            목록으로
          </button>
        </div>

        {/* 카드 (Form 대신 Div 사용) */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
          <div className="p-6 sm:p-8">
            <div id="writeForm">

              {/* 카테고리 */}
              <div className="mb-4">
                <label htmlFor="categorySelect" className="block text-xs sm:text-sm font-medium text-[#222222] mb-1.5">
                  카테고리
                </label>
                <select
                  id="categorySelect"
                  value={selectedTypeCode}
                  onChange={(e) => setSelectedTypeCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#222222] bg-white focus:outline-none focus:ring-2 focus:ring-[#7CBD00] cursor-pointer">
                  {/* 예시 데이터 - 나중에 API로 불러온 boardTypes를 map으로 돌리면 돼 */}
                  <option value="soccer">축구</option>
                  <option value="baseball">야구</option>
                  <option value="basketball">농구</option>
                </select>
              </div>

              {/* 제목 */}
              <div className="mb-4">
                <label htmlFor="boardTitle" className="block text-xs sm:text-sm font-medium text-[#222222] mb-1.5">
                  제목
                </label>
                <input
                  id="boardTitle"
                  type="text"
                  value={boardTitle}
                  onChange={(e) => setBoardTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#222222] placeholder:text-[#a7a7a7] focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
                  placeholder="제목을 입력하세요"
                  maxLength={200}/>
              </div>

              {/* 내용 (에디터 영역) */}
              <div className="mb-5">
                <label htmlFor="boardContent" className="block text-xs sm:text-sm font-medium text-[#222222] mb-1.5">
                  내용
                </label>
                {/* 실무에서는 리액트용 에디터(React-Quill 등)를 쓰거나
                    기존 Summernote를 쓰려면 useRef를 활용해 */}
                <textarea
                  id="boardContent"
                  value={boardContent}
                  onChange={(e) => setBoardContent(e.target.value)}
                  className="w-full min-h-[300px] px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"
                  placeholder="내용을 입력해주세요..."
                ></textarea>
              </div>

              {/* 버튼 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-[#222222] text-white hover:bg-[#444444] cursor-pointer">
                  <i className="bi bi-pencil-square text-[13px]"></i>
                  <span>등록</span>
                </button>
                <button
                    onClick={() => navigate(listPath)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border border-gray-300 text-[#222222] bg-white hover:bg-gray-50 cursor-pointer">
                  취소
                </button>
                {errorMsg && (
                    <p className="mb-3 text-sm text-red-500">{errorMsg}</p>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BoardWrite;
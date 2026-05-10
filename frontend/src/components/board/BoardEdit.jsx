import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const BoardEdit = () => {
  const { boardTypeCode, boardIdx } = useParams();
  const navigate = useNavigate();

  const [boardTitle, setBoardTitle] = useState('');
  const [boardContent, setBoardContent] = useState('');

  // ✨ 원본 데이터 보관 및 변경 감지 상태
  const [original, setOriginal] = useState({ title: '', content: '' });
  const [isTitleValid, setIsTitleValid] = useState(true);
  const [isContentValid, setIsContentValid] = useState(true);
  const [contentErrorMsg, setContentErrorMsg] = useState('');

  useEffect(() => {
    fetch(`http://localhost:8080/boards/${boardTypeCode}/${boardIdx}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        const title = data.boardTitle || '';
        const content = data.boardContent || '';
        setBoardTitle(title);
        setBoardContent(content);
        setOriginal({ title, content }); // ✨ 원본 저장
      })
      .catch(err => console.error('게시글 조회 에러:', err));
  }, [boardTypeCode, boardIdx]);

  // 변경 여부 확인 (둘 다 같으면 false)
  const isDirty = boardTitle !== original.title || boardContent !== original.content;

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setBoardTitle(value);
    setIsTitleValid(value.trim().length === 0 || value.trim().length >= 5);
  };

  const handleContentChange = (e) => {
    const value = e.target.value;
    const length = value.trim().length;
    setBoardContent(value);

    if (length > 0 && length < 10) {
      setIsContentValid(false);
      setContentErrorMsg('내용은 10자 이상 입력해주세요.');
    } else if (length > 1000) {
      setIsContentValid(false);
      setContentErrorMsg('내용은 1000자 이하로 입력해주세요.');
    } else {
      setIsContentValid(true);
      setContentErrorMsg('');
    }
  };

  const handleSubmit = () => {
    if (!isDirty) return; // 변경사항 없으면 중단

    const titleOk = boardTitle.trim().length >= 5;
    const contentOk = boardContent.trim().length >= 10 && boardContent.trim().length <= 1000;

    if (!titleOk || !contentOk) {
      setIsTitleValid(titleOk);
      setIsContentValid(contentOk);
      return;
    }

    fetch(`http://localhost:8080/boards/${boardTypeCode}/${boardIdx}/edit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ boardTitle, boardContent })
    })
      .then(res => {
        if (!res.ok) throw new Error('수정 실패');
        return res.json();
      })
      .then(() => navigate(`/boards/${boardTypeCode}/${boardIdx}`))
      .catch(err => console.error('게시글 수정 에러:', err));
  };

  // ✨ 테두리 색상 결정 로직 (에러가 있거나, 변경사항이 없으면 빨간색)
  const titleError = !isTitleValid || (!isDirty && original.title !== '');
  const contentError = !isContentValid || (!isDirty && original.content !== '');

  return (
    <div className="min-h-[calc(100vh-200px)] bg-white py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded-xl border border-gray-100 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
          <div className="p-6 sm:p-8">
            <div className="space-y-5">
              {/* 제목 섹션 */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#222222] sm:text-sm">제목</label>
                <input
                  type="text"
                  value={boardTitle}
                  onChange={handleTitleChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-[#222222] transition-all focus:outline-none
                    ${titleError ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-[#7CBD00]'}`}
                />
                {titleError && (
                  <p className="mt-1.5 flex items-center text-[12px] text-red-500">
                    <i className="bi bi-exclamation-circle mr-1"></i>
                    {!isTitleValid ? '제목은 5자 이상 입력해주세요.' : '이전과 같습니다.'}
                  </p>
                )}
              </div>

              {/* 내용 섹션 */}
              <div className="relative">
                <label className="mb-1.5 block text-xs font-medium text-[#222222] sm:text-sm">내용</label>
                <textarea
                  value={boardContent}
                  onChange={handleContentChange}
                  rows={15}
                  className={`w-full rounded-lg border p-3 text-sm text-[#222222] transition-all focus:outline-none
                    ${contentError ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-[#7CBD00]'}`}
                />
                <div className="mt-1 flex justify-between items-start">
                  <div>
                    {contentError && (
                      <p className="flex items-center text-[12px] text-red-500">
                        <i className="bi bi-exclamation-circle mr-1"></i>
                        {!isContentValid ? contentErrorMsg : '이전과 같습니다.'}
                      </p>
                    )}
                  </div>
                  <span className={`text-[11px] font-medium ${boardContent.length > 1000 ? 'text-red-500' : 'text-gray-400'}`}>
                    {boardContent.length} / 1000
                  </span>
                </div>
              </div>

              {/* 버튼 섹션 */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  // ✨ 변경사항이 없어도 버튼 비활성화!
                  disabled={!isDirty || !isTitleValid || !isContentValid || boardTitle.trim().length < 5}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#222222] px-4 py-2 text-xs font-semibold text-white hover:bg-[#444444] disabled:bg-gray-300 disabled:cursor-not-allowed sm:text-sm cursor-pointer"
                >
                  <i className="bi bi-save text-[13px]"></i>
                  <span>저장</span>
                </button>
                <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-[#222222] hover:bg-gray-50 sm:text-sm cursor-pointer">
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardEdit;
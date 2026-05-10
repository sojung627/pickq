import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const BoardEdit = () => {
  const { boardTypeCode, boardIdx } = useParams();
  const navigate = useNavigate();

  const [boardTitle, setBoardTitle] = useState('');
  const [boardContent, setBoardContent] = useState('');

  // 게시글 기존 데이터 불러오기
  useEffect(() => {
    fetch(`http://localhost:8080/boards/${boardTypeCode}/${boardIdx}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setBoardTitle(data.boardTitle || '');
        setBoardContent(data.boardContent || '');
      })
      .catch(err => console.error('게시글 조회 에러:', err));

  }, [boardTypeCode, boardIdx]);

  // 게시글 수정
  const handleSubmit = () => {
    if (!boardTitle.trim()) {
      alert('제목을 입력하세요.');
      return;
    }
    if (!boardContent.trim()) {
      alert('내용을 입력하세요.');
      return;
    }

    fetch(`http://localhost:8080/boards/${boardTypeCode}/${boardIdx}/edit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        boardTitle,
        boardContent
      })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('수정 실패');
        }
        return res.json();
      })
      .then(() => {
        navigate(`/boards/${boardTypeCode}/${boardIdx}`);
      })
      .catch(err => {
        console.error('게시글 수정 에러:', err);
        alert('게시글 수정에 실패했습니다.');
      });
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-white py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* 상단 헤더 + 뒤로가기 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-xl font-bold text-[#222222] sm:text-2xl">
              ✏️ 게시글 수정
            </h1>
            <p className="text-xs text-[#767676] sm:text-sm">
              내용을 수정한 후 저장 버튼을 눌러주세요.
            </p>
          </div>
          <button onClick={() => navigate(`/boards/${boardTypeCode}/${boardIdx}`)}
            className="inline-flex items-center rounded-full border border-transparent
            px-3 py-1.5 text-xs text-[#767676] transition-colors
            hover:bg-gray-50 hover:text-[#222222] sm:text-sm cursor-pointer">
            <i className="bi bi-arrow-left-short me-1 text-[1rem]"></i>
            게시글로 돌아가기
          </button>
        </div>

        {/* 카드 */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
          <div className="p-6 sm:p-8">
            <div>
              {/* 제목 */}
              <div className="mb-4">
                <label htmlFor="boardTitle"
                className="mb-1.5 block text-xs font-medium text-[#222222] sm:text-sm">
                  제목
                </label>
                <input type="text" id="boardTitle" value={boardTitle}
                  onChange={(e) => setBoardTitle(e.target.value)}
                  maxLength={200} required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#222222]
                  placeholder:text-[#a7a7a7]
                  focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"/>
              </div>

              {/* 내용 */}
              <div className="mb-5">
                <label htmlFor="boardContent"
                  className="mb-1.5 block text-xs font-medium text-[#222222] sm:text-sm">
                  내용
                </label>
                <textarea id="boardContent" value={boardContent}
                  onChange={(e) => setBoardContent(e.target.value)}
                  rows={15}
                  className="w-full rounded-lg border border-gray-200 p-3 text-sm text-[#222222]
                  focus:outline-none focus:ring-2 focus:ring-[#7CBD00]"/>
              </div>

              {/* 버튼 */}
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleSubmit}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#222222] px-4 py-2 text-xs font-semibold text-white
                  hover:bg-[#444444] sm:text-sm cursor-pointer">
                  <i className="bi bi-save text-[13px]"></i>
                  <span>저장</span>
                </button>
                <button type="button"
                  onClick={() => navigate(`/boards/${boardTypeCode}/${boardIdx}`)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2
                  text-xs font-semibold text-[#222222]
                  hover:bg-gray-50 sm:text-sm cursor-pointer">
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
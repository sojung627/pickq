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
  const [boardTypes, setBoardTypes] = useState([]);

  const from = searchParams.get('from') || '';
  const listPath = from === 'all' ? '/boards' : `/boards/${selectedTypeCode}`;

  // 유효성 메시지 상태
  const [messages, setMessages] = useState({ title: '', content: '' });
  const [errorMsg, setErrorMsg] = useState('');

  // 유효성 검사 (실시간)
  useEffect(() => {
    setMessages(prev => ({
      ...prev,
      title:
        boardTitle.length > 0 && boardTitle.trim().length < 5
          ? (
            <>
              <i className="bi bi-exclamation-circle mr-1"></i>
              제목은 5자 이상 입력해주세요.
            </>
          )
          : '',
      content:
        boardContent.length > 0 && boardContent.length < 10
          ? (
            <>
              <i className="bi bi-exclamation-circle mr-1"></i>
              내용은 10자 이상 입력해주세요.
            </>
          )
          : boardContent.length > 1000
          ? (
            <>
              <i className="bi bi-exclamation-circle mr-1"></i>
              내용은 1000자 이내로 입력해주세요.
            </>
          )
          : '',
    }));
  }, [boardTitle, boardContent]);

  // 글자 수 색상 계산: 0글자이면 초록, 1자 이상이면서 범위 벗어나면 빨간색
  const contentCountColor =
    boardContent.length > 0 && (boardContent.length < 10 || boardContent.length > 1000)
      ? 'text-red-500'
      : 'text-[#7CBD00]';

  // 등록 버튼 활성화 여부
  const isSubmitDisabled =
    boardTitle.trim().length < 5 ||
    boardContent.length < 10 ||
    boardContent.length > 1000;

  // 제목 테두리 색상
  const titleBorderClass =
    messages.title
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-200 focus:ring-[#7CBD00]';

  // 내용 테두리 색상
  const contentBorderClass =
    messages.content
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-200 focus:ring-[#7CBD00]';

  // 등록 핸들러
  const handleSubmit = () => {
    // 제출 시 한 번 더 전체 검증
    const titleValid = boardTitle.trim().length >= 5;
    const contentValid = boardContent.length >= 10 && boardContent.length <= 1000;

    if (!titleValid) {
      setMessages(prev => ({
        ...prev,
        title: (
          <>
            <i className="bi bi-exclamation-circle mr-1"></i>
            제목은 5자 이상 입력해주세요.
          </>
        ),
      }));
    }
    if (!contentValid) {
      setMessages(prev => ({
        ...prev,
        content: boardContent.length < 10
          ? (
            <>
              <i className="bi bi-exclamation-circle mr-1"></i>
              내용은 10자 이상 입력해주세요.
            </>
          )
          : (
            <>
              <i className="bi bi-exclamation-circle mr-1"></i>
              내용은 1000자 이내로 입력해주세요.
            </>
          ),
      }));
    }
    if (!titleValid || !contentValid) return;

    setErrorMsg('');
    fetch(`http://localhost:8080/boards/${selectedTypeCode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ boardTitle, boardContent }),
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

        {/* 카드 */}
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
                  <option value="soccer">축구</option>
                  <option value="baseball">야구</option>
                  <option value="basketball">농구</option>
                  <option value="golf">골프</option>
                  <option value="ski">스키</option>
                  <option value="tennis">테니스</option>
                  <option value="badminton">배드민턴</option>
                  <option value="tabletennis">탁구</option>
                  <option value="running">러닝</option>
                  <option value="bicycle">자전거</option>
                  <option value="fitness">헬스</option>
                  <option value="yoga">요가</option>
                  <option value="pilates">필라테스</option>
                  <option value="aerobics">에어로빅</option>
                  <option value="swimming">수영</option>
                </select>
              </div>

              {/* 제목 */}
              <div className="mb-4 space-y-1.5">
                <label htmlFor="boardTitle" className="block text-xs sm:text-sm font-medium text-[#222222] mb-1.5">
                  제목
                </label>
                <input
                  id="boardTitle"
                  type="text"
                  value={boardTitle}
                  onChange={(e) => setBoardTitle(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm text-[#222222] placeholder:text-[#a7a7a7] focus:outline-none focus:ring-2 ${titleBorderClass}`}
                  placeholder="제목을 입력하세요 (5자 이상)"
                  maxLength={200}
                />
                {/* 제목 에러 메시지 */}
                {messages.title && (
                  <p className="text-sm text-red-500 flex items-center">
                    {messages.title}
                  </p>
                )}
              </div>

              {/* 내용 */}
              <div className="mb-5 space-y-1.5">
                <label htmlFor="boardContent" className="block text-xs sm:text-sm font-medium text-[#222222] mb-1.5">
                  내용
                </label>
                <div className="relative">
                  <textarea
                    id="boardContent"
                    value={boardContent}
                    onChange={(e) => setBoardContent(e.target.value)}
                    className={`w-full min-h-[300px] px-3 py-2 pb-8 border rounded-lg text-sm focus:outline-none focus:ring-2 resize-none ${contentBorderClass}`}
                    placeholder="내용을 입력해주세요 (10자 ~ 1000자)"
                    maxLength={1100}
                  />
                  {/* 실시간 글자 수 카운터 (우측 하단) */}
                  <span className={`absolute bottom-3 right-4 text-xs font-semibold ${contentCountColor}`}>
                    {boardContent.length} / 1000
                  </span>
                </div>
                {/* 내용 에러 메시지 */}
                {messages.content && (
                  <p className="text-sm text-red-500 flex items-center">
                    {messages.content}
                  </p>
                )}
              </div>

              {/* 버튼 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-[#222222] text-white hover:bg-[#444444] disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer">
                  <i className="bi bi-pencil-square text-[13px]"></i>
                  <span>등록</span>
                </button>
                <button
                  onClick={() => navigate(listPath)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border border-gray-300 text-[#222222] bg-white hover:bg-gray-50 cursor-pointer">
                  취소
                </button>
                {errorMsg && (
                  <p className="text-sm text-red-500">{errorMsg}</p>
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

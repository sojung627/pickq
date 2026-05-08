import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

const BoardDetail = () => {
  const { typeCode, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 데이터 상태 관리 (초기값 설정)
  const [board, setBoard] = useState(null);
  const [replies, setReplies] = useState([]);
  const [totalReplies, setTotalReplies] = useState(0);
  const [member, setMember] = useState(null); // 로그인 유저 정보
  const [sortType, setSortType] = useState('oldest');
  const [replyPage, setReplyPage] = useState(1);
  const [editReplyId, setEditReplyId] = useState(null);
  const [replyFormId, setReplyFormId] = useState(null);

  // URL 파라미터에서 이전 페이지 정보 가져오기
  const from = searchParams.get("from") || "";
  const page = searchParams.get("page") || "1";

  // URL 복사 함수
  const copyPostUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => alert('URL이 클립보드에 복사되었습니다.'))
      .catch(() => alert('URL 복사에 실패했습니다.'));
  };

  // 대댓글/수정 폼 토글
  const toggleEditForm = (rid) => setEditReplyId(editReplyId === rid ? null : rid);
  const toggleReplyForm = (rid) => setReplyFormId(replyFormId === rid ? null : rid);

  if (!board) return <div className="py-20 text-center">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">

        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/boards?from=${from}&page=${page}`)}
            className="inline-flex items-center text-xs sm:text-sm px-3 py-1.5 rounded-full text-[#767676] hover:text-[#222222] hover:bg-gray-50 border border-transparent transition-colors cursor-pointer"
          >
            <i className="bi bi-arrow-left-short me-1 text-[1rem]"></i>
            목록으로
          </button>
        </div>

        {/* Post Card */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] mb-6">
          <div className="p-6 sm:p-8">

            {/* Header */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <button
                onClick={() => navigate(`/boards?typeCode=${board.boardTypeCode}`)}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-[#767676] mb-3 cursor-pointer"
              >
                <i className="bi bi-collection-fill me-1 text-[12px]"></i>
                <span>{board.boardTypeName}</span>
              </button>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] leading-snug mb-4">
                {board.boardTitle}
              </h1>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-4 text-[#767676]">
                  <div className="flex items-center gap-2">
                    <i className="bi bi-person-circle text-[14px]"></i>
                    <span>{board.memNickname || board.memId}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#999999]">
                    <i className="bi bi-clock-history text-[13px]"></i>
                    <span>{board.boardRegdate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[#767676] justify-end">
                  <div className="flex items-center gap-1">
                    <i className="bi bi-eye text-[13px]"></i>
                    <span>{board.boardViewCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="bi bi-chat-dots text-[13px]"></i>
                    <span>{totalReplies}</span>
                  </div>
                  <button onClick={copyPostUrl} className="flex items-center gap-1 text-[#a7a7a7] hover:text-[#222222] transition-colors cursor-pointer">
                    <i className="bi bi-share text-[13px]"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* 본문 */}
            <div className="prose max-w-none mb-6">
              <div
                className="board-content text-sm sm:text-base leading-relaxed text-[#222222]"
                dangerouslySetInnerHTML={{ __html: board.boardContent }}
              />
            </div>

            {/* 좋아요 */}
            <div className="pt-6 border-t border-gray-100">
              <button className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-colors cursor-pointer ${
                board.isLiked
                ? 'bg-[#222222] border-[#222222] text-white hover:bg-[#444444]'
                : 'border-gray-200 text-[#222222] hover:bg-gray-50'
              }`}>
                <i className="bi bi-hand-thumbs-up-fill text-[13px]"></i>
                <span>좋아요</span>
                <span>{board.boardLike}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 수정/삭제 (작성자/관리자만) */}
        {member && (member.memIdx === board.memIdx || member.memRoleIdx === 2) && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => navigate(`/boards/${typeCode}/${id}/edit`)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs sm:text-sm border border-gray-300 text-[#222222] bg-white hover:bg-gray-50 cursor-pointer"
            >
              <i className="bi bi-pencil-fill text-[12px]"></i> <span>수정</span>
            </button>
            <button
              onClick={() => confirm('삭제하시겠습니까?') && console.log('삭제 로직')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs sm:text-sm border border-red-300 text-red-600 bg-white hover:bg-red-50 cursor-pointer"
            >
              <i className="bi bi-trash3-fill text-[12px]"></i> <span>삭제</span>
            </button>
          </div>
        )}

        {/* 댓글 카드 */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] mb-6">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-[#222222] mb-0">
                댓글 <span className="ml-1 text-[#7CBD00]">{totalReplies}</span>
              </h2>

              <div className="flex items-center gap-2 text-xs sm:text-sm">
                {['oldest', 'latest'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSortType(type)}
                    className={`px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
                      sortType === type
                      ? 'bg-[#222222] border-[#222222] text-white'
                      : 'border-gray-300 text-[#222222] bg-white hover:bg-gray-50'
                    }`}
                  >
                    {type === 'oldest' ? '등록순' : '최신순'}
                  </button>
                ))}
              </div>
            </div>

            {/* 댓글 리스트 */}
            <div className="space-y-4">
              {replies.map((r) => (
                <div key={r.replyIdx} className="border border-gray-100 rounded-lg bg-white px-3 py-3 sm:px-4 sm:py-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    {/* depth 들여쓰기 */}
                    <span style={{ marginLeft: `${r.replyDepth * 12}px` }}>
                      {r.replyDepth > 0 && <span className="text-[#7CBD00] mr-1">↳</span>}
                    </span>

                    <div className="flex-1">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                            <i className="bi bi-person-fill text-[#a7a7a7]"></i>
                          </div>
                          <div>
                            <div className="text-[13px] font-semibold text-[#222222]">{r.memNickname || r.memId}</div>
                            <div className="text-[11px] text-[#a7a7a7]">{r.replyRegdate}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                          <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] sm:text-xs border border-gray-300 bg-white text-[#767676] hover:bg-gray-50 cursor-pointer">
                            <i className="bi bi-hand-thumbs-up-fill text-[11px]"></i> <span>{r.replyLike}</span>
                          </button>
                          {member && (member.memIdx === r.memIdx || member.memRoleIdx === 2) && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => toggleEditForm(r.replyIdx)} className="inline-flex items-center px-2 py-1 rounded-md text-[11px] sm:text-xs border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer">✏️</button>
                              <button onClick={() => confirm('삭제하시겠습니까?')} className="inline-flex items-center px-2 py-1 rounded-md text-[11px] sm:text-xs border border-red-300 bg-white text-red-600 hover:bg-red-50 cursor-pointer">✕</button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="reply-content mb-2 text-sm text-[#222222]">{r.replyContent}</div>

                      {/* 인라인 수정 폼 */}
                      {editReplyId === r.replyIdx && (
                        <div className="mt-2">
                          <textarea className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-[#7CBD00]" rows="2" defaultValue={r.replyContent}></textarea>
                          <div className="mt-1 flex gap-1">
                            <button className="px-3 py-1 bg-[#7CBD00] text-white text-xs rounded-md">저장</button>
                            <button onClick={() => setEditReplyId(null)} className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-md">취소</button>
                          </div>
                        </div>
                      )}

                      {/* 답글 버튼 & 폼 */}
                      <div className="mt-1 flex items-center gap-3 text-[11px] sm:text-xs text-[#767676]">
                        {member ? (
                          <button onClick={() => r.replyDepth < 3 ? toggleReplyForm(r.replyIdx) : alert('더 이상 답글을 작성할 수 없습니다.')} className="text-[#7CBD00] cursor-pointer">↩ 답글</button>
                        ) : (
                          <button onClick={() => navigate('/members/login')} className="text-[#7CBD00] cursor-pointer">↩ 답글</button>
                        )}
                      </div>

                      {replyFormId === r.replyIdx && (
                        <div className="mt-2">
                          <textarea className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-[#7CBD00]" rows="2" placeholder="답글을 입력하세요"></textarea>
                          <div className="mt-1 flex gap-1">
                            <button className="px-3 py-1 bg-[#7CBD00] text-white text-xs rounded-md">등록</button>
                            <button onClick={() => setReplyFormId(null)} className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-md">취소</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 댓글 작성 */}
        <div className="mt-6">
          {member ? (
            <div className="reply-form">
              <textarea className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-[#7CBD00] focus:outline-none mb-2" rows="3" placeholder="댓글을 입력하세요"></textarea>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-[#222222] text-white hover:bg-[#444444] cursor-pointer">
                <i className="bi bi-chat-dots me-1 text-[13px]"></i> 댓글 등록
              </button>
            </div>
          ) : (
            <div className="mt-2 text-[13px] text-[#767676]">
              댓글을 작성하려면 <button onClick={() => navigate('/members/login')} className="text-[#222222] underline-offset-2 hover:underline cursor-pointer">로그인</button> 이 필요합니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardDetail;
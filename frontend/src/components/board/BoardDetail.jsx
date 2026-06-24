import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Profile from '../profile/Profile';

const BoardDetail = () => {
  const { boardTypeCode, boardIdx } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [replies, setReplies] = useState([]);
  const [totalReplies, setTotalReplies] = useState(0);
  const [member, setMember] = useState(null);
  const [sortType, setSortType] = useState('oldest');
  const [replyPage, setReplyPage] = useState(1);
  const [editReplyId, setEditReplyId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [replyFormId, setReplyFormId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [childReplyContent, setChildReplyContent] = useState('');
  const [likedReplies, setLikedReplies] = useState(new Set());
  const [profileModal, setProfileModal] = useState(null);
  const [totalReplyPages, setTotalReplyPages] = useState(1);

  const fetchReplies = () => {
    fetch(`/boards/${boardTypeCode}/${boardIdx}/replies?sort=${sortType}&page=${replyPage}`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        setReplies(data.replies || []);
        setTotalReplies(data.totalReplies || 0);
        setTotalReplyPages(data.totalPages || 1);
      })
      .catch(err => console.error("댓글 조회 에러:", err));
  };

  const from = searchParams.get("from") || "";
  const page = searchParams.get("page") || "1";

  const copyPostUrl = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('URL이 클립보드에 복사되었습니다.'))
      .catch(() => alert('URL 복사에 실패했습니다.'));
  };

  const toggleEditForm = (rid, content = '') => {
    setEditReplyId(editReplyId === rid ? null : rid);
    setEditContent(content);
  };
  const toggleReplyForm = (rid) => setReplyFormId(replyFormId === rid ? null : rid);

  const openProfileModal = async (memIdx) => {
    if (!memIdx) return;

    try {
      const response = await fetch(`/mypage/profile/modal/${memIdx}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`프로필 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      if (!data?.profile) {
        throw new Error('프로필 데이터가 없습니다.');
      }

      setProfileModal(data);
    } catch (error) {
      console.error('프로필 조회 에러:', error);
    }
  };

  useEffect(() => {
    fetch("/mypage/info", { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(data => setMember(data))
      .catch(() => setMember(null));

    fetch(`/boards/${boardTypeCode}/${boardIdx}`)
      .then(res => res.json())
      .then(data => setBoard(data))
      .catch(err => console.error("게시글 상세 조회 에러:", err));
  }, [boardTypeCode, boardIdx]);

  useEffect(() => {
    fetchReplies();
  }, [boardTypeCode, boardIdx, sortType, replyPage]);

  const handleLike = () => {
    if (!member) { navigate('/members/login'); return; }
    fetch(`/boards/${boardTypeCode}/${boardIdx}/like`, {
      method: 'POST',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setBoard(prev => ({ ...prev, boardLike: data.boardLike, isLiked: data.isLiked })))
      .catch(err => console.error("좋아요 에러:", err));
  };

  const handleReplySubmit = () => {
    if (!replyContent.trim()) return;
    fetch(`/boards/${boardTypeCode}/${boardIdx}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ replyContent })
    })
      .then(res => res.json())
      .then(() => {
        setReplyContent('');
        goToReplyAfterSubmit();
      })
      .catch(err => console.error("댓글 등록 에러:", err));
  };

  const goToReplyAfterSubmit = () => {
    fetch(`/boards/${boardTypeCode}/${boardIdx}/replies?sort=${sortType}&page=1`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        const newTotalPages = data.totalPages || 1;

        if (sortType === 'oldest') {
          if (replyPage === newTotalPages) {
            fetchReplies();
          } else {
            setReplyPage(newTotalPages);
          }
        } else if (sortType === 'latest') {
          if (replyPage === 1) {
            fetchReplies();
          } else {
            setReplyPage(1);
          }
        }
      })
      .catch(err => console.error("댓글 목록 갱신 에러:", err));
  };

  const handleReplyLike = (rid) => {
    if (!member) { navigate('/members/login'); return; }
    fetch(`/boards/replies/${rid}/like`, {
      method: 'POST',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setLikedReplies(prev => {
          const next = new Set(prev);
          next.has(rid) ? next.delete(rid) : next.add(rid);
          return next;
        });
        setReplies(prev => prev.map(r =>
          r.replyIdx === rid ? { ...r, replyLike: data.replyLike } : r
        ));
      })
      .catch(err => console.error("댓글 좋아요 에러:", err));
  };

  const handleReplyEdit = (rid) => {
    if (!editContent.trim()) return;
    fetch(`/boards/replies/${rid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ replyContent: editContent })
    })
      .then(res => res.json())
      .then(() => {
        setEditReplyId(null);
        setEditContent('');
        fetchReplies();
      })
      .catch(err => console.error("댓글 수정 에러:", err));
  };

  const handleReplyDelete = (rid) => {
    if (!confirm('삭제하시겠습니까?')) return;
    fetch(`/boards/replies/${rid}`, {
      method: 'DELETE',
      credentials: 'include'
    })
      .then(() => fetchReplies())
      .catch(err => console.error("댓글 삭제 에러:", err));
  };

  const handleChildReplySubmit = (parentIdx) => {
    if (!childReplyContent.trim()) return;
    fetch(`/boards/${boardTypeCode}/${boardIdx}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ replyContent: childReplyContent, replyParentIdx: parentIdx })
    })
      .then(res => res.json())
      .then(() => {
        setChildReplyContent('');
        setReplyFormId(null);
        goToReplyAfterSubmit();
      })
      .catch(err => console.error("답글 등록 에러:", err));
  };

  const handleBoardDelete = async () => {
    if (!confirm('삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/boards/${boardTypeCode}/${boardIdx}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(errorBody || `게시글 삭제 실패: ${response.status}`);
      }

      navigate(`/boards?from=${from}&page=${page}`);
    } catch (error) {
      console.error('게시글 삭제 에러:', error);
      alert('게시글 삭제 중 오류가 발생했습니다.');
    }
  };

  if (!board) return <div className="py-20 text-center">로딩 중...</div>;

  const isOwner = Number(member?.memIdx) === Number(board.memIdx);
  const isAdmin = Number(member?.memRoleIdx) === 2;

  const getProfileImgUrl = (memProfileImg, memIdx) => {
    if (memProfileImg) {
      return `/uploads/profile/${memProfileImg}`;
    }
    const numericMemIdx = Number(memIdx);
    const defaultNum = Number.isFinite(numericMemIdx)
      ? (numericMemIdx % 5) + 1
      : 1;
    return `/images/profile/profile_default_${defaultNum}.png`;
  };

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
                    <img
                      src={getProfileImgUrl(board.memProfileImg, board.memIdx)}
                      alt="프로필"
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => {
                        const numericMemIdx = Number(board.memIdx);
                        const fallback = Number.isFinite(numericMemIdx)
                          ? (numericMemIdx % 5) + 1
                          : 1;
                        e.target.src = `/images/profile/profile_default_${fallback}.png`;
                      }}
                    />
                    <span
                      className="cursor-pointer hover:text-[#7CBD00]"
                      onClick={() => openProfileModal(board.memIdx)}
                    >
                      {board.memNickname || board.memId}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[#999999]">
                    <i className="bi bi-clock-history text-[13px]"></i>
                    <span>{board.boardRegdate ? board.boardRegdate.split('T')[0] : ''}</span>
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
                className="board-content text-sm sm:text-base leading-relaxed text-[#222222] whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: board.boardContent }}
              />
            </div>

            {/* 좋아요 */}
            <div className="pt-6 border-t border-gray-100">
              <button onClick={handleLike} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-colors cursor-pointer ${
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
        {member && (isOwner || isAdmin) && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => navigate(`/boards/${boardTypeCode}/${boardIdx}/edit`)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs sm:text-sm border border-gray-300 text-[#222222] bg-white hover:bg-gray-50 cursor-pointer"
            >
              <i className="bi bi-pencil-fill text-[12px]"></i> <span>수정</span>
            </button>
            <button
              onClick={handleBoardDelete}
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
                    onClick={() => {
                      setSortType(type);
                      setReplyPage(1);
                    }}
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
              {replies.map((r) => {
                const isReplyOwner = Number(member?.memIdx) === Number(r.memIdx);
                const isReplyLiked = likedReplies.has(r.replyIdx);
                return (
                  <div key={r.replyIdx} className="border border-gray-100 rounded-lg bg-white px-3 py-3 sm:px-4 sm:py-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <span style={{ marginLeft: `${r.replyDepth * 12}px` }}>
                        {r.replyDepth > 0 && <span className="text-[#7CBD00] mr-1">↳</span>}
                      </span>
                      <div className="flex-1">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={getProfileImgUrl(r.memProfileImg, r.memIdx)}
                              alt="프로필"
                              className="h-8 w-8 rounded-full object-cover bg-gray-100"
                              onError={(e) => {
                                const numericMemIdx = Number(r.memIdx);
                                const fallback = Number.isFinite(numericMemIdx)
                                  ? (numericMemIdx % 5) + 1
                                  : 1;
                                e.target.src = `/images/profile/profile_default_${fallback}.png`;
                              }}
                            />
                            <div>
                              <div
                                className="text-[13px] font-semibold text-[#222222] cursor-pointer hover:text-[#7CBD00]"
                                onClick={() => openProfileModal(r.memIdx)}
                              >
                                {r.memNickname || r.memId}
                              </div>
                              <div className="text-[11px] text-[#a7a7a7]">
                                {r.replyRegdate ? r.replyRegdate.split('T')[0] : ''}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <button
                              onClick={() => handleReplyLike(r.replyIdx)}
                              className={`inline-flex items-center gap-1 px-2 h-[28px] rounded-md text-[11px] sm:text-xs font-semibold border border-gray-300 transition-colors cursor-pointer ${
                                isReplyLiked
                                  ? 'bg-[#222222] border-[#222222] text-white hover:bg-[#444444]'
                                  : 'border-gray-200 text-[#222222] hover:bg-gray-50'
                              }`}>
                              <i className="bi bi-hand-thumbs-up-fill text-[11px]"></i>
                              <span>{r.replyLike}</span>
                            </button>
                            {member && (isReplyOwner || isAdmin) && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => toggleEditForm(r.replyIdx, r.replyContent)}
                                  className="inline-flex items-center gap-1 px-2 h-[28px] rounded-md text-[11px] sm:text-xs border border-gray-300 bg-white text-[#767676] hover:bg-gray-50 cursor-pointer">
                                  <i className="bi bi-pencil-fill text-[12px]"></i>
                                </button>
                                <button
                                  onClick={() => handleReplyDelete(r.replyIdx)}
                                  className="inline-flex items-center gap-1 px-2 h-[28px] rounded-md text-[11px] sm:text-xs border border-gray-300 bg-white text-[#ff4d4f] hover:bg-red-50 cursor-pointer">
                                  <i className="bi bi-x-lg text-[12px]"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="reply-content mb-2 text-sm text-[#222222] whitespace-pre-wrap">
                          {r.replyContent}
                        </div>
                        {editReplyId === r.replyIdx && (
                          <div className="mt-2">
                            <textarea
                              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-[#7CBD00]"
                              rows="2"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                            />
                            <div className="mt-1 flex gap-1">
                              <button
                                onClick={() => handleReplyEdit(r.replyIdx)}
                                className="px-3 py-1 bg-[#7CBD00] text-white text-xs rounded-md">저장</button>
                              <button
                                onClick={() => setEditReplyId(null)}
                                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-md">취소</button>
                            </div>
                          </div>
                        )}
                        <div className="mt-1 flex items-center gap-3 text-[11px] sm:text-xs text-[#767676]">
                          {member ? (
                            r.replyDepth < 3 && (
                              <button onClick={() => toggleReplyForm(r.replyIdx)} className="text-[#7CBD00] cursor-pointer">↩ 답글</button>
                            )
                          ) : (
                            <button onClick={() => navigate('/members/login')} className="text-[#7CBD00] cursor-pointer">↩ 답글</button>
                          )}
                        </div>
                        {replyFormId === r.replyIdx && (
                          <div className="mt-2">
                            <textarea
                              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-[#7CBD00]"
                              rows="2"
                              placeholder="답글을 입력하세요"
                              value={childReplyContent}
                              onChange={(e) => setChildReplyContent(e.target.value)}
                            />
                            <div className="mt-1 flex gap-1">
                              <button
                                onClick={() => handleChildReplySubmit(r.replyIdx)}
                                className="px-3 py-1 bg-[#7CBD00] text-white text-xs rounded-md">등록</button>
                              <button
                                onClick={() => { setReplyFormId(null); setChildReplyContent(''); }}
                                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-md">취소</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 댓글 페이지네이션 컴포넌트 추가 (가로 드래그 및 오버플로우 처리 가능) */}
            {totalReplyPages > 1 && (
              <div className="mt-6 flex justify-center border-t border-gray-50 pt-4">
                <div className="flex gap-1 overflow-x-auto max-w-full pb-2 scrollbar-none select-none touch-pan-x">
                  <button
                    disabled={replyPage === 1}
                    onClick={() => setReplyPage(prev => Math.max(1, prev - 1))}
                    className="px-2 py-1 rounded border text-xs disabled:opacity-40 cursor-pointer bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  >
                    이전
                  </button>
                  {Array.from({ length: totalReplyPages }, (_, idx) => idx + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setReplyPage(pageNum)}
                      className={`px-3 py-1 rounded border text-xs transition-colors cursor-pointer ${
                        replyPage === pageNum
                          ? 'bg-[#222222] border-[#222222] text-white font-semibold'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    disabled={replyPage === totalReplyPages}
                    onClick={() => setReplyPage(prev => Math.min(totalReplyPages, prev + 1))}
                    className="px-2 py-1 rounded border text-xs disabled:opacity-40 cursor-pointer bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 하단 댓글 작성 */}
        <div className="mt-6">
          {member ? (
            <div className="reply-form">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-[#7CBD00] focus:outline-none mb-2"
                rows="3"
                placeholder="댓글을 입력하세요"/>
              <button
                onClick={handleReplySubmit}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-[#222222] text-white hover:bg-[#444444] cursor-pointer">
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

      {profileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setProfileModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <Profile
              profile={profileModal.profile}
              reviews={profileModal.reviews}
              loginUser={member}
              onClose={() => setProfileModal(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardDetail;
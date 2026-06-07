import { useNavigate } from "react-router-dom";

export default function Profile({
  profile,
  reviews,
  profileBackUrl,
  profileChatroomIdx,
  loginUser,
  from,
  auctionId,
  openChatPopup,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (profileBackUrl) {
      navigate(profileBackUrl);
      return;
    }
    navigate(-1);
  };

  const moveReviewDetail = (reviewIdx) => {
    const params = new URLSearchParams({
      fromProfile: "true",
      memIdx: profile.memIdx,
    });

    if (from) {
      params.append("from", from);
    }

    if (auctionId) {
      params.append("auctionId", auctionId);
    }

    navigate(`/reviews/detail/${reviewIdx}?${params.toString()}`);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div className="mb-4 md:mb-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <span>←</span>
          <span>뒤로</span>
        </button>
      </div>

      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
        {profile?.maskedMemId} 님의 프로필
      </h1>

      <article className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">

          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">

              {profile?.memImg ? (
                <img
                  src={`/images/profile/${profile.memImg}`}
                  alt="프로필 이미지"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl text-gray-400">
                  👤
                </span>
              )}

            </div>

            {profileChatroomIdx &&
              loginUser &&
              loginUser.memIdx !== profile.memIdx && (
                <button
                  type="button"
                  onClick={() => openChatPopup(profileChatroomIdx)}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#222222] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#333333] transition-colors"
                >
                  <i className="bi bi-chat-dots"></i>
                  대화하기
                </button>
              )}
          </div>

          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2 mb-2">

              {profile?.gradeName &&
                !["basic", "normal"].includes(
                  profile.gradeName.toLowerCase()
                ) && (
                  <img
                    src={`/images/common/icon_${profile.gradeName.toLowerCase()}.png`}
                    alt="grade"
                    className="w-5 h-5 object-contain"
                  />
                )}

              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                {profile?.memNickname ||
                  profile?.maskedMemId}
              </h2>
            </div>

            <p className="text-sm md:text-base text-gray-600 leading-relaxed min-h-[2.25rem]">
              {profile?.memIntro ||
                "소개글이 아직 없습니다."}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span>
                평균 별점{" "}
                <strong className="text-amber-600">
                  {(profile?.avgRating ?? 0).toFixed(1)}
                </strong>
              </span>

              <span>
                리뷰{" "}
                <strong>
                  {profile?.reviewCount ?? 0}
                </strong>
                개
              </span>
            </div>
          </div>

        </div>
      </article>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-bold text-gray-900">
            거래 후기
          </h3>
        </div>

        {reviews?.length > 0 ? (
          <div className="space-y-3">

            {reviews.map((review) => (
              <article
                key={review.reviewIdx}
                className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">

                  <div className="text-sm text-amber-600 font-semibold">
                    ★ {(review.reviewStar ?? 0).toFixed(1)}
                  </div>

                  <div className="text-xs text-gray-500">
                    {review.reviewRegdate?.slice(0, 10)}
                  </div>

                </div>

                <button
                  onClick={() =>
                    moveReviewDetail(review.reviewIdx)
                  }
                  className="block w-full text-left text-sm md:text-base font-semibold text-gray-900 hover:text-emerald-700 truncate"
                >
                  {review.reviewTitle}
                </button>

                <p className="mt-2 text-sm text-gray-600 truncate">
                  거래 상품:{" "}
                  {review.itemName ||
                    review.auctionTitle}
                </p>
              </article>
            ))}

          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
            아직 등록된 거래 후기가 없습니다.
          </div>
        )}
      </section>
    </section>
  );
}
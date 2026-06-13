import { useNavigate } from "react-router-dom";

export function FailPage() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const errorCode = searchParams.get("code");
  const errorMessage = searchParams.get("message");

  return (
    <div className="wrapper w-100">
      <div className="flex-column align-center w-100 max-w-540">
        <h2 className="title">결제를 실패했어요</h2>
        <div className="response-section w-100">
          <div className="flex justify-between">
            <span className="response-label">code</span>
            <span className="response-text">{errorCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="response-label">message</span>
            <span className="response-text">{errorMessage}</span>
          </div>
        </div>
        <div className="w-100 button-group">
          <div className="btn w-100" onClick={() => navigate(-1)}>
            다시 시도하기
          </div>
        </div>
      </div>
    </div>
  );
}
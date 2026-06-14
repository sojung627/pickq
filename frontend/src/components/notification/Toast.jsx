import { useNavigate } from 'react-router-dom';

export default function Toast({ toast, onRemove }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (toast.targetUrl) navigate(toast.targetUrl);
    onRemove(toast.id);
  };

  const [prefix, content] = toast.message?.includes(': ')
    ? [toast.message.substring(0, toast.message.indexOf(': ') + 1),
       toast.message.substring(toast.message.indexOf(': ') + 2)]
    : [toast.message, null];

  return (
    <div
      onClick={handleClick}
      style={{
        background: 'white',
        border: '0.5px solid #e5e7eb',
        borderRadius: '12px',
        padding: '12px 16px',
        minWidth: '280px',
        maxWidth: '340px',
        cursor: toast.targetUrl ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}
    >
      <span style={{ fontSize: '18px', lineHeight: 1.3 }}>🔔</span>
      <div style={{ flex: 1 }}>
        {toast.title && (
          <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#111' }}>
            {toast.title}
          </p>
        )}
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 400, color: '#111' }}>{prefix}</p>
        {content && (
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#555' }}>{content}</p>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(toast.id); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '16px', color: '#aaa', lineHeight: 1, padding: 0
        }}
      >×</button>
    </div>
  );
}
export default function MessageRow({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`msg-row ${isUser ? "user" : "system"}`}>
      <div className={`msg-avatar ${isUser ? "user" : "system"}`}>
        {isUser ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 12a4 4 0 100-8 4 4 0 000 8z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M4 21c0-4 3.6-6 8-6s8 2 8 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="8" width="16" height="11" rx="3" stroke="currentColor" strokeWidth="1.7" />
            <path d="M12 8V4m-3 0h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="9" cy="13.5" r="1.2" fill="currentColor" />
            <circle cx="15" cy="13.5" r="1.2" fill="currentColor" />
          </svg>
        )}
      </div>
      <div className="msg-bubble">{content}</div>
    </div>
  );
}

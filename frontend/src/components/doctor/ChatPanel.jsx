import { useEffect, useRef, useState } from "react";
import MessageRow from "./MessageRow";

const MAX_LEN = 200;
// heuristic demo: chặn câu hỏi có dấu tiếng Việt (chỉ chấp nhận tiếng Anh)
const VIETNAMESE_DIACRITICS =
  /[àáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i;

export default function ChatPanel({ session, isTyping, onSend, onInvalidQuestion }) {
  const [value, setValue] = useState("");
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [session?.conversation, isTyping]);

  const len = value.length;
  const over = len > MAX_LEN;
  const canSend = value.trim().length > 0 && !over;

  const handleSend = () => {
    const question = value.trim();
    if (!canSend) return;
    if (VIETNAMESE_DIACRITICS.test(question)) {
      onInvalidQuestion?.("Câu hỏi phải được nhập bằng tiếng Anh");
      return;
    }
    onSend(question);
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-card">
      <div className="chat-head">
        <div className="chat-head-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="8" width="16" height="11" rx="3" stroke="#1D5FBF" strokeWidth="1.7" />
            <path d="M12 8V4m-3 0h6" stroke="#1D5FBF" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          Hỏi đáp về ảnh (VQA)
        </div>
        {!session.editable && <span className="badge badge-neutral">Chỉ xem lại</span>}
      </div>

      <div className="chat-body" ref={bodyRef}>
        {session.conversation.length === 0 && !isTyping && (
          <p className="chat-empty">Chưa có câu hỏi nào cho phiên này.</p>
        )}

        {session.conversation.map((m, i) => (
          <MessageRow key={i} role={m.role} content={m.content} />
        ))}

        {isTyping && (
          <div className="msg-row system">
            <div className="msg-avatar system">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="8" width="16" height="11" rx="3" stroke="currentColor" strokeWidth="1.7" />
                <path d="M12 8V4m-3 0h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </div>
            <div className="msg-bubble">
              <div className="msg-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {session.editable ? (
        <div className="chat-input-row">
          <div className="chat-input-wrap">
            <textarea
              rows="1"
              placeholder="Nhập câu hỏi bằng tiếng Anh...."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="send-btn" disabled={!canSend} onClick={handleSend}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className={`chat-input-foot ${over ? "over" : ""}`}>
            <span>Chỉ hỗ trợ tiếng Anh · tối đa 200 ký tự</span>
            <span>{len}/{MAX_LEN}</span>
          </div>
        </div>
      ) : (
        <div className="readonly-banner">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="9" width="16" height="10" rx="2" stroke="#5C6B85" strokeWidth="1.6" />
            <path d="M8 9V6a4 4 0 018 0v3" stroke="#5C6B85" strokeWidth="1.6" />
          </svg>
          Bạn đang xem lại phiên cũ — không thể tiếp tục hỏi đáp. Hãy chọn phiên mới nhất để trò chuyện.
        </div>
      )}
    </div>
  );
}

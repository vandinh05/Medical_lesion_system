import { useEffect, useRef, useState } from "react";

export default function RenameModal({ open, session, onClose, onConfirm }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && session) {
      setValue(session.name ?? "");
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 60);
    }
  }, [open, session]);

  const handleConfirm = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <div
      className={`modal-backdrop ${open ? "open" : ""}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <h3>Đổi tên phiên</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="modal-sub">Đặt tên dễ nhận biết cho phiên phân tích này.</p>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="renameInput">Tên phiên</label>
          <input
            id="renameInput"
            type="text"
            maxLength={60}
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          />
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";

export default function SessionCard({ session, active, onSelect, onRename, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // đóng dropdown khi click ra ngoài
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  return (
    <div className={`sess-card ${active ? "active" : ""}`} onClick={() => onSelect(session.id)}>
      <div className={`sess-thumb ${session.hasPolyp ? "polyp" : "clear"}`}>
        <div className="thumb-dot"></div>
      </div>

      <div className="sess-info">
        <div className="sess-name">{session.name}</div>
        <div className="sess-time">{session.time}</div>
      </div>

      <button
        className="sess-menu-btn"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((v) => !v);
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="5" r="1.6" fill="currentColor" />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" />
          <circle cx="12" cy="19" r="1.6" fill="currentColor" />
        </svg>
      </button>

      <div className={`sess-dropdown ${menuOpen ? "open" : ""}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(false);
            onRename(session.id);
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M4 20h4L20 8l-4-4L4 16v4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          Đổi tên
        </button>
        <button
          className="danger"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(false);
            onDelete(session.id);
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 7h16M9 7V4h6v3m-8 0l1 13h8l1-13"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Xóa phiên
        </button>
      </div>
    </div>
  );
}

import SessionCard from "./SessionCard";
import logo from "../../assets/logo.png";

export default function Sidebar({
  sessions,
  activeId,
  onSelectSession,
  onRenameSession,
  onDeleteSession,
  onOpenUpload,
  onLogout,
}) {
  return (
    <aside className="sidebar">
      <div className="sb-head">
        <div className="sb-mark">
          <img src={logo} alt="PolypLens" />
        </div>
        <div className="sb-brand">
          Polyp<span>Lens</span>
        </div>
      </div>

      <div className="sb-upload">
        <button className="btn-upload" onClick={onOpenUpload}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4v11m0-11l-4 4m4-4l4 4M5 18h14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Tải ảnh mới
        </button>
      </div>

      <div className="sb-section-label">Phiên gần đây</div>

      <div className="sb-list">
        {sessions.length === 0 ? (
          <div className="sb-list-empty">Chưa có phiên nào</div>
        ) : (
          sessions.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              active={s.id === activeId}
              onSelect={onSelectSession}
              onRename={onRenameSession}
              onDelete={onDeleteSession}
            />
          ))
        )}
      </div>

      <div className="sb-foot">
        <div className="sb-avatar">
          {(sessionStorage.getItem("pl_username") || "BS").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="sb-user-name">{sessionStorage.getItem("pl_username") || "—"}</div>
          <div className="sb-user-role">Doctor</div>
        </div>
        <button className="sb-logout" title="Đăng xuất" onClick={onLogout}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 17l5-5-5-5M20 12H9M12 4H6a2 2 0 00-2 2v12a2 2 0 002 2h6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </aside>
  );
}
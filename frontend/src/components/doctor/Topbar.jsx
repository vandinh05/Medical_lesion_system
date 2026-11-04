export default function Topbar({ session, onTitleClick }) {
  if (!session) return <div className="topbar" style={{ display: "none" }} />;

  return (
    <div className="topbar">
      <div className="topbar-left">
        <span className="sess-title" onClick={onTitleClick}>
          {session.name}
        </span>
        <span className="topbar-meta">Tải lên lúc {session.time}</span>
      </div>
      <div className="topbar-right">
        {session.hasPolyp ? (
          <span className="badge badge-danger">Polyp detected</span>
        ) : (
          <span className="badge badge-success">No polyp detected</span>
        )}
      </div>
    </div>
  );
}

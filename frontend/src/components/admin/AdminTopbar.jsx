import logo from "../../assets/logo.png";

export default function AdminTopbar({ onLogout }) {
  return (
    <div className="admin-topbar">
      <div className="admin-brand">
        <div className="admin-mark">
          <img src={logo} alt="PolypLens" />
        </div>

        <div className="admin-brand-name">
          Polyp<span>Lens</span> — Admin
        </div>
      </div>

      <div className="admin-topbar-right">
        <div className="admin-user">
          <div className="admin-avatar">AD</div>
          <span>Admin</span>
        </div>
        <button className="admin-logout" onClick={onLogout}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 17l5-5-5-5M20 12H9M12 4H6a2 2 0 00-2 2v12a2 2 0 002 2h6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

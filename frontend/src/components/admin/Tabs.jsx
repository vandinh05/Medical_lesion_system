export default function Tabs({ activeTab, onChange, userCount }) {
  return (
    <div className="tabs">
      <button
        className={`tab-btn ${activeTab === "accounts" ? "active" : ""}`}
        onClick={() => onChange("accounts")}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.7" />
          <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        Quản lý tài khoản <span className="tab-count">{userCount}</span>
      </button>

      <button
        className={`tab-btn ${activeTab === "audit" ? "active" : ""}`}
        onClick={() => onChange("audit")}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path d="M9 12h6M9 16h6M9 8h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
        </svg>
        Audit Log
      </button>
    </div>
  );
}

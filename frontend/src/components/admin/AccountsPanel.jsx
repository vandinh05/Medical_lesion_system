import { useMemo, useState } from "react";
import SearchInput from "./SearchInput";

export default function AccountsPanel({ users, onOpenCreate, onDeleteUser }) {
  const [search, setSearch] = useState("");

  const rows = useMemo(
    () => users.filter((u) => u.username.toLowerCase().includes(search.toLowerCase())),
    [users, search],
  );

  return (
    <div className="tab-panel active">
      <div className="panel-head">
        <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo tên đăng nhập…" />
        <button className="btn btn-primary" onClick={onOpenCreate}>
          + Tạo tài khoản mới
        </button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 56 }}>STT</th>
              <th>Username</th>
              <th>Vai trò</th>
              <th>Ngày tạo</th>
              <th style={{ width: 90 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--text-400)", padding: 32 }}>
                  Không tìm thấy tài khoản phù hợp
                </td>
              </tr>
            ) : (
              rows.map((u, i) => (
                <tr key={u.id}>
                  <td className="mono">{String(i + 1).padStart(2, "0")}</td>
                  <td style={{ fontWeight: 600 }}>{u.username}</td>
                  <td>
                    <span className={`role-pill ${u.role}`}>{u.role}</span>
                  </td>
                  <td className="mono">{u.created}</td>
                  <td>
                    <button className="action-pill" title="Xóa tài khoản" onClick={() => onDeleteUser(u.id)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M4 7h16M9 7V4h6v3m-8 0l1 13h8l1-13"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import SearchInput from "./SearchInput";

export default function AuditPanel({ auditLogs }) {
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const f = search.toLowerCase();
    return auditLogs.filter(
      (l) => l.user.toLowerCase().includes(f) || l.action.toLowerCase().includes(f),
    );
  }, [auditLogs, search]);

  return (
    <div className="tab-panel active">
      <div className="panel-head">
        <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo username hoặc hành động…" />
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 150 }}>Thời gian</th>
              <th>Username</th>
              <th>Hành động</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "var(--text-400)", padding: 32 }}>
                  Không có log phù hợp
                </td>
              </tr>
            ) : (
              rows.map((l, i) => (
                <tr key={i}>
                  <td className="mono">{l.time}</td>
                  <td style={{ fontWeight: 600 }}>{l.user}</td>
                  <td>
                    <div className="audit-action">
                      <span className={`audit-dot ${l.status}`}></span>
                      {l.action}
                    </div>
                  </td>
                  <td style={{ color: "var(--text-500)" }}>{l.detail}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

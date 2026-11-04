import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost } from "../lib/api";

function formatDate(iso) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(
    2,
    "0",
  )}/${d.getFullYear()}`;
}

function formatLogTime(iso) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(
    2,
    "0",
  )} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function mapUser(u) {
  return { id: u.user_id, username: u.username, role: u.role, created: formatDate(u.created_at) };
}

// Maps the 8 backend action_type values to the Vietnamese labels +
// dot color the AuditPanel UI already expects.
const ACTION_LABELS = {
  login_success: "Đăng nhập thành công",
  login_failed: "Đăng nhập thất bại",
  logout: "Đăng xuất",
  upload_image: "Upload ảnh",
  delete_session: "Xóa phiên",
  rename_session: "Đổi tên phiên",
  create_account: "Tạo tài khoản",
  delete_account: "Xóa tài khoản",
};

const ACTION_STATUS = {
  login_success: "ok",
  login_failed: "fail",
  logout: "neutral",
  upload_image: "neutral",
  delete_session: "fail",
  rename_session: "neutral",
  create_account: "ok",
  delete_account: "fail",
};

function mapLog(l) {
  return {
    time: formatLogTime(l.timestamp),
    user: l.username,
    action: ACTION_LABELS[l.action_type] || l.action_type,
    detail: l.details || "—",
    status: ACTION_STATUS[l.action_type] || "neutral",
  };
}

/**
 * Quản lý toàn bộ state của Admin console: danh sách tài khoản, audit log,
 * tạo/xóa tài khoản. Gọi API thật qua lib/api.js; sau mỗi thay đổi thì
 * reload lại danh sách từ server (đơn giản, luôn đồng bộ với DB).
 */
export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [usersData, logsData] = await Promise.all([
        apiGet("/api/admin/users"),
        apiGet("/api/admin/audit-logs"),
      ]);
      setUsers(usersData.map(mapUser));
      setAuditLogs(logsData.map(mapLog));
    } catch (err) {
      setError(err.message || "Không tải được dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const isUsernameTaken = useCallback(
    (username) => users.some((u) => u.username === username),
    [users],
  );

  // Note: real create requires a password (min 8 chars), unlike the old
  // mock which only took (username, role).
  const createUser = useCallback(
    async (username, password, role) => {
      const created = await apiPost("/api/admin/users", { username, password, role });
      await reload();
      return mapUser(created);
    },
    [reload],
  );

  const deleteUser = useCallback(
    async (id) => {
      await apiDelete(`/api/admin/users/${id}`);
      await reload();
    },
    [reload],
  );

  return { users, auditLogs, loading, error, createUser, deleteUser, isUsernameTaken };
}

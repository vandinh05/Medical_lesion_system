import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/admin.css";
import "../styles/style.css";

import AdminTopbar from "../components/admin/AdminTopbar";
import Tabs from "../components/admin/Tabs";
import AccountsPanel from "../components/admin/AccountsPanel";
import AuditPanel from "../components/admin/AuditPanel";
import CreateAccountModal from "../components/admin/CreateAccountModal";
import Toast from "../components/common/Toast";

import { useAdminUsers } from "../hooks/useAdminUsers";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

export default function AdminPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const {
    users,
    auditLogs,
    createUser,
    deleteUser,
    isUsernameTaken,
  } = useAdminUsers();

  const { toast, showToast } = useToast();

  const [activeTab, setActiveTab] = useState("accounts");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Throws on failure (e.g. username already taken) — CreateAccountModal
  // catches it and shows the error inline on the username field.
  const handleCreateUser = async (username, password, role) => {
    await createUser(username, password, role);
    setShowCreateModal(false);
    showToast("Đã tạo tài khoản mới");
  };

  const handleDeleteUser = async (id) => {
    const user = users.find((u) => u.id === id);

    if (!user) return;

    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa tài khoản "${user.username}"?`
    );

    if (!confirmDelete) return;

    try {
      await deleteUser(id);
      showToast("Đã xóa tài khoản", true);
    } catch (err) {
      showToast(err.message || "Xóa tài khoản thất bại", true);
    }
  };

  return (
    <div className="admin-shell">
      {/* Topbar */}
      <AdminTopbar onLogout={handleLogout} />

      <div className="admin-body">
        {/* Header */}
        <div className="admin-header">
          <h1>Quản trị hệ thống</h1>
          <p>
            Quản lý tài khoản bác sĩ / chuyên viên y tế và theo dõi hoạt động hệ
            thống.
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          userCount={users.length}
        />

        {/* Nội dung */}
        {activeTab === "accounts" ? (
          <AccountsPanel
            users={users}
            onOpenCreate={() => setShowCreateModal(true)}
            onDeleteUser={handleDeleteUser}
          />
        ) : (
          <AuditPanel auditLogs={auditLogs} />
        )}
      </div>

      {/* Modal tạo tài khoản */}
      <CreateAccountModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateUser}
        isUsernameTaken={isUsernameTaken}
      />

      <Toast show={toast.show} message={toast.message} danger={toast.danger} />
    </div>
  );
}
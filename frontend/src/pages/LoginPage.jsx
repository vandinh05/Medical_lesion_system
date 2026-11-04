import { useState } from "react";
import BrandPanel from "../components/login/BrandPanel";
import LoginForm from "../components/login/LoginForm";
import Toast from "../components/common/Toast";
import { useAuth } from "../hooks/useAuth";
import "../styles/login.css";

export default function LoginPage() {
  const { login, loading, error, setError } = useAuth();
  const [toast, setToast] = useState({ show: false, message: "" });

  async function handleSubmit(credentials) {
    const result = await login(credentials);
    if (!result.success) return;

    setToast({ show: true, message: "Đăng nhập thành công. Đang chuyển hướng..." });

    // TODO: swap for react-router's useNavigate() once /doctor and /admin
    // routes exist. Kept as a hard redirect for now to match current behavior.
    setTimeout(() => {
      window.location.href = result.role === "admin" ? "/admin" : "/doctor";
    }, 500);
  }

  return (
    <div className="shell">
      <BrandPanel />

      <div className="form-panel">
        <div className="form-card">
          <div className="form-eyebrow">Workspace nội soi</div>
          <h1>Đăng nhập hệ thống</h1>
          <p className="form-sub">
            Nhập thông tin tài khoản được cấp bởi quản trị viên.
          </p>

          <LoginForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            clearError={() => setError("")}
          />

          <div className="disclaimer">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#5C6B85" strokeWidth="1.6" />
              <path
                d="M12 8v5M12 16h.01"
                stroke="#5C6B85"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <span>
              Kết quả AI chỉ mang tính hỗ trợ tham khảo, không thay thế chẩn đoán của
              bác sĩ.
            </span>
          </div>

          <div className="form-footer">
            Tài khoản mới do quản trị viên hệ thống cấp — không hỗ trợ tự đăng ký.
          </div>
        </div>
      </div>

      <Toast message={toast.message} show={toast.show} />
    </div>
  );
}

import { useState } from "react";

export default function CreateAccountModal({ open, onClose, onCreate, isUsernameTaken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("doctor");
  const [errors, setErrors] = useState({ username: "", password: "" });

  const reset = () => {
    setUsername("");
    setPassword("");
    setRole("doctor");
    setErrors({ username: "", password: "" });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleConfirm = async () => {
    const uname = username.trim();
    const nextErrors = { username: "", password: "" };
    let valid = true;

    if (!uname) {
      nextErrors.username = "Tên đăng nhập không được để trống";
      valid = false;
    } else if (isUsernameTaken(uname)) {
      nextErrors.username = "Tên đăng nhập đã tồn tại";
      valid = false;
    }

    if (!password || password.length < 8) {
      nextErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
      valid = false;
    }

    setErrors(nextErrors);
    if (!valid) return;

    try {
      await onCreate(uname, password, role);
      reset();
    } catch (err) {
      // Backend rejected it (e.g. a race on the username check) — show
      // the real error instead of silently doing nothing.
      setErrors({ ...nextErrors, username: err.message || "Tạo tài khoản thất bại" });
    }
  };

  return (
    <div
      className={`modal-backdrop ${open ? "open" : ""}`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="modal create-modal">
        <div className="modal-header">
          <h3>Tạo tài khoản mới</h3>
          <button className="modal-close" onClick={handleClose}>
            ✕
          </button>
        </div>
        <p className="modal-sub">Tài khoản sẽ được cấp quyền truy cập ngay sau khi tạo.</p>

        <div className={`field ${errors.username ? "error" : ""}`}>
          <label>Tên đăng nhập</label>
          <input
            type="text"
            placeholder="vd. bacsi05"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {errors.username && <span className="error-msg">{errors.username}</span>}
        </div>

        <div className={`field ${errors.password ? "error" : ""}`}>
          <label>Mật khẩu tạm thời</label>
          <input
            type="password"
            placeholder="Tối thiểu 8 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <span className="error-msg">{errors.password}</span>}
        </div>

        <div className="field" style={{ marginBottom: 0 }}>
          <label>Vai trò</label>
          <div className="segmented">
            <button type="button" className={role === "doctor" ? "active" : ""} onClick={() => setRole("doctor")}>
              Doctor
            </button>
            <button type="button" className={role === "admin" ? "active" : ""} onClick={() => setRole("admin")}>
              Admin
            </button>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={handleClose}>
            Hủy
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            Tạo tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}

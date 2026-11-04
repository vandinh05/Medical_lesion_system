import { useState } from "react";
import RoleSwitch from "./RoleSwitch";

// Controlled login form. Owns field state + client-side validation only;
// auth logic (calling the API, error text) lives in the useAuth hook and
// is passed in via props so this component stays easy to reuse/test.
export default function LoginForm({ onSubmit, loading, error, clearError }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("doctor");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    username: false,
    password: false,
  });

  function handleRoleChange(newRole) {
    setRole(newRole);
    clearError();
  }

  function handleSubmit(e) {
    e.preventDefault();
    clearError();

    const errors = {
      username: !username.trim(),
      password: !password,
    };
    setFieldErrors(errors);
    if (errors.username || errors.password) return;

    onSubmit({ username: username.trim(), password, role });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="auth-error show">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M12 7.5v6M12 16.5h.01"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className={`field ${fieldErrors.username ? "has-error" : ""}`}>
        <label htmlFor="username">Tên đăng nhập</label>
        <input
          type="text"
          id="username"
          placeholder="vd. bs.hoang"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <span className="error-msg">Vui lòng nhập tên đăng nhập</span>
      </div>

      <div className={`field ${fieldErrors.password ? "has-error" : ""}`}>
        <label htmlFor="password">Mật khẩu</label>
        <div className="input-wrap">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="toggle-eye"
            aria-label="Hiện/ẩn mật khẩu"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>
        <span className="error-msg">Vui lòng nhập mật khẩu</span>
      </div>

      <div className="field" style={{ marginBottom: 26 }}>
        <span className="role-label">Vai trò</span>
        <RoleSwitch value={role} onChange={handleRoleChange} />
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner" /> Đang xác thực...
          </>
        ) : (
          "Đăng nhập"
        )}
      </button>
    </form>
  );
}

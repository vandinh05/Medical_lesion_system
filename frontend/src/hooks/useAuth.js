import { useState } from "react";
import { apiPost } from "../lib/api";

// Encapsulates auth state/logic so pages don't need to know how login works.
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login({ username, password, role }) {
    setError("");
    setLoading(true);
    try {
      const data = await apiPost("/api/auth/login", { username, password, role });
      sessionStorage.setItem("pl_token", data.token);
      sessionStorage.setItem("pl_username", data.user.username);
      sessionStorage.setItem("pl_role", data.user.role);
      sessionStorage.setItem("pl_user_id", String(data.user.user_id));
      return { success: true, role: data.user.role };
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await apiPost("/api/auth/logout");
    } catch {
      // Ignore network errors here — we still want to clear the local
      // session and send the user back to the login page either way.
    } finally {
      sessionStorage.clear();
    }
  }

  return { login, logout, loading, error, setError };
}

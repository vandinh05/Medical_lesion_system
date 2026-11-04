/* ============================================================
   Central fetch client for the FastAPI backend.
   Every hook (useAuth, useAdminUsers, useDoctorSessions) goes
   through here instead of calling fetch() directly, so token
   handling / error parsing / base URL only live in one place.
   ============================================================ */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function authHeaders() {
  const token = sessionStorage.getItem("pl_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  if (res.status === 401) {
    // Token missing/expired/invalidated (e.g. logged in elsewhere, or
    // account deleted) — matches backend's 3-step auth check.
    sessionStorage.clear();
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // empty body (e.g. some error responses) — ignore
  }

  if (!res.ok) {
    const message = data?.detail || "Có lỗi xảy ra, vui lòng thử lại.";
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return data;
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { ...authHeaders() } });
  return handleResponse(res);
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body ?? {}),
  });
  return handleResponse(res);
}

export async function apiPatch(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body ?? {}),
  });
  return handleResponse(res);
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

// File upload: browser sets the multipart boundary itself, so we must
// NOT set Content-Type manually here.
export async function apiUpload(path, file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: form,
  });
  return handleResponse(res);
}

// Backend returns relative paths like "/storage/images/1/xyz.png" —
// prefix with the API origin so <img src> works from the Vite dev server.
export function toAbsoluteUrl(path) {
  if (!path) return path;
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
}

export { API_BASE };

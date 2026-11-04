import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost, apiUpload, toAbsoluteUrl } from "../lib/api";

function formatTime(iso) {
  const d = new Date(iso);
  return (
    d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
    " " +
    d.toLocaleDateString("vi-VN")
  );
}

// Fields returned by GET /api/sessions -> the shape ChatPanel/ImageCard use.
function mapListItem(s, index) {
  return {
    id: s.session_id,
    name: s.session_name,
    time: formatTime(s.created_at),
    hasPolyp: s.has_polyp,
    editable: index === 0, // only the most recent session stays open for chat
    conversation: [], // filled in lazily the first time this session is opened
  };
}

/**
 * Quản lý toàn bộ state của Doctor workspace: danh sách phiên, phiên đang
 * chọn, thao tác đổi tên / xóa / thêm phiên mới, và luồng hỏi-đáp (VQA).
 * Gọi API thật qua lib/api.js.
 */
export function useDoctorSessions() {
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadedDetailIds = useRef(new Set());

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet("/api/sessions");
        const mapped = data.map(mapListItem);
        setSessions(mapped);
        if (mapped.length) setActiveId(mapped[0].id);
      } catch (err) {
        setError(err.message || "Không tải được danh sách phiên.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeId) || null,
    [sessions, activeId],
  );

  // GET /api/sessions only returns the list (no images/conversation).
  // Fetch the full detail lazily the first time a session is opened.
  useEffect(() => {
    if (!activeId || loadedDetailIds.current.has(activeId)) return;
    loadedDetailIds.current.add(activeId);

    (async () => {
      try {
        const detail = await apiGet(`/api/sessions/${activeId}`);
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeId
              ? {
                  ...s,
                  conversation: detail.conversation.map((c) => ({
                    role: c.role,
                    content: c.content,
                  })),
                  imgOrgUrl: toAbsoluteUrl(detail.img_org_url),
                  imgOverlayUrl: toAbsoluteUrl(detail.img_overlay_url),
                }
              : s,
          ),
        );
      } catch (err) {
        loadedDetailIds.current.delete(activeId); // allow retry on reselect
        setError(err.message || "Không tải được chi tiết phiên.");
      }
    })();
  }, [activeId]);

  const selectSession = useCallback((id) => setActiveId(id), []);

  const renameSession = useCallback(async (id, name) => {
    const updated = await apiPatch(`/api/sessions/${id}/rename`, { session_name: name });
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: updated.session_name } : s)),
    );
  }, []);

  const deleteSession = useCallback(
    async (id) => {
      await apiDelete(`/api/sessions/${id}`);
      loadedDetailIds.current.delete(id);
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, editable: i === 0 }));
        if (id === activeId) {
          setActiveId(next.length ? next[0].id : null);
        }
        return next;
      });
    },
    [activeId],
  );

  // Thêm phiên mới từ file vừa upload — gọi thật /api/sessions/upload
  // (backend chạy segmentation + tạo embeddings trước khi trả về).
  const addSession = useCallback(async (file) => {
    const result = await apiUpload("/api/sessions/upload", file);
    const newSession = {
      id: result.session_id,
      name: result.session_name,
      time: formatTime(new Date().toISOString()),
      hasPolyp: result.has_polyp,
      editable: true,
      conversation: [],
      imgOverlayUrl: toAbsoluteUrl(result.img_overlay_url),
    };
    // Not marked as loaded here on purpose: img_org_url isn't in the
    // upload response, so the detail effect (triggered by setActiveId
    // below) still needs to fetch /api/sessions/{id} once for it.
    setSessions((prev) => [newSession, ...prev.map((s) => ({ ...s, editable: false }))]);
    setActiveId(newSession.id);
    return newSession;
  }, []);

  // Gửi câu hỏi cho phiên đang active — gọi thật /api/sessions/{id}/ask
  const sendQuestion = useCallback(
    async (question) => {
      if (!activeId) return;

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeId
            ? { ...s, conversation: [...s.conversation, { role: "user", content: question }] }
            : s,
        ),
      );

      setIsTyping(true);
      try {
        const res = await apiPost(`/api/sessions/${activeId}/ask`, { question });
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeId
              ? { ...s, conversation: [...s.conversation, { role: "system", content: res.answer }] }
              : s,
          ),
        );
      } catch (err) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeId
              ? {
                  ...s,
                  conversation: [
                    ...s.conversation,
                    { role: "system", content: `⚠ ${err.message || "Không gửi được câu hỏi."}` },
                  ],
                }
              : s,
          ),
        );
      } finally {
        setIsTyping(false);
      }
    },
    [activeId],
  );

  return {
    sessions,
    activeId,
    activeSession,
    isTyping,
    loading,
    error,
    selectSession,
    renameSession,
    deleteSession,
    addSession,
    sendQuestion,
  };
}

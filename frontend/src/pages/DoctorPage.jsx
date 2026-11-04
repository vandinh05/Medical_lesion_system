import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/doctor/Sidebar";
import Topbar from "../components/doctor/Topbar";
import ImageCard from "../components/doctor/ImageCard";
import ChatPanel from "../components/doctor/ChatPanel";
import EmptyState from "../components/doctor/EmptyState";
import UploadModal from "../components/doctor/UploadModal";
import RenameModal from "../components/doctor/RenameModal";
import DeleteModal from "../components/doctor/DeleteModal";
import Toast from "../components/common/Toast";

import { useDoctorSessions } from "../hooks/useDoctorSessions";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

import "../styles/doctor.css";
import "../styles/style.css";

export default function DoctorPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const {
    sessions,
    activeId,
    activeSession,
    isTyping,
    selectSession,
    renameSession,
    deleteSession,
    addSession,
    sendQuestion,
  } = useDoctorSessions();

  const { toast, showToast } = useToast();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [renameTargetId, setRenameTargetId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const renameTargetSession =
    sessions.find((s) => s.id === renameTargetId) || null;

  // Throws on failure — UploadModal catches it and shows the error inline.
  const handleUploadComplete = async (file) => {
    await addSession(file);
    showToast("Đã tải ảnh lên và phân tích xong");
  };

  const handleConfirmRename = async (name) => {
    try {
      await renameSession(renameTargetId, name);
      setRenameTargetId(null);
      showToast("Đã đổi tên phiên");
    } catch (err) {
      showToast(err.message || "Đổi tên phiên thất bại", true);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteSession(deleteTargetId);
      setDeleteTargetId(null);
      showToast("Đã xóa phiên", true);
    } catch (err) {
      showToast(err.message || "Xóa phiên thất bại", true);
    }
  };

  const handleLogout = async () => {
    showToast("Đang đăng xuất…");
    await logout();
    setTimeout(() => navigate("/login"), 400);
  };

  return (
    <div className="app">
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        onSelectSession={selectSession}
        onRenameSession={setRenameTargetId}
        onDeleteSession={setDeleteTargetId}
        onOpenUpload={() => setUploadOpen(true)}
        onLogout={handleLogout}
      />

      <main className="main">
        <Topbar
          session={activeSession}
          onTitleClick={() => activeSession && setRenameTargetId(activeSession.id)}
        />

        <div className="viewport">
          {activeSession ? (
            <div className="viewport-inner">
              <div className="images-row">
                <ImageCard session={activeSession} overlay={false} />
                <ImageCard session={activeSession} overlay={true} />
              </div>
              <ChatPanel
                session={activeSession}
                isTyping={isTyping}
                onSend={sendQuestion}
                onInvalidQuestion={(msg) => showToast(msg, true)}
              />
            </div>
          ) : (
            <EmptyState onUploadClick={() => setUploadOpen(true)} />
          )}
        </div>
      </main>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadComplete={handleUploadComplete}
        onError={(msg) => showToast(msg, true)}
      />

      <RenameModal
        open={!!renameTargetId}
        session={renameTargetSession}
        onClose={() => setRenameTargetId(null)}
        onConfirm={handleConfirmRename}
      />

      <DeleteModal
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
      />

      <Toast show={toast.show} message={toast.message} danger={toast.danger} />
    </div>
  );
}

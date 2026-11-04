import { useRef, useState } from "react";

const STEP = { IDLE: "idle", PROGRESS: "progress" };

export default function UploadModal({ open, onClose, onUploadComplete, onError }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState(STEP.IDLE);
  const [progressText, setProgressText] = useState("");
  const fileInputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setStep(STEP.IDLE);
    setDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (step === STEP.PROGRESS) return; // không cho đóng giữa lúc đang phân tích
    reset();
    onClose();
  };

  const validateAndSetFile = (f) => {
    const okType = ["image/jpeg", "image/png"].includes(f.type);
    const okSize = f.size <= 10 * 1024 * 1024;
    if (!okType) {
      onError?.("Chỉ chấp nhận định dạng JPG hoặc PNG");
      return;
    }
    if (!okSize) {
      onError?.("Dung lượng ảnh vượt quá 10MB");
      return;
    }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleStart = async () => {
    if (!file) return;
    setStep(STEP.PROGRESS);
    setProgressText("Đang tải ảnh lên & phân tích (phát hiện tổn thương, tạo embeddings)…");

    try {
      // onUploadComplete now performs the real POST /api/sessions/upload
      // call and throws on failure (invalid file, too large, server error…).
      await onUploadComplete(file);
      reset();
      onClose();
    } catch (err) {
      setStep(STEP.IDLE);
      onError?.(err.message || "Tải ảnh lên thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div
      className={`modal-backdrop ${open ? "open" : ""}`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="modal upload-modal">
        <div className="modal-header">
          <h3>Tải ảnh nội soi lên</h3>
          <button className="modal-close" onClick={handleClose}>
            ✕
          </button>
        </div>
        <p className="modal-sub">
          Hệ thống sẽ tự động phát hiện, khoanh vùng tổn thương và tạo phiên hỏi
          đáp mới.
        </p>

        {step === STEP.IDLE && (
          <div>
            {!file ? (
              <div
                className={`dropzone ${dragOver ? "dragover" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                }}
                onDrop={handleDrop}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ margin: "0 auto", display: "block" }}
                >
                  <path
                    d="M12 4v11m0-11l-4 4m4-4l4 4M5 18h14"
                    stroke="#1D5FBF"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p>Kéo & thả ảnh vào đây, hoặc bấm để chọn</p>
                <span>JPG, PNG · tối đa 10MB · tối thiểu 100×100px</span>
              </div>
            ) : (
              <div className="file-chip">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="#1D5FBF" strokeWidth="1.6" />
                  <circle cx="9" cy="9" r="1.6" fill="#1D5FBF" />
                  <path d="M21 15l-5-5-8 8" stroke="#1D5FBF" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
                <span className="fname">{file.name}</span>
                <button
                  className="btn-ghost btn-sm"
                  style={{ padding: "4px 8px" }}
                  onClick={() => setFile(null)}
                >
                  Đổi ảnh
                </button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept=".jpg,.jpeg,.png"
              style={{ display: "none" }}
              onChange={(e) => e.target.files.length && validateAndSetFile(e.target.files[0])}
            />
            <div className="upload-constraints"></div>
          </div>
        )}

        {step === STEP.PROGRESS && (
          <div className="upload-progress show">
            <div className="spinner"></div>
            <p>{progressText}</p>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={handleClose} disabled={step === STEP.PROGRESS}>
            Hủy
          </button>
          {step === STEP.IDLE && (
            <button className="btn btn-primary" disabled={!file} onClick={handleStart}>
              Bắt đầu phân tích
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

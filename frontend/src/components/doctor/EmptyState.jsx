export default function EmptyState({ onUploadClick }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 4v11m0-11l-4 4m4-4l4 4M5 18h14"
            stroke="#1D5FBF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3>Chưa có phiên nào</h3>
      <p>
        Tải lên một ảnh nội soi tiêu hóa để hệ thống tự động phát hiện, khoanh
        vùng tổn thương và bắt đầu hỏi đáp.
      </p>
      <button className="btn btn-primary" onClick={onUploadClick}>
        + Upload ảnh đầu tiên
      </button>
    </div>
  );
}

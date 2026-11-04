export default function DeleteModal({ open, onClose, onConfirm }) {
  return (
    <div
      className={`modal-backdrop ${open ? "open" : ""}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <h3>Xóa phiên?</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="modal-sub">
          Ảnh gốc, ảnh overlay và toàn bộ hội thoại của phiên này sẽ bị xóa vĩnh
          viễn.
        </p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Xóa phiên
          </button>
        </div>
      </div>
    </div>
  );
}

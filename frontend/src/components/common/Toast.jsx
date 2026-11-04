export default function Toast({ show, message, danger }) {
  return (
    <div className={`toast ${show ? "show" : ""} ${danger ? "danger" : ""}`}>
      <span className="dot"></span>
      <span>{message}</span>
    </div>
  );
}

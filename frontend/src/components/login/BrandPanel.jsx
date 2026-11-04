import logo from "../../assets/logo.png";

// Static left-side brand panel: logo, animated scan illustration, copy & stats.
// Pure presentation, no state — safe to reuse on register/forgot-password pages later.
export default function BrandPanel() {
  return (
    <div className="brand-panel">
      <div className="grid-dots" />

      <div className="brand-top">
        <div className="brand-mark">
          <img src={logo} alt="PolypLens" />
        </div>
        <div className="brand-name">
          Polyp<span>Lens</span>
        </div>
      </div>

      <div className="scope-stage">
        <div className="scan-clip">
          <div className="scan-line" />
        </div>
        <svg viewBox="0 0 280 280">
          <circle className="ring-outer" cx="140" cy="140" r="124" />
          <circle className="ring-inner" cx="140" cy="140" r="98" />
          <path
            className="lesion-outline"
            d="M100,130 C95,110 115,95 140,98 C165,100 178,112 176,132 C174,150 160,165 138,166 C118,167 100,158 96,145 C94,138 96,133 100,130 Z"
          />
          <circle className="pulse-dot" cx="138" cy="132" r="4" />
        </svg>
      </div>

      <div className="brand-copy">
        <h1>Hỗ trợ phát hiện tổn thương nội soi tiêu hóa & hỏi đáp bằng hình ảnh</h1>
        <p>
          PolypLens khoanh vùng polyp tự động trên ảnh nội soi và cho phép bác sĩ đặt
          câu hỏi trực tiếp trên hình ảnh — hỗ trợ ra quyết định lâm sàng nhanh và nhất
          quán hơn.
        </p>
        <div className="stat-row">
          <div>
            <b>&lt;1s</b>
            <span>Thời gian phân tích / ảnh</span>
          </div>
          <div>
            <b>24/7</b>
            <span>Sẵn sàng hỗ trợ</span>
          </div>
        </div>
      </div>

      <div className="brand-foot">
        <span>Hệ thống chỉ mang tính hỗ trợ tham khảo</span>
      </div>
    </div>
  );
}

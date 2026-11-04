import { useEffect, useState } from "react";

// Shows the real image returned by the backend (img_org_url / img_overlay_url).
// The polyp highlight itself is baked into img_overlay_url server-side by the
// segmentation step — this component just displays whichever photo it's given.
export default function ImageCard({ session, overlay }) {
  const [failed, setFailed] = useState(false);
  const label = overlay ? "Ảnh overlay" : "Ảnh gốc";
  const imageUrl = overlay ? session.imgOverlayUrl : session.imgOrgUrl;

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  return (
    <div className="image-card">
      <div className="image-card-label">
        <span>{label}</span>
        {overlay ? (
          session.hasPolyp ? (
            <span className="badge badge-danger">Polyp detected</span>
          ) : (
            <span className="badge badge-success">No polyp</span>
          )
        ) : (
          <span className="mono" style={{ fontSize: 11.5 }}>
            {session.name}
          </span>
        )}
      </div>

      <div className="scope-frame">
        {imageUrl && !failed ? (
          <img
            key={imageUrl}
            src={imageUrl}
            alt={label}
            className="scope-photo"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="scope-loading">
            {failed ? "Không tải được ảnh." : "Đang tải ảnh…"}
          </div>
        )}

        {overlay && !session.hasPolyp && (
          <div className="no-polyp-note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.6" />
              <path
                d="M12 8v5M12 16h.01"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            The model did not detect any polyps in this image
          </div>
        )}
      </div>
    </div>
  );
}

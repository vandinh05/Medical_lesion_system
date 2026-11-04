# Plan

**Project:** Phát hiện và Phân vùng Tổn thương Y tế — Trả lời Câu hỏi dựa trên Nội dung Hình ảnh  
**Domain:** Computer Vision — Gastrointestinal Endoscopy Image Analysis  
**Dataset:** Kvasir-SEG, Kvasir-v2, Kvasir-VQA-x1

---

## Giai đoạn 1: Chuẩn bị dữ liệu & Môi trường

| Task | Mô tả | Vị trí | Phụ thuộc | Thời gian |
|---|---|---|---|---|
| T1.1 | Tải Kvasir-SEG (1,000 ảnh + mask), Kvasir-VQA (6,499 ảnh + 159,549 QA pairs) và Kvasir v2 (900 ảnh normal: pylorus 450 + z-line 450) | `notebooks/download_data.ipynb` → output vào `data/kvasir-seg/`, `data/kvasir-v2-normal/` và `data/kvasir-vqa/` | — | 0.5 ngày |
| T1.2 | Sinh mask jpg toàn số 0 khớp kích thước từng ảnh, tên theo ảnh gốc, cùng format Kvasir-SEG. | `notebooks/download_data.ipynb` → mask output vào `data/kvasir-v2-normal/masks/` | T1.1 | 0.5 ngày |
| T1.3 | U-Net (polyp 800/100/100 + Normal 720/90/90 (pylorus 360/45/45 + z-line 360/45/45)) và BLIP (gộp lại, chia theo img_id 80/10/10), không đồng bộ. | `notebooks/split_data.ipynb` → output `data/splits/unet_split.json` và `data/splits/blip_split.json` | T1.2 | 0.5 ngày |
| T1.4 | Kiểm tra post-hoc class distribution sau khi split. Soi riêng landmark_color (88 ảnh) và phân bố complexity 3 level. | `notebooks/split_data.ipynb` | T1.3 | 0.5 ngày |
| T1.5 | Setup project: tạo cây thư mục, init Git, viết `.gitignore`, `.env.example`, `README.md` | Root project | — | 0.5 ngày |
| T1.6 | Tạo database MySQL: chạy file SQL tạo 4 bảng (Users, Sessions, Conversations, Audit_Logs) | `backend/schema.sql` → chạy vào MySQL | T1.5 | 0.5 ngày |

---

## Giai đoạn 2: Training Models

| Task | Mô tả | Vị trí | Phụ thuộc | Thời gian |
|---|---|---|---|---|
| T2.1 | Viết notebook train U-Net: dataloader đọc từ `unet_split.json`, preprocessing, training loop, lưu weights | `notebooks/unet_training.ipynb` → weights lưu vào `backend/ai_models/segmentation/weights/` | T1.3 | 1–2 ngày |
| T2.2 | Đánh giá U-Net: Dice (chính), IoU, Precision, Recall. Report 2 dòng: toàn bộ test (polyp+normal) và polyp-only. Áp dụng quy ước Dice(∅,∅)=1.0 | `notebooks/unet_training.ipynb` (cells cuối) | T2.1 | 0.5 ngày |
| T2.3 | Viết notebook train BLIP base: dataloader đọc từ `blip_split.json` + ảnh từ `data/kvasir-vqa/images/`, fine-tune end-to-end, lưu weights | `notebooks/blip_training.ipynb` → weights lưu vào `backend/ai_models/vqa/weights/` | T1.3 | 2–3 ngày |
| T2.4 | Đánh giá BLIP: ROUGE-L (chính), METEOR, Accuracy (Yes/No + Count). Report tách theo 3 complexity level | `notebooks/blip_training.ipynb` (cells cuối) | T2.3 | 0.5 ngày |
| T2.5 | Đóng gói model interface: viết `predict_mask()`, `encode_image()`, `ask_vqa()`, test độc lập từng hàm | `backend/ai_models/segmentation/model.py`, `backend/ai_models/vqa/model.py`, `backend/ai_models/__init__.py` | T2.1, T2.3 | 1 ngày |

**Ghi chú:** T2.1 và T2.3 có thể chạy song song vì hai model độc lập.

---

## Giai đoạn 3: Backend

| Task | Mô tả | Vị trí | Phụ thuộc | Thời gian |
|---|---|---|---|---|
| T3.1 | Viết config (đọc `.env`) và kết nối MySQL | `backend/app/config.py`, `backend/app/database.py` | T1.6 | 0.5 ngày |
| T3.2 | Viết SQLAlchemy models cho 4 bảng | `backend/app/models/user.py`, `session.py`, `conversation.py`, `audit_log.py` | T3.1 | 0.5 ngày |
| T3.3 | Viết Pydantic schemas (request/response) | `backend/app/schemas/auth.py`, `session.py`, `admin.py`, `vqa.py` | T3.2 | 0.5 ngày |
| T3.4 | Viết auth middleware: xác thực token, kiểm tra user tồn tại, kiểm tra current_token, phân quyền role | `backend/app/middleware/auth.py` | T3.2 | 1 ngày |
| T3.5 | Viết auth router: POST login, POST logout | `backend/app/routers/auth.py` | T3.3, T3.4 | 0.5 ngày |
| T3.6 | Viết admin router: POST/GET/DELETE users, GET audit-logs | `backend/app/routers/admin.py` | T3.3, T3.4 | 1 ngày |
| T3.7 | Viết utils: ghi 8 loại audit log, validate ảnh (format, size, PIL open, resolution) | `backend/app/utils/audit.py`, `backend/app/utils/image.py` | T3.2 | 0.5 ngày |
| T3.8 | Viết sessions router — upload: validate ảnh → lưu `storage/images/{user_id}/{session_id}/` → gọi predict_mask + encode_image → tạo session record | `backend/app/routers/sessions.py` (phần upload) | T3.3, T3.4, T3.7, T2.5 | 1.5 ngày |
| T3.9 | Viết sessions router — VQA + quản lý: ask, list, detail, rename, delete | `backend/app/routers/sessions.py` (phần còn lại) | T3.8 | 1 ngày |
| T3.10 | Viết script tạo tài khoản admin đầu tiên | `backend/create_admin.py` | T3.2 | 0.5 ngày |

**Ghi chú:** T3.1–T3.7 không phụ thuộc vào AI models, có thể làm song song với Giai đoạn 2. T3.8 là điểm hội tụ — cần cả backend và AI models sẵn sàng.

---

## Giai đoạn 4: Frontend

| Task | Mô tả | Vị trí | Phụ thuộc | Thời gian |
|---|---|---|---|---|
| T4.1 | Dựng trang đăng nhập: form username + password + role dropdown, gọi API login, redirect theo role | `frontend/src/pages/Login.jsx`, `frontend/src/services/api.js` | T3.5 | 0.5 ngày |
| T4.2 | Dựng giao diện bác sĩ — layout: sidebar (danh sách phiên + thumbnail + menu ⋮) + khu vực chính (tên phiên, ảnh gốc, ảnh overlay) | `frontend/src/pages/Doctor.jsx`, `frontend/src/components/` | T4.1 | 1.5 ngày |
| T4.3 | Dựng giao diện bác sĩ — chức năng: upload tạo phiên mới, khung chat VQA, ẩn khung nhập khi xem phiên cũ, đổi tên/xóa phiên | `frontend/src/pages/Doctor.jsx`, `frontend/src/components/` | T4.2, T3.8, T3.9 | 2 ngày |
| T4.4 | Xử lý UI edge cases: thông báo mask trống, disable nút gửi khi rỗng, bộ đếm ký tự x/200, hiển thị lỗi từ backend | `frontend/src/components/` | T4.3 | 0.5 ngày |
| T4.5 | Dựng giao diện admin: tab quản lý tài khoản (bảng + form tạo + nút xóa) + tab Audit Log | `frontend/src/pages/Admin.jsx`, `frontend/src/components/` | T4.1, T3.6 | 1.5 ngày |

---

## Giai đoạn 5: Tích hợp & Docker

| Task | Mô tả | Vị trí | Phụ thuộc | Thời gian |
|---|---|---|---|---|
| T5.1 | Tích hợp end-to-end: FE → BE → AI Models → DB → Filesystem, test luồng upload → segment → VQA hoàn chỉnh | Toàn bộ hệ thống | T4.3, T4.5 | 1 ngày |
| T5.2 | Viết Dockerfile cho backend và frontend | `backend/Dockerfile`, `frontend/Dockerfile` | T5.1 | 0.5 ngày |
| T5.3 | Viết docker-compose, test khởi chạy bằng `docker-compose up` | `docker-compose.yml` | T5.2 | 0.5 ngày |

---

## Giai đoạn 6: Testing

| Task | Mô tả | Vị trí | Phụ thuộc | Thời gian |
|---|---|---|---|---|
| T6.1 | ... (U-Net: Dice/IoU/Precision/Recall, BLIP: ROUGE-L/METEOR/Accuracy) ... | `notebooks/unet_training.ipynb`, `notebooks/blip_training.ipynb` | T2.2, T2.4 | 0.5 ngày |
| T6.2 | Test full pipeline: chạy 17 edge cases đã thiết kế (11 logic + 6 AI), ghi kết quả pass/fail | `docs/edge_cases.md` để đối chiếu | T5.1 | 1 ngày |
| T6.3 | Sửa bug phát sinh từ testing | File nào lỗi sửa file đó | T6.2 | 1 ngày |

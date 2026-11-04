# Tech Solution

**Project:** Phát hiện và Phân vùng Tổn thương Y tế — Trả lời Câu hỏi dựa trên Nội dung Hình ảnh  
**Domain:** Computer Vision — Gastrointestinal Endoscopy Image Analysis  
**Dataset:** Kvasir-SEG, Kvasir-v2, Kvasir-VQA-x1

---

## 1. Kiến trúc tổng thể

Hệ thống 3 lớp, tổ chức theo module trong cùng một FastAPI project:

```
User (Bác sĩ / Admin)
        ↓
   Web Browser (React)
        ↓  HTTP/REST API
   FastAPI Server (Python)
    ├── Auth Module         — Xác thực, phân quyền
    ├── Sessions Module     — Upload ảnh, gọi AI Models, quản lý phiên
    ├── Admin Module        — Quản lý tài khoản, Audit Log
    └── AI Models (ai_models/) — Python package
          ├── U-Net         — Segmentation
          └── BLIP base     — VQA
        ↓
   MySQL (metadata, lịch sử)  +  Filesystem (ảnh gốc, overlay)
```

**Pipeline tổng quan:**

```
Upload ảnh (raw image)
    ├── U-Net  → segmentation mask → overlay (lưu filesystem)
    └── BLIP vision encoder → image embeddings (cache trong RAM, dùng lại cho mọi câu hỏi sau)

Câu hỏi VQA → lấy embeddings đã cache (không encode lại ảnh) → BLIP VQA head → câu trả lời
```

- U-Net và BLIP xử lý **song song, độc lập** — hai encoder khác nhau (CNN vs ViT), không chia sẻ output với nhau
- BLIP vision encoder chỉ chạy **một lần duy nhất** khi upload. Các câu hỏi tiếp theo trong cùng phiên dùng lại embeddings đã cache, bỏ qua bước encode ảnh → tiết kiệm thời gian xử lý

**Lý do kiến trúc:**

- **Gộp chung một FastAPI project** thay vì tách nhiều server riêng: tách nhiều server thì phải deploy nhiều lần, xử lý kết nối giữa chúng — với nhóm nhỏ và hệ thống nội bộ, chỉ thêm phức tạp mà không có lợi ích gì
- **AI Models là Python package** thay vì server riêng: nếu là server riêng, mỗi lần BE cần segment hay VQA phải gửi HTTP request sang server kia rồi chờ response — chậm hơn và phức tạp hơn. Để cùng project thì BE gọi hàm trực tiếp, nhanh hơn, đơn giản hơn, mà vẫn tách code rõ ràng giữa hai bên

---

## 2. Frontend

**Công nghệ:** React

**Trang đăng nhập (chung cho bác sĩ và admin):**

```
┌─────────────────────────────────────────┐
│                                         │
│           Đăng nhập hệ thống            │
│                                         │
│   Tên đăng nhập: [_______________]      │
│   Mật khẩu:      [_______________]      │
│   Vai trò:        [Doctor ▼     ]       │
│                                         │
│            [Đăng nhập]                  │
│                                         │
└─────────────────────────────────────────┘
```

- Người dùng nhập username + password + chọn role
- BE xác thực cả 3 thông tin khớp với database mới cho phép đăng nhập
- FE redirect theo role: doctor → giao diện bác sĩ, admin → giao diện admin

**Giao diện bác sĩ:**

```
┌────────────────────┬─────────────────────────────────────────────────────────┐
│                    │                                                         │
│  [+ Upload mới]    │  📋 polyp_001.jpg — 10:30 03/07/2026  ← click để rename│
│                    │                                              [Đăng xuất]│
│  ┌───────────────┐ │  ┌────────────────────────┬────────────────────────┐    │
│  │ polyp_001  ⋮  │ │  │                        │                        │    │
│  │ 10:30         │ │  │       Ảnh gốc           │      Ảnh overlay       │    │
│  │ [thu nhỏ]     │ │  │                        │                        │    │
│  └───────────────┘ │  └────────────────────────┴────────────────────────┘    │
│  ┌───────────────┐ │                                                         │
│  │ polyp_002  ⋮  │ │  ┌───────────────────────────────────────────────────┐  │
│  │ 10:45         │ │  │                                                   │  │
│  │ [thu nhỏ]     │ │  │  🤖 Trả lời hệ thống                            │  │
│  └───────────────┘ │  │                                                   │  │
│                    │  │                                    Câu hỏi 👤     │  │
│  menu ⋮:          │  │                                                   │  │
│  Đổi tên / Xóa    │  │  🤖 Trả lời hệ thống                            │  │
│                    │  │                                                   │  │
│                    │  │                                    Câu hỏi 👤     │  │
│                    │  │                                                   │  │
│                    │  │  [Nhập câu hỏi bằng tiếng Anh...]                │  │
│                    │  └───────────────────────────────────────────────────┘  │
│                    │                                                         │
└────────────────────┴─────────────────────────────────────────────────────────┘
```

**Hành vi chính:**

- Upload ảnh mới → tạo phiên mới trong sidebar, khu vực chính tự động cập nhật kết quả — tất cả trên cùng một trang, không tải lại
- Bấm phiên cũ trong sidebar → hiển thị ảnh gốc + overlay + toàn bộ hội thoại, nhưng khung nhập câu hỏi bị ẩn (chỉ xem lại, không tiếp tục VQA)
- Bấm ⋮ trên mỗi phiên → hiện menu: Đổi tên phiên / Xóa phiên
- Tên phiên: mặc định là tên file + thời gian upload, bác sĩ có thể đổi tên bằng cách click trực tiếp vào tên phiên ở khu vực chính hoặc qua menu ⋮
- Khi mask trống → cột overlay hiển thị ảnh gốc kèm thông báo "The model did not detect any polyps in this image"
- Chat bubble: tin nhắn bác sĩ bên phải, trả lời hệ thống bên trái

**Giao diện Admin:**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  [Tab: Quản lý tài khoản]    [Tab: Audit Log]               [Đăng xuất]    │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │                                                                      │    │
│  │  Tab Quản lý tài khoản:                                             │    │
│  │  ┌──────────┬──────────────┬──────────┬─────────────┬──────────┐    │    │
│  │  │ STT      │ Username     │ Role     │ Ngày tạo    │ Hành động│    │    │
│  │  ├──────────┼──────────────┼──────────┼─────────────┼──────────┤    │    │
│  │  │ 1        │ bacsi01      │ doctor   │ 01/07/2026  │  🗑      │    │    │
│  │  │ 2        │ bacsi02      │ doctor   │ 02/07/2026  │  🗑      │    │    │
│  │  └──────────┴──────────────┴──────────┴─────────────┴──────────┘    │    │
│  │                                                                      │    │
│  │  [+ Tạo tài khoản mới]                                             │    │
│  │                                                                      │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

Tài khoản admin đầu tiên được tạo thủ công (script hoặc trực tiếp trong database) khi deploy hệ thống.

---

## 3. Backend

**Công nghệ:** FastAPI (Python)

**Cấu trúc modules:**

| Module | Chức năng | Phụ trách |
|---|---|---|
| Auth | Đăng nhập (xác thực username + password + role) / Đăng xuất | BE |
| Sessions | Upload ảnh, quản lý phiên (xem/đổi tên/xóa), gọi AI Models | BE |
| Admin | Quản lý tài khoản (tạo/xem/xóa), xem Audit Log | BE |
| AI Models (`ai_models/`) | Segmentation (U-Net), VQA (BLIP base) | AI |

**AI Models — Interface contract:**

```
ai_models/
├── segmentation/
│   ├── model.py          ← predict_mask()
│   └── weights/
├── vqa/
│   ├── model.py          ← encode_image(), ask_vqa()
│   └── weights/
└── __init__.py
```

| Hàm | Input | Output |
|---|---|---|
| `predict_mask(image)` | PIL Image | numpy array (mask) + PIL Image (overlay) |
| `encode_image(image)` | PIL Image | tensor (image embeddings) |
| `ask_vqa(embeddings, question)` | tensor + str | str (answer) |

Khi mask trống: trả mask toàn số 0 + overlay giống ảnh gốc. BE kiểm tra `mask.sum() == 0` để xác định `has_polyp`.

**API Endpoints (12 endpoints):**

```
Auth:
  POST   /api/auth/login              — Đăng nhập (username + password + role)
  POST   /api/auth/logout             — Đăng xuất

Sessions:
  POST   /api/sessions/upload         — Upload ảnh, gọi U-Net + BLIP encoder
  POST   /api/sessions/{id}/ask       — Gửi câu hỏi VQA
  GET    /api/sessions                — Danh sách phiên của user
  GET    /api/sessions/{id}           — Chi tiết phiên (ảnh + hội thoại)
  PATCH  /api/sessions/{id}/rename    — Đổi tên phiên
  DELETE /api/sessions/{id}           — Xóa phiên

Admin:
  POST   /api/admin/users             — Tạo tài khoản
  GET    /api/admin/users             — Danh sách tài khoản
  DELETE /api/admin/users/{id}        — Xóa tài khoản
  GET    /api/admin/audit-logs        — Xem Audit Log
```

**Auth middleware:** Mọi request (trừ login) phải gửi kèm token. Middleware thực hiện 3 bước kiểm tra: (1) Token hợp lệ (chưa hết hạn, chữ ký đúng) → xác định user + role; (2) user_id còn tồn tại trong database (phòng trường hợp admin đã xóa tài khoản); (3) Token khớp với current_token trong bảng Users (phòng trường hợp đăng nhập từ thiết bị khác đã thay thế phiên cũ). Nếu bất kỳ bước nào thất bại → trả 401 Unauthorized. Các endpoint admin kiểm tra thêm role = admin, nếu không → trả 403 Forbidden.

**Luồng xử lý khi upload ảnh:**

1. Nhận file ảnh từ FE
2. Validate file: kiểm tra định dạng (chỉ JPG/PNG), dung lượng (tối đa 10MB), mở bằng PIL để kiểm tra file không bị hỏng, kiểm tra độ phân giải (tối thiểu 100×100 pixels). Nếu không hợp lệ → trả lỗi, dừng xử lý
3. Lưu ảnh gốc vào filesystem
4. Gọi `predict_mask(image)` → nhận mask + overlay
5. Kiểm tra `mask.sum() == 0` → đánh dấu `has_polyp`
6. Lưu overlay vào filesystem
7. Gọi `encode_image(image)` → cache embeddings trong RAM
8. Tạo record session trong MySQL
9. Ghi Audit Log (upload ảnh)
10. Trả response (session_id, overlay image, has_polyp)

**Luồng xử lý khi hỏi VQA:**

1. Validate câu hỏi: kiểm tra không rỗng (strip), không vượt 200 ký tự, dùng thư viện `langdetect` kiểm tra ngôn ngữ phải là tiếng Anh. Nếu không hợp lệ → trả lỗi, dừng xử lý.
2. Lấy embeddings từ cache (theo session_id). Nếu không tìm thấy (ví dụ server đã restart) → đọc ảnh gốc từ filesystem, gọi lại `encode_image()` để tái tạo cache
3. Gọi `ask_vqa(embeddings, question)` → nhận answer
4. Lưu cặp question-answer vào bảng Conversations
5. Trả response (answer)

**Luồng xử lý khi xóa phiên:**

1. Xóa file ảnh trên filesystem trước
2. Xóa records trong database sau (Sessions + Conversations)
3. Xóa embeddings cache nếu phiên đang active
4. Ghi Audit Log (xóa phiên)

**Luồng xử lý khi xóa user (admin thực hiện):**

1. Xóa toàn bộ folder ảnh trên filesystem (`storage/images/{user_id}/`)
2. Xóa user trong database (sessions + conversations tự xóa CASCADE, audit_logs giữ lại với user_id = NULL)
3. Ghi Audit Log (xóa tài khoản)

**Cache lifecycle:** Mỗi phiên chỉ upload một ảnh duy nhất. Cache embeddings bị xóa khi bác sĩ đóng phiên hoặc chuyển sang phiên mới.

**Audit Log — Các hành động được ghi:**

| Hành động | Lý do |
|---|---|
| Đăng nhập thành công | Biết ai truy cập hệ thống, lúc nào |
| Đăng nhập thất bại | Phát hiện cố truy cập trái phép |
| Đăng xuất | Biết thời điểm kết thúc phiên làm việc |
| Upload ảnh | Biết ai tải ảnh y tế lên, lúc nào |
| Xóa phiên | Biết ai xóa dữ liệu phân tích, lúc nào |
| Đổi tên phiên | Biết ai thay đổi thông tin phiên |
| Tạo tài khoản | Biết admin tạo tài khoản cho ai, lúc nào |
| Xóa tài khoản | Biết admin xóa tài khoản nào, lúc nào |

---

## 4. AI Models

**Kiến trúc sử dụng:**

| Task | Kiến trúc |
|---|---|
| Segmentation | U-Net |
| VQA | BLIP base |

**Kiến trúc model:**

**U-Net:**

```
Ảnh nội soi → CNN Encoder (trích xuất features) → Decoder (upsample) → Segmentation mask
```

- Encoder: trích xuất features ở nhiều mức (cạnh, texture, hình dạng)
- Decoder: upsample ngược lại kích thước ảnh gốc, kết hợp skip connections từ encoder
- Output: mask cùng kích thước ảnh gốc, mỗi pixel phân loại polyp hay không polyp

**BLIP base:**

```
Ảnh nội soi → ViT Encoder → Image embeddings (cache RAM)
                                      ↓
Câu hỏi (text) → Text Encoder → Cross-attention với image embeddings → Câu trả lời
```

- ViT Encoder: chia ảnh thành patches, encode ra chuỗi embeddings biểu diễn ngữ nghĩa ảnh
- Text Decoder: kết hợp image embeddings + câu hỏi qua cross-attention để sinh câu trả lời

**Preprocessing:**

| | U-Net | BLIP base |
|---|---|---|
| Encoder | CNN (ResNet) | ViT |
| Resize | Tùy config training (ví dụ 256×256) | Tùy config training (ví dụ 224×224) |
| Normalize | Theo ImageNet stats | Theo ViT stats |

Con số cụ thể phụ thuộc vào config khi train.

**Metrics đánh giá:**

**U-Net:**

| Metric | Ý nghĩa |
|---|---|
| Dice Coefficient | Đo độ trùng khớp giữa mask dự đoán và mask thực tế |
| IoU (Intersection over Union) | Đo tỷ lệ giao/hợp giữa hai vùng |
| Precision | Tỷ lệ pixel dự đoán là polyp mà thực sự là polyp |
| Recall | Tỷ lệ pixel thực sự là polyp mà model phát hiện được |

**BLIP base:**

| Metric | Ý nghĩa |
|---|---|
| ROUGE-L | Đo chuỗi con chung dài nhất giữa câu trả lời và ground truth |
| METEOR | Tương tự ROUGE-L nhưng hiểu thêm từ đồng nghĩa và biến thể từ |

---

## 5. Database + Filesystem

**Database: MySQL**

**Schema + Quan hệ:**

```
Users (1) ──→ (n) Sessions (1) ──→ (n) Conversations
  │
  └──→ (n) Audit_Logs
```

| Bảng | Cột | Ghi chú |
|---|---|---|
| **Users** | user_id (PK), username (unique), hashed_password, role ('doctor'/'admin'), current_token, created_at | |
| **Sessions** | session_id (PK), user_id (FK → Users), session_name, img_org_path, img_overlay_path, has_polyp, created_at | Mỗi user có nhiều session |
| **Conversations** | message_id (PK), session_id (FK → Sessions), role ('user'/'system'), content, timestamp | Mỗi session có nhiều message |
| **Audit_Logs** | log_id (PK), user_id (FK → Users, nullable, ON DELETE SET NULL), username, action_type, details, timestamp | Ghi log 8 hành động đã định nghĩa ở mục 3. Khi xóa user, user_id chuyển thành NULL nhưng username vẫn được giữ lại để truy vết |

**Quy tắc ON DELETE:**

| Bảng | Hành vi khi xóa parent | Lý do |
|---|---|---|
| Sessions | CASCADE (xóa user → xóa sessions) | Dữ liệu phân tích thuộc về user, không cần giữ lại |
| Conversations | CASCADE (xóa session → xóa conversations) | Hội thoại thuộc về session |
| Audit_Logs | SET NULL (xóa user → user_id thành NULL) | Log cần giữ lại để kiểm tra, username vẫn còn trong cột riêng |

**Filesystem:**

```
/storage/images/{user_id}/{session_id}/
    ├── original.jpg
    └── overlay.jpg
```

- Ảnh lưu trên filesystem, MySQL chỉ lưu đường dẫn tương đối — không lưu binary vào database
- Quy tắc xóa phiên: xóa file trên filesystem trước → xóa records trong database sau
- Quy tắc xóa user: xóa toàn bộ folder `storage/images/{user_id}/` trước → xóa user trong database sau (sessions + conversations tự xóa CASCADE, audit_logs giữ lại)

---

## 6. Dataset

**Hai bộ dataset sử dụng:**

| Dataset | Nguồn | Nội dung | Dùng cho |
|---|---|---|---|
| Kvasir-SEG | SimulaMet | 1,000 ảnh nội soi polyp + segmentation mask | Train U-Net (mẫu dương tính) |
| Kvasir v2 | SimulaMet | 900 ảnh normal (2 class: pylorus, z-line) | Train U-Net (mẫu âm tính) |
| Kvasir-VQA-x1 | SimulaMet (HuggingFace) | 6,449 ảnh nội soi + 159,549 cặp câu hỏi - câu trả lời | Train BLIP base |

Ảnh trong Kvasir-VQA-x1 cần load từ `SimulaMet-HOST/Kvasir-VQA`.

**Data split:**

| Model | Split |
|---|---|
| U-Net | Polyp 800/100/100 + Normal 720/90/90 (pylorus 450 + z-line 450) = 1,520/190/190 |
| BLIP | Gộp train+test gốc (6,449 ảnh) → chia lại theo img_id 80/10/10 (~5,159/645/645), độc lập với U-Net|

**Ghi chú:** Lý do gộp-chia-lại không còn là đồng bộ, mà là sửa rò rỉ 94% trong split gốc của tác giả (3,821/4,058).

**Nguyên tắc split:**

- Split theo **img_id** — tất cả QA pairs của cùng một ảnh nằm trong cùng tập (train/val/test), không bị chia ra nhiều tập
- Class distribution kiểm tra sau khi split (post-hoc verification) thay vì stratified, vì mỗi ảnh mang nhiều question classes (multi-label)
- Đã kiểm tra: không có class hiếm < 10 ảnh (thấp nhất landmark_color = 88 ảnh)
- Iterative stratification là phương án dự phòng; mặc định dùng random + post-hoc

**Metrics đánh giá:**

**U-Net (Segmentation):**

| Metric | Chức năng | Vai trò |
|---|---|---|
| Dice Coefficient | Đo độ trùng khớp giữa vùng mask dự đoán và vùng mask thật (0–1, càng cao càng tốt) | **Chính** — chọn best model |
| IoU | Tương tự Dice nhưng phạt nặng hơn khi lệch | Phụ |
| Precision | Tỷ lệ pixel dự đoán là polyp mà thực sự là polyp (đo tô thừa) | Phụ |
| Recall | Tỷ lệ pixel polyp thật mà model phát hiện được (đo bỏ sót) | Phụ — quan trọng trong y tế |

**Quy ước tính Dice/IoU với ảnh normal:**
- pred trống + gt trống (ảnh normal, model nhận đúng) → Dice = IoU = 1.0
- một bên trống, một bên không → Dice = IoU = 0.0
- cả hai đều có vùng → tính công thức bình thường

Quy ước Dice(∅,∅)=1.0 là chuẩn trong medical image segmentation, tự động thưởng khi model nhận đúng ảnh normal và phạt khi hallucinate.

**Cách report (2 dòng):**

| Test trên | Mục đích |
|---|---|
| Toàn bộ test (100 polyp + 90 normal) | Đánh giá thực tế của hệ thống |
| Chỉ 100 ảnh polyp | So sánh với benchmark Kvasir-SEG published |

**BLIP base (VQA):**

| Metric | Chức năng | Vai trò |
|---|---|---|
| ROUGE-L | So câu trả lời với đáp án, đo chuỗi con chung dài nhất — hợp với câu ngắn | **Chính** — chọn best model |
| METEOR | Giống ROUGE nhưng hiểu từ đồng nghĩa, biến thể từ (polyp ≈ polyps) | Phụ — góc nhìn ngữ nghĩa |
| Accuracy | Với câu Yes/No và câu đếm số: so khớp chính xác đáp án | Phụ — con số trực giác dễ hiểu |

**Ghi chú metric BLIP:**
- Không dùng BLEU: BLEU đo theo cụm 4 từ liên tiếp, cho điểm nhiễu và thấp giả tạo với câu trả lời ngắn (1-2 từ) vốn phổ biến trong Kvasir-VQA-x1. ROUGE-L và METEOR đo chính xác hơn cho loại dữ liệu này.

**Cách report thêm — tách theo complexity 3 level:**

| Độ phức tạp | ROUGE-L | METEOR |
|---|---|---|
| Level 1 (đơn giản) | ... | ... |
| Level 2 (trung bình) | ... | ... |
| Level 3 (phức tạp) | ... | ... |

Bảng này cho thấy model xử lý câu phức tạp kém hơn câu đơn giản — insight phù hợp với thiết kế complexity của dataset.

---

## 7. Deployment

**Công nghệ:** Docker + docker-compose

**Cấu trúc container:**

```
docker-compose
    ├── Container 1: FastAPI + AI Models (U-Net, BLIP base)
    └── Container 2: MySQL
```

- Hai container giao tiếp qua Docker network nội bộ
- FastAPI và AI Models gộp chung một container vì AI Models là Python package, không phải service riêng
- Chỉ cần lệnh `docker-compose up` để khởi chạy toàn bộ hệ thống
- U-Net và BLIP base chạy được trên CPU cho demo — không yêu cầu GPU khi deploy. GPU chỉ cần cho giai đoạn training

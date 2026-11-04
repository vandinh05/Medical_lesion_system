# Business Understanding

**Project:** Phát hiện và Phân vùng Tổn thương Y tế — Trả lời Câu hỏi dựa trên Nội dung Hình ảnh  
**Domain:** Computer Vision — Gastrointestinal Endoscopy Image Analysis  
**Dataset:** Kvasir-SEG, Kvasir-VQA-x1

---

## I. Scope (Trong phạm vi)

- Phát hiện và phân vùng tổn thương trên ảnh y tế (nội soi tiêu hóa)
- Trả lời câu hỏi bằng ngôn ngữ tự nhiên (tiếng Anh) dựa trên ảnh và vùng tổn thương đã được phân vùng
- Giao diện demo Web cho phép bác sĩ tương tác trực tiếp với hệ thống
- Hệ thống Admin cho phép quản lý tài khoản bác sĩ/chuyên viên y tế
- Lưu trữ và cho phép người dùng quản lý lịch sử hội thoại và kết quả phân tích

---

## II. Out of Scope (Ngoài phạm vi)

- Không chẩn đoán được thay bác sĩ, kết quả chỉ mang tính hỗ trợ tham khảo
- Không xử lý được video, chỉ xử lý ảnh tĩnh
- Không hỗ trợ định dạng DICOM hoặc dữ liệu 3D
- Không tích hợp vào hệ thống bệnh viện thực tế
- Không xử lý ảnh chất lượng quá thấp hoặc ảnh không liên quan đến y tế
- Không phân tích dữ liệu phi hình ảnh (hồ sơ bệnh án, xét nghiệm máu...)
- Không hỗ trợ đa ngôn ngữ, chỉ xử lý tiếng Anh
- Không hỗ trợ theo dõi hay quản lý điều trị bệnh nhân
- Không hỗ trợ quản lý tài khoản theo tổ chức/bệnh viện
- Không hỗ trợ ảnh y tế ngoài ảnh nội soi ống mềm tiêu hóa (X-quang, MRI, CT, siêu âm, da liễu…)
- Không tự động sinh mô tả (caption) về nội dung ảnh
- Không tự động đề xuất phác đồ điều trị hoặc kê đơn thuốc
- Không triển khai trên môi trường public/internet, chỉ sử dụng nội bộ

---

## III. User's Requirements

| Thành phần | Nội dung |
|---|---|
| **Người dùng** | Bác sĩ / Chuyên viên y tế |
| **Vấn đề** | Dễ bỏ sót tổn thương nhỏ khi đọc ảnh nội soi tiêu hóa |
| **Họ cần** | Công cụ hỗ trợ tự động khoanh vùng + cho phép hỏi đáp trực tiếp về vùng bất thường trên ảnh |
| **Kết quả mong đợi** | Hỗ trợ bác sĩ ra quyết định chẩn đoán chính xác hơn và giảm nguy cơ bỏ sót tổn thương |

---

### 1. Functional Requirements (Yêu cầu chức năng)

| ID | Mô tả |
|---|---|
| FR-01 | Admin trực tiếp tạo/xem/xóa tài khoản cho từng bác sĩ/chuyên viên y tế |
| FR-02 | Người dùng có thể đăng nhập/đăng xuất tài khoản |
| FR-03 | Hệ thống tự động phát hiện và khoanh vùng tổn thương trên ảnh nội soi tiêu hóa |
| FR-04 | Người dùng có thể nhập câu hỏi bằng tiếng Anh về vùng tổn thương trên ảnh và nhận câu trả lời từ hệ thống trong cùng một phiên |
| FR-05 | Giao diện Web hiển thị theo vai trò: bác sĩ thấy giao diện phân tích (ảnh gốc, ảnh overlay segmentation mask, khung hội thoại VQA, thông tin phiên); admin thấy giao diện quản lý (quản lý tài khoản, Audit Log). |
| FR-06 | Người dùng đã đăng nhập có thể xem/đổi tên/xóa lịch sử hội thoại theo danh sách phiên; mỗi phiên lưu ảnh gốc, ảnh overlay và toàn bộ hội thoại VQA |

---

### 2. Non-functional Requirements (Yêu cầu phi chức năng)

| ID | Mô tả |
|---|---|
| NFR-01 | Lịch sử hội thoại và dữ liệu người dùng được lưu trữ an toàn |
| NFR-02 | Chỉ người dùng đã đăng nhập vào tài khoản của chính mình mới có quyền truy cập dữ liệu lịch sử của mình |
| NFR-03 | Giao diện thân thiện, bác sĩ không cần đào tạo kỹ thuật vẫn sử dụng được |
| NFR-04 | Chỉ Admin mới có quyền tạo/xóa tài khoản người dùng |
| NFR-05 | Hệ thống ghi lại Audit Log các hành động quan trọng (đăng nhập, upload ảnh, tạo/xóa tài khoản, xóa lịch sử) để Admin có thể kiểm tra khi cần |

---

### 3. Actors

> Hệ thống được triển khai và sử dụng trong phạm vi nội bộ bệnh viện.

#### 3.1 Người dùng được cấp tài khoản (Bác sĩ / Chuyên viên y tế)

- Đăng nhập và đăng xuất hệ thống
- Tải ảnh nội soi tiêu hóa lên hệ thống
- Xem kết quả phát hiện và phân vùng tổn thương
- Đặt câu hỏi và nhận câu trả lời về vùng tổn thương trong cùng một phiên hội thoại
- Quản lý lịch sử hội thoại (xem/đổi tên/xóa theo danh sách phiên)

#### 3.2 Quản trị viên (Admin)

- Quản lý người dùng: tạo/xem/xóa tài khoản bác sĩ/chuyên viên y tế
- Kiểm tra Audit Log khi cần

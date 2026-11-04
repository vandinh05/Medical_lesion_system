# Feature Specification

**Project:** Phát hiện và Phân vùng Tổn thương Y tế — Trả lời Câu hỏi dựa trên Nội dung Hình ảnh  
**Domain:** Computer Vision — Gastrointestinal Endoscopy Image Analysis  
**Dataset:** Kvasir-SEG, Kvasir-VQA-x1

---

## 1. Quản lý tài khoản (FR-01, FR-02)

| | Nội dung |
|---|---|
| **Tên tính năng** | Quản lý tài khoản |
| **Mô tả** | Admin tạo/xem/xóa tài khoản bác sĩ. Người dùng đăng nhập/đăng xuất hệ thống. |
| **Đầu vào** | Thông tin tài khoản (tên đăng nhập, mật khẩu, vai trò) |
| **Đầu ra** | Tài khoản được tạo/xóa; phiên đăng nhập được cấp hoặc thu hồi |
| **Ràng buộc** | Chỉ Admin mới có quyền tạo/xóa tài khoản; không cho phép tự ý đăng ký |

---

## 2. Phát hiện và phân vùng tổn thương (FR-03)

| | Nội dung |
|---|---|
| **Tên tính năng** | Phát hiện và phân vùng tổn thương |
| **Mô tả** | Hệ thống tự động phát hiện và khoanh vùng tổn thương trên ảnh nội soi tiêu hóa. |
| **Đầu vào** | Ảnh nội soi tiêu hóa (ảnh gốc) |
| **Đầu ra** | Ảnh overlay (ảnh gốc được phủ mask lên vùng tổn thương) |
| **Ràng buộc** | Chỉ xử lý ảnh nội soi ống mềm tiêu hóa; không xử lý ảnh y tế khác (X-quang, MRI, CT, siêu âm...); không xử lý ảnh không liên quan đến y tế. Chỉ chấp nhận định dạng JPG/PNG, dung lượng tối đa 10MB, độ phân giải tối thiểu 100×100 pixels |

---

## 3. Trả lời câu hỏi dựa trên hình ảnh (FR-04)

| | Nội dung |
|---|---|
| **Tên tính năng** | Trả lời câu hỏi dựa trên hình ảnh (VQA) |
| **Mô tả** | Người dùng được hỏi nhiều lần về vùng tổn thương trong cùng một phiên mà không cần tải ảnh lên lại. |
| **Đầu vào** | ảnh gốc + câu hỏi của người dùng bằng tiếng Anh |
| **Đầu ra** | Câu trả lời ngắn bằng tiếng Anh liên quan đến nội dung ảnh |
| **Ràng buộc** | Chỉ trả lời câu hỏi liên quan đến nội dung ảnh; không trả lời câu hỏi ngoài phạm vi ảnh. Câu hỏi phải bằng tiếng Anh, tối đa 200 ký tự |

---

## 4. Hiển thị kết quả (FR-05)

| | Nội dung |
|---|---|
| **Tên tính năng** | Hiển thị kết quả |
| **Mô tả** | Hiển thị trực quan toàn bộ kết quả phân tích lên giao diện Web |
| **Đầu vào** | Kết quả ảnh overlay + câu trả lời từ câu hỏi của người dùng |
| **Đầu ra** | Giao diện hiển thị 4 thành phần: ảnh gốc; ảnh overlay (ảnh gốc được phủ mask lên vùng tổn thương); khung hội thoại hỏi đáp; thông tin phiên (tên phiên do bác sĩ đặt hoặc mặc định theo tên file + thời gian tải lên) + ảnh thu nhỏ |
| **Ràng buộc** | — |

---

## 5. Quản lý lịch sử (FR-06)

| | Nội dung |
|---|---|
| **Tên tính năng** | Quản lý lịch sử |
| **Mô tả** | Người dùng xem danh sách các phiên theo thời gian và có thể xem lại chi tiết từng phiên |
| **Đầu vào** | Hành động của người dùng (xem/đổi tên/xóa) |
| **Đầu ra** | Danh sách phiên hiển thị theo tên phiên + thời gian; chi tiết từng phiên bao gồm ảnh gốc + ảnh overlay + toàn bộ hội thoại hỏi đáp |
| **Ràng buộc** | Mỗi người dùng chỉ truy cập được lịch sử của chính mình |


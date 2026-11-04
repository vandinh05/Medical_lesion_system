# Edge Cases

**Project:** Phát hiện và Phân vùng Tổn thương Y tế — Trả lời Câu hỏi dựa trên Nội dung Hình ảnh  
**Domain:** Computer Vision — Gastrointestinal Endoscopy Image Analysis  
**Dataset:** Kvasir-SEG, Kvasir-VQA-x1

---

## 1. Logic Edge Cases

| # | Tình huống | Mô tả | Cách xử lý |
|---|---|---|---|
| 1 | File upload không phải ảnh hợp lệ | Người dùng upload file có định dạng không được hỗ trợ (ví dụ: .pdf, .docx, .zip, .bmp...) | Backend kiểm tra MIME type + extension. Hệ thống chỉ chấp nhận định dạng JPG và PNG. Nếu không hợp lệ → từ chối, trả thông báo lỗi |
| 2 | File ảnh bị hỏng hoặc trống | File có đuôi .jpg/.png nhưng dữ liệu bên trong bị lỗi, không thể đọc được | Backend dùng thư viện PIL để mở ảnh. Nếu PIL không mở được → từ chối, trả thông báo lỗi |
| 3 | File có dung lượng quá lớn | Người dùng upload ảnh vượt quá dung lượng cho phép | Backend giới hạn tối đa 10MB. Vượt quá → từ chối, trả thông báo lỗi |
| 4 | Ảnh có độ phân giải quá nhỏ | Ảnh có kích thước quá thấp để model xử lý hiệu quả | Backend kiểm tra kích thước ảnh sau khi mở. Dưới 100×100 pixels → từ chối, trả thông báo lỗi |
| 5 | Câu hỏi VQA rỗng | Người dùng gửi câu hỏi không có nội dung hoặc chỉ chứa khoảng trắng | Frontend disable nút gửi khi input rỗng. Backend validate lại bằng `strip()`, nếu rỗng → từ chối |
| 6 | Câu hỏi VQA quá dài | Người dùng nhập câu hỏi vượt quá khả năng xử lý của model | Frontend giới hạn tối đa 200 ký tự và hiển thị bộ đếm ký tự (ví dụ "25/200"). Backend validate lại, vượt quá → từ chối |
| 7 | Câu hỏi VQA không phải tiếng Anh | Người dùng nhập câu hỏi bằng ngôn ngữ khác (tiếng Việt, tiếng Trung...). Model BLIP chỉ được huấn luyện trên tiếng Anh, input ngôn ngữ khác sẽ cho kết quả vô nghĩa | Backend dùng thư viện `langdetect` kiểm tra ngôn ngữ. Nếu không phải tiếng Anh → từ chối, trả thông báo yêu cầu nhập bằng tiếng Anh |
| 8 | Mất embeddings cache giữa phiên | Server bị restart trong khi bác sĩ đang sử dụng phiên VQA. Image embeddings được lưu trong RAM sẽ bị mất | Khi backend không tìm thấy embeddings trong cache → đọc ảnh gốc từ filesystem, gọi lại `encode_image()` để tái tạo embeddings, sau đó tiếp tục xử lý VQA bình thường |
| 9 | Tài khoản bị xóa khi đang đăng nhập | Admin xóa tài khoản bác sĩ trong khi bác sĩ đó vẫn đang sử dụng hệ thống. Token chưa hết hạn nhưng tài khoản không còn tồn tại | Auth middleware sau khi xác thực token, thêm bước kiểm tra user_id có còn tồn tại trong database không. Nếu không → trả lỗi 401, frontend chuyển về trang đăng nhập |
| 10 | Đăng nhập đồng thời trên nhiều thiết bị | Cùng một tài khoản đăng nhập trên hai thiết bị khác nhau, gây xung đột phiên và cache | Bảng Users lưu thêm cột `current_token`. Mỗi lần đăng nhập mới → ghi đè token mới. Auth middleware kiểm tra token trong request có khớp với `current_token` trong database không. Nếu không khớp → phiên cũ bị vô hiệu hóa, frontend chuyển về trang đăng nhập |
| 11 | Xóa tài khoản khi user có nhiều phiên chứa ảnh | Admin xóa tài khoản bác sĩ đang có nhiều phiên, mỗi phiên có file ảnh trên filesystem | Backend xóa toàn bộ folder ảnh trên filesystem (`storage/images/{user_id}/`) trước, sau đó xóa user trong database. Sessions + Conversations tự xóa theo CASCADE. Audit_Logs giữ lại với user_id = NULL, username vẫn còn để truy vết |

---

## 2. AI Solution Edge Cases

| # | Tình huống | Mô tả | Cách xử lý |
|---|---|---|---|
| 12 | Ảnh không phải nội soi tiêu hóa | Người dùng upload ảnh y tế khác (X-quang, MRI) hoặc ảnh không liên quan (ảnh chụp thường). Model vẫn chạy nhưng kết quả không có ý nghĩa lâm sàng | Chấp nhận rủi ro. Hệ thống không có bước phân loại ảnh đầu vào |
| 13 | U-Net không phát hiện tổn thương | Model phân vùng trả về mask trống (không tìm thấy polyp trong ảnh) | Cột overlay hiển thị ảnh gốc kèm thông báo "The model did not detect any polyps in this image". Vẫn cho phép hỏi VQA vì BLIP xử lý trên ảnh gốc, không phụ thuộc vào mask |
| 14 | U-Net trả mask có nhiều vùng nhỏ rải rác | Kết quả phân vùng có nhiều vùng tổn thương nhỏ. Có thể là nhiều polyp thật hoặc model không chắc chắn | Hiển thị nguyên mask mà model trả ra, không áp dụng bước lọc. Bác sĩ là người có chuyên môn tự đánh giá kết quả. Hệ thống chỉ hỗ trợ, không thay thế phán đoán lâm sàng |
| 15 | Câu hỏi ngoài phạm vi nội dung ảnh | Người dùng hỏi những câu mà ảnh không chứa thông tin để trả lời (ví dụ: hỏi về đơn thuốc, tiền sử bệnh). BLIP vẫn sinh câu trả lời nhưng có thể sai và không đáng tin cậy | Chấp nhận rủi ro. Việc phân loại câu hỏi hợp lệ / không hợp lệ đòi hỏi model NLU riêng, vượt quá scope đề tài. Đối tượng sử dụng là bác sĩ — có khả năng đánh giá độ tin cậy của câu trả lời |
| 16 | BLIP trả câu trả lời bất thường | Model sinh ra câu trả lời lặp từ (ví dụ: "yes yes yes"), chuỗi vô nghĩa, hoặc câu trả lời không liên quan đến câu hỏi. Đây là hành vi phổ biến của generative model | Chấp nhận |
| 17 | Ảnh chất lượng thấp | Ảnh bị mờ, tối, hoặc góc chụp không rõ. Model vẫn xử lý được nhưng kết quả có thể kém chính xác | Chấp nhận rủi ro. Ảnh nội soi thực tế thường có chất lượng không đồng đều, việc đặt ngưỡng chất lượng có thể từ chối nhầm ảnh hợp lệ |

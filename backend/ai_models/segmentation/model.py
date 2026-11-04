"""
Segmentation model (U-Net) — MOCK IMPLEMENTATION.

Nhóm CV sẽ thay nội dung hàm predict_mask() bằng model U-Net thật đã train
(đọc weights từ ./weights/). Giữ nguyên chữ ký hàm (input/output) theo
interface contract trong doc/tech_solution.md mục 4 để backend không cần
sửa gì ở routers/sessions.py.

Input:  PIL Image
Output: (mask: numpy array cùng kích thước ảnh, overlay: PIL Image)
"""

import numpy as np
from PIL import Image


def predict_mask(image: Image.Image) -> tuple[np.ndarray, Image.Image]:
    # TODO(nhóm CV): thay bằng inference U-Net thật.
    # Mock hiện tại: luôn trả mask rỗng (không phát hiện polyp) + overlay = ảnh gốc,
    # để backend/frontend có thể test full luồng upload -> lưu -> hiển thị ngay.
    mask = np.zeros((image.height, image.width), dtype=np.uint8)
    overlay = image.copy()
    return mask, overlay

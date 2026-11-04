"""
VQA model (BLIP base) — MOCK IMPLEMENTATION.

Nhóm CV sẽ thay nội dung 2 hàm dưới bằng model BLIP đã fine-tune (đọc
weights từ ./weights/). Giữ nguyên chữ ký hàm theo interface contract
trong doc/tech_solution.md mục 4 để backend không cần sửa gì ở
routers/sessions.py.
"""

from typing import Any

from PIL import Image


def encode_image(image: Image.Image) -> Any:
    # TODO(nhóm CV): thay bằng ViT encoder thật, trả về tensor embeddings.
    # Mock hiện tại: trả một dict giả đóng vai trò "embeddings" để cache trong RAM.
    return {"mock": True, "size": image.size}


def ask_vqa(embeddings: Any, question: str) -> str:
    # TODO(nhóm CV): thay bằng BLIP text decoder thật (cross-attention với embeddings).
    return f"[MOCK] Đây là câu trả lời giả cho câu hỏi: \"{question}\". Sẽ được thay bằng model BLIP thật."

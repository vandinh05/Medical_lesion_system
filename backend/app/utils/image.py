"""
Image upload validation + filesystem storage helpers.

Validation follows doc/edge_cases.md #1-4:
  - only .jpg/.jpeg/.png
  - max 10MB
  - must open with PIL (rejects corrupted files)
  - min 100x100 px
"""

import uuid
from io import BytesIO
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from PIL import Image, UnidentifiedImageError

from app.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB
MIN_WIDTH_PX = 100
MIN_HEIGHT_PX = 100


def validate_and_open_image(file: UploadFile, raw_bytes: bytes) -> Image.Image:
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS or file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chỉ chấp nhận định dạng ảnh JPG hoặc PNG.",
        )

    if len(raw_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dung lượng ảnh vượt quá 10MB.",
        )

    try:
        image = Image.open(BytesIO(raw_bytes))
        image.verify()  # checks the file isn't corrupted
        # verify() leaves the file unusable for further ops -> reopen
        image = Image.open(BytesIO(raw_bytes)).convert("RGB")
    except (UnidentifiedImageError, OSError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File ảnh bị hỏng hoặc không đọc được.",
        )

    if image.width < MIN_WIDTH_PX or image.height < MIN_HEIGHT_PX:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ảnh phải có kích thước tối thiểu {MIN_WIDTH_PX}x{MIN_HEIGHT_PX} pixels.",
        )

    return image


def user_storage_dir(user_id: int) -> Path:
    d = settings.STORAGE_DIR / "images" / str(user_id)
    d.mkdir(parents=True, exist_ok=True)
    return d


def save_image(image: Image.Image, user_id: int, suffix: str) -> Path:
    """Saves `image` as a .png under storage/images/{user_id}/ and returns the path."""
    filename = f"{uuid.uuid4().hex}_{suffix}.png"
    path = user_storage_dir(user_id) / filename
    image.save(path, format="PNG")
    return path


def to_public_url(path: Path) -> str:
    """Path on disk -> URL the frontend can fetch (served under /storage)."""
    rel = path.relative_to(settings.STORAGE_DIR)
    return f"/storage/{rel.as_posix()}"

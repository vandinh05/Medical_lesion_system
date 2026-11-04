"""
Bridge between the API layer and ai_models/ (owned by the CV team).

ai_models/segmentation/model.py and ai_models/vqa/model.py are still
empty stubs at the time of writing. This module tries to import the
real functions; if they aren't implemented yet, it transparently
falls back to a mock so Sessions endpoints can be built and tested
end-to-end right now. Once the CV team fills in predict_mask() /
encode_image() / ask_vqa(), this file starts using them automatically
-- no changes needed in routers/sessions.py.

In-memory embeddings cache: {session_id: embeddings}. Cleared on
server restart, in which case routers/sessions.py recomputes it from
the stored original image (doc/edge_cases.md #8).
"""

import numpy as np
from PIL import Image

embeddings_cache: dict[int, object] = {}

try:
    from ai_models.segmentation.model import predict_mask as _predict_mask
except (ImportError, AttributeError):
    _predict_mask = None

try:
    from ai_models.vqa.model import ask_vqa as _ask_vqa
    from ai_models.vqa.model import encode_image as _encode_image
except (ImportError, AttributeError):
    _encode_image = None
    _ask_vqa = None


def run_segmentation(image: Image.Image) -> tuple[np.ndarray, Image.Image]:
    """Returns (mask, overlay_image). Falls back to an empty mask
    (no polyp) + the original image as overlay if the real model
    isn't wired up yet."""
    if _predict_mask is not None:
        return _predict_mask(image)

    mask = np.zeros((image.height, image.width), dtype=np.uint8)
    overlay = image.copy()
    return mask, overlay


def run_encode_image(image: Image.Image, session_id: int):
    if _encode_image is not None:
        embeddings = _encode_image(image)
    else:
        embeddings = image  # mock placeholder: cache the image itself
    embeddings_cache[session_id] = embeddings
    return embeddings


def run_ask_vqa(embeddings, question: str) -> str:
    if _ask_vqa is not None:
        return _ask_vqa(embeddings, question)
    return (
        "[Mock answer] VQA model chưa được tích hợp. "
        f"Câu hỏi đã nhận: \"{question}\""
    )

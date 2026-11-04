"""
Doctor-facing endpoints for uploading images and running VQA.

/upload and /ask currently run through app.utils.ai_bridge, which
falls back to a mock (empty mask, canned answer) until the CV team's
ai_models/segmentation and ai_models/vqa are implemented. Everything
else (list/detail/rename/delete) is fully real against MySQL +
filesystem already.
"""

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from langdetect import LangDetectException, detect
from sqlalchemy import desc
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.conversation import Conversation
from app.models.session import SessionRecord
from app.models.user import User
from app.schemas.session import (
    ConversationOut,
    MessageResponse,
    RenameRequest,
    SessionDetailOut,
    SessionListItem,
    UploadResponse,
)
from app.schemas.vqa import AskRequest, AskResponse
from app.utils.ai_bridge import embeddings_cache, run_ask_vqa, run_encode_image, run_segmentation
from app.utils.audit import ActionType, log_action
from app.utils.image import save_image, to_public_url, validate_and_open_image
from PIL import Image

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


def _get_owned_session(db: DBSession, session_id: int, user: User) -> SessionRecord:
    """Fetches a session and 404s if missing OR belongs to another user
    (returning 404 instead of 403 avoids leaking that the id exists)."""
    session = (
        db.query(SessionRecord)
        .filter(SessionRecord.session_id == session_id, SessionRecord.user_id == user.user_id)
        .first()
    )
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy phiên.")
    return session


@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile,
    db: DBSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    raw_bytes = await file.read()
    image = validate_and_open_image(file, raw_bytes)

    org_path = save_image(image, user.user_id, "org")

    mask, overlay = run_segmentation(image)
    overlay_path = save_image(overlay, user.user_id, "overlay")
    has_polyp = bool(mask.sum() > 0)

    session = SessionRecord(
        user_id=user.user_id,
        session_name=file.filename or "Untitled",
        img_org_path=str(org_path),
        img_overlay_path=str(overlay_path),
        has_polyp=has_polyp,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    run_encode_image(image, session.session_id)

    log_action(
        db,
        action_type=ActionType.UPLOAD_IMAGE,
        username=user.username,
        user_id=user.user_id,
        details=f"Upload '{session.session_name}' (session #{session.session_id})",
    )

    return UploadResponse(
        session_id=session.session_id,
        session_name=session.session_name,
        has_polyp=session.has_polyp,
        img_overlay_url=to_public_url(overlay_path),
    )


@router.post("/{session_id}/ask", response_model=AskResponse)
def ask_question(
    session_id: int,
    payload: AskRequest,
    db: DBSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    session = _get_owned_session(db, session_id, user)

    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Câu hỏi không được để trống.")
    if len(question) > 200:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Câu hỏi vượt quá 200 ký tự.")

    try:
        if detect(question) != "en":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vui lòng nhập câu hỏi bằng tiếng Anh.",
            )
    except LangDetectException:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể xác định ngôn ngữ của câu hỏi. Vui lòng nhập bằng tiếng Anh.",
        )

    embeddings = embeddings_cache.get(session_id)
    if embeddings is None:
        # Server restarted since upload -> cache is gone (edge case #8).
        # Re-derive it from the original image saved on disk.
        image = Image.open(session.img_org_path).convert("RGB")
        embeddings = run_encode_image(image, session_id)

    answer = run_ask_vqa(embeddings, question)

    db.add(Conversation(session_id=session_id, role="user", content=question))
    db.add(Conversation(session_id=session_id, role="system", content=answer))
    db.commit()

    return AskResponse(answer=answer)


@router.get("", response_model=list[SessionListItem])
def list_sessions(
    db: DBSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    sessions = (
        db.query(SessionRecord)
        .filter(SessionRecord.user_id == user.user_id)
        .order_by(desc(SessionRecord.created_at))
        .all()
    )
    return [SessionListItem.model_validate(s) for s in sessions]


@router.get("/{session_id}", response_model=SessionDetailOut)
def get_session(
    session_id: int,
    db: DBSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    session = _get_owned_session(db, session_id, user)
    conversation = (
        db.query(Conversation)
        .filter(Conversation.session_id == session_id)
        .order_by(Conversation.timestamp)
        .all()
    )

    return SessionDetailOut(
        session_id=session.session_id,
        session_name=session.session_name,
        has_polyp=session.has_polyp,
        img_org_url=to_public_url(Path(session.img_org_path)),
        img_overlay_url=to_public_url(Path(session.img_overlay_path)),
        created_at=session.created_at,
        conversation=[ConversationOut.model_validate(c) for c in conversation],
    )


@router.patch("/{session_id}/rename", response_model=SessionListItem)
def rename_session(
    session_id: int,
    payload: RenameRequest,
    db: DBSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    session = _get_owned_session(db, session_id, user)
    old_name = session.session_name
    session.session_name = payload.session_name.strip()
    db.commit()
    db.refresh(session)

    log_action(
        db,
        action_type=ActionType.RENAME_SESSION,
        username=user.username,
        user_id=user.user_id,
        details=f"'{old_name}' → '{session.session_name}' (session #{session_id})",
    )

    return SessionListItem.model_validate(session)


@router.delete("/{session_id}", response_model=MessageResponse)
def delete_session(
    session_id: int,
    db: DBSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    session = _get_owned_session(db, session_id, user)
    session_name = session.session_name

    # 1. Remove image files from disk first.
    for p in (session.img_org_path, session.img_overlay_path):
        path = Path(p)
        if path.exists():
            path.unlink(missing_ok=True)

    # 2. Remove DB rows (Conversations cascade via FK).
    db.delete(session)
    db.commit()

    # 3. Drop the in-memory embeddings cache for this session, if any.
    embeddings_cache.pop(session_id, None)

    log_action(
        db,
        action_type=ActionType.DELETE_SESSION,
        username=user.username,
        user_id=user.user_id,
        details=f"Xóa phiên '{session_name}' (session #{session_id})",
    )

    return MessageResponse(message=f"Đã xóa phiên '{session_name}'.")

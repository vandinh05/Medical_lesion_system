"""
Admin-only endpoints: manage doctor/admin accounts + view audit logs.
Every route here requires require_admin (role check -> 403 otherwise).
"""

import shutil

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.middleware.auth import require_admin
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.admin import AuditLogOut, CreateUserRequest, MessageResponse, UserOut
from app.utils.audit import ActionType, log_action
from app.utils.security import hash_password

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: CreateUserRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên đăng nhập đã tồn tại.",
        )

    new_user = User(
        username=payload.username,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    log_action(
        db,
        action_type=ActionType.CREATE_ACCOUNT,
        username=admin.username,
        user_id=admin.user_id,
        details=f"Tạo tài khoản '{new_user.username}' (role: {new_user.role})",
    )

    return UserOut.model_validate(new_user)


@router.get("/users", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    users = db.query(User).order_by(desc(User.created_at)).all()
    return [UserOut.model_validate(u) for u in users]


@router.delete("/users/{user_id}", response_model=MessageResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if user_id == admin.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể tự xóa tài khoản đang đăng nhập.",
        )

    target = db.query(User).filter(User.user_id == user_id).first()
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tài khoản.")

    target_username = target.username
    target_role = target.role

    # 1. Remove that user's image folder from the filesystem first.
    user_storage_dir = settings.STORAGE_DIR / "images" / str(user_id)
    if user_storage_dir.exists():
        shutil.rmtree(user_storage_dir, ignore_errors=True)

    # 2. Delete the user row. Sessions + Conversations cascade via FK
    #    (ON DELETE CASCADE); Audit_Logs referencing this user_id are
    #    kept, with user_id set to NULL (ON DELETE SET NULL).
    db.delete(target)
    db.commit()

    # 3. Audit log entry for the deletion itself, written after the
    #    user is gone so it isn't affected by the SET NULL above.
    log_action(
        db,
        action_type=ActionType.DELETE_ACCOUNT,
        username=admin.username,
        user_id=admin.user_id,
        details=f"Xóa tài khoản '{target_username}' (role: {target_role})",
    )

    return MessageResponse(message=f"Đã xóa tài khoản '{target_username}'.")


@router.get("/audit-logs", response_model=list[AuditLogOut])
def list_audit_logs(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    logs = db.query(AuditLog).order_by(desc(AuditLog.timestamp)).all()
    return [AuditLogOut.model_validate(log) for log in logs]

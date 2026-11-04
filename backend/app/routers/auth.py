from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse, MessageResponse, UserOut
from app.utils.audit import ActionType, log_action
from app.utils.security import create_access_token, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()

    # Username, password AND role must all match.
    # Kept as one generic error message so the response doesn't leak
    # which part (username vs password vs role) was wrong.
    invalid_credentials = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Tên đăng nhập, mật khẩu hoặc vai trò không đúng.",
    )

    if user is None or not verify_password(payload.password, user.hashed_password):
        log_action(
            db,
            action_type=ActionType.LOGIN_FAILED,
            username=payload.username,
            details="Sai tên đăng nhập hoặc mật khẩu",
        )
        raise invalid_credentials

    if user.role != payload.role:
        log_action(
            db,
            action_type=ActionType.LOGIN_FAILED,
            username=payload.username,
            user_id=user.user_id,
            details=f"Sai vai trò (chọn '{payload.role}', thực tế '{user.role}')",
        )
        raise invalid_credentials

    token = create_access_token(user_id=user.user_id, username=user.username, role=user.role)

    # Overwrite current_token: logging in elsewhere invalidates any
    # older session for this account (edge case #10).
    user.current_token = token
    db.commit()
    db.refresh(user)

    log_action(
        db,
        action_type=ActionType.LOGIN_SUCCESS,
        username=user.username,
        user_id=user.user_id,
    )

    return LoginResponse(token=token, user=UserOut.model_validate(user))


@router.post("/logout", response_model=MessageResponse)
def logout(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.current_token = None
    db.commit()

    log_action(
        db,
        action_type=ActionType.LOGOUT,
        username=current_user.username,
        user_id=current_user.user_id,
    )

    return MessageResponse(message="Đăng xuất thành công.")

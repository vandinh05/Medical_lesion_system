"""
Auth dependencies used by every protected router.

Per doc/tech_solution.md, every request except login must carry a
bearer token, and 3 checks are performed in order:
  1. Token valid (signature + not expired) -> decode user_id/role
  2. user_id still exists in the database
  3. token matches users.current_token (guards against a newer
     login on another device invalidating this session)
Any failure -> 401. Admin-only endpoints additionally require role
"admin" -> 403 otherwise.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.utils.security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired session. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None or not credentials.credentials:
        raise unauthorized

    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise unauthorized

    user_id = payload.get("sub")
    if user_id is None:
        raise unauthorized

    # Step 2: user must still exist (admin may have deleted the account)
    user = db.query(User).filter(User.user_id == int(user_id)).first()
    if user is None:
        raise unauthorized

    # Step 3: token must match the most recently issued one for this user
    if user.current_token != token:
        raise unauthorized

    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required.",
        )
    return user

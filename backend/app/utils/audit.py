"""
Shared helper to write Audit Log rows.

Any router (auth, sessions, admin) can call log_action() after an
action succeeds (or fails, e.g. failed login) instead of building
the AuditLog row by hand every time.
"""

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


# The 8 action types defined in doc/tech_solution.md section 3.
class ActionType:
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILED = "login_failed"
    LOGOUT = "logout"
    UPLOAD_IMAGE = "upload_image"
    DELETE_SESSION = "delete_session"
    RENAME_SESSION = "rename_session"
    CREATE_ACCOUNT = "create_account"
    DELETE_ACCOUNT = "delete_account"


def log_action(
    db: Session,
    *,
    action_type: str,
    username: str,
    user_id: int | None = None,
    details: str | None = None,
) -> None:
    entry = AuditLog(
        user_id=user_id,
        username=username,
        action_type=action_type,
        details=details,
    )
    db.add(entry)
    db.commit()

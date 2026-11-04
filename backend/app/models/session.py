from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# Named SessionRecord (not "Session") to avoid clashing with
# SQLAlchemy's own Session / the DB session used across the app.
class SessionRecord(Base):
    __tablename__ = "sessions"

    session_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    session_name: Mapped[str] = mapped_column(String(255), nullable=False)
    img_org_path: Mapped[str] = mapped_column(String(500), nullable=False)
    img_overlay_path: Mapped[str] = mapped_column(String(500), nullable=False)
    has_polyp: Mapped[bool] = mapped_column(Boolean, nullable=False)
    created_at: Mapped[object] = mapped_column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="sessions")
    conversations = relationship(
        "Conversation", back_populates="session", cascade="all, delete-orphan"
    )

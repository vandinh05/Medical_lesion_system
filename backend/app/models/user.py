from sqlalchemy import DateTime, Enum, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(Enum("doctor", "admin", name="user_role"), nullable=False)
    # Holds the JWT issued at the most recent successful login.
    # Auth middleware compares this against the token in each request
    # so that logging in on a new device invalidates the old session.
    current_token: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[object] = mapped_column(DateTime, server_default=func.now())

    sessions = relationship("SessionRecord", back_populates="user", cascade="all, delete-orphan")

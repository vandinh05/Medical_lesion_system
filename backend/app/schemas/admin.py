from datetime import datetime

from pydantic import BaseModel, Field


class CreateUserRequest(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=8)
    role: str = Field(pattern="^(doctor|admin)$")


class UserOut(BaseModel):
    user_id: int
    username: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class AuditLogOut(BaseModel):
    log_id: int
    user_id: int | None
    username: str
    action_type: str
    details: str | None
    timestamp: datetime

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    message: str

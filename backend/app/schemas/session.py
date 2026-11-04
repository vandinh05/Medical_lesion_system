from datetime import datetime

from pydantic import BaseModel, Field


class ConversationOut(BaseModel):
    message_id: int
    role: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True


class SessionListItem(BaseModel):
    session_id: int
    session_name: str
    has_polyp: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SessionDetailOut(BaseModel):
    session_id: int
    session_name: str
    has_polyp: bool
    img_org_url: str
    img_overlay_url: str
    created_at: datetime
    conversation: list[ConversationOut]


class UploadResponse(BaseModel):
    session_id: int
    session_name: str
    has_polyp: bool
    img_overlay_url: str


class RenameRequest(BaseModel):
    session_name: str = Field(min_length=1, max_length=255)


class MessageResponse(BaseModel):
    message: str

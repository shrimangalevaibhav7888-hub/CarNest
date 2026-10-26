from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel
from app.models.enums import NotificationType


class NotificationCreate(BaseModel):
    user_id: int
    patient_id: Optional[int] = None
    title: str
    message: str
    type: NotificationType = NotificationType.SYSTEM
    action_url: Optional[str] = None
    metadata_json: Optional[Any] = None


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    patient_id: Optional[int] = None
    title: str
    message: str
    type: NotificationType
    is_read: bool
    read_at: Optional[datetime] = None
    action_url: Optional[str] = None
    metadata_json: Optional[Any] = None
    created_at: datetime

    class Config:
        from_attributes = True

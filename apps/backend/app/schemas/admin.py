from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict
from app.models.enums import UserRole, VerificationStatus


class AdminUserItem(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    phone: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminUserStatusUpdate(BaseModel):
    is_active: bool


class AdminCaregiverVerificationUpdate(BaseModel):
    verification_status: VerificationStatus
    verification_notes: Optional[str] = None


class AdminStatsResponse(BaseModel):
    total_users: int
    total_elderly: int
    total_family: int
    total_caregivers: int
    verified_caregivers: int
    pending_verifications: int
    total_active_tasks: int
    total_emergency_events: int

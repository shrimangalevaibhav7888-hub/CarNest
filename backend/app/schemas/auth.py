from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.models.enums import UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    remember_me: Optional[bool] = False


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: Optional[str] = None
    full_name: str = Field(..., min_length=2)
    role: UserRole = UserRole.ELDERLY
    phone: Optional[str] = None
    # Elderly-specific profile fields
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    medical_notes: Optional[str] = None
    care_requirements: Optional[List[str]] = None
    # Family-specific profile fields
    relationship: Optional[str] = None
    linked_elderly_email: Optional[str] = None
    # Caregiver-specific profile fields
    experience_years: Optional[int] = None
    skills: Optional[List[str]] = None
    availability: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str
    email: str


class UserSummary(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    patient_id: Optional[int] = None
    caregiver_id: Optional[int] = None
    verification_status: Optional[str] = None
    linked_patient_ids: Optional[List[int]] = None
    is_active: bool = True
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserSummary

from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel
from app.models.enums import CaregiverAvailability, VerificationStatus


class CaregiverCreate(BaseModel):
    user_id: Optional[int] = None
    skills: List[str] = []
    experience_years: int = 3
    languages: List[str] = ["English"]
    availability_status: CaregiverAvailability = CaregiverAvailability.AVAILABLE
    service_area: str = "North District"
    care_categories: List[str] = []
    bio: Optional[str] = None
    hourly_rate: float = 28.5
    phone: Optional[str] = None


class CaregiverUpdate(BaseModel):
    skills: Optional[List[str]] = None
    experience_years: Optional[int] = None
    languages: Optional[List[str]] = None
    availability_status: Optional[CaregiverAvailability] = None
    service_area: Optional[str] = None
    care_categories: Optional[List[str]] = None
    bio: Optional[str] = None
    hourly_rate: Optional[float] = None
    phone: Optional[str] = None


class CaregiverResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    
    skills: List[str] = []
    experience_years: int
    languages: List[str] = []
    availability_status: CaregiverAvailability
    service_area: str
    care_categories: List[str] = []
    verification_status: VerificationStatus
    rating: float
    max_workload: int
    current_workload: int
    bio: Optional[str] = None
    hourly_rate: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CaregiverMatchRequest(BaseModel):
    patient_id: int
    required_skills: Optional[List[str]] = None
    preferred_language: Optional[str] = None
    service_area: Optional[str] = None
    care_categories: Optional[List[str]] = None


class CaregiverMatchResult(BaseModel):
    caregiver: CaregiverResponse
    match_score: int  # 0 to 100 percentage
    matching_reasons: List[str]
    workload_status: str

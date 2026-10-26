from datetime import date, datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr
from app.models.enums import MobilityStatus, LivingSituation, DischargeStatus, FamilyRelationship


class EmergencyContactCreate(BaseModel):
    name: str
    relationship: str
    phone_number: str
    alternate_phone: Optional[str] = None
    email: Optional[EmailStr] = None
    is_primary: bool = False
    priority_order: int = 1


class EmergencyContactResponse(EmergencyContactCreate):
    id: int
    patient_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PatientCreate(BaseModel):
    user_id: Optional[int] = None  # If created directly with an existing user
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    
    age: int = 70
    gender: str = "Not Specified"
    address: str = "Home Address"
    date_of_birth: Optional[date] = None
    mobility_status: MobilityStatus = MobilityStatus.ASSISTED
    living_situation: LivingSituation = LivingSituation.LIVES_ALONE
    preferred_language: str = "English"
    care_requirements: List[str] = []
    allergies: List[str] = []
    medical_history: Optional[str] = None
    discharge_status: DischargeStatus = DischargeStatus.DISCHARGE_READY
    emergency_notes: Optional[str] = None
    hospital_id: Optional[int] = None
    room_number: Optional[str] = None


class PatientUpdate(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    mobility_status: Optional[MobilityStatus] = None
    living_situation: Optional[LivingSituation] = None
    preferred_language: Optional[str] = None
    care_requirements: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    medical_history: Optional[str] = None
    discharge_status: Optional[DischargeStatus] = None
    emergency_notes: Optional[str] = None
    room_number: Optional[str] = None


class PatientResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    hospital_id: Optional[int] = None
    
    date_of_birth: Optional[date] = None
    age: int
    gender: str
    address: str
    room_number: Optional[str] = None
    
    mobility_status: MobilityStatus
    living_situation: LivingSituation
    preferred_language: str
    care_requirements: List[str] = []
    allergies: List[str] = []
    medical_history: Optional[str] = None
    discharge_status: DischargeStatus
    emergency_notes: Optional[str] = None
    
    emergency_contacts: List[EmergencyContactResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LinkFamilyRequest(BaseModel):
    elderly_email: str
    relationship: Optional[str] = "Family"

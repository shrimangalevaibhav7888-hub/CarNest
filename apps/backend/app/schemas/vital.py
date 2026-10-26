from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.enums import VitalFlagStatus


class VitalRecordCreate(BaseModel):
    patient_id: int
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    heart_rate: Optional[int] = None
    temperature: Optional[float] = None
    oxygen_saturation: Optional[int] = None
    weight: Optional[float] = None
    blood_glucose: Optional[float] = None
    notes: Optional[str] = None


class VitalRecordResponse(BaseModel):
    id: int
    patient_id: int
    recorded_by_user_id: Optional[int] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    heart_rate: Optional[int] = None
    temperature: Optional[float] = None
    oxygen_saturation: Optional[int] = None
    weight: Optional[float] = None
    blood_glucose: Optional[float] = None
    notes: Optional[str] = None
    ai_flag_status: VitalFlagStatus
    ai_flag_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

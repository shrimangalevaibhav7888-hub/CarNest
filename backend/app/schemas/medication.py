from datetime import date, time, datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.enums import MedicationStatus


class MedicationScheduleResponse(BaseModel):
    id: int
    medication_id: int
    patient_id: int
    scheduled_date: date
    scheduled_time: time
    status: MedicationStatus
    taken_at: Optional[datetime] = None
    confirmed_by_user_id: Optional[int] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class MedicationCreate(BaseModel):
    patient_id: Optional[int] = 1
    elderlyId: Optional[str] = None
    name: str
    dosage: str
    frequency: str
    instructions: Optional[str] = None
    prescribing_doctor: Optional[str] = None
    start_date: Optional[date] = None
    startDate: Optional[str] = None
    end_date: Optional[date] = None
    is_active: bool = True
    isActive: Optional[bool] = True
    times: Optional[List[str]] = None
    schedule_times: Optional[List[str]] = None


class MedicationActionRequest(BaseModel):
    action: str  # 'TAKEN', 'SKIPPED', 'UPCOMING'
    loggedBy: Optional[str] = "Elderly"
    notes: Optional[str] = None
    minutes: Optional[int] = 15



class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    instructions: Optional[str] = None
    prescribing_doctor: Optional[str] = None
    is_active: Optional[bool] = None
    end_date: Optional[date] = None


class MedicationResponse(BaseModel):
    id: int
    patient_id: int
    name: str
    dosage: str
    frequency: str
    instructions: Optional[str] = None
    prescribing_doctor: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    is_active: bool
    schedules: List[MedicationScheduleResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class MedicationStatusUpdate(BaseModel):
    status: MedicationStatus
    notes: Optional[str] = None

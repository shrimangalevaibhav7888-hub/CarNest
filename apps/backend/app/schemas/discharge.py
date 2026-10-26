from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel
from app.models.enums import HomeReadinessStatus


class DischargeRecordCreate(BaseModel):
    patient_id: int
    hospital_id: Optional[int] = None
    discharge_date: Optional[date] = None
    medical_summary: str
    mobility_requirements: str = "Walker assistance required for ambulation."
    dietary_requirements: str = "Low sodium diet, maintain adequate hydration."
    hygiene_requirements: str = "Assistance with bathing and grooming."
    post_discharge_instructions: str
    home_readiness_status: HomeReadinessStatus = HomeReadinessStatus.READY_FOR_DISCHARGE
    follow_up_date: Optional[date] = None


class DischargeRecordResponse(BaseModel):
    id: int
    patient_id: int
    hospital_id: int
    coordinator_id: Optional[int] = None
    discharge_date: date
    medical_summary: str
    mobility_requirements: str
    dietary_requirements: str
    hygiene_requirements: str
    post_discharge_instructions: str
    home_readiness_status: HomeReadinessStatus
    follow_up_date: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True

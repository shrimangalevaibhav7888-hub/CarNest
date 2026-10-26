from datetime import date, datetime
from typing import Optional, List, Any
from pydantic import BaseModel
from app.models.enums import CarePlanStatus


class CarePlanCreate(BaseModel):
    patient_id: int
    assigned_caregiver_id: Optional[int] = None
    discharge_record_id: Optional[int] = None
    title: str = "Post-Discharge Recovery & Home-Care Plan"
    goals: List[str] = []
    status: CarePlanStatus = CarePlanStatus.ACTIVE
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    required_services: List[str] = []
    emergency_instructions: Optional[str] = None
    monitoring_requirements: Optional[str] = None


class CarePlanUpdate(BaseModel):
    assigned_caregiver_id: Optional[int] = None
    title: Optional[str] = None
    goals: Optional[List[str]] = None
    status: Optional[CarePlanStatus] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    required_services: Optional[List[str]] = None
    emergency_instructions: Optional[str] = None
    monitoring_requirements: Optional[str] = None


class CarePlanResponse(BaseModel):
    id: int
    patient_id: int
    assigned_caregiver_id: Optional[int] = None
    discharge_record_id: Optional[int] = None
    created_by_user_id: int
    title: str
    goals: List[str] = []
    status: CarePlanStatus
    start_date: date
    end_date: Optional[date] = None
    required_services: List[str] = []
    emergency_instructions: Optional[str] = None
    monitoring_requirements: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.enums import EmergencyStatus, EmergencySeverity


class EmergencyTriggerRequest(BaseModel):
    patient_id: Optional[int] = 1
    severity: EmergencySeverity = EmergencySeverity.HIGH
    location: Optional[str] = "Home Address"
    notes: Optional[str] = "Elderly patient pressed emergency SOS help button."


class EmergencyStatusUpdate(BaseModel):
    status: EmergencyStatus
    notes: Optional[str] = None


class EmergencyEventResponse(BaseModel):
    id: int
    patient_id: int
    patient_name: Optional[str] = None
    triggered_by_user_id: int
    status: EmergencyStatus
    severity: EmergencySeverity
    location: str
    notes: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

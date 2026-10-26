from typing import Optional
from pydantic import BaseModel


class AppointmentCreate(BaseModel):
    elderlyId: Optional[str] = "1"
    elderlyName: Optional[str] = "Eleanor Vance"
    doctorName: str
    hospitalName: Optional[str] = "St. Jude Outpatient Center"
    specialty: Optional[str] = "Cardiology"
    date: str
    time: str
    purpose: str
    doctorPhone: Optional[str] = ""
    location: Optional[str] = "Suite 300, St. Jude Outpatient Center"
    notes: Optional[str] = ""
    status: Optional[str] = "UPCOMING"
    reminderSent: Optional[bool] = False
    accompaniedByCaregiver: Optional[bool] = True
    caregiverName: Optional[str] = "David Miller, RN"


class AppointmentUpdate(BaseModel):
    doctorName: Optional[str] = None
    hospitalName: Optional[str] = None
    specialty: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    purpose: Optional[str] = None
    doctorPhone: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    accompaniedByCaregiver: Optional[bool] = None
    caregiverName: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: str
    elderlyId: str
    elderlyName: str
    doctorName: str
    hospitalName: str
    specialty: str
    date: str
    time: str
    purpose: str
    doctorPhone: Optional[str] = ""
    location: str
    notes: Optional[str] = ""
    status: str
    reminderSent: bool = False
    accompaniedByCaregiver: bool = True
    caregiverName: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

    class Config:
        from_attributes = True

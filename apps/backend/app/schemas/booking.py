from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class BookingCreate(BaseModel):
    elderlyId: Optional[str] = "1"
    elderlyName: Optional[str] = "Eleanor Vance"
    elderlyAddress: Optional[str] = "742 Evergreen Healthcare Ave"
    familyId: Optional[str] = "1"
    familyName: Optional[str] = "Sarah Vance"
    familyPhone: Optional[str] = "+1 (555) 019-2831"
    caregiverId: str
    caregiverName: str
    caregiverPhone: Optional[str] = "+1 (555) 019-4412"
    caregiverAvatar: Optional[str] = None
    date: str
    timeSlot: Optional[str] = "Morning (09:00 AM - 01:00 PM)"
    serviceType: Optional[str] = "Medication & Vitals"
    durationHours: Optional[int] = 4
    instructions: Optional[str] = ""
    status: Optional[str] = "CONFIRMED"
    totalAmount: Optional[float] = 1400.0
    paymentStatus: Optional[str] = "PAID"
    paymentId: Optional[str] = None
    caregiverNotes: Optional[str] = None


class BookingStatusUpdate(BaseModel):
    status: str
    caregiverNotes: Optional[str] = None
    cancelledReason: Optional[str] = None


class BookingResponse(BaseModel):
    id: str
    elderlyId: str
    elderlyName: str
    elderlyAddress: str
    familyId: str
    familyName: str
    familyPhone: str
    caregiverId: str
    caregiverName: str
    caregiverPhone: str
    caregiverAvatar: Optional[str] = None
    date: str
    timeSlot: str
    serviceType: str
    durationHours: int
    instructions: Optional[str] = None
    status: str
    totalAmount: float
    paymentStatus: str
    paymentId: Optional[str] = None
    caregiverNotes: Optional[str] = None
    startedAt: Optional[str] = None
    completedAt: Optional[str] = None
    cancelledReason: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

    class Config:
        from_attributes = True

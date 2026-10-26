from typing import Optional, List
from pydantic import BaseModel


class DailyCareItemSchema(BaseModel):
    id: str
    category: str = "MEDICINE"
    title: str
    timeTarget: Optional[str] = "09:00 AM"
    completed: bool = False
    timeCompleted: Optional[str] = None
    completedBy: Optional[str] = None
    notes: Optional[str] = None


class DailyCareLogResponse(BaseModel):
    id: str
    elderlyId: str
    date: str
    items: List[DailyCareItemSchema] = []
    generalNote: Optional[str] = None
    caregiverNote: Optional[str] = None
    updatedBy: Optional[str] = None
    updatedAt: Optional[str] = None


class ToggleItemRequest(BaseModel):
    itemId: str
    author: Optional[str] = "Caregiver"


class SaveGeneralNoteRequest(BaseModel):
    note: str
    author: Optional[str] = "Caregiver"

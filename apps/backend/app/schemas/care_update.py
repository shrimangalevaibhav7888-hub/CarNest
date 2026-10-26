from typing import Optional, Dict, Any, List
from pydantic import BaseModel


class CareUpdateCreate(BaseModel):
    elderlyId: Optional[str] = "1"
    elderlyName: Optional[str] = "Eleanor Vance"
    authorId: Optional[str] = "1"
    authorName: Optional[str] = "Sister Ananya Roy"
    authorRole: Optional[str] = "CAREGIVER"
    timestamp: Optional[str] = "Just now"
    title: str
    description: str
    category: Optional[str] = "VISIT"
    vitals: Optional[Dict[str, Any]] = None
    attachments: Optional[List[str]] = None


class CareUpdateResponse(BaseModel):
    id: str
    elderlyId: str
    elderlyName: str
    authorId: str
    authorName: str
    authorRole: str
    timestamp: str
    title: str
    description: str
    category: str
    vitals: Optional[Dict[str, Any]] = None
    attachments: Optional[List[str]] = None
    createdAt: Optional[str] = None

    class Config:
        from_attributes = True

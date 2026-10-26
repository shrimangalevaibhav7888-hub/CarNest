from typing import Optional
from pydantic import BaseModel


class ReviewCreate(BaseModel):
    caregiverId: str
    familyId: Optional[str] = "1"
    familyName: Optional[str] = "CareNest Family Member"
    rating: float
    comment: str
    date: Optional[str] = None
    visitServiceType: Optional[str] = "Home Care"


class ReviewResponse(BaseModel):
    id: str
    caregiverId: str
    familyId: str
    familyName: str
    rating: float
    comment: str
    date: str
    visitServiceType: str

    class Config:
        from_attributes = True

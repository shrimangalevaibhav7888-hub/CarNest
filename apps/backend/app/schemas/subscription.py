from typing import Optional, List
from pydantic import BaseModel


class SubscriptionCreate(BaseModel):
    userId: Optional[str] = "1"
    planName: str
    monthlyRateINR: Optional[int] = 0
    status: Optional[str] = "ACTIVE"
    renewalDate: Optional[str] = "2026-12-31"
    paymentMethod: Optional[str] = "UPI / Card"
    features: Optional[List[str]] = None


class SubscriptionResponse(BaseModel):
    id: str
    userId: str
    planName: str
    monthlyRateINR: int
    status: str
    renewalDate: str
    paymentMethod: str
    features: List[str] = []

    class Config:
        from_attributes = True

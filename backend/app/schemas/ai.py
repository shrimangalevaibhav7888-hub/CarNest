from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel
from app.models.enums import AIInteractionType


class AISummaryRequest(BaseModel):
    patient_id: int


class AIHandoverRequest(BaseModel):
    patient_id: int
    caregiver_id: Optional[int] = None
    shift_notes: Optional[str] = None


class AIPlanExplanationRequest(BaseModel):
    care_plan_id: int
    target_audience: str = "FAMILY"  # "PATIENT", "FAMILY", "CAREGIVER"


class AIQueryRequest(BaseModel):
    patient_id: Optional[int] = None
    prompt: str
    is_voice: bool = False


class AIResponseSchema(BaseModel):
    interaction_type: AIInteractionType
    title: str
    content: str
    highlights: List[str] = []
    safety_disclaimer: str = (
        "IMPORTANT MEDICAL NOTICE: CareNest AI is a non-diagnostic support assistant and does not "
        "replace professional medical judgment. In an emergency or for severe symptoms, call emergency services immediately."
    )
    tokens_used: int = 0
    created_at: datetime = datetime.utcnow()

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import User, AIInteraction
from app.schemas.ai import (
    AISummaryRequest, AIPlanExplanationRequest, AIHandoverRequest,
    AIQueryRequest, AIResponseSchema
)
from app.auth.dependencies import get_current_user
from app.services.ai_service import ai_service

router = APIRouter(prefix="/ai", tags=["AI Care Assistant"])


@router.post("/daily-summary", response_model=AIResponseSchema)
def get_daily_summary(
    req: AISummaryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates a daily care status summary for patients and family members,
    synthesizing completed tasks, vitals, and medication confirmations.
    """
    summary = ai_service.generate_daily_summary(db=db, patient_id=req.patient_id)
    
    # Save interaction record
    interaction = AIInteraction(
        user_id=current_user.id,
        patient_id=req.patient_id,
        interaction_type=summary.interaction_type,
        prompt="Generate daily care status summary",
        response=summary.content,
        tokens_used=120,
        disclaimer_attached=True
    )
    db.add(interaction)
    db.commit()

    return summary


@router.post("/explain-plan", response_model=AIResponseSchema)
def explain_plan(
    req: AIPlanExplanationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Translates a clinical post-discharge care plan into plain English."""
    explanation = ai_service.explain_care_plan(
        db=db,
        care_plan_id=req.care_plan_id,
        audience=req.target_audience
    )

    interaction = AIInteraction(
        user_id=current_user.id,
        patient_id=None,
        interaction_type=explanation.interaction_type,
        prompt=f"Explain care plan ID {req.care_plan_id} for {req.target_audience}",
        response=explanation.content,
        tokens_used=95,
        disclaimer_attached=True
    )
    db.add(interaction)
    db.commit()

    return explanation


@router.post("/handover", response_model=AIResponseSchema)
def generate_handover(
    req: AIHandoverRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generates a structured clinical shift handover report for caregivers."""
    handover = ai_service.generate_handover(
        db=db,
        patient_id=req.patient_id,
        shift_notes=req.shift_notes
    )

    interaction = AIInteraction(
        user_id=current_user.id,
        patient_id=req.patient_id,
        interaction_type=handover.interaction_type,
        prompt=f"Generate caregiver handover report for patient {req.patient_id}",
        response=handover.content,
        tokens_used=150,
        disclaimer_attached=True
    )
    db.add(interaction)
    db.commit()

    return handover


@router.post("/query", response_model=AIResponseSchema)
def process_ai_query(
    req: AIQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Processes safe text or voice conversational queries from elderly patients and family.
    Enforces clinical safety disclaimers and emergency detection.
    """
    res = ai_service.process_voice_or_text_query(
        db=db,
        current_user=current_user,
        patient_id=req.patient_id,
        prompt=req.prompt,
        is_voice=req.is_voice
    )

    interaction = AIInteraction(
        user_id=current_user.id,
        patient_id=req.patient_id,
        interaction_type=res.interaction_type,
        prompt=req.prompt,
        response=res.content,
        tokens_used=80,
        disclaimer_attached=True
    )
    db.add(interaction)
    db.commit()

    return res

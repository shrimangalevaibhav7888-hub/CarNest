from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import User, VitalRecord, PatientProfile
from app.models.enums import UserRole, VitalFlagStatus, NotificationType
from app.schemas.vital import VitalRecordCreate, VitalRecordResponse
from app.auth.dependencies import get_current_user
from app.services.notification_service import notification_service

router = APIRouter(prefix="/vitals", tags=["Vitals & Wellness Monitoring"])


def _evaluate_vital_flags(req: VitalRecordCreate) -> tuple[VitalFlagStatus, Optional[str]]:
    """Non-diagnostic supportive flag evaluation."""
    flags = []
    status = VitalFlagStatus.NORMAL

    if req.systolic_bp and req.systolic_bp >= 160:
        status = VitalFlagStatus.ATTENTION_REQUIRED
        flags.append(f"Systolic BP ({req.systolic_bp} mmHg) is elevated above normal resting parameters.")
    elif req.systolic_bp and req.systolic_bp >= 140:
        flags.append(f"Systolic BP ({req.systolic_bp} mmHg) slightly higher than target range.")

    if req.diastolic_bp and req.diastolic_bp >= 100:
        status = VitalFlagStatus.ATTENTION_REQUIRED
        flags.append(f"Diastolic BP ({req.diastolic_bp} mmHg) is elevated.")

    if req.oxygen_saturation and req.oxygen_saturation < 92:
        status = VitalFlagStatus.ATTENTION_REQUIRED
        flags.append(f"Oxygen saturation ({req.oxygen_saturation}%) is below recommended 94% threshold.")

    if req.heart_rate and (req.heart_rate > 110 or req.heart_rate < 50):
        status = VitalFlagStatus.ATTENTION_REQUIRED
        flags.append(f"Heart rate ({req.heart_rate} bpm) outside typical resting bounds.")

    if flags:
        msg = " ; ".join(flags) + " — Suggest review by treating physician or care team."
        return status, msg
    return VitalFlagStatus.NORMAL, "Vitals within acceptable post-discharge parameters."


@router.get("/patient/{patient_id}", response_model=List[VitalRecordResponse])
def get_vitals_by_patient(
    patient_id: int,
    limit: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve historical vital readings for chart visualization and trend analysis."""
    records = db.query(VitalRecord).filter(
        VitalRecord.patient_id == patient_id
    ).order_by(VitalRecord.created_at.desc()).limit(limit).all()
    return records


@router.post("", response_model=VitalRecordResponse, status_code=status.HTTP_201_CREATED)
async def record_vitals(
    req: VitalRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record patient vital signs with automated non-diagnostic safety flag assessment."""
    patient = db.query(PatientProfile).filter(PatientProfile.id == req.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found.")

    flag_status, flag_message = _evaluate_vital_flags(req)

    vital = VitalRecord(
        patient_id=req.patient_id,
        recorded_by_user_id=current_user.id,
        systolic_bp=req.systolic_bp,
        diastolic_bp=req.diastolic_bp,
        heart_rate=req.heart_rate,
        temperature=req.temperature,
        oxygen_saturation=req.oxygen_saturation,
        weight=req.weight,
        blood_glucose=req.blood_glucose,
        notes=req.notes,
        ai_flag_status=flag_status,
        ai_flag_message=flag_message
    )
    db.add(vital)
    db.commit()
    db.refresh(vital)

    # If vital flagged attention required, notify family and caregiver
    if flag_status == VitalFlagStatus.ATTENTION_REQUIRED:
        p_name = patient.user.full_name if patient.user else "Patient"
        for fam in patient.family_members:
            await notification_service.create_notification(
                db=db,
                user_id=fam.user_id,
                title="Vital Sign Attention Notice",
                message=f"New reading logged for {p_name}: {flag_message}",
                notification_type=NotificationType.FAMILY_UPDATE,
                patient_id=patient.id
            )

    return vital

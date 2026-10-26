from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import User, CaregiverProfile, CarePlan, CaregiverAssignment, PatientProfile
from app.models.enums import UserRole, NotificationType, VerificationStatus
from app.schemas.caregiver import (
    CaregiverResponse, CaregiverMatchRequest, CaregiverMatchResult
)
from app.auth.dependencies import get_current_user
from app.services.matching_service import caregiver_matching_service
from app.services.notification_service import notification_service

router = APIRouter(prefix="/caregivers", tags=["Caregiver Directory & Matching"])


def _format_caregiver(cg: CaregiverProfile) -> CaregiverResponse:
    return CaregiverResponse(
        id=cg.id,
        user_id=cg.user_id,
        full_name=cg.user.full_name if cg.user else "Caregiver",
        email=cg.user.email if cg.user else "",
        phone=cg.phone or (cg.user.phone if cg.user else None),
        avatar_url=cg.user.avatar_url if cg.user else None,
        skills=cg.skills or [],
        experience_years=cg.experience_years,
        languages=cg.languages or [],
        availability_status=cg.availability_status,
        service_area=cg.service_area,
        care_categories=cg.care_categories or [],
        verification_status=cg.verification_status,
        rating=cg.rating,
        max_workload=cg.max_workload,
        current_workload=cg.current_workload,
        bio=cg.bio,
        hourly_rate=cg.hourly_rate,
        created_at=cg.created_at
    )


@router.get("", response_model=List[CaregiverResponse])
def get_caregivers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve caregivers directory.
    Only VERIFIED caregivers are listed for public and family searches.
    Administrators can see all caregivers regardless of verification status.
    """
    query = db.query(CaregiverProfile)
    if current_user.role != UserRole.ADMIN:
        query = query.filter(CaregiverProfile.verification_status == VerificationStatus.VERIFIED)

    caregivers = query.all()
    return [_format_caregiver(cg) for cg in caregivers]


@router.get("/{caregiver_id}", response_model=CaregiverResponse)
def get_caregiver_by_id(
    caregiver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve single caregiver profile with verification check."""
    cg = db.query(CaregiverProfile).filter(CaregiverProfile.id == caregiver_id).first()
    if not cg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Caregiver profile not found.")

    # If not verified, only admin or the caregiver themselves can view it
    if cg.verification_status != VerificationStatus.VERIFIED:
        if current_user.role != UserRole.ADMIN and current_user.id != cg.user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Caregiver profile is pending verification.")

    return _format_caregiver(cg)


@router.post("/match", response_model=List[CaregiverMatchResult])
def match_caregivers(
    req: CaregiverMatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Computes compatibility ranking scores for caregivers based on patient requirements,
    language preference, availability, and clinical skillset.
    """
    return caregiver_matching_service.match_caregivers(
        db=db,
        patient_id=req.patient_id,
        required_skills=req.required_skills,
        preferred_language=req.preferred_language,
        service_area=req.service_area
    )


@router.post("/assign")
async def assign_caregiver(
    patient_id: int,
    caregiver_id: int,
    care_plan_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Assigns a recommended caregiver to a patient and care plan.
    """
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")

    caregiver = db.query(CaregiverProfile).filter(CaregiverProfile.id == caregiver_id).first()
    if not caregiver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Caregiver not found.")

    # Update care plan if provided or find active plan
    plan = None
    if care_plan_id:
        plan = db.query(CarePlan).filter(CarePlan.id == care_plan_id).first()
    if not plan:
        plan = db.query(CarePlan).filter(CarePlan.patient_id == patient_id).order_by(CarePlan.created_at.desc()).first()

    if plan:
        plan.assigned_caregiver_id = caregiver_id

    assignment = CaregiverAssignment(
        caregiver_id=caregiver_id,
        patient_id=patient_id,
        care_plan_id=plan.id if plan else None,
        assigned_by_user_id=current_user.id,
        start_date=date.today(),
        status="ACTIVE"
    )
    db.add(assignment)

    # Increment workload
    caregiver.current_workload = min(caregiver.max_workload, caregiver.current_workload + 1)
    db.commit()

    # Notify caregiver and patient
    p_name = patient.user.full_name if patient.user else "Patient"
    cg_name = caregiver.user.full_name if caregiver.user else "Caregiver"

    await notification_service.create_notification(
        db=db,
        user_id=caregiver.user_id,
        title="New Patient Assignment",
        message=f"You have been assigned to coordinate home care for {p_name}.",
        notification_type=NotificationType.CAREGIVER_ASSIGNMENT,
        patient_id=patient_id
    )

    await notification_service.create_notification(
        db=db,
        user_id=patient.user_id,
        title="Caregiver Assigned",
        message=f"{cg_name} has been assigned as your home-care coordinator.",
        notification_type=NotificationType.CAREGIVER_ASSIGNMENT,
        patient_id=patient_id
    )

    return {"message": f"Caregiver {cg_name} assigned successfully to {p_name}."}

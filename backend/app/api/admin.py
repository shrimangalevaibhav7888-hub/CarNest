from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import User, CaregiverProfile, PatientProfile, FamilyMember, CareTask, EmergencyEvent
from app.models.enums import UserRole, VerificationStatus, TaskStatus
from app.schemas.admin import (
    AdminUserItem, AdminUserStatusUpdate, AdminCaregiverVerificationUpdate, AdminStatsResponse
)
from app.schemas.caregiver import CaregiverResponse
from app.api.caregivers import _format_caregiver
from app.auth.dependencies import get_admin_user

router = APIRouter(prefix="/admin", tags=["Operations Administration"])


@router.get("/users", response_model=List[AdminUserItem])
def list_all_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """List all registered users on the CareNest platform (Operations Admin only)."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users


@router.patch("/users/{user_id}/status", response_model=AdminUserItem)
def update_user_status(
    user_id: int,
    req: AdminUserStatusUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """Activate or deactivate a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if user.id == admin_user.id and not req.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin cannot deactivate their own account.")

    user.is_active = req.is_active
    db.commit()
    db.refresh(user)
    return user


@router.get("/caregivers", response_model=List[CaregiverResponse])
def list_all_caregivers_for_verification(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """List all caregivers including pending and rejected applicants for verification."""
    caregivers = db.query(CaregiverProfile).all()
    return [_format_caregiver(cg) for cg in caregivers]


@router.patch("/caregivers/{caregiver_id}/verification", response_model=CaregiverResponse)
def update_caregiver_verification(
    caregiver_id: int,
    req: AdminCaregiverVerificationUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """
    Approve, set under review, or reject a caregiver application with official notes.
    """
    caregiver = db.query(CaregiverProfile).filter(CaregiverProfile.id == caregiver_id).first()
    if not caregiver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Caregiver profile not found.")

    caregiver.verification_status = req.verification_status
    if req.verification_notes is not None:
        caregiver.verification_notes = req.verification_notes

    db.commit()
    db.refresh(caregiver)
    return _format_caregiver(caregiver)


@router.get("/stats", response_model=AdminStatsResponse)
def get_platform_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """Retrieve operational metrics across the CareNest ecosystem."""
    total_users = db.query(User).count()
    total_elderly = db.query(User).filter(User.role.in_([UserRole.ELDERLY, UserRole.PATIENT])).count()
    total_family = db.query(User).filter(User.role == UserRole.FAMILY).count()
    total_caregivers = db.query(CaregiverProfile).count()
    verified_caregivers = db.query(CaregiverProfile).filter(CaregiverProfile.verification_status == VerificationStatus.VERIFIED).count()
    pending_verifications = db.query(CaregiverProfile).filter(CaregiverProfile.verification_status != VerificationStatus.VERIFIED).count()
    total_active_tasks = db.query(CareTask).filter(CareTask.status.in_([TaskStatus.PENDING, TaskStatus.IN_PROGRESS])).count()
    total_emergency_events = db.query(EmergencyEvent).count()

    return AdminStatsResponse(
        total_users=total_users,
        total_elderly=total_elderly,
        total_family=total_family,
        total_caregivers=total_caregivers,
        verified_caregivers=verified_caregivers,
        pending_verifications=pending_verifications,
        total_active_tasks=total_active_tasks,
        total_emergency_events=total_emergency_events
    )

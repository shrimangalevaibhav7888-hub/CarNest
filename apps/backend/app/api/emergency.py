from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import User, EmergencyEvent, PatientProfile, CarePlan, CaregiverProfile
from app.models.enums import EmergencyStatus, EmergencySeverity, NotificationType, UserRole
from app.schemas.emergency import (
    EmergencyTriggerRequest, EmergencyStatusUpdate, EmergencyEventResponse
)
from app.auth.dependencies import get_current_user, get_optional_current_user
from app.services.notification_service import notification_service

router = APIRouter(prefix="/emergency", tags=["Emergency Support Module"])


def _format_event(e: EmergencyEvent) -> EmergencyEventResponse:
    p_name = e.patient.user.full_name if (e.patient and e.patient.user) else "Patient"
    return EmergencyEventResponse(
        id=e.id,
        patient_id=e.patient_id,
        patient_name=p_name,
        triggered_by_user_id=e.triggered_by_user_id,
        status=e.status,
        severity=e.severity,
        location=e.location,
        notes=e.notes,
        acknowledged_at=e.acknowledged_at,
        resolved_at=e.resolved_at,
        created_at=e.created_at,
        updated_at=e.updated_at
    )


@router.get("/events", response_model=List[EmergencyEventResponse])
def get_all_emergency_events(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve emergency events history isolated to user authorization."""
    query = db.query(EmergencyEvent)

    if current_user and current_user.role not in (UserRole.ADMIN, UserRole.HOSPITAL):
        if current_user.role in (UserRole.PATIENT, UserRole.ELDERLY):
            if current_user.patient_profile:
                query = query.filter(EmergencyEvent.patient_id == current_user.patient_profile.id)
            else:
                return []
        elif current_user.role == UserRole.FAMILY:
            linked_ids = [m.patient_id for m in current_user.family_memberships]
            if linked_ids:
                query = query.filter(EmergencyEvent.patient_id.in_(linked_ids))
            else:
                return []
        elif current_user.role == UserRole.CAREGIVER:
            if current_user.caregiver_profile:
                assigned_ids = [a.patient_id for a in current_user.caregiver_profile.assignments if a.status == "ACTIVE"]
                if assigned_ids:
                    query = query.filter(EmergencyEvent.patient_id.in_(assigned_ids))
                else:
                    return []

    events = query.order_by(EmergencyEvent.created_at.desc()).all()
    return [_format_event(e) for e in events]


@router.post("/trigger", response_model=EmergencyEventResponse, status_code=status.HTTP_201_CREATED)
async def trigger_emergency(
    req: EmergencyTriggerRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Triggers an instant emergency SOS event.
    Dispatches immediate simulated multi-channel notifications to all authorized contacts.
    """
    p_id = req.patient_id or 1
    patient = db.query(PatientProfile).filter(PatientProfile.id == p_id).first()
    if not patient:
        patient = db.query(PatientProfile).first()
        p_id = patient.id if patient else 1

    location = req.location or (patient.address if patient else "742 Evergreen Healthcare Ave") or "Home Address"
    user_id = current_user.id if current_user else (patient.user_id if patient else 1)

    event = EmergencyEvent(
        patient_id=p_id,
        triggered_by_user_id=user_id,
        status=EmergencyStatus.TRIGGERED,
        severity=req.severity,
        location=location,
        notes=req.notes
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    db.refresh(event)

    # Collect recipient user IDs: family members, assigned caregivers, hospital coordinators
    recipients = set()
    for fam in patient.family_members:
        recipients.add(fam.user_id)

    # Find active caregiver
    active_plans = db.query(CarePlan).filter(CarePlan.patient_id == patient.id).all()
    for plan in active_plans:
        if plan.assigned_caregiver:
            recipients.add(plan.assigned_caregiver.user_id)

    # Add hospital coordinators and admin
    hospital_staff = db.query(User).filter(User.role.in_([UserRole.HOSPITAL, UserRole.ADMIN])).all()
    for h in hospital_staff:
        recipients.add(h.id)

    p_name = patient.user.full_name if patient.user else "Patient"

    # Broadcast emergency alerts
    await notification_service.broadcast_emergency_alert(
        db=db,
        patient_name=p_name,
        patient_id=patient.id,
        target_user_ids=list(recipients),
        severity=req.severity.value
    )

    return _format_event(event)


def _can_access_patient(patient_id: int, user: User) -> bool:
    if user.role in (UserRole.ADMIN, UserRole.HOSPITAL):
        return True
    if user.role in (UserRole.PATIENT, UserRole.ELDERLY):
        return user.patient_profile is not None and user.patient_profile.id == patient_id
    if user.role == UserRole.FAMILY:
        linked_ids = [m.patient_id for m in user.family_memberships]
        return patient_id in linked_ids
    if user.role == UserRole.CAREGIVER:
        if not user.caregiver_profile:
            return False
        assigned_ids = [a.patient_id for a in user.caregiver_profile.assignments if a.status == "ACTIVE"]
        return patient_id in assigned_ids
    return False


@router.get("/active", response_model=List[EmergencyEventResponse])
def get_active_emergencies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List active emergency events authorized for current user."""
    query = db.query(EmergencyEvent).filter(
        EmergencyEvent.status.in_([EmergencyStatus.TRIGGERED, EmergencyStatus.ACKNOWLEDGED, EmergencyStatus.RESPONDING])
    )
    if current_user.role in (UserRole.PATIENT, UserRole.ELDERLY):
        if not current_user.patient_profile:
            return []
        query = query.filter(EmergencyEvent.patient_id == current_user.patient_profile.id)
    elif current_user.role == UserRole.FAMILY:
        p_ids = [m.patient_id for m in current_user.family_memberships]
        if not p_ids:
            return []
        query = query.filter(EmergencyEvent.patient_id.in_(p_ids))
    elif current_user.role == UserRole.CAREGIVER:
        assigned_ids = [a.patient_id for a in current_user.caregiver_profile.assignments if a.status == "ACTIVE"] if current_user.caregiver_profile else []
        if not assigned_ids:
            return []
        query = query.filter(EmergencyEvent.patient_id.in_(assigned_ids))

    events = query.order_by(EmergencyEvent.created_at.desc()).all()
    return [_format_event(e) for e in events]


@router.get("/patient/{patient_id}", response_model=List[EmergencyEventResponse])
def get_emergency_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve emergency events history for a specific patient with authorization checks."""
    if not _can_access_patient(patient_id, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access to patient emergency history is forbidden.")

    events = db.query(EmergencyEvent).filter(
        EmergencyEvent.patient_id == patient_id
    ).order_by(EmergencyEvent.created_at.desc()).all()
    return [_format_event(e) for e in events]


@router.patch("/{event_id}/status", response_model=EmergencyEventResponse)
def update_emergency_status(
    event_id: int,
    req: EmergencyStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Update emergency response workflow status (ACKNOWLEDGED, RESPONDING, RESOLVED)."""
    event = db.query(EmergencyEvent).filter(EmergencyEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency event not found.")

    event.status = req.status
    if req.notes:
        event.notes = f"{event.notes or ''} | [{datetime.utcnow().strftime('%H:%M')}] {req.notes}".strip()

    if req.status == EmergencyStatus.ACKNOWLEDGED and not event.acknowledged_at:
        event.acknowledged_at = datetime.utcnow()
    elif req.status == EmergencyStatus.RESOLVED and not event.resolved_at:
        event.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(event)
    return _format_event(event)

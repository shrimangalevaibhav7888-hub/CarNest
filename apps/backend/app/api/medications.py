from typing import List, Optional
from datetime import date, datetime, time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import (
    User, Medication, MedicationSchedule, PatientProfile, AuditLog, CareUpdate
)
from app.models.enums import UserRole, MedicationStatus, NotificationType
from app.schemas.medication import (
    MedicationCreate, MedicationUpdate, MedicationResponse,
    MedicationScheduleResponse, MedicationStatusUpdate, MedicationActionRequest
)
from app.auth.dependencies import get_current_user, get_optional_current_user
from app.services.notification_service import notification_service

router = APIRouter(prefix="/medications", tags=["Medication Management"])



def _format_medication(m: Medication) -> MedicationResponse:
    schedules = [
        MedicationScheduleResponse(
            id=s.id,
            medication_id=s.medication_id,
            patient_id=s.patient_id,
            scheduled_date=s.scheduled_date,
            scheduled_time=s.scheduled_time,
            status=s.status,
            taken_at=s.taken_at,
            confirmed_by_user_id=s.confirmed_by_user_id,
            notes=s.notes
        ) for s in m.schedules
    ]
    return MedicationResponse(
        id=m.id,
        patient_id=m.patient_id,
        name=m.name,
        dosage=m.dosage,
        frequency=m.frequency,
        instructions=m.instructions,
        prescribing_doctor=m.prescribing_doctor,
        start_date=m.start_date,
        end_date=m.end_date,
        is_active=m.is_active,
        schedules=schedules,
        created_at=m.created_at
    )


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


@router.get("", response_model=List[MedicationResponse])
def get_medications(
    patient_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """List medications from SQLite database for patient or local user."""
    query = db.query(Medication)
    if patient_id:
        query = query.filter(Medication.patient_id == patient_id)
    elif current_user:
        if current_user.role in (UserRole.PATIENT, UserRole.ELDERLY):
            if current_user.patient_profile:
                query = query.filter(Medication.patient_id == current_user.patient_profile.id)
        elif current_user.role == UserRole.FAMILY:
            p_ids = [m.patient_id for m in current_user.family_memberships]
            if p_ids:
                query = query.filter(Medication.patient_id.in_(p_ids))
        elif current_user.role == UserRole.CAREGIVER:
            assigned_ids = [a.patient_id for a in current_user.caregiver_profile.assignments if a.status == "ACTIVE"] if current_user.caregiver_profile else []
            if assigned_ids:
                query = query.filter(Medication.patient_id.in_(assigned_ids))

    meds = query.order_by(Medication.is_active.desc(), Medication.name.asc()).all()
    return [_format_medication(m) for m in meds]


@router.post("", response_model=MedicationResponse, status_code=status.HTTP_201_CREATED)
def create_medication(
    req: MedicationCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Add a new medication to SQLite and automatically generate schedule times."""
    p_id = req.patient_id
    if not p_id and req.elderlyId:
        p_id = int(''.join(filter(str.isdigit, req.elderlyId)) or 1)
    if not p_id and current_user and current_user.patient_profile:
        p_id = current_user.patient_profile.id
    if not p_id:
        patient = db.query(PatientProfile).first()
        p_id = patient.id if patient else 1

    # Check or fallback patient
    patient = db.query(PatientProfile).filter(PatientProfile.id == p_id).first()
    if not patient:
        patient = db.query(PatientProfile).first()
        p_id = patient.id if patient else 1

    start_d = req.start_date
    if not start_d and req.startDate:
        try:
            start_d = datetime.strptime(req.startDate, "%Y-%m-%d").date()
        except Exception:
            start_d = date.today()
    if not start_d:
        start_d = date.today()

    med = Medication(
        patient_id=p_id,
        name=req.name,
        dosage=req.dosage,
        frequency=req.frequency,
        instructions=req.instructions,
        prescribing_doctor=req.prescribing_doctor or "Primary Care Physician",
        start_date=start_d,
        end_date=req.end_date,
        is_active=req.isActive if req.isActive is not None else req.is_active
    )
    db.add(med)
    db.flush()

    # Generate initial schedules for today
    today = date.today()
    raw_times = req.times or req.schedule_times or ["08:00 AM"]
    for t_str in raw_times:
        try:
            clean = t_str.strip().upper()
            if "AM" in clean or "PM" in clean:
                t_obj = datetime.strptime(clean, "%I:%M %p").time()
            else:
                parts = clean.split(":")
                t_obj = time(int(parts[0]), int(parts[1]))
        except Exception:
            t_obj = time(8, 0)

        sched = MedicationSchedule(
            medication_id=med.id,
            patient_id=p_id,
            scheduled_date=today,
            scheduled_time=t_obj,
            status=MedicationStatus.PENDING,
            notes=f"Scheduled {med.dosage} dose"
        )
        db.add(sched)

    db.commit()
    db.refresh(med)
    return _format_medication(med)


@router.delete("/{medication_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medication(
    medication_id: int,
    db: Session = Depends(get_db)
):
    """Delete a medication and its schedules permanently from SQLite."""
    med = db.query(Medication).filter(Medication.id == medication_id).first()
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medication not found.")

    db.delete(med)
    db.commit()
    return None


@router.post("/{medication_id}/action", status_code=status.HTTP_200_OK)
def log_medication_action(
    medication_id: int,
    req: MedicationActionRequest,
    db: Session = Depends(get_db)
):
    """Log medicine action (TAKEN, SKIPPED, SNOOZED) and create persistent timeline update."""
    med = db.query(Medication).filter(Medication.id == medication_id).first()
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medication not found.")

    # Find today's pending schedule or create one
    today = date.today()
    sched = db.query(MedicationSchedule).filter(
        MedicationSchedule.medication_id == medication_id,
        MedicationSchedule.scheduled_date == today
    ).first()

    status_str = req.action.upper()
    if sched:
        if status_str == "TAKEN":
            sched.status = MedicationStatus.TAKEN
            sched.taken_at = datetime.utcnow()
        elif status_str == "SKIPPED":
            sched.status = MedicationStatus.SKIPPED
        sched.notes = req.notes or f"Logged by {req.loggedBy}"

    # Also record in CareUpdate table so family timeline stays updated permanently
    action_label = "Taken" if status_str == "TAKEN" else "Skipped" if status_str == "SKIPPED" else "Snoozed"
    update = CareUpdate(
        elderly_id=str(med.patient_id),
        elderly_name="Eleanor Vance",
        author_id="1",
        author_name=req.loggedBy or "Caregiver",
        author_role="CAREGIVER",
        timestamp_label=f"Today, {datetime.utcnow().strftime('%I:%M %p')}",
        title=f"Medication {action_label}: {med.name} ({med.dosage})",
        description=req.notes or f"Marked as {action_label} by {req.loggedBy}.",
        category="MEDICINE"
    )
    db.add(update)
    db.commit()

    return {"status": "success", "action": status_str, "medication": med.name}



@router.get("/schedules", response_model=List[MedicationScheduleResponse])
def get_medication_schedules(
    patient_id: Optional[int] = None,
    schedule_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve scheduled medication doses for today or specified date."""
    query = db.query(MedicationSchedule)
    target_date = schedule_date or date.today()
    query = query.filter(MedicationSchedule.scheduled_date == target_date)

    if patient_id:
        if not _can_access_patient(patient_id, current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access to patient schedule is forbidden.")
        query = query.filter(MedicationSchedule.patient_id == patient_id)
    elif current_user.role in (UserRole.PATIENT, UserRole.ELDERLY):
        if not current_user.patient_profile:
            return []
        query = query.filter(MedicationSchedule.patient_id == current_user.patient_profile.id)
    elif current_user.role == UserRole.FAMILY:
        p_ids = [m.patient_id for m in current_user.family_memberships]
        if not p_ids:
            return []
        query = query.filter(MedicationSchedule.patient_id.in_(p_ids))
    elif current_user.role == UserRole.CAREGIVER:
        assigned_ids = [a.patient_id for a in current_user.caregiver_profile.assignments if a.status == "ACTIVE"] if current_user.caregiver_profile else []
        if not assigned_ids:
            return []
        query = query.filter(MedicationSchedule.patient_id.in_(assigned_ids))

    return query.order_by(MedicationSchedule.scheduled_time.asc()).all()


@router.patch("/schedules/{schedule_id}/status", response_model=MedicationScheduleResponse)
async def update_schedule_status(
    schedule_id: int,
    req: MedicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update medication dose status (TAKEN, MISSED, SKIPPED).
    Includes audit logging and automated notification if a dose is missed.
    """
    sched = db.query(MedicationSchedule).filter(MedicationSchedule.id == schedule_id).first()
    if not sched:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medication schedule item not found.")

    old_status = sched.status
    sched.status = req.status
    if req.notes:
        sched.notes = req.notes

    if req.status == MedicationStatus.TAKEN:
        sched.taken_at = datetime.utcnow()
        sched.confirmed_by_user_id = current_user.id
    elif req.status == MedicationStatus.MISSED:
        # Create missed dose notification
        p_user_id = sched.patient.user_id if sched.patient else current_user.id
        med_name = sched.medication.name if sched.medication else "Medication"
        await notification_service.create_notification(
            db=db,
            user_id=p_user_id,
            title="Missed Medication Notice",
            message=f"A scheduled dose of {med_name} was marked as missed. Please review schedule or contact caregiver.",
            notification_type=NotificationType.MISSED_TASK,
            patient_id=sched.patient_id
        )

    # Log audit entry
    audit = AuditLog(
        user_id=current_user.id,
        action="MEDICATION_STATUS_UPDATE",
        entity_type="MedicationSchedule",
        entity_id=sched.id,
        old_values={"status": old_status.value},
        new_values={"status": req.status.value, "updated_by": current_user.full_name}
    )
    db.add(audit)

    db.commit()
    db.refresh(sched)
    return sched

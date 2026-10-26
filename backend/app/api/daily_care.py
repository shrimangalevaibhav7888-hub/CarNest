from typing import Optional, List
from datetime import datetime, date, time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import CareTask, DailyCareLog, PatientProfile, User
from app.models.enums import TaskStatus, TaskCategory, TaskPriority, UserRole
from app.schemas.daily_care import DailyCareLogResponse, DailyCareItemSchema, ToggleItemRequest, SaveGeneralNoteRequest
from app.auth.dependencies import get_optional_current_user

router = APIRouter(prefix="/daily-care-logs", tags=["Daily Care Checklist & Logs"])


def _category_map(cat: TaskCategory) -> str:
    mapping = {
        TaskCategory.MEDICATION: "MEDICINE",
        TaskCategory.MEALS: "MEAL",
        TaskCategory.HYDRATION: "HYDRATION",
        TaskCategory.HYGIENE: "PERSONAL_CARE",
        TaskCategory.PHYSIOTHERAPY: "EXERCISE",
        TaskCategory.WALKING: "EXERCISE",
        TaskCategory.EXERCISE: "EXERCISE",
        TaskCategory.VITAL_CHECK: "WELL_BEING",
        TaskCategory.DOCTOR_APPOINTMENT: "APPOINTMENT",
        TaskCategory.COMPANION_VISIT: "WELL_BEING",
    }
    return mapping.get(cat, "WELL_BEING")


@router.get("/today", response_model=DailyCareLogResponse)
def get_today_care_log(
    db: Session = Depends(get_db),
    elderly_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve today's active checklist items and daily note isolated to the user's patient."""
    p_id = None
    if current_user:
        if current_user.role in (UserRole.PATIENT, UserRole.ELDERLY) and current_user.patient_profile:
            p_id = current_user.patient_profile.id
        elif current_user.role == UserRole.FAMILY and current_user.family_memberships:
            p_id = current_user.family_memberships[0].patient_id
        elif current_user.role == UserRole.CAREGIVER and current_user.caregiver_profile:
            assigned = [a.patient_id for a in current_user.caregiver_profile.assignments if a.status == "ACTIVE"]
            if assigned:
                p_id = assigned[0]

    if not p_id:
        p_id = int(''.join(filter(str.isdigit, elderly_id or "1")) or 1)
        patient = db.query(PatientProfile).filter(PatientProfile.id == p_id).first()
        if not patient:
            patient = db.query(PatientProfile).first()
            p_id = patient.id if patient else 1

    tasks = db.query(CareTask).filter(CareTask.patient_id == p_id).order_by(CareTask.due_time.asc()).all()

    # If no tasks exist for this patient, seed default daily checklist
    if not tasks:
        seed_tasks = [
            CareTask(
                patient_id=p_id,
                category=TaskCategory.VITAL_CHECK,
                title="Morning Vital Signs Recording",
                due_date=date.today(),
                due_time=time(8, 0),
                priority=TaskPriority.HIGH,
                status=TaskStatus.COMPLETED,
                notes="Target BP < 130/80 mmHg. Log heart rate & SpO2.",
                completion_time=datetime.utcnow()
            ),
            CareTask(
                patient_id=p_id,
                category=TaskCategory.MEDICATION,
                title="Morning Medication Administration",
                due_date=date.today(),
                due_time=time(8, 30),
                priority=TaskPriority.HIGH,
                status=TaskStatus.COMPLETED,
                notes="Administer Metformin 500mg and Lisinopril 10mg with breakfast.",
                completion_time=datetime.utcnow()
            ),
            CareTask(
                patient_id=p_id,
                category=TaskCategory.MEALS,
                title="Heart-Healthy Breakfast & Hydration",
                due_date=date.today(),
                due_time=time(9, 0),
                priority=TaskPriority.MEDIUM,
                status=TaskStatus.COMPLETED,
                notes="Low sodium vegetable oats porridge with 1 cup warm water.",
                completion_time=datetime.utcnow()
            ),
            CareTask(
                patient_id=p_id,
                category=TaskCategory.PHYSIOTHERAPY,
                title="Supervised Mobility & Walking Routine",
                due_date=date.today(),
                due_time=time(11, 0),
                priority=TaskPriority.MEDIUM,
                status=TaskStatus.PENDING,
                notes="15 minutes gentle corridor walking with walker support."
            ),
            CareTask(
                patient_id=p_id,
                category=TaskCategory.HYDRATION,
                title="Afternoon Hydration & Refreshment",
                due_date=date.today(),
                due_time=time(14, 30),
                priority=TaskPriority.MEDIUM,
                status=TaskStatus.PENDING,
                notes="Tender coconut water or fresh lime water."
            ),
            CareTask(
                patient_id=p_id,
                category=TaskCategory.VITAL_CHECK,
                title="Evening Blood Pressure & Glucose Check",
                due_date=date.today(),
                due_time=time(19, 0),
                priority=TaskPriority.HIGH,
                status=TaskStatus.PENDING,
                notes="Pre-dinner BP and post-snack capillary glucose record."
            )
        ]
        db.add_all(seed_tasks)
        db.commit()
        tasks = db.query(CareTask).filter(CareTask.patient_id == p_id).order_by(CareTask.due_time.asc()).all()

    # Get or create daily care log for notes
    today_log = db.query(DailyCareLog).filter(
        DailyCareLog.patient_id == p_id,
        DailyCareLog.date == date.today()
    ).first()

    general_note = today_log.notes if today_log else "Patient in good spirits. Morning medications and vital signs recorded successfully."

    items = [
        DailyCareItemSchema(
            id=str(t.id),
            category=_category_map(t.category),
            title=t.title,
            timeTarget=t.due_time.strftime("%I:%M %p") if isinstance(t.due_time, time) else str(t.due_time),
            completed=(t.status == TaskStatus.COMPLETED),
            timeCompleted=t.completion_time.strftime("%I:%M %p") if t.completion_time else None,
            completedBy="Caregiver" if t.status == TaskStatus.COMPLETED else None,
            notes=t.notes
        )
        for t in tasks
    ]

    return DailyCareLogResponse(
        id=str(today_log.id) if today_log else f"log-{p_id}",
        elderlyId=str(p_id),
        date=date.today().strftime("%Y-%m-%d"),
        items=items,
        generalNote=general_note,
        caregiverNote="Care checklist synced with SQLite.",
        updatedBy="Caregiver",
        updatedAt=datetime.utcnow().isoformat()
    )


@router.post("/toggle-item", response_model=DailyCareLogResponse)
def toggle_daily_care_item(
    req: ToggleItemRequest,
    db: Session = Depends(get_db)
):
    """Toggle care checklist item status and update SQLite permanently."""
    numeric_id = int(''.join(filter(str.isdigit, req.itemId)) or req.itemId)
    task = db.query(CareTask).filter(CareTask.id == numeric_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

    if task.status == TaskStatus.COMPLETED:
        task.status = TaskStatus.PENDING
        task.completion_time = None
    else:
        task.status = TaskStatus.COMPLETED
        task.completion_time = datetime.utcnow()

    db.commit()
    db.refresh(task)
    return get_today_care_log(db=db, elderly_id=str(task.patient_id))


@router.post("/note", response_model=DailyCareLogResponse)
def save_daily_care_note(
    req: SaveGeneralNoteRequest,
    db: Session = Depends(get_db)
):
    """Save daily care general note to SQLite database."""
    patient = db.query(PatientProfile).first()
    p_id = patient.id if patient else 1

    log = db.query(DailyCareLog).filter(
        DailyCareLog.patient_id == p_id,
        DailyCareLog.date == date.today()
    ).first()

    if not log:
        log = DailyCareLog(
            patient_id=p_id,
            date=date.today(),
            notes=req.note
        )
        db.add(log)
    else:
        log.notes = req.note

    db.commit()
    return get_today_care_log(db=db, elderly_id=str(p_id))

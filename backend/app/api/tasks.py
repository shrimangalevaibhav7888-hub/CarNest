from typing import List, Optional
from datetime import date, datetime, time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import User, CareTask, PatientProfile, AuditLog
from app.models.enums import UserRole, TaskStatus, TaskCategory, TaskPriority
from app.schemas.task import (
    CareTaskCreate, CareTaskUpdate, CareTaskStatusUpdate, CareTaskResponse
)
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/tasks", tags=["Daily Care Tasks"])


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


@router.get("", response_model=List[CareTaskResponse])
def get_tasks(
    patient_id: Optional[int] = None,
    task_date: Optional[date] = None,
    category: Optional[TaskCategory] = None,
    status_filter: Optional[TaskStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve daily care tasks with strict authorization filters."""
    query = db.query(CareTask)

    if patient_id:
        if not _can_access_patient(patient_id, current_user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access to patient tasks is forbidden.")
        query = query.filter(CareTask.patient_id == patient_id)
    elif current_user.role in (UserRole.PATIENT, UserRole.ELDERLY):
        if not current_user.patient_profile:
            return []
        query = query.filter(CareTask.patient_id == current_user.patient_profile.id)
    elif current_user.role == UserRole.FAMILY:
        p_ids = [m.patient_id for m in current_user.family_memberships]
        if not p_ids:
            return []
        query = query.filter(CareTask.patient_id.in_(p_ids))
    elif current_user.role == UserRole.CAREGIVER:
        if not current_user.caregiver_profile:
            return []
        assigned_ids = [a.patient_id for a in current_user.caregiver_profile.assignments if a.status == "ACTIVE"]
        if not assigned_ids:
            return []
        query = query.filter(
            (CareTask.caregiver_id == current_user.caregiver_profile.id) | (CareTask.patient_id.in_(assigned_ids))
        )

    if task_date:
        query = query.filter(CareTask.due_date == task_date)
    if category:
        query = query.filter(CareTask.category == category)
    if status_filter:
        query = query.filter(CareTask.status == status_filter)

    return query.order_by(CareTask.due_date.asc(), CareTask.due_time.asc()).all()


@router.get("/{task_id}", response_model=CareTaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve a single care task by ID with authorization verification."""
    task = db.query(CareTask).filter(CareTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    if not _can_access_patient(task.patient_id, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this care task.")
    return task



@router.post("", response_model=CareTaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    req: CareTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new daily care task."""
    patient = db.query(PatientProfile).filter(PatientProfile.id == req.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found.")

    task = CareTask(
        patient_id=req.patient_id,
        caregiver_id=req.caregiver_id,
        care_plan_id=req.care_plan_id,
        category=req.category,
        title=req.title,
        description=req.description,
        due_date=req.due_date or date.today(),
        due_time=req.due_time or time(9, 0),
        priority=req.priority,
        status=req.status,
        notes=req.notes
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}/status", response_model=CareTaskResponse)
def update_task_status(
    task_id: int,
    req: CareTaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update status of a daily care task (e.g. mark COMPLETED, MISSED) with audit trail."""
    task = db.query(CareTask).filter(CareTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

    old_status = task.status
    task.status = req.status
    if req.notes:
        task.notes = req.notes

    if req.status == TaskStatus.COMPLETED and not task.completion_time:
        task.completion_time = datetime.utcnow()

    # Log audit
    audit = AuditLog(
        user_id=current_user.id,
        action="TASK_STATUS_CHANGED",
        entity_type="CareTask",
        entity_id=task.id,
        old_values={"status": old_status.value},
        new_values={"status": req.status.value, "updated_by": current_user.full_name}
    )
    db.add(audit)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a task."""
    task = db.query(CareTask).filter(CareTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    db.delete(task)
    db.commit()
    return None

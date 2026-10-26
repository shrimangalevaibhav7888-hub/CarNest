from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import (
    User, PatientProfile, CaregiverProfile, CarePlan, CareTask,
    MedicationSchedule, VitalRecord, EmergencyEvent, AuditLog, Hospital
)
from app.models.enums import (
    UserRole, TaskStatus, MedicationStatus, VitalFlagStatus,
    EmergencyStatus, CarePlanStatus, HomeReadinessStatus
)
from app.schemas.analytics import (
    PatientDashboardAnalytics, CaregiverDashboardAnalytics,
    HospitalDashboardAnalytics, AdminDashboardAnalytics, StatusCounts
)
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/analytics", tags=["Dashboard Analytics"])


@router.get("/patient/{patient_id}", response_model=PatientDashboardAnalytics)
def get_patient_analytics(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Computes patient care health indicators (GREEN, YELLOW, RED)
    and daily task/medication adherence metrics.
    """
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found.")

    today = date.today()

    # Task metrics
    tasks = db.query(CareTask).filter(
        CareTask.patient_id == patient_id,
        CareTask.due_date == today
    ).all()
    total_t = len(tasks)
    comp_t = len([t for t in tasks if t.status == TaskStatus.COMPLETED])
    pend_t = len([t for t in tasks if t.status in (TaskStatus.PENDING, TaskStatus.IN_PROGRESS)])
    miss_t = len([t for t in tasks if t.status == TaskStatus.MISSED])
    t_rate = round((comp_t / total_t * 100), 1) if total_t > 0 else 100.0

    task_stats = StatusCounts(
        total=total_t,
        completed=comp_t,
        pending=pend_t,
        missed=miss_t,
        adherence_rate=t_rate
    )

    # Medication metrics
    schedules = db.query(MedicationSchedule).filter(
        MedicationSchedule.patient_id == patient_id,
        MedicationSchedule.scheduled_date == today
    ).all()
    total_m = len(schedules)
    comp_m = len([m for m in schedules if m.status == MedicationStatus.TAKEN])
    pend_m = len([m for m in schedules if m.status == MedicationStatus.PENDING])
    miss_m = len([m for m in schedules if m.status == MedicationStatus.MISSED])
    m_rate = round((comp_m / total_m * 100), 1) if total_m > 0 else 100.0

    med_stats = StatusCounts(
        total=total_m,
        completed=comp_m,
        pending=pend_m,
        missed=miss_m,
        adherence_rate=m_rate
    )

    # Check for active emergencies
    active_emergency = db.query(EmergencyEvent).filter(
        EmergencyEvent.patient_id == patient_id,
        EmergencyEvent.status.in_([EmergencyStatus.TRIGGERED, EmergencyStatus.ACKNOWLEDGED, EmergencyStatus.RESPONDING])
    ).first()

    # Recent Vitals
    latest_vital = db.query(VitalRecord).filter(
        VitalRecord.patient_id == patient_id
    ).order_by(VitalRecord.created_at.desc()).first()

    vital_flag = latest_vital.ai_flag_status if latest_vital else VitalFlagStatus.NORMAL

    # Determine Traffic Light Status
    if active_emergency:
        care_status = "RED"
        status_message = "Urgent attention required: Active emergency event reported."
    elif miss_m > 0 or vital_flag == VitalFlagStatus.ATTENTION_REQUIRED or miss_t > 1:
        care_status = "YELLOW"
        status_message = "Attention may be required: Missed dose or vital variation detected."
    else:
        care_status = "GREEN"
        status_message = "Care progressing normally. Routine tasks on schedule."

    return PatientDashboardAnalytics(
        care_status=care_status,
        status_message=status_message,
        task_stats=task_stats,
        medication_stats=med_stats,
        recent_vital_status=vital_flag.value,
        upcoming_appointments_count=len(patient.appointments)
    )


@router.get("/caregiver/{caregiver_id}", response_model=CaregiverDashboardAnalytics)
def get_caregiver_analytics(
    caregiver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Computes workload, today's schedule completion, and alerts for caregiver."""
    cg = db.query(CaregiverProfile).filter(CaregiverProfile.id == caregiver_id).first()
    if not cg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Caregiver not found.")

    today = date.today()
    tasks = db.query(CareTask).filter(
        CareTask.caregiver_id == caregiver_id,
        CareTask.due_date == today
    ).all()

    total_tasks = len(tasks)
    completed = len([t for t in tasks if t.status == TaskStatus.COMPLETED])
    pending = len([t for t in tasks if t.status in (TaskStatus.PENDING, TaskStatus.IN_PROGRESS)])
    rate = round((completed / total_tasks * 100), 1) if total_tasks > 0 else 100.0

    return CaregiverDashboardAnalytics(
        assigned_patients_count=len(cg.assignments),
        today_tasks_count=total_tasks,
        completed_tasks_count=completed,
        pending_tasks_count=pending,
        completion_rate=rate,
        urgent_alerts_count=0
    )


@router.get("/hospital", response_model=HospitalDashboardAnalytics)
def get_hospital_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Hospital discharge pipeline metrics."""
    awaiting = db.query(PatientProfile).filter(
        PatientProfile.discharge_status == "DISCHARGE_READY"
    ).count()

    active_plans = db.query(CarePlan).filter(
        CarePlan.status == CarePlanStatus.ACTIVE
    ).count()

    assigned_plans = db.query(CarePlan).filter(
        CarePlan.status == CarePlanStatus.ACTIVE,
        CarePlan.assigned_caregiver_id.isnot(None)
    ).count()

    cg_pct = round((assigned_plans / active_plans * 100), 1) if active_plans > 0 else 0.0

    critical_alerts = db.query(EmergencyEvent).filter(
        EmergencyEvent.status.in_([EmergencyStatus.TRIGGERED, EmergencyStatus.ACKNOWLEDGED])
    ).count()

    return HospitalDashboardAnalytics(
        patients_awaiting_discharge=awaiting,
        active_home_care_plans=active_plans,
        caregiver_assigned_percentage=cg_pct,
        total_discharged_this_month=db.query(PatientProfile).filter(PatientProfile.discharge_status == "DISCHARGED_HOME").count(),
        critical_alerts_count=critical_alerts
    )


@router.get("/admin", response_model=AdminDashboardAnalytics)
def get_admin_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Platform-wide system metrics for administrators."""
    return AdminDashboardAnalytics(
        total_users=db.query(User).count(),
        total_patients=db.query(PatientProfile).count(),
        total_caregivers=db.query(CaregiverProfile).count(),
        total_active_care_plans=db.query(CarePlan).filter(CarePlan.status == CarePlanStatus.ACTIVE).count(),
        total_emergency_events=db.query(EmergencyEvent).count(),
        recent_audit_logs_count=db.query(AuditLog).count()
    )

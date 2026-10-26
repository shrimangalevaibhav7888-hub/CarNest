from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class StatusCounts(BaseModel):
    total: int = 0
    completed: int = 0
    pending: int = 0
    missed: int = 0
    adherence_rate: float = 0.0


class PatientDashboardAnalytics(BaseModel):
    care_status: str  # "GREEN", "YELLOW", "RED"
    status_message: str
    task_stats: StatusCounts
    medication_stats: StatusCounts
    recent_vital_status: str
    upcoming_appointments_count: int


class CaregiverDashboardAnalytics(BaseModel):
    assigned_patients_count: int
    today_tasks_count: int
    completed_tasks_count: int
    pending_tasks_count: int
    completion_rate: float
    urgent_alerts_count: int


class HospitalDashboardAnalytics(BaseModel):
    patients_awaiting_discharge: int
    active_home_care_plans: int
    caregiver_assigned_percentage: float
    total_discharged_this_month: int
    critical_alerts_count: int


class AdminDashboardAnalytics(BaseModel):
    total_users: int
    total_patients: int
    total_caregivers: int
    total_active_care_plans: int
    total_emergency_events: int
    recent_audit_logs_count: int

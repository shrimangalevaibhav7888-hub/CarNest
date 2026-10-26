from datetime import date, time, datetime
from typing import Optional
from pydantic import BaseModel
from app.models.enums import TaskCategory, TaskPriority, TaskStatus


class CareTaskCreate(BaseModel):
    patient_id: int
    caregiver_id: Optional[int] = None
    care_plan_id: Optional[int] = None
    category: TaskCategory = TaskCategory.MEDICATION
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    due_time: Optional[time] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    status: TaskStatus = TaskStatus.PENDING
    notes: Optional[str] = None


class CareTaskUpdate(BaseModel):
    caregiver_id: Optional[int] = None
    category: Optional[TaskCategory] = None
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    due_time: Optional[time] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    notes: Optional[str] = None


class CareTaskStatusUpdate(BaseModel):
    status: TaskStatus
    notes: Optional[str] = None


class CareTaskResponse(BaseModel):
    id: int
    patient_id: int
    caregiver_id: Optional[int] = None
    care_plan_id: Optional[int] = None
    category: TaskCategory
    title: str
    description: Optional[str] = None
    due_date: date
    due_time: time
    priority: TaskPriority
    status: TaskStatus
    notes: Optional[str] = None
    completion_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

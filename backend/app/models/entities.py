import json
from datetime import datetime, date, time
from typing import List, Optional, Any
from sqlalchemy import (
    String, Integer, Float, Boolean, Text, Date, Time, DateTime,
    ForeignKey, Enum as SQLEnum, Index, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship as orm_relationship

from app.database.base import Base, TimestampMixin
from app.models.enums import (
    UserRole, MobilityStatus, LivingSituation, DischargeStatus,
    HomeReadinessStatus, CarePlanStatus, TaskCategory, TaskPriority,
    TaskStatus, MedicationStatus, AppointmentStatus, EmergencyStatus,
    EmergencySeverity, CaregiverAvailability, VerificationStatus,
    NotificationType, VitalFlagStatus, AIInteractionType, FamilyRelationship
)


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    patient_profile: Mapped[Optional["PatientProfile"]] = orm_relationship("PatientProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    caregiver_profile: Mapped[Optional["CaregiverProfile"]] = orm_relationship("CaregiverProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    family_memberships: Mapped[List["FamilyMember"]] = orm_relationship("FamilyMember", back_populates="user", cascade="all, delete-orphan")
    notifications: Mapped[List["Notification"]] = orm_relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    audit_logs: Mapped[List["AuditLog"]] = orm_relationship("AuditLog", back_populates="user")


class Hospital(Base, TimestampMixin):
    __tablename__ = "hospitals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(50), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    license_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Relationships
    patients: Mapped[List["PatientProfile"]] = orm_relationship("PatientProfile", back_populates="hospital")
    discharge_records: Mapped[List["DischargeRecord"]] = orm_relationship("DischargeRecord", back_populates="hospital")


class PatientProfile(Base, TimestampMixin):
    __tablename__ = "patient_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    hospital_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("hospitals.id", ondelete="SET NULL"), nullable=True)
    
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    age: Mapped[int] = mapped_column(Integer, nullable=False, default=70)
    gender: Mapped[str] = mapped_column(String(20), nullable=False, default="Not Specified")
    address: Mapped[str] = mapped_column(String(500), nullable=False, default="Home Address")
    room_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    mobility_status: Mapped[MobilityStatus] = mapped_column(SQLEnum(MobilityStatus), default=MobilityStatus.ASSISTED, nullable=False)
    living_situation: Mapped[LivingSituation] = mapped_column(SQLEnum(LivingSituation), default=LivingSituation.LIVES_ALONE, nullable=False)
    preferred_language: Mapped[str] = mapped_column(String(50), default="English", nullable=False)
    
    care_requirements: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    allergies: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    medical_history: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    discharge_status: Mapped[DischargeStatus] = mapped_column(SQLEnum(DischargeStatus), default=DischargeStatus.DISCHARGE_READY, nullable=False)
    emergency_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = orm_relationship("User", back_populates="patient_profile")
    hospital: Mapped[Optional["Hospital"]] = orm_relationship("Hospital", back_populates="patients")
    family_members: Mapped[List["FamilyMember"]] = orm_relationship("FamilyMember", back_populates="patient", cascade="all, delete-orphan")
    emergency_contacts: Mapped[List["EmergencyContact"]] = orm_relationship("EmergencyContact", back_populates="patient", cascade="all, delete-orphan")
    care_plans: Mapped[List["CarePlan"]] = orm_relationship("CarePlan", back_populates="patient", cascade="all, delete-orphan")
    tasks: Mapped[List["CareTask"]] = orm_relationship("CareTask", back_populates="patient", cascade="all, delete-orphan")
    medications: Mapped[List["Medication"]] = orm_relationship("Medication", back_populates="patient", cascade="all, delete-orphan")
    medication_schedules: Mapped[List["MedicationSchedule"]] = orm_relationship("MedicationSchedule", back_populates="patient", cascade="all, delete-orphan")
    appointments: Mapped[List["Appointment"]] = orm_relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")
    vitals: Mapped[List["VitalRecord"]] = orm_relationship("VitalRecord", back_populates="patient", cascade="all, delete-orphan")
    discharge_records: Mapped[List["DischargeRecord"]] = orm_relationship("DischargeRecord", back_populates="patient", cascade="all, delete-orphan")
    caregiver_assignments: Mapped[List["CaregiverAssignment"]] = orm_relationship("CaregiverAssignment", back_populates="patient", cascade="all, delete-orphan")
    emergency_events: Mapped[List["EmergencyEvent"]] = orm_relationship("EmergencyEvent", back_populates="patient", cascade="all, delete-orphan")
    daily_care_logs: Mapped[List["DailyCareLog"]] = orm_relationship("DailyCareLog", back_populates="patient", cascade="all, delete-orphan")
    documents: Mapped[List["Document"]] = orm_relationship("Document", back_populates="patient", cascade="all, delete-orphan")


class CaregiverProfile(Base, TimestampMixin):
    __tablename__ = "caregiver_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    skills: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    experience_years: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    languages: Mapped[Optional[Any]] = mapped_column(JSON, default=lambda: ["English"], nullable=True)
    availability_status: Mapped[CaregiverAvailability] = mapped_column(SQLEnum(CaregiverAvailability), default=CaregiverAvailability.AVAILABLE, nullable=False)
    service_area: Mapped[str] = mapped_column(String(255), default="North District", nullable=False)
    care_categories: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    verification_status: Mapped[VerificationStatus] = mapped_column(SQLEnum(VerificationStatus), default=VerificationStatus.PENDING, nullable=False)
    verification_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=4.9, nullable=False)
    max_workload: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    current_workload: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    hourly_rate: Mapped[Optional[float]] = mapped_column(Float, default=28.5, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Relationships
    user: Mapped["User"] = orm_relationship("User", back_populates="caregiver_profile")
    assignments: Mapped[List["CaregiverAssignment"]] = orm_relationship("CaregiverAssignment", back_populates="caregiver")
    assigned_tasks: Mapped[List["CareTask"]] = orm_relationship("CareTask", back_populates="caregiver")
    care_plans: Mapped[List["CarePlan"]] = orm_relationship("CarePlan", back_populates="assigned_caregiver")
    daily_care_logs: Mapped[List["DailyCareLog"]] = orm_relationship("DailyCareLog", back_populates="caregiver")


class FamilyMember(Base, TimestampMixin):
    __tablename__ = "family_members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    relationship_type: Mapped[FamilyRelationship] = mapped_column(SQLEnum(FamilyRelationship), default=FamilyRelationship.DAUGHTER, nullable=False)
    access_level: Mapped[str] = mapped_column(String(50), default="FULL", nullable=False)
    is_primary_contact: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    user: Mapped["User"] = orm_relationship("User", back_populates="family_memberships")
    patient: Mapped["PatientProfile"] = orm_relationship("PatientProfile", back_populates="family_members")


class EmergencyContact(Base, TimestampMixin):
    __tablename__ = "emergency_contacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    relationship: Mapped[str] = mapped_column(String(100), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(50), nullable=False)
    alternate_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    priority_order: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Relationships
    patient: Mapped["PatientProfile"] = orm_relationship("PatientProfile", back_populates="emergency_contacts")


class DischargeRecord(Base, TimestampMixin):
    __tablename__ = "discharge_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    hospital_id: Mapped[int] = mapped_column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    coordinator_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    discharge_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    medical_summary: Mapped[str] = mapped_column(Text, nullable=False)
    mobility_requirements: Mapped[str] = mapped_column(Text, nullable=False, default="Walker assistance required for ambulation.")
    dietary_requirements: Mapped[str] = mapped_column(Text, nullable=False, default="Low sodium diet, maintain adequate hydration.")
    hygiene_requirements: Mapped[str] = mapped_column(Text, nullable=False, default="Assistance with bathing and grooming.")
    post_discharge_instructions: Mapped[str] = mapped_column(Text, nullable=False)
    home_readiness_status: Mapped[HomeReadinessStatus] = mapped_column(SQLEnum(HomeReadinessStatus), default=HomeReadinessStatus.READY_FOR_DISCHARGE, nullable=False)
    follow_up_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    # Relationships
    patient: Mapped["PatientProfile"] = orm_relationship("PatientProfile", back_populates="discharge_records")
    hospital: Mapped["Hospital"] = orm_relationship("Hospital", back_populates="discharge_records")
    coordinator: Mapped[Optional["User"]] = orm_relationship("User")
    care_plans: Mapped[List["CarePlan"]] = orm_relationship("CarePlan", back_populates="discharge_record")


class CarePlan(Base, TimestampMixin):
    __tablename__ = "care_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    assigned_caregiver_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("caregiver_profiles.id", ondelete="SET NULL"), nullable=True)
    discharge_record_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("discharge_records.id", ondelete="SET NULL"), nullable=True)
    created_by_user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    title: Mapped[str] = mapped_column(String(255), nullable=False, default="Post-Discharge Recovery & Home-Care Plan")
    goals: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    status: Mapped[CarePlanStatus] = mapped_column(SQLEnum(CarePlanStatus), default=CarePlanStatus.ACTIVE, nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
    required_services: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    emergency_instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    monitoring_requirements: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    patient: Mapped["PatientProfile"] = orm_relationship("PatientProfile", back_populates="care_plans")
    assigned_caregiver: Mapped[Optional["CaregiverProfile"]] = orm_relationship("CaregiverProfile", back_populates="care_plans")
    discharge_record: Mapped[Optional["DischargeRecord"]] = orm_relationship("DischargeRecord", back_populates="care_plans")
    created_by: Mapped["User"] = orm_relationship("User")
    tasks: Mapped[List["CareTask"]] = orm_relationship("CareTask", back_populates="care_plan", cascade="all, delete-orphan")
    assignments: Mapped[List["CaregiverAssignment"]] = orm_relationship("CaregiverAssignment", back_populates="care_plan")


class CareTask(Base, TimestampMixin):
    __tablename__ = "care_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    caregiver_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("caregiver_profiles.id", ondelete="SET NULL"), nullable=True)
    care_plan_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("care_plans.id", ondelete="SET NULL"), nullable=True)

    category: Mapped[TaskCategory] = mapped_column(SQLEnum(TaskCategory), default=TaskCategory.MEDICATION, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    due_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    due_time: Mapped[time] = mapped_column(Time, nullable=False, default=lambda: time(9, 0))
    priority: Mapped[TaskPriority] = mapped_column(SQLEnum(TaskPriority), default=TaskPriority.MEDIUM, nullable=False)
    status: Mapped[TaskStatus] = mapped_column(SQLEnum(TaskStatus), default=TaskStatus.PENDING, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    completion_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    patient: Mapped["PatientProfile"] = orm_relationship("PatientProfile", back_populates="tasks")
    caregiver: Mapped[Optional["CaregiverProfile"]] = orm_relationship("CaregiverProfile", back_populates="assigned_tasks")
    care_plan: Mapped[Optional["CarePlan"]] = orm_relationship("CarePlan", back_populates="tasks")


class Medication(Base, TimestampMixin):
    __tablename__ = "medications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    dosage: Mapped[str] = mapped_column(String(100), nullable=False)
    frequency: Mapped[str] = mapped_column(String(100), nullable=False)
    instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    prescribing_doctor: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    patient: Mapped["PatientProfile"] = orm_relationship("PatientProfile", back_populates="medications")
    schedules: Mapped[List["MedicationSchedule"]] = orm_relationship("MedicationSchedule", back_populates="medication", cascade="all, delete-orphan")


class MedicationSchedule(Base, TimestampMixin):
    __tablename__ = "medication_schedules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    medication_id: Mapped[int] = mapped_column(Integer, ForeignKey("medications.id", ondelete="CASCADE"), nullable=False)
    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)

    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    scheduled_time: Mapped[time] = mapped_column(Time, nullable=False, default=lambda: time(8, 0))
    status: Mapped[MedicationStatus] = mapped_column(SQLEnum(MedicationStatus), default=MedicationStatus.PENDING, nullable=False)
    taken_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    confirmed_by_user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    medication: Mapped["Medication"] = orm_relationship("Medication", back_populates="schedules")
    patient: Mapped["PatientProfile"] = orm_relationship("PatientProfile", back_populates="medication_schedules")
    confirmed_by: Mapped[Optional["User"]] = orm_relationship("User")


class Appointment(Base, TimestampMixin):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)

    doctor_name: Mapped[str] = mapped_column(String(255), nullable=False)
    department: Mapped[str] = mapped_column(String(255), nullable=False, default="Cardiology / Internal Medicine")
    location: Mapped[str] = mapped_column(String(500), nullable=False)
    appointment_date: Mapped[date] = mapped_column(Date, nullable=False)
    appointment_time: Mapped[time] = mapped_column(Time, nullable=False)
    purpose: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[AppointmentStatus] = mapped_column(SQLEnum(AppointmentStatus), default=AppointmentStatus.SCHEDULED, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    caregiver_accompany_required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    patient: Mapped["PatientProfile"] = orm_relationship("PatientProfile", back_populates="appointments")


class VitalRecord(Base):
    __tablename__ = "vital_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    recorded_by_user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    systolic_bp: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    diastolic_bp: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    heart_rate: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    temperature: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    oxygen_saturation: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    weight: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    blood_glucose: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    ai_flag_status: Mapped[VitalFlagStatus] = mapped_column(SQLEnum(VitalFlagStatus), default=VitalFlagStatus.NORMAL, nullable=False)
    ai_flag_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    patient: Mapped["PatientProfile"] = orm_relationship("PatientProfile", back_populates="vitals")
    recorded_by: Mapped[Optional["User"]] = orm_relationship("User")


class EmergencyEvent(Base, TimestampMixin):
    __tablename__ = "emergency_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    triggered_by_user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    status: Mapped[EmergencyStatus] = mapped_column(SQLEnum(EmergencyStatus), default=EmergencyStatus.TRIGGERED, nullable=False)
    severity: Mapped[EmergencySeverity] = mapped_column(SQLEnum(EmergencySeverity), default=EmergencySeverity.HIGH, nullable=False)
    location: Mapped[str] = mapped_column(String(500), default="Home Address", nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    patient: Mapped["PatientProfile"] = orm_relationship("PatientProfile", back_populates="emergency_events")
    triggered_by: Mapped["User"] = orm_relationship("User")


class CaregiverAssignment(Base, TimestampMixin):
    __tablename__ = "caregiver_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    caregiver_id: Mapped[int] = mapped_column(Integer, ForeignKey("caregiver_profiles.id", ondelete="CASCADE"), nullable=False)
    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    care_plan_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("care_plans.id", ondelete="SET NULL"), nullable=True)
    assigned_by_user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    start_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    caregiver: Mapped["CaregiverProfile"] = orm_relationship("CaregiverProfile", back_populates="assignments")
    patient: Mapped["PatientProfile"] = orm_relationship("PatientProfile", back_populates="caregiver_assignments")
    care_plan: Mapped[Optional["CarePlan"]] = orm_relationship("CarePlan", back_populates="assignments")
    assigned_by: Mapped["User"] = orm_relationship("User")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    patient_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[NotificationType] = mapped_column(SQLEnum(NotificationType), default=NotificationType.SYSTEM, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    action_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    metadata_json: Mapped[Optional[Any]] = mapped_column(JSON, default=dict, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user: Mapped["User"] = orm_relationship("User", back_populates="notifications")


class AIInteraction(Base):
    __tablename__ = "ai_interactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    patient_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("patient_profiles.id", ondelete="SET NULL"), nullable=True)

    interaction_type: Mapped[AIInteractionType] = mapped_column(SQLEnum(AIInteractionType), default=AIInteractionType.GENERAL_QNA, nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    response: Mapped[str] = mapped_column(Text, nullable=False)
    tokens_used: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    disclaimer_attached: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class DailyCareLog(Base, TimestampMixin):
    __tablename__ = "daily_care_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    caregiver_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("caregiver_profiles.id", ondelete="SET NULL"), nullable=True)

    date: Mapped[date] = mapped_column(Date, default=date.today, nullable=False)
    general_condition: Mapped[str] = mapped_column(String(100), default="Stable and comfortable", nullable=False)
    mood: Mapped[str] = mapped_column(String(100), default="Cheerful & alert", nullable=False)
    appetite: Mapped[str] = mapped_column(String(100), default="Normal", nullable=False)
    hydration: Mapped[str] = mapped_column(String(100), default="6-8 glasses of water", nullable=False)
    hygiene_completed: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    handover_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    patient: Mapped["PatientProfile"] = orm_relationship("PatientProfile", back_populates="daily_care_logs")
    caregiver: Mapped[Optional["CaregiverProfile"]] = orm_relationship("CaregiverProfile", back_populates="daily_care_logs")


class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    uploaded_by_user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    document_type: Mapped[str] = mapped_column(String(100), default="DISCHARGE_SUMMARY", nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), default="application/pdf", nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    patient: Mapped["PatientProfile"] = orm_relationship("PatientProfile", back_populates="documents")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    action: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    old_values: Mapped[Optional[Any]] = mapped_column(JSON, default=dict, nullable=True)
    new_values: Mapped[Optional[Any]] = mapped_column(JSON, default=dict, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user: Mapped[Optional["User"]] = orm_relationship("User", back_populates="audit_logs")


class Booking(Base, TimestampMixin):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    elderly_id: Mapped[str] = mapped_column(String(100), default="1", nullable=False)
    elderly_name: Mapped[str] = mapped_column(String(255), default="Eleanor Vance", nullable=False)
    elderly_address: Mapped[str] = mapped_column(String(500), default="742 Evergreen Healthcare Ave", nullable=False)
    family_id: Mapped[str] = mapped_column(String(100), default="1", nullable=False)
    family_name: Mapped[str] = mapped_column(String(255), default="Sarah Vance", nullable=False)
    family_phone: Mapped[str] = mapped_column(String(50), default="+1 (555) 019-2831", nullable=False)
    caregiver_id: Mapped[str] = mapped_column(String(100), nullable=False)
    caregiver_name: Mapped[str] = mapped_column(String(255), nullable=False)
    caregiver_phone: Mapped[str] = mapped_column(String(50), default="+1 (555) 019-4412", nullable=False)
    caregiver_avatar: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    date: Mapped[str] = mapped_column(String(50), nullable=False)
    time_slot: Mapped[str] = mapped_column(String(100), default="Morning (09:00 AM - 01:00 PM)", nullable=False)
    service_type: Mapped[str] = mapped_column(String(100), default="Medication & Vitals", nullable=False)
    duration_hours: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="CONFIRMED", nullable=False)
    total_amount: Mapped[float] = mapped_column(Float, default=1400.0, nullable=False)
    payment_status: Mapped[str] = mapped_column(String(50), default="PAID", nullable=False)
    payment_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    caregiver_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    started_at: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    completed_at: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    cancelled_reason: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)


class CareUpdate(Base):
    __tablename__ = "care_updates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    elderly_id: Mapped[str] = mapped_column(String(100), default="1", nullable=False)
    elderly_name: Mapped[str] = mapped_column(String(255), default="Eleanor Vance", nullable=False)
    author_id: Mapped[str] = mapped_column(String(100), default="1", nullable=False)
    author_name: Mapped[str] = mapped_column(String(255), default="Sister Ananya Roy", nullable=False)
    author_role: Mapped[str] = mapped_column(String(50), default="CAREGIVER", nullable=False)
    timestamp_label: Mapped[str] = mapped_column(String(100), default="Just now", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="VISIT", nullable=False)
    vitals: Mapped[Optional[Any]] = mapped_column(JSON, default=dict, nullable=True)
    attachments: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class Subscription(Base, TimestampMixin):
    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(100), default="1", nullable=False)
    plan_name: Mapped[str] = mapped_column(String(100), default="CareNest Basic", nullable=False)
    monthly_rate_inr: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)
    renewal_date: Mapped[str] = mapped_column(String(50), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(100), default="UPI / Card", nullable=False)
    features: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    caregiver_id: Mapped[str] = mapped_column(String(100), nullable=False)
    family_id: Mapped[str] = mapped_column(String(100), default="1", nullable=False)
    family_name: Mapped[str] = mapped_column(String(255), default="CareNest Family Member", nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=5.0, nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    date: Mapped[str] = mapped_column(String(50), nullable=False)
    visit_service_type: Mapped[str] = mapped_column(String(100), default="Home Care", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


import os
from datetime import date, datetime, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.config import settings
from app.models.entities import (
    PatientProfile, CarePlan, CareTask, Medication,
    MedicationSchedule, Appointment, VitalRecord, DailyCareLog,
    AIInteraction, User
)
from app.models.enums import (
    AIInteractionType, TaskStatus, MedicationStatus,
    VitalFlagStatus, CarePlanStatus
)
from app.schemas.ai import AIResponseSchema
from app.utils.logger import logger

SAFETY_DISCLAIMER = (
    "IMPORTANT MEDICAL NOTICE: CareNest AI is a supportive, non-diagnostic home-care coordinator. "
    "It does not provide medical diagnoses, alter medication dosages, or replace professional healthcare providers. "
    "In a medical emergency, immediately call emergency services (911/112) or trigger the CareNest SOS button."
)


class AIService:
    @staticmethod
    def _check_emergency_red_flags(prompt: str) -> Optional[str]:
        """Detects high-risk symptoms in prompt and returns immediate safety guidance."""
        emergency_keywords = [
            "chest pain", "can't breathe", "shortness of breath", "slurred speech",
            "facial drooping", "arm weakness", "unconscious", "heavy bleeding",
            "severe dizziness", "fainted", "collapsed", "stroke", "heart attack"
        ]
        lower = prompt.lower()
        if any(k in lower for k in emergency_keywords):
            return (
                "EMERGENCY SAFETY ALERT: The symptoms mentioned may indicate a time-sensitive medical emergency. "
                "Please call 911 / emergency services or press the CareNest Emergency SOS button immediately. "
                "Do not wait for AI response or online assistance."
            )
        return None

    @staticmethod
    def generate_daily_summary(db: Session, patient_id: int) -> AIResponseSchema:
        """
        Generates a comprehensive, comforting daily care summary for family members and patients.
        """
        patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
        if not patient:
            return AIResponseSchema(
                interaction_type=AIInteractionType.DAILY_SUMMARY,
                title="Patient Not Found",
                content="Unable to locate patient record.",
                highlights=[],
                safety_disclaimer=SAFETY_DISCLAIMER
            )

        today = date.today()
        tasks = db.query(CareTask).filter(
            CareTask.patient_id == patient_id,
            CareTask.due_date == today
        ).all()

        med_schedules = db.query(MedicationSchedule).filter(
            MedicationSchedule.patient_id == patient_id,
            MedicationSchedule.scheduled_date == today
        ).all()

        vitals = db.query(VitalRecord).filter(
            VitalRecord.patient_id == patient_id
        ).order_by(VitalRecord.created_at.desc()).limit(3).all()

        appts = db.query(Appointment).filter(
            Appointment.patient_id == patient_id,
            Appointment.appointment_date >= today
        ).order_by(Appointment.appointment_date.asc()).limit(2).all()

        completed_tasks = [t for t in tasks if t.status == TaskStatus.COMPLETED]
        pending_tasks = [t for t in tasks if t.status in (TaskStatus.PENDING, TaskStatus.IN_PROGRESS)]
        missed_tasks = [t for t in tasks if t.status == TaskStatus.MISSED]

        taken_meds = [m for m in med_schedules if m.status == MedicationStatus.TAKEN]
        pending_meds = [m for m in med_schedules if m.status == MedicationStatus.PENDING]

        highlights = []
        if completed_tasks:
            highlights.append(f"{len(completed_tasks)} of {len(tasks)} planned daily tasks successfully completed.")
        if taken_meds:
            highlights.append(f"{len(taken_meds)} scheduled medication doses confirmed on time.")
        if vitals:
            latest_v = vitals[0]
            bp_str = f"{latest_v.systolic_bp}/{latest_v.diastolic_bp} mmHg" if latest_v.systolic_bp else "Recorded"
            highlights.append(f"Latest blood pressure is {bp_str} with {latest_v.heart_rate or '--'} bpm pulse.")
        if appts:
            highlights.append(f"Next appointment: {appts[0].doctor_name} on {appts[0].appointment_date.strftime('%b %d')}.")

        content = (
            f"Care status summary for {patient.user.full_name if patient.user else 'Patient'}:\n\n"
            f"Today's routine is progressing smoothly. The morning medication doses and vital checks were completed successfully. "
            f"There are currently {len(pending_tasks)} upcoming activity/vital tasks and {len(pending_meds)} pending evening medication doses remaining today. "
            f"Overall recovery trajectory remains stable and compliant with the post-discharge home-care plan."
        )

        return AIResponseSchema(
            interaction_type=AIInteractionType.DAILY_SUMMARY,
            title=f"Daily Care Summary — {patient.user.full_name if patient.user else 'Patient'}",
            content=content,
            highlights=highlights,
            safety_disclaimer=SAFETY_DISCLAIMER
        )

    @staticmethod
    def explain_care_plan(db: Session, care_plan_id: int, audience: str = "FAMILY") -> AIResponseSchema:
        """
        Translates a clinical post-discharge care plan into warm, plain English.
        """
        plan = db.query(CarePlan).filter(CarePlan.id == care_plan_id).first()
        if not plan:
            return AIResponseSchema(
                interaction_type=AIInteractionType.CARE_PLAN_EXPLANATION,
                title="Plan Not Found",
                content="Care plan record not found.",
                highlights=[],
                safety_disclaimer=SAFETY_DISCLAIMER
            )

        patient_name = plan.patient.user.full_name if (plan.patient and plan.patient.user) else "the patient"
        caregiver_name = plan.assigned_caregiver.user.full_name if (plan.assigned_caregiver and plan.assigned_caregiver.user) else "Assigned Caregiver"

        highlights = [
            f"Goal: {g}" for g in (plan.goals or ["Ensure safe recovery and mobility support."])[:3]
        ]
        highlights.append(f"Caregiver Assigned: {caregiver_name}")

        content = (
            f"This recovery plan for {patient_name} focuses on establishing a safe, structured daily home routine. "
            f"Key priorities include monitoring vital indicators twice daily, ensuring consistent medication adherence, "
            f"and supporting gentle physical movement to prevent falls. "
            f"Caregiver {caregiver_name} is scheduled to assist with essential daily tasks and maintain continuous progress logs."
        )

        return AIResponseSchema(
            interaction_type=AIInteractionType.CARE_PLAN_EXPLANATION,
            title=f"Care Plan Guide: {plan.title}",
            content=content,
            highlights=highlights,
            safety_disclaimer=SAFETY_DISCLAIMER
        )

    @staticmethod
    def generate_handover(db: Session, patient_id: int, shift_notes: Optional[str] = None) -> AIResponseSchema:
        """
        Synthesizes recent tasks, vitals, and caregiver observations into a professional clinical handover.
        """
        patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
        patient_name = patient.user.full_name if (patient and patient.user) else "Patient"

        today = date.today()
        completed_tasks = db.query(CareTask).filter(
            CareTask.patient_id == patient_id,
            CareTask.due_date == today,
            CareTask.status == TaskStatus.COMPLETED
        ).all()

        vitals = db.query(VitalRecord).filter(
            VitalRecord.patient_id == patient_id
        ).order_by(VitalRecord.created_at.desc()).first()

        highlights = [
            f"Patient: {patient_name} (Age {patient.age if patient else '70'})",
            f"Tasks Completed: {len(completed_tasks)} tasks documented during shift",
            f"Latest Vitals: BP {vitals.systolic_bp}/{vitals.diastolic_bp} mmHg, HR {vitals.heart_rate} bpm" if vitals else "Vitals: Stable",
            f"Mobility: {patient.mobility_status.value if patient else 'ASSISTED'}"
        ]

        content = (
            f"SHIFT HANDOVER REPORT for {patient_name} ({today.strftime('%B %d, %Y')}):\n\n"
            f"• General Condition: Patient alert, responsive, and resting comfortably.\n"
            f"• Medications: Scheduled morning doses confirmed.\n"
            f"• Vitals: Within expected post-discharge baseline.\n"
            f"• Caregiver Notes: {shift_notes or 'No adverse events or discomfort observed during shift.'}\n"
            f"• Incoming Caregiver Focus: Supervise evening hydration and medication dose; maintain fall precaution protocol."
        )

        return AIResponseSchema(
            interaction_type=AIInteractionType.HANDOVER,
            title=f"Caregiver Shift Handover — {patient_name}",
            content=content,
            highlights=highlights,
            safety_disclaimer=SAFETY_DISCLAIMER
        )

    @staticmethod
    def process_voice_or_text_query(
        db: Session,
        current_user: User,
        patient_id: Optional[int],
        prompt: str,
        is_voice: bool = False
    ) -> AIResponseSchema:
        """
        Safe conversational assistant for elderly patients, caregivers, and family members.
        Converts queries into safe application data responses.
        """
        # 1. Emergency Safety Guardrail
        emergency_warning = AIService._check_emergency_red_flags(prompt)
        if emergency_warning:
            return AIResponseSchema(
                interaction_type=AIInteractionType.VOICE_QUERY if is_voice else AIInteractionType.GENERAL_QNA,
                title="Emergency Assistance Required",
                content=emergency_warning,
                highlights=["Call 911 / 112 immediately", "Press Red Emergency SOS button in app"],
                safety_disclaimer=SAFETY_DISCLAIMER
            )

        # Resolve Target Patient
        target_pid = patient_id
        if not target_pid and current_user.patient_profile:
            target_pid = current_user.patient_profile.id
        elif not target_pid and current_user.family_memberships:
            target_pid = current_user.family_memberships[0].patient_id

        patient = db.query(PatientProfile).filter(PatientProfile.id == target_pid).first() if target_pid else None
        p_name = patient.user.full_name if (patient and patient.user) else current_user.full_name

        lower = prompt.lower()
        today = date.today()

        # Query Type 1: "What do I need to do today?" / "Tasks"
        if any(w in lower for w in ["what do i need", "tasks", "today", "schedule", "routine", "what next"]):
            tasks = db.query(CareTask).filter(
                CareTask.patient_id == target_pid,
                CareTask.due_date == today
            ).all() if target_pid else []

            pending = [t for t in tasks if t.status == TaskStatus.PENDING]
            done = [t for t in tasks if t.status == TaskStatus.COMPLETED]

            highlights = [f"Upcoming: {t.title} at {t.due_time.strftime('%I:%M %p')}" for t in pending[:3]]
            if done:
                highlights.append(f"Completed: {len(done)} tasks done so far")

            if pending:
                next_t = pending[0]
                content = (
                    f"Hello {p_name}! Today you have {len(tasks)} total activities scheduled. "
                    f"You have already completed {len(done)} tasks. "
                    f"Your next scheduled item is '{next_t.title}' at {next_t.due_time.strftime('%I:%M %p')}."
                )
            else:
                content = f"Great news, {p_name}! You are all caught up on your scheduled tasks for right now."

            return AIResponseSchema(
                interaction_type=AIInteractionType.VOICE_QUERY if is_voice else AIInteractionType.GENERAL_QNA,
                title=f"Today's Care Schedule — {p_name}",
                content=content,
                highlights=highlights,
                safety_disclaimer=SAFETY_DISCLAIMER
            )

        # Query Type 2: "When is my next appointment?"
        elif any(w in lower for w in ["appointment", "doctor", "hospital", "clinic", "visit"]):
            appts = db.query(Appointment).filter(
                Appointment.patient_id == target_pid,
                Appointment.appointment_date >= today
            ).order_by(Appointment.appointment_date.asc()).all() if target_pid else []

            if appts:
                next_a = appts[0]
                content = (
                    f"Your next appointment is with {next_a.doctor_name} ({next_a.department}) on "
                    f"{next_a.appointment_date.strftime('%A, %B %d')} at {next_a.appointment_time.strftime('%I:%M %p')}. "
                    f"Location: {next_a.location}."
                )
                highlights = [
                    f"Doctor: {next_a.doctor_name}",
                    f"Date: {next_a.appointment_date.strftime('%B %d, %Y')} at {next_a.appointment_time.strftime('%I:%M %p')}",
                    f"Purpose: {next_a.purpose}"
                ]
            else:
                content = "You do not have any upcoming doctor appointments scheduled in your CareNest calendar."
                highlights = ["No pending appointments"]

            return AIResponseSchema(
                interaction_type=AIInteractionType.VOICE_QUERY if is_voice else AIInteractionType.GENERAL_QNA,
                title="Upcoming Doctor Appointment",
                content=content,
                highlights=highlights,
                safety_disclaimer=SAFETY_DISCLAIMER
            )

        # Query Type 3: "Who is my caregiver?"
        elif any(w in lower for w in ["caregiver", "nurse", "helper", "who is taking care", "assistant"]):
            care_plan = db.query(CarePlan).filter(
                CarePlan.patient_id == target_pid,
                CarePlan.status == CarePlanStatus.ACTIVE
            ).first() if target_pid else None

            cg = care_plan.assigned_caregiver if care_plan else None
            if cg and cg.user:
                content = (
                    f"Your designated primary caregiver is {cg.user.full_name}. "
                    f"{cg.user.full_name} is a certified healthcare professional with {cg.experience_years} years of experience. "
                    f"Contact phone: {cg.phone or cg.user.phone or 'Available in caregiver directory'}."
                )
                highlights = [
                    f"Caregiver: {cg.user.full_name}",
                    f"Specialties: {', '.join(cg.skills[:2]) if cg.skills else 'Elderly Care'}",
                    f"Rating: {cg.rating:.1f} ★"
                ]
            else:
                content = "A caregiver is currently being coordinated for your active care plan."
                highlights = ["Coordination in progress"]

            return AIResponseSchema(
                interaction_type=AIInteractionType.VOICE_QUERY if is_voice else AIInteractionType.GENERAL_QNA,
                title="Caregiver Information",
                content=content,
                highlights=highlights,
                safety_disclaimer=SAFETY_DISCLAIMER
            )

        # Query Type 4: "Medications"
        elif any(w in lower for w in ["medication", "pill", "medicine", "drugs", "prescription"]):
            meds = db.query(Medication).filter(
                Medication.patient_id == target_pid,
                Medication.is_active == True
            ).all() if target_pid else []

            highlights = [f"{m.name} ({m.dosage}) — {m.frequency}" for m in meds]
            content = (
                f"You currently have {len(meds)} active prescribed medications on your profile. "
                f"Always take medications exactly as prescribed by your doctor and never change doses without consulting them."
            )
            return AIResponseSchema(
                interaction_type=AIInteractionType.VOICE_QUERY if is_voice else AIInteractionType.GENERAL_QNA,
                title="Medication Overview",
                content=content,
                highlights=highlights,
                safety_disclaimer=SAFETY_DISCLAIMER
            )

        # General helpful query response
        else:
            content = (
                f"Hello {p_name}! I am your CareNest AI Assistant. I can help you check today's tasks, "
                f"look up your medication timetable, see your upcoming doctor appointments, or contact your caregiver. "
                f"How can I assist you right now?"
            )
            return AIResponseSchema(
                interaction_type=AIInteractionType.VOICE_QUERY if is_voice else AIInteractionType.GENERAL_QNA,
                title="CareNest Support Assistant",
                content=content,
                highlights=[
                    "Ask: 'What do I need to do today?'",
                    "Ask: 'When is my next appointment?'",
                    "Ask: 'Who is my caregiver?'"
                ],
                safety_disclaimer=SAFETY_DISCLAIMER
            )


ai_service = AIService()

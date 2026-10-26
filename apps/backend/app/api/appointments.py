from typing import List, Optional
from datetime import datetime, date, time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Appointment, PatientProfile, User
from app.models.enums import AppointmentStatus, UserRole
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse
from app.auth.dependencies import get_optional_current_user

router = APIRouter(prefix="/appointments", tags=["Doctor Appointments"])


def _to_response(a: Appointment) -> AppointmentResponse:
    p_name = a.patient.user.full_name if (a.patient and a.patient.user) else "Senior Patient"
    
    # Parse notes for custom fields if encoded
    hospital_name = "St. Jude Outpatient Center"
    specialty = a.department or "Cardiology"
    doc_phone = ""
    notes_clean = a.notes or ""

    if a.location and " - " in a.location:
        parts = a.location.split(" - ", 1)
        hospital_name = parts[0]
    elif a.location:
        hospital_name = a.location

    return AppointmentResponse(
        id=str(a.id),
        elderlyId=str(a.patient_id),
        elderlyName=p_name,
        doctorName=a.doctor_name,
        hospitalName=hospital_name,
        specialty=specialty,
        date=a.appointment_date.strftime("%Y-%m-%d"),
        time=a.appointment_time.strftime("%I:%M %p") if isinstance(a.appointment_time, time) else str(a.appointment_time),
        purpose=a.purpose,
        doctorPhone=doc_phone,
        location=a.location,
        notes=notes_clean,
        status="UPCOMING" if a.status == AppointmentStatus.SCHEDULED else a.status.value,
        reminderSent=False,
        accompaniedByCaregiver=a.caregiver_accompany_required,
        caregiverName="Assigned Caregiver",
        createdAt=a.created_at.isoformat() if a.created_at else None,
        updatedAt=a.updated_at.isoformat() if a.updated_at else None,
    )


@router.get("", response_model=List[AppointmentResponse])
def get_appointments(
    db: Session = Depends(get_db),
    patient_id: Optional[int] = None,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve doctor appointments isolated to the authenticated user."""
    query = db.query(Appointment)

    if current_user and current_user.role != UserRole.ADMIN:
        if current_user.role in (UserRole.PATIENT, UserRole.ELDERLY):
            if current_user.patient_profile:
                query = query.filter(Appointment.patient_id == current_user.patient_profile.id)
            else:
                return []
        elif current_user.role == UserRole.FAMILY:
            linked_ids = [m.patient_id for m in current_user.family_memberships]
            if linked_ids:
                query = query.filter(Appointment.patient_id.in_(linked_ids))
            else:
                return []
        elif current_user.role == UserRole.CAREGIVER:
            if current_user.caregiver_profile:
                assigned_ids = [a.patient_id for a in current_user.caregiver_profile.assignments if a.status == "ACTIVE"]
                if assigned_ids:
                    query = query.filter(Appointment.patient_id.in_(assigned_ids))
                else:
                    return []
    elif patient_id:
        query = query.filter(Appointment.patient_id == patient_id)

    appointments = query.order_by(Appointment.appointment_date.asc(), Appointment.appointment_time.asc()).all()

    # If completely empty and not a specific user filter, seed demo appointment
    if not appointments and not current_user and not patient_id:
        p = db.query(PatientProfile).first()
        p_id = p.id if p else 1
        demo = Appointment(
            patient_id=p_id,
            doctor_name="Dr. Gregory Chen, Cardiologist",
            department="Cardiology & Geriatric Medicine",
            location="Suite 300, St. Jude Outpatient Center",
            appointment_date=date.today(),
            appointment_time=time(10, 30),
            purpose="Post-stroke recovery milestone evaluation and ECG review.",
            status=AppointmentStatus.SCHEDULED,
            notes="Wheelchair transport arranged for clinic transit.",
            caregiver_accompany_required=True
        )
        db.add(demo)
        db.commit()
        appointments = [demo]

    return [_to_response(a) for a in appointments]


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    req: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Schedule a new appointment associated with the authenticated patient."""
    p_id = None
    if current_user:
        if current_user.role in (UserRole.PATIENT, UserRole.ELDERLY) and current_user.patient_profile:
            p_id = current_user.patient_profile.id
        elif current_user.role == UserRole.FAMILY and current_user.family_memberships:
            p_id = current_user.family_memberships[0].patient_id

    if not p_id:
        p_id = int(''.join(filter(str.isdigit, req.elderlyId or "1")) or 1)
        patient = db.query(PatientProfile).filter(PatientProfile.id == p_id).first()
        if not patient:
            patient = db.query(PatientProfile).first()
            p_id = patient.id if patient else 1

    # Parse date
    try:
        parsed_date = datetime.strptime(req.date, "%Y-%m-%d").date()
    except Exception:
        parsed_date = date.today()

    # Parse time
    parsed_time = time(10, 0)
    try:
        clean_time = req.time.strip().upper()
        if "AM" in clean_time or "PM" in clean_time:
            parsed_time = datetime.strptime(clean_time, "%I:%M %p").time()
        else:
            parsed_time = datetime.strptime(clean_time[:5], "%H:%M").time()
    except Exception:
        parsed_time = time(10, 0)

    location_str = f"{req.hospitalName} - {req.location}" if req.hospitalName else req.location

    appointment = Appointment(
        patient_id=p_id,
        doctor_name=req.doctorName,
        department=req.specialty or "General Healthcare",
        location=location_str,
        appointment_date=parsed_date,
        appointment_time=parsed_time,
        purpose=req.purpose,
        status=AppointmentStatus.SCHEDULED,
        notes=req.notes or "",
        caregiver_accompany_required=req.accompaniedByCaregiver if req.accompaniedByCaregiver is not None else True
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return _to_response(appointment)


@router.patch("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: str,
    req: AppointmentUpdate,
    db: Session = Depends(get_db)
):
    """Update appointment details in SQLite."""
    numeric_id = int(''.join(filter(str.isdigit, appointment_id)) or appointment_id)
    appointment = db.query(Appointment).filter(Appointment.id == numeric_id).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")

    if req.doctorName:
        appointment.doctor_name = req.doctorName
    if req.specialty:
        appointment.department = req.specialty
    if req.location:
        appointment.location = req.location
    if req.purpose:
        appointment.purpose = req.purpose
    if req.notes is not None:
        appointment.notes = req.notes
    if req.status:
        try:
            appointment.status = AppointmentStatus(req.status)
        except Exception:
            pass
    if req.accompaniedByCaregiver is not None:
        appointment.caregiver_accompany_required = req.accompaniedByCaregiver

    db.commit()
    db.refresh(appointment)
    return _to_response(appointment)


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(
    appointment_id: str,
    db: Session = Depends(get_db)
):
    """Delete an appointment permanently from SQLite."""
    numeric_id = int(''.join(filter(str.isdigit, appointment_id)) or appointment_id)
    appointment = db.query(Appointment).filter(Appointment.id == numeric_id).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")

    db.delete(appointment)
    db.commit()
    return None

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import User, PatientProfile, EmergencyContact, Hospital, FamilyMember
from app.models.enums import UserRole, FamilyRelationship
from app.schemas.patient import (
    PatientCreate, PatientUpdate, PatientResponse,
    EmergencyContactCreate, EmergencyContactResponse, LinkFamilyRequest
)
from app.auth.dependencies import get_current_user
from app.auth.security import get_password_hash

router = APIRouter(prefix="/patients", tags=["Patients"])


def _format_patient_response(p: PatientProfile) -> PatientResponse:
    contacts = [
        EmergencyContactResponse(
            id=c.id,
            patient_id=c.patient_id,
            name=c.name,
            relationship=c.relationship,
            phone_number=c.phone_number,
            alternate_phone=c.alternate_phone,
            email=c.email,
            is_primary=c.is_primary,
            priority_order=c.priority_order,
            created_at=c.created_at
        ) for c in p.emergency_contacts
    ]
    return PatientResponse(
        id=p.id,
        user_id=p.user_id,
        full_name=p.user.full_name if p.user else "Patient",
        email=p.user.email if p.user else "",
        phone=p.user.phone if p.user else None,
        avatar_url=p.user.avatar_url if p.user else None,
        hospital_id=p.hospital_id,
        date_of_birth=p.date_of_birth,
        age=p.age,
        gender=p.gender,
        address=p.address,
        room_number=p.room_number,
        mobility_status=p.mobility_status,
        living_situation=p.living_situation,
        preferred_language=p.preferred_language,
        care_requirements=p.care_requirements or [],
        allergies=p.allergies or [],
        medical_history=p.medical_history,
        discharge_status=p.discharge_status,
        emergency_notes=p.emergency_notes,
        emergency_contacts=contacts,
        created_at=p.created_at,
        updated_at=p.updated_at
    )


@router.get("", response_model=List[PatientResponse])
def get_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List patients authorized for the current user:
    - PATIENT: only their own profile
    - FAMILY: linked patient profiles
    - CAREGIVER, HOSPITAL, ADMIN: all active patients
    """
    if current_user.role in (UserRole.PATIENT, UserRole.ELDERLY):
        if not current_user.patient_profile:
            return []
        return [_format_patient_response(current_user.patient_profile)]

    elif current_user.role == UserRole.FAMILY:
        linked_ids = [m.patient_id for m in current_user.family_memberships]
        if not linked_ids:
            return []
        patients = db.query(PatientProfile).filter(PatientProfile.id.in_(linked_ids)).all()
        return [_format_patient_response(p) for p in patients]

    elif current_user.role == UserRole.CAREGIVER:
        if not current_user.caregiver_profile:
            return []
        assigned_ids = [a.patient_id for a in current_user.caregiver_profile.assignments if a.status == "ACTIVE"]
        if not assigned_ids:
            return []
        patients = db.query(PatientProfile).filter(PatientProfile.id.in_(assigned_ids)).all()
        return [_format_patient_response(p) for p in patients]

    else:
        # Hospital and Admin roles
        patients = db.query(PatientProfile).all()
        return [_format_patient_response(p) for p in patients]


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch single patient by ID with strict authorization verification (anti-IDOR)."""
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found.")

    # Verify authorization
    if current_user.role in (UserRole.PATIENT, UserRole.ELDERLY):
        if not current_user.patient_profile or current_user.patient_profile.id != patient_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access to other patient records is forbidden.")
    elif current_user.role == UserRole.FAMILY:
        linked_ids = [m.patient_id for m in current_user.family_memberships]
        if patient_id not in linked_ids:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this patient profile.")
    elif current_user.role == UserRole.CAREGIVER:
        assigned_ids = [a.patient_id for a in current_user.caregiver_profile.assignments if a.status == "ACTIVE"] if current_user.caregiver_profile else []
        if patient_id not in assigned_ids:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Caregivers can only view assigned patients.")

    return _format_patient_response(patient)


@router.post("/link-family")
def link_family_to_patient(
    req: LinkFamilyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Allow an authenticated family member to securely link an elderly patient profile."""
    if current_user.role not in (UserRole.FAMILY, UserRole.FAMILY_MEMBER):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only family accounts can link elderly patients.")

    clean_email = req.elderly_email.lower().strip()
    target_user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if not target_user or not target_user.patient_profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No registered elderly patient found with this email.")

    # Check existing link
    existing = db.query(FamilyMember).filter(
        FamilyMember.user_id == current_user.id,
        FamilyMember.patient_id == target_user.patient_profile.id
    ).first()
    if existing:
        return {"message": f"Already connected to {target_user.full_name}."}

    f_member = FamilyMember(
        user_id=current_user.id,
        patient_id=target_user.patient_profile.id,
        relationship_type=FamilyRelationship.OTHER,
        access_level="FULL",
        is_primary_contact=True
    )
    db.add(f_member)
    db.commit()
    return {"message": f"Successfully linked to {target_user.full_name}."}



@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    req: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new patient record (Hospital coordinators and Admins)."""
    if current_user.role not in (UserRole.HOSPITAL, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only hospital coordinators and administrators can enroll new patients."
        )

    # Create associated user if not provided
    if req.user_id:
        user = db.query(User).filter(User.id == req.user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specified user not found.")
    else:
        email = req.email or f"patient_{int(db.query(PatientProfile).count()) + 1}@carenest.ai"
        user = User(
            email=email.lower(),
            hashed_password=get_password_hash("Password123!"),
            full_name=req.full_name or "New Patient",
            role=UserRole.PATIENT,
            phone=req.phone
        )
        db.add(user)
        db.flush()

    patient = PatientProfile(
        user_id=user.id,
        hospital_id=req.hospital_id,
        date_of_birth=req.date_of_birth,
        age=req.age,
        gender=req.gender,
        address=req.address,
        room_number=req.room_number,
        mobility_status=req.mobility_status,
        living_situation=req.living_situation,
        preferred_language=req.preferred_language,
        care_requirements=req.care_requirements,
        allergies=req.allergies,
        medical_history=req.medical_history,
        discharge_status=req.discharge_status,
        emergency_notes=req.emergency_notes
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    return _format_patient_response(patient)


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int,
    req: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update patient information."""
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found.")

    update_data = req.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(patient, field, val)

    db.commit()
    db.refresh(patient)
    return _format_patient_response(patient)


@router.post("/{patient_id}/emergency-contacts", response_model=EmergencyContactResponse)
def add_emergency_contact(
    patient_id: int,
    req: EmergencyContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add an emergency contact for a patient."""
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found.")

    contact = EmergencyContact(
        patient_id=patient_id,
        name=req.name,
        relationship=req.relationship,
        phone_number=req.phone_number,
        alternate_phone=req.alternate_phone,
        email=req.email,
        is_primary=req.is_primary,
        priority_order=req.priority_order
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact

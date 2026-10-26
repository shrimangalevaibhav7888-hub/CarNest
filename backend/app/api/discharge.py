from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import User, DischargeRecord, PatientProfile, Hospital
from app.models.enums import UserRole, DischargeStatus
from app.schemas.discharge import DischargeRecordCreate, DischargeRecordResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/discharge-records", tags=["Discharge Records"])


@router.post("", response_model=DischargeRecordResponse, status_code=status.HTTP_201_CREATED)
def create_discharge_record(
    req: DischargeRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Hospital discharge coordinator creates a post-discharge assessment record.
    Transitions patient discharge eligibility for home-care planning.
    """
    if current_user.role not in (UserRole.HOSPITAL, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only hospital coordinators and administrators can create discharge records."
        )

    patient = db.query(PatientProfile).filter(PatientProfile.id == req.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found.")

    hospital_id = req.hospital_id or patient.hospital_id
    if not hospital_id:
        first_hosp = db.query(Hospital).first()
        hospital_id = first_hosp.id if first_hosp else 1

    record = DischargeRecord(
        patient_id=req.patient_id,
        hospital_id=hospital_id,
        coordinator_id=current_user.id,
        discharge_date=req.discharge_date or date.today(),
        medical_summary=req.medical_summary,
        mobility_requirements=req.mobility_requirements,
        dietary_requirements=req.dietary_requirements,
        hygiene_requirements=req.hygiene_requirements,
        post_discharge_instructions=req.post_discharge_instructions,
        home_readiness_status=req.home_readiness_status,
        follow_up_date=req.follow_up_date
    )
    db.add(record)
    
    # Update patient discharge status
    patient.discharge_status = DischargeStatus.DISCHARGE_READY
    db.commit()
    db.refresh(record)

    return record


@router.get("/patient/{patient_id}", response_model=List[DischargeRecordResponse])
def get_discharge_records_by_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve discharge history records for a specific patient."""
    records = db.query(DischargeRecord).filter(
        DischargeRecord.patient_id == patient_id
    ).order_by(DischargeRecord.discharge_date.desc()).all()
    return records


@router.get("", response_model=List[DischargeRecordResponse])
def get_all_discharge_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all discharge records across patients."""
    records = db.query(DischargeRecord).order_by(DischargeRecord.discharge_date.desc()).all()
    return records

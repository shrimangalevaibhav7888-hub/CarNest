from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import User, CarePlan, PatientProfile, CaregiverProfile, CaregiverAssignment
from app.models.enums import UserRole, CarePlanStatus
from app.schemas.care_plan import CarePlanCreate, CarePlanUpdate, CarePlanResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/care-plans", tags=["Care Plans"])


@router.get("", response_model=List[CarePlanResponse])
def get_care_plans(
    patient_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List care plans filtered by patient or authorized user."""
    query = db.query(CarePlan)
    if patient_id:
        query = query.filter(CarePlan.patient_id == patient_id)
    elif current_user.role == UserRole.PATIENT and current_user.patient_profile:
        query = query.filter(CarePlan.patient_id == current_user.patient_profile.id)
    elif current_user.role == UserRole.FAMILY and current_user.family_memberships:
        p_ids = [m.patient_id for m in current_user.family_memberships]
        query = query.filter(CarePlan.patient_id.in_(p_ids))
    elif current_user.role == UserRole.CAREGIVER and current_user.caregiver_profile:
        query = query.filter(CarePlan.assigned_caregiver_id == current_user.caregiver_profile.id)

    return query.order_by(CarePlan.created_at.desc()).all()


@router.get("/{plan_id}", response_model=CarePlanResponse)
def get_care_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve single care plan by ID."""
    plan = db.query(CarePlan).filter(CarePlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Care plan not found.")
    return plan


@router.post("", response_model=CarePlanResponse, status_code=status.HTTP_201_CREATED)
def create_care_plan(
    req: CarePlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a comprehensive home-care plan for a patient."""
    patient = db.query(PatientProfile).filter(PatientProfile.id == req.patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found.")

    plan = CarePlan(
        patient_id=req.patient_id,
        assigned_caregiver_id=req.assigned_caregiver_id,
        discharge_record_id=req.discharge_record_id,
        created_by_user_id=current_user.id,
        title=req.title,
        goals=req.goals or [],
        status=req.status,
        start_date=req.start_date or date.today(),
        end_date=req.end_date,
        required_services=req.required_services or [],
        emergency_instructions=req.emergency_instructions,
        monitoring_requirements=req.monitoring_requirements
    )
    db.add(plan)
    db.flush()

    # If caregiver assigned, create assignment record
    if req.assigned_caregiver_id:
        assignment = CaregiverAssignment(
            caregiver_id=req.assigned_caregiver_id,
            patient_id=req.patient_id,
            care_plan_id=plan.id,
            assigned_by_user_id=current_user.id,
            start_date=plan.start_date,
            end_date=plan.end_date,
            status="ACTIVE"
        )
        db.add(assignment)

    db.commit()
    db.refresh(plan)
    return plan


@router.put("/{plan_id}", response_model=CarePlanResponse)
def update_care_plan(
    plan_id: int,
    req: CarePlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update care plan details, status, or assigned caregiver."""
    plan = db.query(CarePlan).filter(CarePlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Care plan not found.")

    update_data = req.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(plan, field, val)

    db.commit()
    db.refresh(plan)
    return plan

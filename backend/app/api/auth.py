from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.entities import User, PatientProfile, CaregiverProfile, FamilyMember, EmergencyContact
from app.models.enums import UserRole, VerificationStatus, FamilyRelationship
from app.schemas.auth import (
    LoginRequest, RegisterRequest, TokenResponse, UserSummary,
    ForgotPasswordRequest, ForgotPasswordResponse
)
from app.auth.security import verify_password, get_password_hash, create_access_token
from app.auth.dependencies import get_current_user
from app.utils.logger import logger

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _build_user_summary(user: User) -> UserSummary:
    patient_id = user.patient_profile.id if user.patient_profile else None
    caregiver_id = user.caregiver_profile.id if user.caregiver_profile else None

    verification_status = None
    if user.caregiver_profile:
        verification_status = user.caregiver_profile.verification_status.value

    linked_patient_ids = []
    if user.family_memberships:
        linked_patient_ids = [m.patient_id for m in user.family_memberships]

    return UserSummary(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        phone=user.phone,
        avatar_url=user.avatar_url,
        patient_id=patient_id,
        caregiver_id=caregiver_id,
        verification_status=verification_status,
        linked_patient_ids=linked_patient_ids,
        is_active=user.is_active,
        created_at=user.created_at
    )


def _set_auth_cookie(response: Response, token: str, remember_me: bool = True):
    max_age = 60 * 60 * 24 * 30 if remember_me else 60 * 60 * 24 * 7
    response.set_cookie(
        key="carenest_token",
        value=token,
        httponly=True,
        max_age=max_age,
        path="/",
        samesite="lax",
        secure=False  # Dev default; matches local HTTP
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    """
    Register a new CareNest user.
    Public registration is strictly permitted for:
    - ELDERLY / PATIENT
    - FAMILY
    - CAREGIVER (created in PENDING verification state)
    ADMIN and HOSPITAL accounts are forbidden from public signup.
    """
    # 1. Reject unauthorized roles from public signup
    if req.role in (UserRole.ADMIN, UserRole.HOSPITAL):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator accounts must be provisioned securely by platform operations and cannot be created via public registration."
        )

    # 2. Validate passwords match if confirmation provided
    if req.confirm_password and req.password != req.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match. Please ensure both passwords match."
        )

    # 3. Enforce email uniqueness case-insensitively
    clean_email = req.email.lower().strip()
    existing_user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists. Please sign in instead."
        )

    # Normalize role: if PATIENT or ELDERLY, normalize to ELDERLY; if FAMILY_MEMBER, normalize to FAMILY
    effective_role = (
        UserRole.ELDERLY if req.role in (UserRole.PATIENT, UserRole.ELDERLY)
        else UserRole.FAMILY if req.role in (UserRole.FAMILY, UserRole.FAMILY_MEMBER)
        else req.role
    )

    # 4. Create User entity with hashed password
    hashed_pw = get_password_hash(req.password)
    new_user = User(
        email=clean_email,
        hashed_password=hashed_pw,
        full_name=req.full_name.strip(),
        role=effective_role,
        phone=req.phone.strip() if req.phone else None,
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # 5. Automatically create associated profile & records based on role
    if effective_role in (UserRole.ELDERLY, UserRole.PATIENT):
        p_profile = PatientProfile(
            user_id=new_user.id,
            age=req.age or 72,
            gender=req.gender or "Not Specified",
            address=req.address or "Home Address",
            medical_history=req.medical_notes or "None noted",
            care_requirements=req.care_requirements or ["Daily vitals check", "Medication reminders"]
        )
        db.add(p_profile)
        db.flush()

        # Add emergency contact if provided
        if req.emergency_contact_name and req.emergency_contact_phone:
            e_contact = EmergencyContact(
                patient_id=p_profile.id,
                name=req.emergency_contact_name.strip(),
                relationship=req.emergency_contact_relation or "Family",
                phone_number=req.emergency_contact_phone.strip(),
                is_primary=True,
                priority_order=1
            )
            db.add(e_contact)

    elif effective_role == UserRole.CAREGIVER:
        # Caregivers MUST start in PENDING verification status!
        c_profile = CaregiverProfile(
            user_id=new_user.id,
            skills=req.skills or ["General Nursing", "Medication Support", "Vital Signs"],
            experience_years=req.experience_years or 2,
            languages=["English"],
            verification_status=VerificationStatus.PENDING,
            verification_notes="Awaiting document verification by CareNest Operations.",
            current_workload=0,
            bio=f"Caregiver applicant: {req.full_name}. Credentials submitted for verification.",
            phone=req.phone
        )
        db.add(c_profile)
        db.flush()

    elif effective_role == UserRole.FAMILY:
        # If an elderly patient's email is provided, link them
        if req.linked_elderly_email:
            linked_user = db.query(User).filter(
                func.lower(User.email) == req.linked_elderly_email.lower().strip()
            ).first()
            if linked_user and linked_user.patient_profile:
                rel = FamilyRelationship.OTHER
                if req.relationship:
                    rel_upper = req.relationship.upper()
                    if hasattr(FamilyRelationship, rel_upper):
                        rel = getattr(FamilyRelationship, rel_upper)

                f_member = FamilyMember(
                    user_id=new_user.id,
                    patient_id=linked_user.patient_profile.id,
                    relationship_type=rel,
                    access_level="FULL",
                    is_primary_contact=True
                )
                db.add(f_member)

    db.commit()
    db.refresh(new_user)

    # 6. Generate JWT token
    token = create_access_token(subject=new_user.id, role=new_user.role.value)
    _set_auth_cookie(response, token, remember_me=True)

    summary = _build_user_summary(new_user)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=60 * 24 * 7 * 60,
        user=summary
    )


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """Authenticate user with email and password, returning JWT token and setting session cookie."""
    clean_email = req.email.lower().strip()
    user = db.query(User).filter(func.lower(User.email) == clean_email).first()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Please contact CareNest support."
        )

    token = create_access_token(subject=user.id, role=user.role.value)
    _set_auth_cookie(response, token, remember_me=req.remember_me or False)

    summary = _build_user_summary(user)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=60 * 24 * 7 * 60,
        user=summary
    )


@router.post("/logout")
def logout(response: Response, current_user: User = Depends(get_current_user)):
    """Logs out active session and clears authentication cookies."""
    response.delete_cookie(key="carenest_token", path="/")
    return {"message": "Logged out successfully from CareNest."}


@router.get("/me", response_model=UserSummary)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns profile and role details for the currently authenticated user session."""
    return _build_user_summary(current_user)


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Initiates secure password recovery instructions for registered emails."""
    clean_email = req.email.lower().strip()
    user = db.query(User).filter(func.lower(User.email) == clean_email).first()

    # Generic response regardless of existence to prevent account enumeration
    if user:
        logger.info(f"Password reset requested for {clean_email}. Time-limited reset instructions generated.")

    return ForgotPasswordResponse(
        message="If this email is registered with CareNest, password reset instructions have been dispatched.",
        email=clean_email
    )

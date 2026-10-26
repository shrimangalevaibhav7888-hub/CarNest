from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import CareUpdate, User
from app.models.enums import UserRole
from app.schemas.care_update import CareUpdateCreate, CareUpdateResponse
from app.auth.dependencies import get_optional_current_user

router = APIRouter(prefix="/care-updates", tags=["Care Updates & Health Timeline"])


def _to_response(u: CareUpdate) -> CareUpdateResponse:
    return CareUpdateResponse(
        id=str(u.id),
        elderlyId=str(u.elderly_id),
        elderlyName=u.elderly_name,
        authorId=str(u.author_id),
        authorName=u.author_name,
        authorRole=u.author_role,
        timestamp=u.timestamp_label,
        title=u.title,
        description=u.description,
        category=u.category,
        vitals=u.vitals,
        attachments=u.attachments,
        createdAt=u.created_at.isoformat() if u.created_at else None
    )


@router.get("", response_model=List[CareUpdateResponse])
def get_care_updates(
    db: Session = Depends(get_db),
    elderly_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve family health timeline updates isolated to the authorized user."""
    query = db.query(CareUpdate)

    if current_user and current_user.role != UserRole.ADMIN:
        if current_user.role in (UserRole.PATIENT, UserRole.ELDERLY):
            p_id = str(current_user.patient_profile.id if current_user.patient_profile else current_user.id)
            query = query.filter(CareUpdate.elderly_id == p_id)
        elif current_user.role == UserRole.FAMILY:
            linked_ids = [str(m.patient_id) for m in current_user.family_memberships]
            if linked_ids:
                query = query.filter(CareUpdate.elderly_id.in_(linked_ids))
            else:
                return []
    elif elderly_id:
        query = query.filter(CareUpdate.elderly_id == elderly_id)

    updates = query.order_by(CareUpdate.id.desc()).all()

    # Seed initial demo timeline records if table is completely empty and no user filter active
    if not updates and not current_user and not elderly_id:
        demo1 = CareUpdate(
            elderly_id="1",
            elderly_name="Ramesh Chandra",
            author_id="1",
            author_name="Sister Ananya Roy",
            author_role="CAREGIVER",
            timestamp_label="Today, 09:30 AM",
            title="Morning Vitals & Medication Check",
            description="Blood pressure recorded at 122/78 mmHg with heart rate 72 bpm. Morning Metformin & Lisinopril administered after oatmeal breakfast.",
            category="VITALS",
            vitals={
                "bloodPressure": "122/78",
                "heartRate": 72,
                "bloodSugar": "110 mg/dL",
                "temperature": "98.4°F",
                "oxygenLevel": "98%"
            }
        )
        demo2 = CareUpdate(
            elderly_id="1",
            elderly_name="Ramesh Chandra",
            author_id="1",
            author_name="Sister Ananya Roy",
            author_role="CAREGIVER",
            timestamp_label="Today, 11:15 AM",
            title="Mobility & Gentle Garden Walk",
            description="Completed 20 minutes of supervised walking in the courtyard garden. Good balance maintained without dizziness.",
            category="ACTIVITY"
        )
        db.add_all([demo1, demo2])
        db.commit()
        updates = query.order_by(CareUpdate.id.desc()).all()

    return [_to_response(u) for u in updates]


@router.post("", response_model=CareUpdateResponse, status_code=status.HTTP_201_CREATED)
def create_care_update(
    req: CareUpdateCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Post a new care update linked to the authenticated author."""
    author_id = req.authorId or "1"
    author_name = req.authorName or "Caregiver"
    author_role = req.authorRole or "CAREGIVER"
    elderly_id = req.elderlyId or "1"
    elderly_name = req.elderlyName or "Eleanor Vance"

    if current_user:
        author_id = str(current_user.id)
        author_name = current_user.full_name
        author_role = current_user.role.value
        if current_user.role in (UserRole.PATIENT, UserRole.ELDERLY) and current_user.patient_profile:
            elderly_id = str(current_user.patient_profile.id)
            elderly_name = current_user.full_name

    update = CareUpdate(
        elderly_id=elderly_id,
        elderly_name=elderly_name,
        author_id=author_id,
        author_name=author_name,
        author_role=author_role,
        timestamp_label=req.timestamp or f"Today, {datetime.utcnow().strftime('%I:%M %p')}",
        title=req.title,
        description=req.description,
        category=req.category or "VISIT",
        vitals=req.vitals or {},
        attachments=req.attachments or []
    )
    db.add(update)
    db.commit()
    db.refresh(update)
    return _to_response(update)


@router.delete("/{update_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_care_update(
    update_id: str,
    db: Session = Depends(get_db)
):
    """Delete a care update from SQLite."""
    numeric_id = int(''.join(filter(str.isdigit, update_id)) or update_id)
    update = db.query(CareUpdate).filter(CareUpdate.id == numeric_id).first()
    if not update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Update not found.")

    db.delete(update)
    db.commit()
    return None

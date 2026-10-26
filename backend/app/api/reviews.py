from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Review
from app.schemas.review import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["Caregiver Reviews"])


def _to_response(r: Review) -> ReviewResponse:
    return ReviewResponse(
        id=str(r.id),
        caregiverId=str(r.caregiver_id),
        familyId=str(r.family_id),
        familyName=r.family_name,
        rating=r.rating,
        comment=r.comment,
        date=r.date,
        visitServiceType=r.visit_service_type
    )


@router.get("", response_model=List[ReviewResponse])
def get_reviews(
    db: Session = Depends(get_db),
    caregiver_id: Optional[str] = None
):
    """Retrieve caregiver reviews from SQLite database."""
    query = db.query(Review)
    if caregiver_id:
        query = query.filter(Review.caregiver_id == caregiver_id)

    reviews = query.order_by(Review.id.desc()).all()

    # Seed initial demo reviews if empty
    if not reviews:
        demo1 = Review(
            caregiver_id="cg-1",
            family_id="fam-1",
            family_name="Vikram Chandra",
            rating=5.0,
            comment="Sister Ananya is extraordinarily attentive and warm with my father. Her clinical experience gave our whole family peace of mind.",
            date="2026-03-24",
            visit_service_type="Medication & Vitals"
        )
        demo2 = Review(
            caregiver_id="cg-1",
            family_id="fam-2",
            family_name="Neha Sharma",
            rating=4.8,
            comment="Punctual, professional, and very thorough with blood pressure tracking.",
            date="2026-03-20",
            visit_service_type="Companion Care"
        )
        db.add_all([demo1, demo2])
        db.commit()
        reviews = query.order_by(Review.id.desc()).all()

    return [_to_response(r) for r in reviews]


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    req: ReviewCreate,
    db: Session = Depends(get_db)
):
    """Submit a caregiver review and save permanently to SQLite."""
    date_str = req.date or datetime.utcnow().strftime("%Y-%m-%d")
    review = Review(
        caregiver_id=req.caregiverId,
        family_id=req.familyId or "1",
        family_name=req.familyName or "CareNest Family Member",
        rating=req.rating,
        comment=req.comment,
        date=date_str,
        visit_service_type=req.visitServiceType or "Home Care"
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return _to_response(review)

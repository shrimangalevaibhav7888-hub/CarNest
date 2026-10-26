from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Subscription, User
from app.schemas.subscription import SubscriptionCreate, SubscriptionResponse
from app.auth.dependencies import get_optional_current_user

router = APIRouter(prefix="/subscriptions", tags=["User Subscriptions"])


def _to_response(s: Subscription) -> SubscriptionResponse:
    features = s.features if isinstance(s.features, list) else [
        "Verified Caregiver Matching",
        "Digital Health Journal & Vitals Tracking",
        "24/7 Emergency SOS Alert Dispatch"
    ]
    return SubscriptionResponse(
        id=str(s.id),
        userId=str(s.user_id),
        planName=s.plan_name,
        monthlyRateINR=s.monthly_rate_inr,
        status=s.status,
        renewalDate=s.renewal_date,
        paymentMethod=s.payment_method,
        features=features
    )


@router.get("", response_model=SubscriptionResponse)
def get_subscription(
    db: Session = Depends(get_db),
    user_id: Optional[str] = "1",
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve active subscription isolated to the authenticated user."""
    target_id = str(current_user.id) if current_user else (user_id or "1")
    sub = db.query(Subscription).filter(Subscription.user_id == target_id).first()
    if not sub and not current_user:
        sub = db.query(Subscription).first()

    if not sub:
        sub = Subscription(
            user_id=target_id,
            plan_name="CareNest Plus",
            monthly_rate_inr=1499,
            status="ACTIVE",
            renewal_date="2026-12-31",
            payment_method="UPI Auto-Pay",
            features=[
                "Verified Caregiver Priority Matching",
                "Digital Health Journal & Daily Checklist",
                "Live WhatsApp & SMS Alerts",
                "24/7 Dedicated Emergency Dispatch"
            ]
        )
        db.add(sub)
        db.commit()
        db.refresh(sub)

    return _to_response(sub)


@router.post("", response_model=SubscriptionResponse, status_code=status.HTTP_200_OK)
def update_subscription(
    req: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Create or update membership subscription for the authenticated user."""
    u_id = str(current_user.id) if current_user else (req.userId or "1")
    sub = db.query(Subscription).filter(Subscription.user_id == u_id).first()

    if sub:
        sub.plan_name = req.planName
        sub.monthly_rate_inr = req.monthlyRateINR or 0
        sub.status = req.status or "ACTIVE"
        sub.renewal_date = req.renewalDate or "2026-12-31"
        sub.payment_method = req.paymentMethod or "UPI / Card"
        if req.features:
            sub.features = req.features
    else:
        sub = Subscription(
            user_id=u_id,
            plan_name=req.planName,
            monthly_rate_inr=req.monthlyRateINR or 0,
            status=req.status or "ACTIVE",
            renewal_date=req.renewalDate or "2026-12-31",
            payment_method=req.paymentMethod or "UPI / Card",
            features=req.features or [
                "Verified Caregiver Matching",
                "Digital Health Journal",
                "24/7 Emergency Dispatch"
            ]
        )
        db.add(sub)

    db.commit()
    db.refresh(sub)
    return _to_response(sub)

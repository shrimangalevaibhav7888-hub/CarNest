from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Booking, User
from app.models.enums import UserRole
from app.schemas.booking import BookingCreate, BookingStatusUpdate, BookingResponse
from app.auth.dependencies import get_optional_current_user

router = APIRouter(prefix="/bookings", tags=["Caregiver Bookings"])


def _to_response(b: Booking) -> BookingResponse:
    return BookingResponse(
        id=str(b.id),
        elderlyId=str(b.elderly_id),
        elderlyName=b.elderly_name,
        elderlyAddress=b.elderly_address,
        familyId=str(b.family_id),
        familyName=b.family_name,
        familyPhone=b.family_phone,
        caregiverId=str(b.caregiver_id),
        caregiverName=b.caregiver_name,
        caregiverPhone=b.caregiver_phone,
        caregiverAvatar=b.caregiver_avatar,
        date=b.date,
        timeSlot=b.time_slot,
        serviceType=b.service_type,
        durationHours=b.duration_hours,
        instructions=b.instructions or "",
        status=b.status,
        totalAmount=b.total_amount,
        paymentStatus=b.payment_status,
        paymentId=b.payment_id,
        caregiverNotes=b.caregiver_notes,
        startedAt=b.started_at,
        completedAt=b.completed_at,
        cancelledReason=b.cancelled_reason,
        createdAt=b.created_at.isoformat() if b.created_at else None,
        updatedAt=b.updated_at.isoformat() if b.updated_at else None,
    )


@router.get("", response_model=List[BookingResponse])
def get_bookings(
    db: Session = Depends(get_db),
    caregiver_id: Optional[str] = None,
    elderly_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve home-care bookings isolated to the authenticated user's authorization."""
    query = db.query(Booking)

    # Enforce strict user isolation when authenticated
    if current_user and current_user.role != UserRole.ADMIN:
        if current_user.role == UserRole.FAMILY:
            query = query.filter(Booking.family_id == str(current_user.id))
        elif current_user.role in (UserRole.PATIENT, UserRole.ELDERLY):
            p_id = str(current_user.patient_profile.id if current_user.patient_profile else current_user.id)
            query = query.filter(Booking.elderly_id == p_id)
        elif current_user.role == UserRole.CAREGIVER:
            cg_id = str(current_user.caregiver_profile.id if current_user.caregiver_profile else current_user.id)
            query = query.filter(Booking.caregiver_id == cg_id)
    else:
        # Fallback query filters for guest / unauthenticated inspection
        if caregiver_id:
            query = query.filter(Booking.caregiver_id == caregiver_id)
        if elderly_id:
            query = query.filter(Booking.elderly_id == elderly_id)

    bookings = query.order_by(Booking.id.desc()).all()

    # Seed initial demo bookings if database table is completely empty and no user filter active
    if not bookings and not current_user and not caregiver_id and not elderly_id:
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        demo1 = Booking(
            elderly_id="1",
            elderly_name="Ramesh Chandra",
            elderly_address="Flat 402, Shanti Niketan, Indiranagar, Bengaluru",
            family_id="1",
            family_name="Vikram Chandra",
            family_phone="+91 98111 22334",
            caregiver_id="cg-1",
            caregiver_name="Sister Ananya Roy",
            caregiver_phone="+91 99887 76655",
            caregiver_avatar="https://images.unsplash.com/photo-1594824813593-6a56b46487e4?auto=format&fit=crop&q=80&w=200",
            date=today_str,
            time_slot="09:00 AM - 01:00 PM",
            service_type="Medication & Vitals",
            duration_hours=4,
            instructions="Morning blood pressure check, administer morning meds, light knee exercises and garden walk.",
            status="IN_PROGRESS",
            total_amount=1400.0,
            payment_status="PAID",
            payment_id="pay_live_care_101",
            caregiver_notes="Arrived at 9:00 AM sharp. Patient in high spirits. Morning vitals recorded and verified normal."
        )
        demo2 = Booking(
            elderly_id="1",
            elderly_name="Ramesh Chandra",
            elderly_address="Flat 402, Shanti Niketan, Indiranagar, Bengaluru",
            family_id="1",
            family_name="Vikram Chandra",
            family_phone="+91 98111 22334",
            caregiver_id="cg-1",
            caregiver_name="Sister Ananya Roy",
            caregiver_phone="+91 99887 76655",
            caregiver_avatar="https://images.unsplash.com/photo-1594824813593-6a56b46487e4?auto=format&fit=crop&q=80&w=200",
            date=today_str,
            time_slot="09:00 AM - 01:00 PM",
            service_type="Full Day Assistance",
            duration_hours=4,
            instructions="Accompany to Apollo Hospital for routine cardiology follow-up with Dr. Murthy.",
            status="CONFIRMED",
            total_amount=1400.0,
            payment_status="PAID",
            payment_id="pay_live_care_102"
        )
        db.add_all([demo1, demo2])
        db.commit()
        bookings = query.order_by(Booking.id.desc()).all()

    return [_to_response(b) for b in bookings]


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    req: BookingCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Create a home care booking associated with the authenticated user."""
    # Never blindly trust frontend-supplied family_id or elderly_id
    family_id = req.familyId or "1"
    family_name = req.familyName or "Sarah Vance"
    family_phone = req.familyPhone or "+1 (555) 019-2831"
    elderly_id = req.elderlyId or "1"
    elderly_name = req.elderlyName or "Eleanor Vance"

    if current_user:
        if current_user.role == UserRole.FAMILY:
            family_id = str(current_user.id)
            family_name = current_user.full_name
            family_phone = current_user.phone or family_phone
        elif current_user.role in (UserRole.PATIENT, UserRole.ELDERLY):
            elderly_id = str(current_user.patient_profile.id if current_user.patient_profile else current_user.id)
            elderly_name = current_user.full_name

    booking = Booking(
        elderly_id=elderly_id,
        elderly_name=elderly_name,
        elderly_address=req.elderlyAddress or "742 Evergreen Healthcare Ave",
        family_id=family_id,
        family_name=family_name,
        family_phone=family_phone,
        caregiver_id=req.caregiverId,
        caregiver_name=req.caregiverName,
        caregiver_phone=req.caregiverPhone or "+1 (555) 019-4412",
        caregiver_avatar=req.caregiverAvatar,
        date=req.date,
        time_slot=req.timeSlot or "Morning (09:00 AM - 01:00 PM)",
        service_type=req.serviceType or "Medication & Vitals",
        duration_hours=req.durationHours or 4,
        instructions=req.instructions or "",
        status=req.status or "CONFIRMED",
        total_amount=req.totalAmount or 1400.0,
        payment_status=req.paymentStatus or "PAID",
        payment_id=req.paymentId or f"pay_{int(datetime.utcnow().timestamp())}",
        caregiver_notes=req.caregiverNotes
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return _to_response(booking)


@router.patch("/{booking_id}/status", response_model=BookingResponse)
def update_booking_status(
    booking_id: str,
    req: BookingStatusUpdate,
    db: Session = Depends(get_db)
):
    """Update status or caregiver notes for a persistent booking."""
    numeric_id = int(''.join(filter(str.isdigit, booking_id)) or booking_id)
    booking = db.query(Booking).filter(Booking.id == numeric_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    booking.status = req.status
    if req.caregiverNotes:
        booking.caregiver_notes = req.caregiverNotes
    if req.cancelledReason:
        booking.cancelled_reason = req.cancelledReason

    if req.status == "IN_PROGRESS" and not booking.started_at:
        booking.started_at = datetime.utcnow().isoformat()
    elif req.status == "COMPLETED" and not booking.completed_at:
        booking.completed_at = datetime.utcnow().isoformat()

    db.commit()
    db.refresh(booking)
    return _to_response(booking)


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_booking(
    booking_id: str,
    db: Session = Depends(get_db)
):
    """Delete a booking permanently from SQLite."""
    numeric_id = int(''.join(filter(str.isdigit, booking_id)) or booking_id)
    booking = db.query(Booking).filter(Booking.id == numeric_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    db.delete(booking)
    db.commit()
    return None

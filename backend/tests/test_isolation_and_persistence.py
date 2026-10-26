import pytest
import time
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_booking_and_appointment_user_isolation():
    ts = int(time.time() * 1000)
    # 1. Register User Alpha (Family)
    res_a = client.post("/api/auth/register", json={
        "email": f"alpha_{ts}@carenest.ai",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "full_name": "Alpha Parent",
        "role": "FAMILY",
        "phone": "+91 91111 22222"
    })
    assert res_a.status_code == 201
    token_a = res_a.json()["access_token"]
    user_a_id = res_a.json()["user"]["id"]

    # 2. Register User Beta (Family)
    res_b = client.post("/api/auth/register", json={
        "email": f"beta_{ts}@carenest.ai",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "full_name": "Beta Parent",
        "role": "FAMILY",
        "phone": "+91 93333 44444"
    })
    assert res_b.status_code == 201
    token_b = res_b.json()["access_token"]
    user_b_id = res_b.json()["user"]["id"]

    # 3. User Alpha creates a booking
    res_create_bk = client.post(
        "/api/bookings",
        headers={"Authorization": f"Bearer {token_a}"},
        json={
            "caregiverId": "cg-1",
            "caregiverName": "Sister Ananya Roy",
            "date": "2026-11-01",
            "timeSlot": "Morning (09:00 AM - 01:00 PM)",
            "serviceType": "Medication & Vitals",
            "durationHours": 4,
            "instructions": "Alpha private care booking",
            "totalAmount": 1400.0
        }
    )
    assert res_create_bk.status_code == 201
    created_bk = res_create_bk.json()
    assert created_bk["familyId"] == str(user_a_id)

    # 4. User Alpha fetches bookings -> Sees their booking
    res_list_a = client.get("/api/bookings", headers={"Authorization": f"Bearer {token_a}"})
    assert res_list_a.status_code == 200
    bks_a = res_list_a.json()
    assert any(b["id"] == created_bk["id"] for b in bks_a)

    # 5. User Beta fetches bookings -> CANNOT see User Alpha's booking
    res_list_b = client.get("/api/bookings", headers={"Authorization": f"Bearer {token_b}"})
    assert res_list_b.status_code == 200
    bks_b = res_list_b.json()
    assert not any(b["id"] == created_bk["id"] for b in bks_b)

def test_unauthenticated_access_protection():
    # Clear any cookies stored on client from previous steps
    client.cookies.clear()
    # Attempting to fetch protected /auth/me without token or cookie -> 401 Unauthorized
    res = client.get("/api/auth/me")
    assert res.status_code == 401

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_public_registration_elderly():
    """Scenario 1: A new elderly patient can register with individual profile and data."""
    email = "priya.sharma@carenest.ai"
    res = client.post("/api/auth/register", json={
        "email": email,
        "password": "SecurePassword123!",
        "confirm_password": "SecurePassword123!",
        "full_name": "Priya Sharma",
        "role": "ELDERLY",
        "phone": "+91 98765 11111",
        "age": 73,
        "gender": "Female",
        "address": "45 Lotus Garden, Bangalore",
        "emergency_contact_name": "Rohan Sharma",
        "emergency_contact_phone": "+91 98765 22222",
        "medical_notes": "Mild hypertension, routine physiotherapy"
    })
    # If already exists from earlier test run, log in
    if res.status_code == 400 and "already exists" in res.json()["detail"]:
        login_res = client.post("/api/auth/login", json={
            "email": email,
            "password": "SecurePassword123!"
        })
        assert login_res.status_code == 200
        data = login_res.json()
    else:
        assert res.status_code == 201
        data = res.json()

    assert "access_token" in data
    assert data["user"]["full_name"] == "Priya Sharma"
    assert data["user"]["role"] in ("ELDERLY", "PATIENT")
    assert data["user"]["patient_id"] is not None


def test_public_registration_duplicate_email_rejected():
    """Scenario 4: Duplicate email registration is rejected."""
    res = client.post("/api/auth/register", json={
        "email": "priya.sharma@carenest.ai",
        "password": "AnotherPassword123!",
        "confirm_password": "AnotherPassword123!",
        "full_name": "Another Priya",
        "role": "ELDERLY"
    })
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"]


def test_public_registration_admin_forbidden():
    """Scenario 5: Admin accounts cannot be created via public registration."""
    res = client.post("/api/auth/register", json={
        "email": "fake.admin@carenest.ai",
        "password": "AdminPassword123!",
        "confirm_password": "AdminPassword123!",
        "full_name": "Fake Admin Attempt",
        "role": "ADMIN"
    })
    assert res.status_code == 403
    assert "Administrator accounts" in res.json()["detail"]


def test_public_registration_password_mismatch():
    """Scenario 6: Password mismatch is rejected."""
    res = client.post("/api/auth/register", json={
        "email": "mismatch@example.com",
        "password": "PasswordOne123!",
        "confirm_password": "PasswordTwo456!",
        "full_name": "Mismatch Tester",
        "role": "ELDERLY"
    })
    assert res.status_code == 400
    assert "Passwords do not match" in res.json()["detail"]


def test_public_registration_caregiver_starts_pending():
    """Scenario 3: A caregiver can register and enters PENDING verification status."""
    import uuid
    email = f"nurse.pending.{uuid.uuid4().hex[:6]}@carenest.ai"
    res = client.post("/api/auth/register", json={
        "email": email,
        "password": "NursePassword123!",
        "confirm_password": "NursePassword123!",
        "full_name": "Meera Krishnan, GDA",
        "role": "CAREGIVER",
        "phone": "+91 98765 33333",
        "experience_years": 4,
        "skills": ["Vital Signs", "Wound Dressing", "Elderly Care"]
    })
    assert res.status_code == 201
    data = res.json()

    assert data["user"]["role"] == "CAREGIVER"
    assert data["user"]["caregiver_id"] is not None
    assert data["user"]["verification_status"] == "PENDING"


def test_login_success_and_failure():
    """Scenario 7 & 8: Correct credentials login, incorrect rejected."""
    # Success
    res = client.post("/api/auth/login", json={
        "email": "priya.sharma@carenest.ai",
        "password": "SecurePassword123!"
    })
    assert res.status_code == 200
    assert res.json()["user"]["full_name"] == "Priya Sharma"

    # Wrong password
    res_wrong = client.post("/api/auth/login", json={
        "email": "priya.sharma@carenest.ai",
        "password": "WrongPassword999!"
    })
    assert res_wrong.status_code == 401


def test_data_isolation_between_two_elderly_users():
    """Scenario 10: Two distinct elderly accounts never see each other's private data."""
    # User 1 (Priya Sharma)
    res1 = client.post("/api/auth/login", json={
        "email": "priya.sharma@carenest.ai",
        "password": "SecurePassword123!"
    })
    assert res1.status_code == 200
    token1 = res1.json()["access_token"]
    p_id1 = res1.json()["user"]["patient_id"]

    # Register/Login user 2 (Sunil Verma)
    email2 = "sunil.verma@carenest.ai"
    res2 = client.post("/api/auth/register", json={
        "email": email2,
        "password": "SunilPassword123!",
        "confirm_password": "SunilPassword123!",
        "full_name": "Sunil Verma",
        "role": "ELDERLY",
        "phone": "+91 98765 44444",
        "age": 78,
        "address": "12 Shanti Path, Pune"
    })
    if res2.status_code == 400:
        res2 = client.post("/api/auth/login", json={
            "email": email2,
            "password": "SunilPassword123!"
        })
    assert res2.status_code in (200, 201)
    token2 = res2.json()["access_token"]
    p_id2 = res2.json()["user"]["patient_id"]

    assert p_id1 != p_id2

    # Priya queries /api/patients -> should only return her own profile
    res_p1 = client.get("/api/patients", headers={"Authorization": f"Bearer {token1}"})
    assert res_p1.status_code == 200
    patients_for_1 = res_p1.json()
    assert len(patients_for_1) == 1
    assert patients_for_1[0]["full_name"] == "Priya Sharma"

    # Sunil queries /api/patients -> should only return his own profile
    res_p2 = client.get("/api/patients", headers={"Authorization": f"Bearer {token2}"})
    assert res_p2.status_code == 200
    patients_for_2 = res_p2.json()
    assert len(patients_for_2) == 1
    assert patients_for_2[0]["full_name"] == "Sunil Verma"

    # Priya attempts to access Sunil's patient record directly via ID -> must be FORBIDDEN (anti-IDOR)
    res_idor = client.get(f"/api/patients/{p_id2}", headers={"Authorization": f"Bearer {token1}"})
    assert res_idor.status_code == 403


def test_admin_dashboard_and_caregiver_verification_flow():
    """Scenario 13 & 14: Only admin can access admin APIs, and can approve caregiver verification."""
    # Non-admin user attempts admin stats
    res_login = client.post("/api/auth/login", json={
        "email": "priya.sharma@carenest.ai",
        "password": "SecurePassword123!"
    })
    user_token = res_login.json()["access_token"]

    forbidden_res = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {user_token}"})
    assert forbidden_res.status_code == 403

    # Admin logs in
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@carenest.ai",
        "password": "Password123!"
    })
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Admin gets stats
    stats_res = client.get("/api/admin/stats", headers=headers)
    assert stats_res.status_code == 200
    assert stats_res.json()["total_users"] >= 2

    # Admin lists users
    users_res = client.get("/api/admin/users", headers=headers)
    assert users_res.status_code == 200
    assert len(users_res.json()) >= 2

    # Admin verifies caregiver Meera
    cg_res = client.get("/api/admin/caregivers", headers=headers)
    assert cg_res.status_code == 200
    caregivers = cg_res.json()
    meera_cg = next((c for c in caregivers if "Meera" in c["full_name"]), None)
    if meera_cg:
        # Approve Meera
        approve_res = client.patch(
            f"/api/admin/caregivers/{meera_cg['id']}/verification",
            json={"verification_status": "VERIFIED", "verification_notes": "All credentials verified by Senior Admin."},
            headers=headers
        )
        assert approve_res.status_code == 200
        assert approve_res.json()["verification_status"] == "VERIFIED"


def test_auth_me_endpoint():
    """Scenario 12: Session restoration via GET /api/auth/me."""
    login_res = client.post("/api/auth/login", json={
        "email": "priya.sharma@carenest.ai",
        "password": "SecurePassword123!"
    })
    token = login_res.json()["access_token"]

    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    data = me_res.json()
    assert data["full_name"] == "Priya Sharma"
    assert data["email"] == "priya.sharma@carenest.ai"
    assert data["role"] in ("ELDERLY", "PATIENT")


def test_registration_fresh_unique_account():
    """Verify fresh registration creates a new user, hashed password, and returns JWT token."""
    import uuid
    unique_email = f"patient_{uuid.uuid4().hex[:8]}@example.com"
    res = client.post("/api/auth/register", json={
        "email": unique_email,
        "password": "ValidPassword123!",
        "confirm_password": "ValidPassword123!",
        "full_name": "Unique Test Patient",
        "role": "ELDERLY",
        "phone": "+1 555-0199",
        "age": 75,
        "gender": "Female",
        "address": "123 Sunshine Ave",
        "emergency_contact_name": "Contact Person",
        "emergency_contact_phone": "+1 555-0188"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == unique_email
    assert data["user"]["full_name"] == "Unique Test Patient"
    assert data["user"]["patient_id"] is not None

    # Verify newly registered user can immediately log in
    login_res = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "ValidPassword123!"
    })
    assert login_res.status_code == 200
    assert login_res.json()["user"]["email"] == unique_email


def test_registration_duplicate_email_enforcement():
    """Verify registration with already existing email returns HTTP 400."""
    res = client.post("/api/auth/register", json={
        "email": "patient@carenest.ai",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "full_name": "Eleanor Duplicate",
        "role": "ELDERLY"
    })
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"].lower()


def test_valid_login_demo_credentials():
    """Verify all core demo accounts can log in with Password123! and receive valid tokens."""
    demo_accounts = [
        ("patient@carenest.ai", "Password123!", "Eleanor Vance"),
        ("family@carenest.ai", "Password123!", "Sarah Vance"),
        ("caregiver@carenest.ai", "Password123!", "David Miller, RN"),
        ("admin@carenest.ai", "Password123!", "Alex Mercer (Admin)")
    ]
    for email, pwd, expected_name in demo_accounts:
        res = client.post("/api/auth/login", json={
            "email": email,
            "password": pwd
        })
        assert res.status_code == 200, f"Failed login for {email}: {res.text}"
        data = res.json()
        assert "access_token" in data
        assert data["user"]["full_name"] == expected_name
        assert data["user"]["is_active"] is True


def test_invalid_login_wrong_password():
    """Verify login with invalid password returns 401 with standard error message."""
    res = client.post("/api/auth/login", json={
        "email": "patient@carenest.ai",
        "password": "CompletelyWrongPassword!"
    })
    assert res.status_code == 401
    assert "invalid email or password" in res.json()["detail"].lower()


def test_invalid_login_missing_database_record():
    """Verify login with email not present in database returns 401."""
    import uuid
    ghost_email = f"ghost_{uuid.uuid4().hex[:10]}@nonexistent.domain"
    res = client.post("/api/auth/login", json={
        "email": ghost_email,
        "password": "Password123!"
    })
    assert res.status_code == 401
    assert "invalid email or password" in res.json()["detail"].lower()


def test_cors_preflight_for_vercel_deployment():
    """Verify CORS preflight OPTIONS request from a Vercel deployment origin is permitted."""
    res = client.options("/api/auth/login", headers={
        "Origin": "https://carenest-ai-test.vercel.app",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type"
    })
    assert res.status_code == 200
    assert res.headers.get("access-control-allow-origin") == "https://carenest-ai-test.vercel.app"
    assert res.headers.get("access-control-allow-credentials") == "true"


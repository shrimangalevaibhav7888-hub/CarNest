import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("healthy", "ok")


def test_auth_login_valid_patient():
    response = client.post("/api/auth/login", json={
        "email": "patient@carenest.ai",
        "password": "Password123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "PATIENT"
    assert data["user"]["email"] == "patient@carenest.ai"


def test_auth_login_invalid_password():
    response = client.post("/api/auth/login", json={
        "email": "patient@carenest.ai",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401


def test_get_patients_authorized():
    # Login as admin
    login_res = client.post("/api/auth/login", json={
        "email": "admin@carenest.ai",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/patients", headers=headers)
    assert res.status_code == 200
    patients = res.json()
    assert len(patients) >= 1
    assert any(p["email"] == "patient@carenest.ai" for p in patients)


def test_caregiver_matching():
    login_res = client.post("/api/auth/login", json={
        "email": "hospital@carenest.ai",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get patient ID
    patients = client.get("/api/patients", headers=headers).json()
    patient_id = patients[0]["id"]

    res = client.post("/api/caregivers/match", json={
        "patient_id": patient_id,
        "required_skills": ["Vital Sign Monitoring", "Geriatric Nursing"]
    }, headers=headers)

    assert res.status_code == 200
    matches = res.json()
    assert len(matches) >= 1
    assert matches[0]["match_score"] >= 50
    assert len(matches[0]["matching_reasons"]) > 0


def test_ai_daily_summary_and_disclaimer():
    login_res = client.post("/api/auth/login", json={
        "email": "family@carenest.ai",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    patients = client.get("/api/patients", headers=headers).json()
    patient_id = patients[0]["id"]

    res = client.post("/api/ai/daily-summary", json={
        "patient_id": patient_id
    }, headers=headers)

    assert res.status_code == 200
    ai_data = res.json()
    assert "IMPORTANT MEDICAL NOTICE" in ai_data["safety_disclaimer"]
    assert len(ai_data["content"]) > 20


def test_ai_emergency_red_flag_detection():
    login_res = client.post("/api/auth/login", json={
        "email": "patient@carenest.ai",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/api/ai/query", json={
        "prompt": "I have sudden severe chest pain and cannot breathe"
    }, headers=headers)

    assert res.status_code == 200
    data = res.json()
    assert "EMERGENCY SAFETY ALERT" in data["content"]
    assert "Call 911" in data["content"] or "emergency" in data["content"].lower()


def test_vital_recording_and_safety_flag():
    login_res = client.post("/api/auth/login", json={
        "email": "caregiver@carenest.ai",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    patients = client.get("/api/patients", headers=headers).json()
    patient_id = patients[0]["id"]

    # Normal reading
    res_normal = client.post("/api/vitals", json={
        "patient_id": patient_id,
        "systolic_bp": 120,
        "diastolic_bp": 80,
        "heart_rate": 72,
        "oxygen_saturation": 98
    }, headers=headers)
    assert res_normal.status_code == 201
    assert res_normal.json()["ai_flag_status"] == "NORMAL"

    # Elevated reading requiring clinical attention
    res_elevated = client.post("/api/vitals", json={
        "patient_id": patient_id,
        "systolic_bp": 175,
        "diastolic_bp": 105,
        "heart_rate": 88,
        "oxygen_saturation": 91
    }, headers=headers)
    assert res_elevated.status_code == 201
    assert res_elevated.json()["ai_flag_status"] == "ATTENTION_REQUIRED"
    assert "elevated" in res_elevated.json()["ai_flag_message"].lower()


def test_task_status_workflow():
    login_res = client.post("/api/auth/login", json={
        "email": "caregiver@carenest.ai",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    tasks = client.get("/api/tasks", headers=headers).json()
    assert len(tasks) > 0
    task_id = tasks[0]["id"]

    # Mark completed
    update_res = client.patch(f"/api/tasks/{task_id}/status", json={
        "status": "COMPLETED",
        "notes": "Verified by caregiver during test"
    }, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "COMPLETED"

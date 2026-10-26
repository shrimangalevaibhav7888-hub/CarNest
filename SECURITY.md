# CareNest AI — Security & Privacy Architecture (SECURITY.md)

## 1. Overview & Healthcare Privacy Principles
CareNest AI manages sensitive health information for elderly patients during the critical transition from hospital discharge to home recovery. The platform adheres to strict privacy and role-isolation principles inspired by healthcare compliance standards (e.g., HIPAA-conscious design).

---

## 2. Authentication & Session Management
- **Password Hashing**: Passwords are encrypted using salted **Bcrypt** (`bcrypt.gensalt()`). Plaintext passwords are never stored or logged.
- **JWT Authorization**: Authenticated sessions issue signed **JSON Web Tokens (JWT)** with `HS256` encryption and explicit expiration timestamps.
- **Token Storage**: On the client, tokens are isolated in local browser memory/storage and transmitted via standard `Authorization: Bearer <token>` HTTP headers.

---

## 3. Role-Based Access Control (RBAC)
CareNest AI strictly enforces access boundaries across 5 system roles:

| Role | Resource Permissions | Restrictions |
| :--- | :--- | :--- |
| **PATIENT** | Access own profile, daily tasks, medication reminders, emergency SOS, and assigned caregiver info. | Cannot access other patients' data or clinical hospital records. |
| **FAMILY** | Access authorized linked elderly relative's progress, vital charts, and AI daily summaries. | Cannot modify clinical discharge orders or access non-linked patients. |
| **CAREGIVER** | Access assigned patients' schedules, log task completions, record vital readings, and generate shift handovers. | Cannot reassign hospital discharge status or edit physician prescriptions. |
| **HOSPITAL** | Create patient discharge records, build care plans, and match/assign certified caregivers. | Cannot modify administrative platform settings. |
| **ADMIN** | Access system-wide metrics, user directory, audit logs, and security controls. | All actions are logged to immutable audit trails. |

---

## 4. AI Clinical Safety Guardrails
- **Non-Diagnostic Constraint**: AI services are strictly isolated to routine summaries, plain-language care plan explanations, and shift handover synthesis.
- **No Medical Prescription / Dosage Changes**: AI models are forbidden from prescribing drugs or altering medical treatment plans.
- **Mandatory Disclaimers**: Every AI-generated response includes an explicit medical disclaimer directing users to licensed healthcare providers.
- **Emergency Red Flag Detection**: The AI service actively detects life-threatening emergency keywords (e.g., *chest pain*, *facial drooping*, *cannot breathe*) and prepends immediate instructions to call 911 / emergency services.

---

## 5. Audit Logging & Real-Time Emergency Simulation
- **Audit Trails**: Critical state transitions (medication taken, missed doses, task status modifications, emergency triggers) are recorded in the `audit_logs` database table with user ID, timestamps, and previous/new values.
- **Emergency SOS Dispatch**: Emergency events create database records and broadcast real-time in-app and WebSocket notifications to all linked contacts. External SMS/WhatsApp integrations are structured via clean provider interfaces to prevent unauthorized external transmissions during development.

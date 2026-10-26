from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserSummary
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse, EmergencyContactCreate, EmergencyContactResponse
from app.schemas.caregiver import CaregiverCreate, CaregiverUpdate, CaregiverResponse, CaregiverMatchRequest, CaregiverMatchResult
from app.schemas.discharge import DischargeRecordCreate, DischargeRecordResponse
from app.schemas.care_plan import CarePlanCreate, CarePlanUpdate, CarePlanResponse
from app.schemas.task import CareTaskCreate, CareTaskUpdate, CareTaskStatusUpdate, CareTaskResponse
from app.schemas.medication import MedicationCreate, MedicationUpdate, MedicationResponse, MedicationScheduleResponse, MedicationStatusUpdate
from app.schemas.vital import VitalRecordCreate, VitalRecordResponse
from app.schemas.emergency import EmergencyTriggerRequest, EmergencyStatusUpdate, EmergencyEventResponse
from app.schemas.notification import NotificationCreate, NotificationResponse
from app.schemas.ai import AISummaryRequest, AIHandoverRequest, AIPlanExplanationRequest, AIQueryRequest, AIResponseSchema
from app.schemas.analytics import PatientDashboardAnalytics, CaregiverDashboardAnalytics, HospitalDashboardAnalytics, AdminDashboardAnalytics

__all__ = [
    "LoginRequest", "RegisterRequest", "TokenResponse", "UserSummary",
    "PatientCreate", "PatientUpdate", "PatientResponse", "EmergencyContactCreate", "EmergencyContactResponse",
    "CaregiverCreate", "CaregiverUpdate", "CaregiverResponse", "CaregiverMatchRequest", "CaregiverMatchResult",
    "DischargeRecordCreate", "DischargeRecordResponse",
    "CarePlanCreate", "CarePlanUpdate", "CarePlanResponse",
    "CareTaskCreate", "CareTaskUpdate", "CareTaskStatusUpdate", "CareTaskResponse",
    "MedicationCreate", "MedicationUpdate", "MedicationResponse", "MedicationScheduleResponse", "MedicationStatusUpdate",
    "VitalRecordCreate", "VitalRecordResponse",
    "EmergencyTriggerRequest", "EmergencyStatusUpdate", "EmergencyEventResponse",
    "NotificationCreate", "NotificationResponse",
    "AISummaryRequest", "AIHandoverRequest", "AIPlanExplanationRequest", "AIQueryRequest", "AIResponseSchema",
    "PatientDashboardAnalytics", "CaregiverDashboardAnalytics", "HospitalDashboardAnalytics", "AdminDashboardAnalytics"
]

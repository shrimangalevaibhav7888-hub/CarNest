from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.patients import router as patients_router
from app.api.discharge import router as discharge_router
from app.api.care_plans import router as care_plans_router
from app.api.tasks import router as tasks_router
from app.api.medications import router as medications_router
from app.api.caregivers import router as caregivers_router
from app.api.vitals import router as vitals_router
from app.api.emergency import router as emergency_router
from app.api.notifications import router as notifications_router
from app.api.ai import router as ai_router
from app.api.analytics import router as analytics_router
from app.api.ws import router as ws_router
from app.api.admin import router as admin_router
from app.api.bookings import router as bookings_router
from app.api.appointments import router as appointments_router
from app.api.care_updates import router as care_updates_router
from app.api.subscriptions import router as subscriptions_router
from app.api.reviews import router as reviews_router
from app.api.daily_care import router as daily_care_router

api_router = APIRouter()

# Register sub-routers
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(admin_router)
api_router.include_router(patients_router)
api_router.include_router(discharge_router)
api_router.include_router(care_plans_router)
api_router.include_router(tasks_router)
api_router.include_router(medications_router)
api_router.include_router(caregivers_router)
api_router.include_router(vitals_router)
api_router.include_router(emergency_router)
api_router.include_router(notifications_router)
api_router.include_router(ai_router)
api_router.include_router(analytics_router)
api_router.include_router(ws_router)
api_router.include_router(bookings_router)
api_router.include_router(appointments_router)
api_router.include_router(care_updates_router)
api_router.include_router(subscriptions_router)
api_router.include_router(reviews_router)
api_router.include_router(daily_care_router)


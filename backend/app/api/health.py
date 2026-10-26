from fastapi import APIRouter
from app.schemas.health import HealthResponse
from app.services.health_service import HealthService

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse, summary="Get backend system health")
async def health_check() -> HealthResponse:
    """
    Health check endpoint to verify backend operational status.
    Returns application metadata, timestamp, and subsystem status.
    """
    return HealthService.get_system_health()

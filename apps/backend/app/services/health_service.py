from datetime import datetime
from app.config import settings
from app.schemas.health import HealthResponse
from app import __version__


class HealthService:
    @staticmethod
    def get_system_health() -> HealthResponse:
        return HealthResponse(
            status="healthy",
            app_name=settings.PROJECT_NAME,
            version=__version__,
            environment=settings.APP_ENV,
            timestamp=datetime.utcnow(),
            services={
                "api": "operational",
                "database": "ready",
                "ai_engine": "ready",
            }
        )

from datetime import datetime
from sqlalchemy import text
from app.config import settings
from app.schemas.health import HealthResponse
from app import __version__


class HealthService:
    @staticmethod
    def get_system_health() -> HealthResponse:
        db_status = "operational"
        try:
            from app.database.session import engine
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        except Exception as e:
            db_status = f"unreachable ({e.__class__.__name__})"

        overall_status = "healthy" if db_status == "operational" else "degraded"

        return HealthResponse(
            status=overall_status,
            app_name=settings.PROJECT_NAME,
            version=__version__,
            environment=settings.APP_ENV,
            timestamp=datetime.utcnow(),
            services={
                "api": "operational",
                "database": db_status,
                "ai_engine": "ready",
            }
        )

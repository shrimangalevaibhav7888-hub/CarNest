from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.router import api_router
from app.database.session import init_db
from app.database.seed import seed_database
from app.utils.logger import logger
from app import __version__


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Starting up {settings.PROJECT_NAME} v{__version__}")
    logger.info(f"CORS Allowed Origins: {settings.ALLOWED_ORIGINS}")
    logger.info(f"API Prefix: {settings.API_PREFIX}")
    try:
        init_db()
        if settings.AUTO_SEED:
            seed_database()
    except Exception as e:
        logger.error(f"Startup DB initialization error: {e}")
    
    yield
    
    # Shutdown
    logger.info(f"Shutting down {settings.PROJECT_NAME}")


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME,
        version=__version__,
        description="CareNest AI — Full-Stack Elderly Patient Home-Care Support Platform API",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url=f"{settings.API_PREFIX}/openapi.json",
        lifespan=lifespan
    )

    # Configure CORS Middleware
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Dedicated Health Check Endpoints for Deployment & Monitoring Probes
    # Responds immediately to /api/health and /health without prefix or database dependencies
    @application.get("/api/health", tags=["Health"], summary="Render deployment health check")
    @application.get("/api/health/", tags=["Health"], include_in_schema=False)
    @application.get("/health", tags=["Health"], summary="Root health check")
    @application.get("/health/", tags=["Health"], include_in_schema=False)
    async def health_check():
        return {"status": "ok"}

    # Include API Routes
    application.include_router(api_router, prefix=settings.API_PREFIX)

    @application.get("/", tags=["Root"])
    async def root():
        return {
            "name": settings.PROJECT_NAME,
            "version": __version__,
            "status": "online",
            "docs": "/docs",
            "health": f"{settings.API_PREFIX}/health"
        }

    return application


app = create_application()
application = app  # Alias for ASGI servers referencing 'application'

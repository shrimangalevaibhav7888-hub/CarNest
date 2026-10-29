import os
from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
from app.database.base import Base
from app.utils.logger import logger

# Handle database URL (Render provides postgres:// which SQLAlchemy 1.4+ rejects in favor of postgresql://)
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Connect arguments and pool configuration
engine_kwargs = {
    "echo": False,
    "pool_pre_ping": True,
}

if db_url.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # Cloud PostgreSQL connection resilience (Supabase / Render PostgreSQL)
    engine_kwargs["pool_recycle"] = 300
    engine_kwargs["pool_size"] = 5
    engine_kwargs["max_overflow"] = 10

# Create engine
engine = create_engine(db_url, **engine_kwargs)

# Enable Foreign Keys in SQLite
if db_url.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a database session and closes it afterwards.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Creates all database tables defined in the SQLAlchemy models.
    """
    try:
        logger.info(f"Initializing database schema on {settings.DATABASE_URL.split('//')[0]}...")
        # Import models so they are registered with Base metadata
        import app.models  # noqa
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise e

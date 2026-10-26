from datetime import datetime
from typing import Dict, Any
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(default="healthy", description="Overall health status")
    app_name: str = Field(..., description="Application name")
    version: str = Field(..., description="API Version")
    environment: str = Field(..., description="Running environment")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Current UTC timestamp")
    services: Dict[str, Any] = Field(default_factory=dict, description="Status of connected services")

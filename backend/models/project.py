from pydantic import BaseModel
from enum import Enum
from datetime import datetime
from typing import Optional

class DeploymentStatus(str, Enum):
    DEPLOYING = "deploying"
    ACTIVE = "active"
    ERROR = "error"
    STOPPED = "stopped"

class Project(BaseModel):
    id: str
    name: str
    github_url: str
    domain: str
    status: DeploymentStatus
    created_at: datetime
    last_deployed: Optional[datetime] = None
    build_logs: Optional[str] = None
    container_id: Optional[str] = None
    port: Optional[str] = None  # Add port field
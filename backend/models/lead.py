from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid


class LeadCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = ""
    company: Optional[str] = ""
    service: Optional[str] = ""
    message: str = Field(..., min_length=1, max_length=5000)
    source: Optional[str] = "marketing_contact_form"


class LeadInDB(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str = ""
    company: str = ""
    service: str = ""
    message: str
    source: str = "marketing_contact_form"
    status: str = "new"  # new, contacted, in_progress, closed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

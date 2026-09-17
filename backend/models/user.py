from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, Literal
from datetime import datetime, timezone
import uuid


class UserBase(BaseModel):
    email: EmailStr
    role: Literal["admin", "subscriber", "demo_user"] = "subscriber"


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    name: str = ""


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserInDB(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str = ""
    password_hash: str
    role: str = "subscriber"
    email_verified: bool = False
    is_active: bool = True
    subscription_id: Optional[str] = None
    razorpay_customer_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Demo TTL — MongoDB will use this field to auto-expire demo documents
    expires_at: Optional[datetime] = None


class UserOut(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    email: str
    name: str
    role: str
    email_verified: bool
    subscription_id: Optional[str] = None
    created_at: datetime


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    token: str
    new_password: str


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)


class ResendOTPRequest(BaseModel):
    email: EmailStr


class PasswordResetWithOTP(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=6, max_length=128)


class UpdateProfile(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

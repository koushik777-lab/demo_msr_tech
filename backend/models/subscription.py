from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal
from datetime import datetime, timezone
import uuid


PLAN_LIMITS = {
    "free": {"sites": 1, "storage_mb": 50, "custom_domain": False, "watermark": True, "publish": True},
    "starter": {"sites": 3, "storage_mb": 500, "custom_domain": True, "watermark": False, "publish": True},
    "pro": {"sites": 999, "storage_mb": 5000, "custom_domain": True, "watermark": False, "publish": True},
    "agency": {"sites": 999, "storage_mb": 20000, "custom_domain": True, "watermark": False, "publish": True, "white_label": True},
}

PLAN_PRICES = {
    "free": 0,
    "starter": 149900,   # ₹1,499/month in paise
    "pro": 299900,       # ₹2,999/month in paise
    "agency": 599900,    # ₹5,999/month in paise
}

PLAN_NAMES = {
    "free": "Free",
    "starter": "Starter",
    "pro": "Pro",
    "agency": "Agency",
}


class SubscriptionInDB(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan: Literal["free", "starter", "pro", "agency"] = "free"
    status: Literal["active", "expired", "trial", "cancelled", "past_due"] = "trial"
    razorpay_subscription_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    renewal_date: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None

    @property
    def limits(self):
        return PLAN_LIMITS.get(self.plan, PLAN_LIMITS["free"])

    @property
    def is_active(self):
        return self.status in ("active", "trial")


class SubscriptionOut(BaseModel):
    id: str
    plan: str
    status: str
    renewal_date: Optional[datetime]
    limits: dict
    created_at: datetime


class CreateOrderRequest(BaseModel):
    plan: Literal["starter", "pro", "agency"]


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan: str

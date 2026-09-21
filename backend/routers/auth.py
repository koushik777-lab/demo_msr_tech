from fastapi import APIRouter, HTTPException, Depends, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timezone, timedelta
import uuid
import os
import random

from models.user import (
    UserCreate, UserLogin, UserInDB, UserOut, TokenPair,
    PasswordResetRequest, PasswordReset, VerifyOTPRequest, ResendOTPRequest, PasswordResetWithOTP
)
from models.subscription import SubscriptionInDB
from utils.email import send_otp_verification_email, send_password_reset_email

router = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.getenv("JWT_SECRET", "changeme")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
REFRESH_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 30))
DEMO_EXPIRE_HOURS = int(os.getenv("DEMO_TOKEN_EXPIRE_HOURS", 24))
DEMO_EMAIL = os.getenv("DEMO_EMAIL", "demo@sitecraft.app")


def get_db(request: Request):
    return request.app.state.db


def create_tokens(user_id: str, role: str, email: str, expire_minutes: int = None) -> tuple[str, str]:
    exp_min = expire_minutes or ACCESS_EXPIRE_MIN
    access_payload = {
        "sub": user_id,
        "role": role,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=exp_min),
        "iat": datetime.now(timezone.utc),
    }
    refresh_payload = {
        "sub": user_id,
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_EXPIRE_DAYS),
    }
    access = jwt.encode(access_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    refresh = jwt.encode(refresh_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return access, refresh


# ─── Register with OTP ──────────────────────────────────────────────────────────

@router.post("/register")
async def register(body: UserCreate, request: Request):
    db = get_db(request)
    email_clean = body.email.strip().lower()
    existing = await db.users.find_one({"email": email_clean}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    password_hash = pwd_context.hash(body.password)
    otp_code = str(random.randint(100000, 999999))
    otp_expires_at = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()

    user = UserInDB(
        email=email_clean,
        name=body.name,
        password_hash=password_hash,
        role="subscriber",
        email_verified=False,
    )
    user_doc = user.model_dump()
    user_doc["otp_code"] = otp_code
    user_doc["otp_expires_at"] = otp_expires_at
    user_doc["created_at"] = user_doc["created_at"].isoformat()
    user_doc["updated_at"] = user_doc["updated_at"].isoformat()
    await db.users.insert_one(user_doc)

    # Create free subscription
    sub = SubscriptionInDB(user_id=user.id, plan="free", status="trial")
    sub_doc = sub.model_dump()
    sub_doc["created_at"] = sub_doc["created_at"].isoformat()
    sub_doc["updated_at"] = sub_doc["updated_at"].isoformat()
    await db.subscriptions.insert_one(sub_doc)
    await db.users.update_one({"id": user.id}, {"$set": {"subscription_id": sub.id}})

    # Send OTP Email
    send_otp_verification_email(email_clean, otp_code)

    return {
        "requires_otp": True,
        "email": email_clean,
        "message": "Verification OTP has been sent to your email address."
    }


@router.post("/verify-otp", response_model=TokenPair)
async def verify_otp(body: VerifyOTPRequest, request: Request):
    db = get_db(request)
    email_clean = body.email.strip().lower()
    user_doc = await db.users.find_one({"email": email_clean}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User account not found")

    saved_otp = user_doc.get("otp_code")
    expires_str = user_doc.get("otp_expires_at")

    if not saved_otp or saved_otp != body.otp_code.strip():
        raise HTTPException(status_code=400, detail="Invalid OTP verification code")

    if expires_str:
        expires_at = datetime.fromisoformat(expires_str).replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=400, detail="OTP code has expired. Please request a new one.")

    # Mark user as verified and clear OTP
    await db.users.update_one(
        {"id": user_doc["id"]},
        {"$set": {"email_verified": True, "updated_at": datetime.now(timezone.utc).isoformat()}, "$unset": {"otp_code": "", "otp_expires_at": ""}}
    )

    access, refresh = create_tokens(user_doc["id"], user_doc["role"], user_doc["email"])
    user_out = UserOut(
        id=user_doc["id"], email=user_doc["email"], name=user_doc.get("name", ""),
        role=user_doc["role"], email_verified=True, subscription_id=user_doc.get("subscription_id"),
        created_at=datetime.fromisoformat(user_doc["created_at"]) if isinstance(user_doc["created_at"], str) else user_doc["created_at"],
    )
    return TokenPair(access_token=access, refresh_token=refresh, user=user_out)


@router.post("/resend-otp")
async def resend_otp(body: ResendOTPRequest, request: Request):
    db = get_db(request)
    email_clean = body.email.strip().lower()
    user_doc = await db.users.find_one({"email": email_clean}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User account not found")

    new_otp = str(random.randint(100000, 999999))
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()

    await db.users.update_one(
        {"id": user_doc["id"]},
        {"$set": {"otp_code": new_otp, "otp_expires_at": expires_at}}
    )

    send_otp_verification_email(email_clean, new_otp)
    return {"message": "A new verification OTP code has been sent to your email address."}


# ─── Login ─────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenPair)
async def login(body: UserLogin, request: Request):
    db = get_db(request)
    user_doc = await db.users.find_one({"email": body.email.strip().lower()}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not pwd_context.verify(body.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user_doc.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account disabled")

    access, refresh = create_tokens(user_doc["id"], user_doc["role"], user_doc["email"])
    user_out = UserOut(
        id=user_doc["id"], email=user_doc["email"], name=user_doc.get("name", ""),
        role=user_doc["role"], email_verified=user_doc.get("email_verified", False),
        subscription_id=user_doc.get("subscription_id"),
        created_at=datetime.fromisoformat(user_doc["created_at"]) if isinstance(user_doc["created_at"], str) else user_doc["created_at"],
    )
    return TokenPair(access_token=access, refresh_token=refresh, user=user_out)


# ─── Demo Login ────────────────────────────────────────────────────────────────

@router.post("/demo", response_model=TokenPair)
async def demo_login(request: Request):
    """Creates a fresh demo session with a 24-hour TTL workspace."""
    db = get_db(request)
    demo_id = str(uuid.uuid4())
    demo_email = f"demo_{demo_id[:8]}@sitecraft.demo"
    expires_at = datetime.now(timezone.utc) + timedelta(hours=DEMO_EXPIRE_HOURS)

    user = UserInDB(
        id=demo_id,
        email=demo_email,
        name="Demo User",
        password_hash=pwd_context.hash("demo_password_123"),
        role="demo_user",
        email_verified=True,
        expires_at=expires_at,
    )
    user_doc = user.model_dump()
    user_doc["created_at"] = user_doc["created_at"].isoformat() if hasattr(user_doc["created_at"], "isoformat") else user_doc["created_at"]
    user_doc["updated_at"] = user_doc["updated_at"].isoformat() if hasattr(user_doc["updated_at"], "isoformat") else user_doc["updated_at"]
    user_doc["expires_at"] = user_doc["expires_at"].isoformat() if user_doc.get("expires_at") and hasattr(user_doc["expires_at"], "isoformat") else expires_at.isoformat()
    await db.demo_users.insert_one(user_doc)

    sub = SubscriptionInDB(user_id=demo_id, plan="pro", status="active", expires_at=expires_at)
    sub_doc = sub.model_dump()
    sub_doc["created_at"] = sub_doc["created_at"].isoformat() if hasattr(sub_doc["created_at"], "isoformat") else sub_doc["created_at"]
    sub_doc["updated_at"] = sub_doc["updated_at"].isoformat() if hasattr(sub_doc["updated_at"], "isoformat") else sub_doc["updated_at"]
    sub_doc["expires_at"] = sub_doc["expires_at"].isoformat() if sub_doc.get("expires_at") and hasattr(sub_doc["expires_at"], "isoformat") else expires_at.isoformat()
    await db.subscriptions.insert_one(sub_doc)
    await db.demo_users.update_one({"id": demo_id}, {"$set": {"subscription_id": sub.id}})

    # Load templates defaults
    template_path = os.path.join(os.path.dirname(__file__), "..", "templates", "hardware.json")
    tdata = {}
    if os.path.exists(template_path):
        with open(template_path, encoding="utf-8") as f:
            import json
            tdata = json.load(f)

    site_id = str(uuid.uuid4())
    demo_site = {
        "id": site_id,
        "user_id": demo_id,
        "name": "My Business",
        "sector": "hardware",
        "variant": "modern",
        "subdomain": f"demo-{demo_id[:6]}",
        "status": "draft",
        "is_demo": True,
        "expires_at": expires_at.isoformat(),
        "settings": {
            "brand_colors": tdata.get("theme", {"primary": "#6366f1", "secondary": "#1e293b", "accent": "#f59e0b"}),
            "font_heading": tdata.get("theme", {}).get("font_heading", "Outfit"),
            "font_body": tdata.get("theme", {}).get("font_body", "Inter"),
            "footer": {"company_name": "My Business", "description": "Welcome to our website."},
        },
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.demo_sites.insert_one(demo_site)

    demo_page = {
        "id": str(uuid.uuid4()),
        "site_id": site_id,
        "title": "Home",
        "slug": "index",
        "is_home": True,
        "sections": tdata.get("sections", []),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.demo_pages.insert_one(demo_page)

    access, refresh = create_tokens(demo_id, "demo_user", demo_email)
    user_out = UserOut(id=demo_id, email=demo_email, name="Demo User", role="demo_user",
                       email_verified=True, subscription_id=sub.id, created_at=user.created_at)
    return TokenPair(access_token=access, refresh_token=refresh, user=user_out)


# ─── Refresh Token ─────────────────────────────────────────────────────────────

@router.post("/refresh")
async def refresh_token(request: Request):
    body = await request.json()
    token = body.get("refresh_token")
    if not token:
        raise HTTPException(status_code=400, detail="refresh_token required")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=400, detail="Not a refresh token")
        user_id = payload["sub"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    db = get_db(request)
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user_doc:
        user_doc = await db.demo_users.find_one({"id": user_id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    access, refresh = create_tokens(user_id, user_doc["role"], user_doc["email"])
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}


# ─── Me ────────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserOut)
async def get_me(request: Request):
    from middleware.auth import get_current_user_db
    from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth_header.split(" ")[1]
    from middleware.auth import decode_token
    payload = decode_token(token)
    user_id = payload.get("sub")

    db = get_db(request)
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user_doc:
        user_doc = await db.demo_users.find_one({"id": user_id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    return UserOut(
        id=user_doc["id"], email=user_doc["email"], name=user_doc.get("name", ""),
        role=user_doc["role"], email_verified=user_doc.get("email_verified", False),
        subscription_id=user_doc.get("subscription_id"),
        created_at=datetime.fromisoformat(user_doc["created_at"]) if isinstance(user_doc["created_at"], str) else user_doc["created_at"],
    )


from utils.email import send_password_reset_email

# ─── Forgot / Reset Password ──────────────────────────────────────────────────

@router.post("/forgot-password")
async def forgot_password(body: PasswordResetRequest, request: Request):
    db = get_db(request)
    email_clean = body.email.strip().lower()
    user_doc = await db.users.find_one({"email": email_clean}, {"_id": 0})
    if not user_doc:
        # Don't reveal if email exists
        return {"message": "If that email is registered, you'll receive a verification code."}

    reset_otp = str(random.randint(100000, 999999))
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
    await db.password_resets.insert_one({
        "email": email_clean,
        "token": reset_otp,
        "user_id": user_doc["id"],
        "expires_at": expires_at,
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    
    # Send actual email via SMTP
    send_password_reset_email(email_clean, reset_otp)
    
    return {"message": "A 6-digit password reset verification code has been sent to your email address."}


@router.post("/reset-password")
async def reset_password(body: PasswordResetWithOTP, request: Request):
    db = get_db(request)
    email_clean = body.email.strip().lower()
    otp_code = body.otp_code.strip()

    record = await db.password_resets.find_one(
        {"email": email_clean, "token": otp_code, "used": False},
        {"_id": 0}
    )
    if not record:
        # Fallback search by token alone in case email was omitted in older records
        record = await db.password_resets.find_one(
            {"token": otp_code, "used": False},
            {"_id": 0}
        )

    if not record:
        raise HTTPException(status_code=400, detail="Invalid OTP verification code")

    expires = datetime.fromisoformat(record["expires_at"]).replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="OTP code has expired. Please request a new code.")

    new_hash = pwd_context.hash(body.new_password)
    await db.users.update_one({"id": record["user_id"]}, {"$set": {"password_hash": new_hash}})
    await db.password_resets.update_one({"token": otp_code, "used": False}, {"$set": {"used": True}})
    return {"message": "Password updated successfully! You can now log in."}

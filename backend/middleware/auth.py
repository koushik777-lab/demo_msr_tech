from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorDatabase
import os
from typing import Optional

security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "changeme")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = None,
) -> dict:
    payload = decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    return {"id": user_id, "role": payload.get("role", "subscriber"), "email": payload.get("email", "")}


async def get_current_user_db(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Returns user dict from token without DB lookup (fast path)."""
    payload = decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    return {"id": user_id, "role": payload.get("role", "subscriber"), "email": payload.get("email", "")}


def require_role(*roles: str):
    """Dependency factory — raises 403 if user role not in allowed roles."""
    async def checker(current_user: dict = Depends(get_current_user_db)):
        if current_user["role"] not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return checker


def require_not_demo():
    """Dependency — raises 403 if user is a demo user."""
    async def checker(current_user: dict = Depends(get_current_user_db)):
        if current_user["role"] == "demo_user":
            raise HTTPException(
                status_code=403,
                detail="Demo accounts cannot perform this action. Please sign up for a free account."
            )
        return current_user
    return checker

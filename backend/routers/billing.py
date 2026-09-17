from fastapi import APIRouter, HTTPException, Depends, Request
import razorpay
import hmac
import hashlib
import os
from datetime import datetime, timezone, timedelta
import uuid

import logging

from models.subscription import (
    SubscriptionInDB, SubscriptionOut, CreateOrderRequest,
    VerifyPaymentRequest, PLAN_PRICES, PLAN_LIMITS, PLAN_NAMES
)
from middleware.auth import get_current_user_db

router = APIRouter(prefix="/api/billing", tags=["billing"])
logger = logging.getLogger(__name__)

def get_rzp_keys():
    key_id = os.getenv("RAZORPAY_KEY_ID", "")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
    return key_id, key_secret


def get_db(request: Request):
    return request.app.state.db


def get_rzp_client():
    key_id, key_secret = get_rzp_keys()
    if not key_id or not key_secret:
        return None
    return razorpay.Client(auth=(key_id, key_secret))


# ─── Plans listing ────────────────────────────────────────────────────────────

@router.get("/plans")
async def list_plans():
    plans = []
    for plan_id, price in PLAN_PRICES.items():
        plans.append({
            "id": plan_id,
            "name": PLAN_NAMES[plan_id],
            "price_paise": price,
            "price_inr": price / 100,
            "limits": PLAN_LIMITS[plan_id],
            "features": _plan_features(plan_id),
        })
    return {"plans": plans}


def _plan_features(plan: str) -> list:
    features_map = {
        "free": ["1 website", "Subdomain only", "SiteCraft watermark", "Basic templates", "ZIP export"],
        "starter": ["Up to 3 websites", "Custom domain", "No watermark", "All templates", "ZIP export", "Form submissions"],
        "pro": ["Unlimited websites", "Custom domain", "No watermark", "All templates", "ZIP export", "Form submissions", "Analytics dashboard", "Priority support"],
        "agency": ["Unlimited websites", "White-label", "Custom domain", "No watermark", "All templates", "ZIP export", "Form submissions", "Analytics", "Multi-client management", "Priority support"],
    }
    return features_map.get(plan, [])


# ─── Get subscription ─────────────────────────────────────────────────────────

@router.get("/subscription")
async def get_subscription(request: Request, current_user: dict = Depends(get_current_user_db)):
    db = get_db(request)

    if current_user.get("role") == "demo_user":
        return {
            "id": f"demo-sub-{current_user['id'][:8]}",
            "plan": "pro",
            "plan_name": "Pro (Demo Access)",
            "status": "trial",
            "renewal_date": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat(),
            "limits": PLAN_LIMITS["pro"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    user_doc = await db.users.find_one({"id": current_user["id"]}, {"_id": 0})
    if not user_doc:
        user_doc = await db.demo_users.find_one({"id": current_user["id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    sub_id = user_doc.get("subscription_id")
    if sub_id:
        sub_doc = await db.subscriptions.find_one({"id": sub_id}, {"_id": 0})
    else:
        sub_doc = None

    if not sub_doc:
        # Auto-create free subscription
        sub = SubscriptionInDB(user_id=current_user["id"], plan="free", status="trial")
        sub_doc = sub.model_dump()
        sub_doc["created_at"] = sub_doc["created_at"].isoformat()
        sub_doc["updated_at"] = sub_doc["updated_at"].isoformat()
        await db.subscriptions.insert_one(sub_doc)
        await db.users.update_one({"id": current_user["id"]}, {"$set": {"subscription_id": sub.id}})

    plan = sub_doc.get("plan", "free")
    return {
        "id": sub_doc["id"],
        "plan": plan,
        "plan_name": PLAN_NAMES.get(plan, "Free"),
        "status": sub_doc.get("status", "trial"),
        "renewal_date": sub_doc.get("renewal_date"),
        "limits": PLAN_LIMITS.get(plan, PLAN_LIMITS["free"]),
        "created_at": sub_doc.get("created_at"),
    }


# ─── Create Order ─────────────────────────────────────────────────────────────

@router.post("/create-order")
async def create_order(body: CreateOrderRequest, request: Request,
                       current_user: dict = Depends(get_current_user_db)):
    if current_user["role"] == "demo_user":
        raise HTTPException(status_code=403, detail="Demo users cannot purchase subscriptions")

    amount = PLAN_PRICES.get(body.plan)
    if not amount:
        raise HTTPException(status_code=400, detail="Invalid plan")

    key_id, key_secret = get_rzp_keys()
    rzp = get_rzp_client()
    if not rzp:
        # Mock mode — return a fake order
        return {
            "order_id": f"mock_order_{uuid.uuid4().hex[:8]}",
            "amount": amount,
            "currency": "INR",
            "key_id": key_id or "mock_key",
            "plan": body.plan,
            "mock": True,
        }

    order_data = {
        "amount": amount,
        "currency": "INR",
        "receipt": f"rcpt_{uuid.uuid4().hex[:10]}",
        "notes": {"user_id": current_user["id"], "plan": body.plan},
    }
    order = rzp.order.create(data=order_data)

    db = get_db(request)
    await db.payment_orders.insert_one({
        "order_id": order["id"],
        "user_id": current_user["id"],
        "plan": body.plan,
        "amount": amount,
        "status": "created",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {
        "order_id": order["id"],
        "amount": amount,
        "currency": "INR",
        "key_id": key_id,
        "plan": body.plan,
    }


# ─── Verify Payment ───────────────────────────────────────────────────────────

@router.post("/verify-payment")
async def verify_payment(body: VerifyPaymentRequest, request: Request,
                         current_user: dict = Depends(get_current_user_db)):
    db = get_db(request)

    # Mock mode bypass
    if body.razorpay_order_id.startswith("mock_order_"):
        await _activate_subscription(db, current_user["id"], body.plan, None, body.razorpay_order_id)
        return {"success": True, "message": "Subscription activated (mock mode)", "plan": body.plan}

    key_id, key_secret = get_rzp_keys()

    # Verify Razorpay signature
    generated_sig = hmac.new(
        key_secret.encode(),
        f"{body.razorpay_order_id}|{body.razorpay_payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()

    if generated_sig != body.razorpay_signature:
        raise HTTPException(status_code=400, detail="Payment signature verification failed")

    await _activate_subscription(db, current_user["id"], body.plan,
                                 body.razorpay_payment_id, body.razorpay_order_id)
    return {"success": True, "message": "Subscription activated", "plan": body.plan}


async def _activate_subscription(db, user_id: str, plan: str, payment_id: str, order_id: str):
    renewal_date = datetime.now(timezone.utc) + timedelta(days=30)
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    sub_id = user_doc.get("subscription_id") if user_doc else None

    sub_data = {
        "plan": plan,
        "status": "active",
        "razorpay_payment_id": payment_id,
        "razorpay_order_id": order_id,
        "renewal_date": renewal_date.isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    if sub_id:
        await db.subscriptions.update_one({"id": sub_id}, {"$set": sub_data})
    else:
        sub = SubscriptionInDB(user_id=user_id, plan=plan, status="active",
                               renewal_date=renewal_date)
        doc = sub.model_dump()
        doc.update(sub_data)
        doc["created_at"] = doc["created_at"].isoformat()
        await db.subscriptions.insert_one(doc)
        await db.users.update_one({"id": user_id}, {"$set": {"subscription_id": sub.id}})

    await db.payment_orders.update_one(
        {"order_id": order_id},
        {"$set": {"status": "paid", "payment_id": payment_id}}
    )


# ─── Razorpay Webhook ─────────────────────────────────────────────────────────

@router.post("/webhook")
async def razorpay_webhook(request: Request):
    """Handle Razorpay webhook events."""
    body = await request.json()
    event = body.get("event", "")
    db = get_db(request)

    if event == "subscription.charged":
        payload = body.get("payload", {}).get("subscription", {}).get("entity", {})
        rzp_sub_id = payload.get("id")
        current_end = payload.get("current_end")
        if rzp_sub_id:
            update_data = {
                "status": "active",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            if current_end:
                update_data["expires_at"] = datetime.fromtimestamp(current_end, timezone.utc).isoformat()
            await db.subscriptions.update_one(
                {"razorpay_subscription_id": rzp_sub_id},
                {"$set": update_data}
            )
    elif event == "subscription.cancelled":
        payload = body.get("payload", {}).get("subscription", {}).get("entity", {})
        rzp_sub_id = payload.get("id")
        if rzp_sub_id:
            await db.subscriptions.update_one(
                {"razorpay_subscription_id": rzp_sub_id},
                {"$set": {"status": "cancelled", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
    elif event == "payment.failed":
        payload = body.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = payload.get("order_id")
        logger.warning(f"Payment failed for order: {order_id}")

    return {"status": "ok"}

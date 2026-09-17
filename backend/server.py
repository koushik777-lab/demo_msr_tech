from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from routers import auth, billing, sites, pages, templates, publish, assets, leads

# MongoDB connection
mongo_url = os.getenv('MONGO_URL') or os.getenv('MONGO_URI', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db_name = os.getenv('DB_NAME', 'sitecraft')
db = client[db_name]

# Create the main app
app = FastAPI(title="SiteCraft API", version="2.0.0")

# Attach DB to app state for request access
app.state.db = db

# Create upload directory
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Create a router with the /api prefix (legacy)
api_router = APIRouter(prefix="/api")


# Define Models (legacy - keep for backward compat)
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


@api_router.get("/")
async def root():
    return {"message": "SiteCraft API v2.0", "status": "running"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


# Include legacy router
app.include_router(api_router)

# Include all new builder routers
app.include_router(auth.router)
app.include_router(billing.router)
app.include_router(sites.router)
app.include_router(pages.router)
app.include_router(templates.router)
app.include_router(publish.router)
app.include_router(assets.router)
app.include_router(leads.router)

# Serve uploaded files
app.mount(f"/api/assets/file", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# CORS Configuration
raw_cors = os.environ.get('CORS_ORIGINS', '').strip()
if not raw_cors:
    logger.warning("  ⚠️ [SECURITY WARNING] 'CORS_ORIGINS' environment variable is NOT set. Defaulting to wildcard '*'. Explicitly define allowed domain origins for production!")
    allowed_origins = ["*"]
else:
    allowed_origins = [origin.strip() for origin in raw_cors.split(',') if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


def check_production_environment():
    """Verify environment variables before launch and warn if dummy placeholders are detected."""
    env = os.getenv("ENVIRONMENT", "development").lower()
    razorpay_key = os.getenv("RAZORPAY_KEY_ID", "")
    razorpay_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
    aws_key = os.getenv("AWS_ACCESS_KEY_ID", "")
    storage_provider = os.getenv("STORAGE_PROVIDER", "local").lower()
    
    warnings = []
    raw_cors = os.environ.get('CORS_ORIGINS', '').strip()
    if not raw_cors or raw_cors == "*":
        warnings.append("  ⚠️ [CORS SECURITY] 'CORS_ORIGINS' is unconfigured or set to wildcard '*'. Explicitly specify domain origins in production .env!")
    
    if "YourRazorpayKeyIdHere" in razorpay_key or "rzp_test_YourRazorpayKeyIdHere" in razorpay_key:
        warnings.append("  ⚠️ [PAYMENTS] RAZORPAY_KEY_ID contains placeholder value. Billing/checkout will fail!")
    if "YourRazorpaySecretKeyHere" in razorpay_secret:
        warnings.append("  ⚠️ [PAYMENTS] RAZORPAY_KEY_SECRET contains placeholder value.")
    if storage_provider == "s3" and "YOUR_AWS_ACCESS_KEY_HERE" in aws_key:
        warnings.append("  ⚠️ [STORAGE] STORAGE_PROVIDER is set to 's3' but AWS credentials are dummy placeholders!")
    if os.getenv("JWT_SECRET") in ("changeme", "f8c2b71940e79124ad5f7823e9a0c31d8e6451293a74b0df1c82367489ab52d1") and env == "production":
        warnings.append("  ⚠️ [SECURITY] Default/Example JWT_SECRET is active in production environment. Generate a unique secret!")

    if warnings:
        logger.warning("\n" + "="*80 + "\n🚨 PRE-LAUNCH PRODUCTION ENVIRONMENT WARNINGS:\n" + "\n".join(warnings) + "\n" + "="*80 + "\n")
    else:
        logger.info("✅ Environment configuration passed production readiness checks.")


@app.on_event("startup")
async def startup_event():
    """Create MongoDB indexes on startup and verify environment with automatic local failover."""
    global db, client
    check_production_environment()
    try:
        # Try primary MongoDB connection
        await db.demo_users.create_index("expires_at", expireAfterSeconds=0)
        await db.demo_sites.create_index("expires_at", expireAfterSeconds=0)
        await db.demo_pages.create_index("created_at")
        await db.users.create_index("email", unique=True)
        await db.sites.create_index("user_id")
        await db.pages.create_index("site_id")
        await db.assets.create_index("user_id")
        await db.leads.create_index("created_at")
        await db.leads.create_index("email")
        logger.info("✅ SiteCraft API started. Primary MongoDB connected and indexes created.")
    except Exception as e:
        logger.warning(f"⚠️ Primary MongoDB connection failed ({e}). Falling back to local MongoDB (mongodb://127.0.0.1:27017)...")
        try:
            local_client = AsyncIOMotorClient("mongodb://127.0.0.1:27017", serverSelectionTimeoutMS=3000)
            local_db = local_client[db_name]
            await local_db.users.create_index("email", unique=True)
            await local_db.sites.create_index("user_id")
            await local_db.pages.create_index("site_id")
            client = local_client
            db = local_db
            app.state.db = local_db
            logger.info("✅ Connected to Local MongoDB fallback successfully. SiteCraft API started.")
        except Exception as local_err:
            logger.error(f"❌ Both Primary and Local MongoDB connections failed: {local_err}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
from fastapi import APIRouter, HTTPException, Depends, Request, UploadFile, File
from datetime import datetime, timezone
import uuid
import os
import re
import logging
import aiofiles

from middleware.auth import get_current_user_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/assets", tags=["assets"])

STORAGE_PROVIDER = os.getenv("STORAGE_PROVIDER", "local").lower()
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", 10))

ALLOWED_MIME_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
}
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp", "svg"}

# S3 Configuration
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")


def get_db(request: Request):
    return request.app.state.db


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent directory traversal or script injection."""
    cleaned = re.sub(r'[^a-zA-Z0-9_.-]', '', filename)
    return cleaned[:100]


@router.post("/upload")
async def upload_asset(
    request: Request,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user_db),
):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed: {file.content_type}. Allowed: {list(ALLOWED_MIME_TYPES.keys())}"
        )

    # Validate file extension
    raw_ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if raw_ext not in ALLOWED_EXTENSIONS:
        ext = ALLOWED_MIME_TYPES[file.content_type]
    else:
        ext = raw_ext

    content = await file.read()
    if len(content) > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File too large (max {MAX_UPLOAD_MB}MB)")

    asset_id = str(uuid.uuid4())
    filename = f"{asset_id}.{ext}"
    sanitized_original = sanitize_filename(file.filename)

    # 1. Cloud Storage Provider: AWS S3
    if STORAGE_PROVIDER == "s3":
        if not S3_BUCKET_NAME:
            raise HTTPException(status_code=500, detail="S3_BUCKET_NAME is not configured in environment")
        try:
            import boto3
            s3_client = boto3.client(
                's3',
                aws_access_key_id=AWS_ACCESS_KEY_ID,
                aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                region_name=AWS_REGION
            )
            s3_key = f"assets/{filename}"
            s3_client.put_object(
                Bucket=S3_BUCKET_NAME,
                Key=s3_key,
                Body=content,
                ContentType=file.content_type,
            )
            url = f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"
            storage_type = "s3"
        except Exception as e:
            logger.error(f"S3 Upload failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Cloud storage upload failed: {str(e)}")

    # 2. Local Storage Provider (Default for dev / non-ephemeral servers)
    else:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        filepath = os.path.join(UPLOAD_DIR, filename)
        async with aiofiles.open(filepath, "wb") as f:
            await f.write(content)
        url = f"/api/assets/file/{filename}"
        storage_type = "local"

    db = get_db(request)
    asset_doc = {
        "id": asset_id,
        "user_id": current_user["id"],
        "filename": sanitized_original,
        "url": url,
        "storage_type": storage_type,
        "size_bytes": len(content),
        "mime_type": file.content_type,
        "alt_text": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.assets.insert_one(asset_doc)
    asset_doc.pop("_id", None)
    return {"asset": asset_doc}


@router.get("")
async def list_assets(request: Request, current_user: dict = Depends(get_current_user_db)):
    db = get_db(request)
    assets = await db.assets.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(200)
    return {"assets": assets}


@router.delete("/{asset_id}")
async def delete_asset(asset_id: str, request: Request,
                       current_user: dict = Depends(get_current_user_db)):
    db = get_db(request)
    asset = await db.assets.find_one({"id": asset_id, "user_id": current_user["id"]}, {"_id": 0})
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    storage_type = asset.get("storage_type", "local")
    if storage_type == "s3":
        if S3_BUCKET_NAME:
            try:
                import boto3
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                    region_name=AWS_REGION
                )
                s3_key = f"assets/{asset['url'].split('/')[-1]}"
                s3_client.delete_object(Bucket=S3_BUCKET_NAME, Key=s3_key)
            except Exception as e:
                logger.warning(f"Failed to delete S3 asset {asset_id}: {str(e)}")
    else:
        filepath = os.path.join(UPLOAD_DIR, asset["url"].split("/")[-1])
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception as e:
                logger.warning(f"Failed to delete local asset file {filepath}: {str(e)}")

    await db.assets.delete_one({"id": asset_id})
    return {"message": "Asset deleted"}

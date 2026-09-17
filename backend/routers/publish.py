from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from datetime import datetime, timezone
import io
import os

from middleware.auth import get_current_user_db
from models.subscription import PLAN_LIMITS
from static_generator import generate_static_site

router = APIRouter(prefix="/api/sites", tags=["publish"])


def get_db(request: Request):
    return request.app.state.db


async def get_plan_limits(db, user_id: str, role: str) -> dict:
    if role == "demo_user":
        return PLAN_LIMITS["pro"]  # Demo gets pro limits for viewing
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user_doc:
        return PLAN_LIMITS["free"]
    sub_id = user_doc.get("subscription_id")
    if not sub_id:
        return PLAN_LIMITS["free"]
    sub_doc = await db.subscriptions.find_one({"id": sub_id}, {"_id": 0})
    if not sub_doc:
        return PLAN_LIMITS["free"]
    if sub_doc.get("status") not in ("active", "trial"):
        return PLAN_LIMITS["free"]
    return PLAN_LIMITS.get(sub_doc.get("plan", "free"), PLAN_LIMITS["free"])


@router.post("/{site_id}/publish")
async def publish_site(site_id: str, request: Request,
                       current_user: dict = Depends(get_current_user_db)):
    db = get_db(request)
    is_demo = current_user["role"] == "demo_user"

    if is_demo:
        raise HTTPException(
            status_code=403,
            detail="Demo accounts cannot publish sites. Please sign up to publish your website."
        )

    limits = await get_plan_limits(db, current_user["id"], current_user["role"])
    if not limits.get("publish", False):
        raise HTTPException(status_code=403, detail="Your plan does not support publishing. Please upgrade.")

    site_coll = db.demo_sites if is_demo else db.sites
    pages_coll = db.demo_pages if is_demo else db.pages

    site = await site_coll.find_one({"id": site_id, "user_id": current_user["id"]}, {"_id": 0})
    if not site and not is_demo:
        site = await db.demo_sites.find_one({"id": site_id}, {"_id": 0})
        if site:
            site_coll = db.demo_sites
            pages_coll = db.demo_pages

    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    pages = await pages_coll.find({"site_id": site_id}, {"_id": 0}).to_list(50)

    # Generate ZIP
    zip_bytes = generate_static_site(site, pages, add_watermark=limits.get("watermark", True), local_assets=True)

    # Mark as published
    await site_coll.update_one(
        {"id": site_id},
        {"$set": {"status": "published", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )

    filename = f"{site.get('subdomain', site_id)}.zip"
    return StreamingResponse(
        io.BytesIO(zip_bytes),
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/{site_id}/preview-html")
async def preview_html(site_id: str, request: Request,
                       current_user: dict = Depends(get_current_user_db)):
    """Returns the generated index.html for in-editor preview."""
    db = get_db(request)
    is_demo = current_user["role"] == "demo_user"
    site_coll = db.demo_sites if is_demo else db.sites
    pages_coll = db.demo_pages if is_demo else db.pages

    site = await site_coll.find_one({"id": site_id, "user_id": current_user["id"]}, {"_id": 0})
    if not site and not is_demo:
        site = await db.demo_sites.find_one({"id": site_id}, {"_id": 0})
        if site:
            site_coll = db.demo_sites
            pages_coll = db.demo_pages

    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    pages = await pages_coll.find({"site_id": site_id}, {"_id": 0}).to_list(50)
    zip_bytes = generate_static_site(site, pages, add_watermark=True, local_assets=False)
    
    # Extract index.html from zip
    import zipfile
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        try:
            html_content = zf.read("index.html").decode("utf-8")
        except KeyError:
            html_content = "<html><body><p>No preview available</p></body></html>"

    from fastapi.responses import HTMLResponse
    return HTMLResponse(content=html_content)

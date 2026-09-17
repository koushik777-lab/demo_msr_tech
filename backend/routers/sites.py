from fastapi import APIRouter, HTTPException, Depends, Request
from datetime import datetime, timezone, timedelta
import uuid
import re

from models.site import SiteCreate, SiteUpdate, SiteInDB, SiteOut, SiteSettings, SiteVersion
from middleware.auth import get_current_user_db
from models.subscription import PLAN_LIMITS

router = APIRouter(prefix="/api/sites", tags=["sites"])


def get_db(request: Request):
    return request.app.state.db


async def get_user_subscription(db, user_id: str) -> dict:
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user_doc:
        return PLAN_LIMITS["free"]
    sub_id = user_doc.get("subscription_id")
    if not sub_id:
        return PLAN_LIMITS["free"]
    sub_doc = await db.subscriptions.find_one({"id": sub_id}, {"_id": 0})
    if not sub_doc or sub_doc.get("status") not in ("active", "trial"):
        return PLAN_LIMITS["free"]
    return PLAN_LIMITS.get(sub_doc.get("plan", "free"), PLAN_LIMITS["free"])


def slugify(name: str) -> str:
    slug = re.sub(r'[^a-z0-9]+', '-', name.strip().lower()).strip('-')
    if not slug:
        slug = 'site'
    return slug[:30] + '-' + uuid.uuid4().hex[:6]


# ─── List sites ───────────────────────────────────────────────────────────────

@router.get("")
async def list_sites(request: Request, current_user: dict = Depends(get_current_user_db)):
    db = get_db(request)
    is_demo = current_user["role"] == "demo_user"
    coll = db.demo_sites if is_demo else db.sites
    sites = await coll.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(100)
    return {"sites": sites}


# ─── Create site ──────────────────────────────────────────────────────────────

@router.post("")
async def create_site(body: SiteCreate, request: Request,
                      current_user: dict = Depends(get_current_user_db)):
    db = get_db(request)
    cleaned_name = body.name.strip()
    if len(cleaned_name) < 2:
        raise HTTPException(status_code=400, detail="Site name must be at least 2 characters")
    body.name = cleaned_name
    is_demo = current_user["role"] == "demo_user"

    if not is_demo:
        # Check site limit
        limits = await get_user_subscription(db, current_user["id"])
        count = await db.sites.count_documents({"user_id": current_user["id"]})
        if count >= limits["sites"]:
            raise HTTPException(
                status_code=403,
                detail=f"Site limit reached ({limits['sites']}). Please upgrade your plan."
            )

    # Load template defaults
    import json, os
    template_path = os.path.join(os.path.dirname(__file__), "..", "templates", f"{body.sector}.json")
    template_data = {}
    if os.path.exists(template_path):
        with open(template_path, encoding="utf-8") as f:
            template_data = json.load(f)

    theme = template_data.get("theme", {})
    subdomain = slugify(body.name)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=24) if is_demo else None

    site = SiteInDB(
        user_id=current_user["id"],
        name=body.name,
        sector=body.sector,
        variant=body.variant,
        subdomain=subdomain,
        is_demo=is_demo,
        expires_at=expires_at,
        settings=SiteSettings(
            brand_colors={
                "primary": theme.get("primary", "#6366f1"),
                "secondary": theme.get("secondary", "#1e293b"),
                "accent": theme.get("accent", "#f59e0b"),
            },
            font_heading=theme.get("font_heading", "Outfit"),
            font_body=theme.get("font_body", "Inter"),
            footer={
                "company_name": body.name,
                "description": f"We provide excellent {body.sector} services.",
                "address": "123 Main St, City, Country",
                "phone": "+91 99999 99999",
                "email": "hello@yourcompany.com",
                "social": {"facebook": "", "twitter": "", "instagram": "", "linkedin": ""},
                "copyright": f"© {datetime.now(timezone.utc).year} {body.name}. All rights reserved.",
            }
        ),
    )

    site_doc = site.model_dump()
    site_doc["created_at"] = site_doc["created_at"].isoformat()
    site_doc["updated_at"] = site_doc["updated_at"].isoformat()
    site_doc["expires_at"] = site_doc["expires_at"].isoformat() if site_doc.get("expires_at") else None

    # Build default pages from template
    coll = db.demo_sites if is_demo else db.sites
    pages_coll = db.demo_pages if is_demo else db.pages
    await coll.insert_one(site_doc)
    site_doc.pop("_id", None)  # Remove MongoDB ObjectId for JSON serialization

    # Seed pages from template
    default_pages = template_data.get("default_pages", {})
    variant_layouts = template_data.get("variant_layouts", {})
    if body.variant in variant_layouts:
        default_pages = variant_layouts[body.variant]

    for page_slug, sections_data in default_pages.items():
        page_doc = {
            "id": str(uuid.uuid4()),
            "site_id": site.id,
            "slug": page_slug,
            "title": page_slug.replace("_", " ").title(),
            "page_type": page_slug if page_slug in ["home", "about", "contact", "terms", "privacy", "cookie", "404"] else "custom",
            "sections": sections_data,
            "seo": {
                "title": f"{body.name} | {page_slug.title()}",
                "description": "",
                "og_image": "",
                "canonical": "",
            },
        }
        await pages_coll.insert_one(page_doc)
        page_doc.pop("_id", None)

    return {"site": site_doc, "message": "Site created successfully"}


# ─── Get site ─────────────────────────────────────────────────────────────────

@router.get("/{site_id}")
async def get_site(site_id: str, request: Request,
                   current_user: dict = Depends(get_current_user_db)):
    db = get_db(request)
    is_demo = current_user["role"] == "demo_user"
    coll = db.demo_sites if is_demo else db.sites

    site = await coll.find_one({"id": site_id, "user_id": current_user["id"]}, {"_id": 0})
    if not site and not is_demo:
        site = await db.demo_sites.find_one({"id": site_id}, {"_id": 0})

    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return {"site": site}


# ─── Update site ──────────────────────────────────────────────────────────────

@router.put("/{site_id}")
async def update_site(site_id: str, body: SiteUpdate, request: Request,
                      current_user: dict = Depends(get_current_user_db)):
    db = get_db(request)
    is_demo = current_user["role"] == "demo_user"
    coll = db.demo_sites if is_demo else db.sites

    site = await coll.find_one({"id": site_id, "user_id": current_user["id"]}, {"_id": 0})
    if not site and not is_demo:
        site = await db.demo_sites.find_one({"id": site_id}, {"_id": 0})
        if site:
            coll = db.demo_sites

    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    update_data = body.model_dump(exclude_none=True)
    if "subdomain" in update_data and update_data["subdomain"]:
        new_sub = re.sub(r'[^a-z0-9-]', '', update_data["subdomain"].strip().lower()).strip('-')
        if not new_sub:
            raise HTTPException(status_code=400, detail="Invalid subdomain format")
        existing_sub = await coll.find_one({"subdomain": new_sub, "id": {"$ne": site_id}}, {"_id": 0})
        if existing_sub:
            raise HTTPException(status_code=400, detail="Subdomain already taken by another site")
        update_data["subdomain"] = new_sub

    if "custom_domain" in update_data and update_data["custom_domain"]:
        if not is_demo:
            limits = await get_user_subscription(db, current_user["id"])
            if not limits.get("custom_domain", False):
                raise HTTPException(status_code=403, detail="Custom domains require Starter or Pro plan")

    if "settings" in update_data:
        update_data["settings"] = update_data["settings"]  # Already a dict via pydantic
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    await coll.update_one({"id": site_id}, {"$set": update_data})
    return {"message": "Site updated"}


# ─── Delete site ──────────────────────────────────────────────────────────────

@router.delete("/{site_id}")
async def delete_site(site_id: str, request: Request,
                      current_user: dict = Depends(get_current_user_db)):
    db = get_db(request)
    is_demo = current_user["role"] == "demo_user"
    sites_coll = db.demo_sites if is_demo else db.sites
    pages_coll = db.demo_pages if is_demo else db.pages

    site = await sites_coll.find_one({"id": site_id, "user_id": current_user["id"]}, {"_id": 0})
    if not site and not is_demo:
        site = await db.demo_sites.find_one({"id": site_id}, {"_id": 0})
        if site:
            sites_coll = db.demo_sites
            pages_coll = db.demo_pages

    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    result = await sites_coll.delete_one({"id": site_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Site not found")
    await pages_coll.delete_many({"site_id": site_id})
    return {"message": "Site deleted"}


# ─── Version history ──────────────────────────────────────────────────────────

@router.get("/{site_id}/versions")
async def list_versions(site_id: str, request: Request,
                        current_user: dict = Depends(get_current_user_db)):
    db = get_db(request)
    versions = await db.site_versions.find(
        {"site_id": site_id}, {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    return {"versions": versions}


@router.post("/{site_id}/versions")
async def save_version(site_id: str, request: Request,
                       current_user: dict = Depends(get_current_user_db)):
    db = get_db(request)
    is_demo = current_user["role"] == "demo_user"
    pages_coll = db.demo_pages if is_demo else db.pages
    pages = await pages_coll.find({"site_id": site_id}, {"_id": 0}).to_list(50)

    version = {
        "id": str(uuid.uuid4()),
        "site_id": site_id,
        "pages_snapshot": pages,
        "label": f"Auto-save {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.site_versions.insert_one(version)

    # Keep only last 10
    all_versions = await db.site_versions.find(
        {"site_id": site_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    if len(all_versions) > 10:
        for v in all_versions[10:]:
            await db.site_versions.delete_one({"id": v["id"]})
    return {"message": "Version saved", "version_id": version["id"]}


# ─── Unlock Social Link/Integrations ──────────────────────────────────────────

@router.post("/{site_id}/unlock-social")
async def unlock_social(site_id: str, body: dict, request: Request,
                        current_user: dict = Depends(get_current_user_db)):
    db = get_db(request)
    is_demo = current_user["role"] == "demo_user"
    coll = db.demo_sites if is_demo else db.sites

    site = await coll.find_one({"id": site_id, "user_id": current_user["id"]}, {"_id": 0})
    if not site and not is_demo:
        site = await db.demo_sites.find_one({"id": site_id}, {"_id": 0})
        if site:
            coll = db.demo_sites

    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    feature = body.get("feature") # "whatsapp", "instagram", "facebook", "youtube", "linkedin", "github", "custom", or "all"
    if not feature:
        raise HTTPException(status_code=400, detail="Feature parameter required")

    settings = site.get("settings", {})
    unlocked = settings.get("unlocked_socials", [])
    if feature == "all":
        unlocked = ["whatsapp", "instagram", "facebook", "youtube", "linkedin", "github", "custom"]
    else:
        if feature not in unlocked:
            unlocked.append(feature)

    await coll.update_one(
        {"id": site_id},
        {"$set": {"settings.unlocked_socials": unlocked}}
    )
    return {"success": True, "unlocked_socials": unlocked, "message": f"Successfully purchased {feature}"}

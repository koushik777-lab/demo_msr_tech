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

    # 100% Accurate Variant Theme Map (Matches TemplatePicker)
    VARIANT_THEME_MAP = {
        "medical": {
            "modern": {"primary": "#0d9488", "secondary": "#0f172a", "accent": "#14b8a6", "font_heading": "Inter", "font_body": "Inter"},
            "bold": {"primary": "#0284c7", "secondary": "#0f172a", "accent": "#38bdf8", "font_heading": "Outfit", "font_body": "Inter"},
            "classic": {"primary": "#15803d", "secondary": "#166534", "accent": "#22c55e", "font_heading": "Merriweather", "font_body": "Inter"},
            "luxury": {"primary": "#d97706", "secondary": "#1c1917", "accent": "#fcd34d", "font_heading": "Playfair Display", "font_body": "Inter"},
            "minimal": {"primary": "#475569", "secondary": "#0f172a", "accent": "#64748b", "font_heading": "Inter", "font_body": "Inter"},
            "vibrant": {"primary": "#7c3aed", "secondary": "#1e1b4b", "accent": "#a78bfa", "font_heading": "Outfit", "font_body": "Inter"},
        },
        "restaurant": {
            "modern": {"primary": "#ea580c", "secondary": "#1c1917", "accent": "#fb923c", "font_heading": "Inter", "font_body": "Inter"},
            "bold": {"primary": "#dc2626", "secondary": "#1a0000", "accent": "#ef4444", "font_heading": "Outfit", "font_body": "Inter"},
            "classic": {"primary": "#92400e", "secondary": "#292524", "accent": "#b45309", "font_heading": "Playfair Display", "font_body": "Inter"},
            "luxury": {"primary": "#ca8a04", "secondary": "#0c0a09", "accent": "#fcd34d", "font_heading": "Cormorant Garamond", "font_body": "Inter"},
            "minimal": {"primary": "#059669", "secondary": "#064e3b", "accent": "#10b981", "font_heading": "DM Sans", "font_body": "Inter"},
            "vibrant": {"primary": "#d946ef", "secondary": "#1e1b4b", "accent": "#e879f9", "font_heading": "Poppins", "font_body": "Inter"},
        },
        "construction": {
            "modern": {"primary": "#ea580c", "secondary": "#111827", "accent": "#fb923c", "font_heading": "Outfit", "font_body": "Inter"},
            "bold": {"primary": "#eab308", "secondary": "#0f172a", "accent": "#facc15", "font_heading": "Barlow Condensed", "font_body": "Inter"},
            "classic": {"primary": "#1d4ed8", "secondary": "#0f172a", "accent": "#2563eb", "font_heading": "Inter", "font_body": "Inter"},
            "luxury": {"primary": "#d97706", "secondary": "#1c1917", "accent": "#fbbf24", "font_heading": "Playfair Display", "font_body": "Inter"},
            "minimal": {"primary": "#374151", "secondary": "#111827", "accent": "#6b7280", "font_heading": "Inter", "font_body": "Inter"},
            "vibrant": {"primary": "#7c3aed", "secondary": "#1e1b4b", "accent": "#818cf8", "font_heading": "Space Grotesk", "font_body": "Inter"},
        },
        "ecommerce": {
            "modern": {"primary": "#7c3aed", "secondary": "#1e1b4b", "accent": "#8b5cf6", "font_heading": "Inter", "font_body": "Inter"},
            "bold": {"primary": "#ef4444", "secondary": "#000000", "accent": "#f87171", "font_heading": "Space Grotesk", "font_body": "Inter"},
            "classic": {"primary": "#be185d", "secondary": "#4c0519", "accent": "#ec4899", "font_heading": "Playfair Display", "font_body": "Inter"},
            "luxury": {"primary": "#ca8a04", "secondary": "#0c0a09", "accent": "#fbbf24", "font_heading": "Cormorant Garamond", "font_body": "Inter"},
            "minimal": {"primary": "#111827", "secondary": "#0f172a", "accent": "#6b7280", "font_heading": "DM Sans", "font_body": "Inter"},
            "vibrant": {"primary": "#06b6d4", "secondary": "#042f2e", "accent": "#22d3ee", "font_heading": "Outfit", "font_body": "Inter"},
        },
        "fitness": {
            "modern": {"primary": "#16a34a", "secondary": "#052e16", "accent": "#22c55e", "font_heading": "Outfit", "font_body": "Inter"},
            "bold": {"primary": "#dc2626", "secondary": "#0a0a0a", "accent": "#ef4444", "font_heading": "Barlow Condensed", "font_body": "Inter"},
            "classic": {"primary": "#1d4ed8", "secondary": "#0f172a", "accent": "#3b82f6", "font_heading": "Inter", "font_body": "Inter"},
            "luxury": {"primary": "#d97706", "secondary": "#1c1917", "accent": "#fbbf24", "font_heading": "Playfair Display", "font_body": "Inter"},
            "minimal": {"primary": "#0891b2", "secondary": "#042f2e", "accent": "#06b6d4", "font_heading": "DM Sans", "font_body": "Inter"},
            "vibrant": {"primary": "#a855f7", "secondary": "#0f0520", "accent": "#d946ef", "font_heading": "Outfit", "font_body": "Inter"},
        },
        "real_estate": {
            "modern": {"primary": "#1d4ed8", "secondary": "#0f172a", "accent": "#3b82f6", "font_heading": "Inter", "font_body": "Inter"},
            "bold": {"primary": "#f59e0b", "secondary": "#111827", "accent": "#fbbf24", "font_heading": "Space Grotesk", "font_body": "Inter"},
            "classic": {"primary": "#6d28d9", "secondary": "#1e1b4b", "accent": "#7c3aed", "font_heading": "Merriweather", "font_body": "Inter"},
            "luxury": {"primary": "#ca8a04", "secondary": "#0a0800", "accent": "#fbbf24", "font_heading": "Cormorant Garamond", "font_body": "Inter"},
            "minimal": {"primary": "#059669", "secondary": "#064e3b", "accent": "#10b981", "font_heading": "DM Sans", "font_body": "Inter"},
            "vibrant": {"primary": "#0891b2", "secondary": "#042f2e", "accent": "#06b6d4", "font_heading": "Outfit", "font_body": "Inter"},
        },
        "education": {
            "modern": {"primary": "#4338ca", "secondary": "#1e1b4b", "accent": "#6366f1", "font_heading": "Inter", "font_body": "Inter"},
            "bold": {"primary": "#dc2626", "secondary": "#0f172a", "accent": "#ef4444", "font_heading": "Outfit", "font_body": "Inter"},
            "classic": {"primary": "#92400e", "secondary": "#451a03", "accent": "#b45309", "font_heading": "Merriweather", "font_body": "Inter"},
            "luxury": {"primary": "#0369a1", "secondary": "#082f49", "accent": "#38bdf8", "font_heading": "Playfair Display", "font_body": "Inter"},
            "minimal": {"primary": "#a21caf", "secondary": "#4c0519", "accent": "#d946ef", "font_heading": "Nunito", "font_body": "Inter"},
            "vibrant": {"primary": "#059669", "secondary": "#020d09", "accent": "#10b981", "font_heading": "Space Grotesk", "font_body": "Inter"},
        },
        "salon": {
            "modern": {"primary": "#db2777", "secondary": "#4c0519", "accent": "#ec4899", "font_heading": "Outfit", "font_body": "Inter"},
            "bold": {"primary": "#dc2626", "secondary": "#0f172a", "accent": "#ef4444", "font_heading": "Space Grotesk", "font_body": "Inter"},
            "classic": {"primary": "#92400e", "secondary": "#451a03", "accent": "#b45309", "font_heading": "Cormorant Garamond", "font_body": "Inter"},
            "luxury": {"primary": "#be185d", "secondary": "#0a0008", "accent": "#ec4899", "font_heading": "Playfair Display", "font_body": "Inter"},
            "minimal": {"primary": "#0d9488", "secondary": "#042f2e", "accent": "#14b8a6", "font_heading": "DM Sans", "font_body": "Inter"},
            "vibrant": {"primary": "#d946ef", "secondary": "#2e0050", "accent": "#e879f9", "font_heading": "Poppins", "font_body": "Inter"},
        },
        "legal_services": {
            "modern": {"primary": "#1d4ed8", "secondary": "#0f172a", "accent": "#3b82f6", "font_heading": "Inter", "font_body": "Inter"},
            "bold": {"primary": "#4b5563", "secondary": "#030712", "accent": "#9ca3af", "font_heading": "Barlow Condensed", "font_body": "Inter"},
            "classic": {"primary": "#78350f", "secondary": "#451a03", "accent": "#b45309", "font_heading": "Playfair Display", "font_body": "Inter"},
            "luxury": {"primary": "#ca8a04", "secondary": "#0a0800", "accent": "#fbbf24", "font_heading": "Cormorant Garamond", "font_body": "Inter"},
            "minimal": {"primary": "#059669", "secondary": "#064e3b", "accent": "#10b981", "font_heading": "DM Sans", "font_body": "Inter"},
            "vibrant": {"primary": "#7c3aed", "secondary": "#1e1b4b", "accent": "#8b5cf6", "font_heading": "Space Grotesk", "font_body": "Inter"},
        },
        "agriculture": {
            "modern": {"primary": "#15803d", "secondary": "#052e16", "accent": "#22c55e", "font_heading": "Inter", "font_body": "Inter"},
            "bold": {"primary": "#eab308", "secondary": "#1a1400", "accent": "#facc15", "font_heading": "Barlow Condensed", "font_body": "Inter"},
            "classic": {"primary": "#78350f", "secondary": "#451a03", "accent": "#b45309", "font_heading": "Merriweather", "font_body": "Inter"},
            "luxury": {"primary": "#16a34a", "secondary": "#052e16", "accent": "#4ade80", "font_heading": "Playfair Display", "font_body": "Inter"},
            "minimal": {"primary": "#0891b2", "secondary": "#042f2e", "accent": "#0ea5e9", "font_heading": "DM Sans", "font_body": "Inter"},
            "vibrant": {"primary": "#ea580c", "secondary": "#431407", "accent": "#fb923c", "font_heading": "Poppins", "font_body": "Inter"},
        },
        "hotel": {
            "modern": {"primary": "#0369a1", "secondary": "#082f49", "accent": "#0284c7", "font_heading": "Inter", "font_body": "Inter"},
            "bold": {"primary": "#f59e0b", "secondary": "#030712", "accent": "#fbbf24", "font_heading": "Space Grotesk", "font_body": "Inter"},
            "classic": {"primary": "#92400e", "secondary": "#451a03", "accent": "#d97706", "font_heading": "Playfair Display", "font_body": "Inter"},
            "luxury": {"primary": "#ca8a04", "secondary": "#0a0800", "accent": "#fbbf24", "font_heading": "Cormorant Garamond", "font_body": "Inter"},
            "minimal": {"primary": "#0d9488", "secondary": "#042f2e", "accent": "#14b8a6", "font_heading": "DM Sans", "font_body": "Inter"},
            "vibrant": {"primary": "#06b6d4", "secondary": "#042f2e", "accent": "#22d3ee", "font_heading": "Outfit", "font_body": "Inter"},
        },
        "hardware": {
            "modern": {"primary": "#dc2626", "secondary": "#1f2937", "accent": "#ef4444", "font_heading": "Outfit", "font_body": "Inter"},
            "bold": {"primary": "#eab308", "secondary": "#0f0f00", "accent": "#facc15", "font_heading": "Barlow Condensed", "font_body": "Inter"},
            "classic": {"primary": "#1d4ed8", "secondary": "#0f172a", "accent": "#3b82f6", "font_heading": "Inter", "font_body": "Inter"},
            "luxury": {"primary": "#d97706", "secondary": "#1c1917", "accent": "#fbbf24", "font_heading": "Playfair Display", "font_body": "Inter"},
            "minimal": {"primary": "#374151", "secondary": "#111827", "accent": "#6b7280", "font_heading": "DM Sans", "font_body": "Inter"},
            "vibrant": {"primary": "#0891b2", "secondary": "#042f2e", "accent": "#22d3ee", "font_heading": "Space Grotesk", "font_body": "Inter"},
        },
        "clinic": {
            "modern": {"primary": "#0d9488", "secondary": "#042f2e", "accent": "#14b8a6", "font_heading": "Inter", "font_body": "Inter"},
            "bold": {"primary": "#0284c7", "secondary": "#0f172a", "accent": "#38bdf8", "font_heading": "Outfit", "font_body": "Inter"},
            "classic": {"primary": "#15803d", "secondary": "#052e16", "accent": "#22c55e", "font_heading": "Merriweather", "font_body": "Inter"},
            "luxury": {"primary": "#d97706", "secondary": "#1c1917", "accent": "#fbbf24", "font_heading": "Playfair Display", "font_body": "Inter"},
            "minimal": {"primary": "#475569", "secondary": "#0f172a", "accent": "#64748b", "font_heading": "DM Sans", "font_body": "Inter"},
            "vibrant": {"primary": "#7c3aed", "secondary": "#1e1b4b", "accent": "#a78bfa", "font_heading": "Poppins", "font_body": "Inter"},
        },
    }

    sector_themes = VARIANT_THEME_MAP.get(body.sector, {})
    variant_theme = sector_themes.get(body.variant, {})

    theme = template_data.get("theme", {})
    primary_color = variant_theme.get("primary") or theme.get("primary", "#6366f1")
    secondary_color = variant_theme.get("secondary") or theme.get("secondary", "#1e293b")
    accent_color = variant_theme.get("accent") or theme.get("accent", "#f59e0b")
    font_heading = variant_theme.get("font_heading") or theme.get("font_heading", "Outfit")
    font_body = variant_theme.get("font_body") or theme.get("font_body", "Inter")

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
                "primary": primary_color,
                "secondary": secondary_color,
                "accent": accent_color,
            },
            font_heading=font_heading,
            font_body=font_body,
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

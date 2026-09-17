from fastapi import APIRouter, HTTPException
import os, json

router = APIRouter(prefix="/api/templates", tags=["templates"])

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")

SECTOR_META = {
    "construction": {"icon": "🏗️", "color": "#F97316", "description": "Contractors, builders & renovation firms"},
    "medical": {"icon": "🏥", "color": "#0D9488", "description": "Clinics, hospitals & healthcare providers"},
    "salon": {"icon": "💇", "color": "#EC4899", "description": "Hair salons, spas & beauty studios"},
    "hardware": {"icon": "🔧", "color": "#DC2626", "description": "Hardware stores & tool suppliers"},
    "ecommerce": {"icon": "🛍️", "color": "#7C3AED", "description": "Online stores & retail shops"},
    "restaurant": {"icon": "🍽️", "color": "#B91C1C", "description": "Restaurants, cafés & food delivery"},
    "real_estate": {"icon": "🏠", "color": "#1D4ED8", "description": "Real estate agencies & property listings"},
    "education": {"icon": "🎓", "color": "#4338CA", "description": "Schools, coaching & online courses"},
    "fitness": {"icon": "💪", "color": "#16A34A", "description": "Gyms, trainers & wellness studios"},
    "legal_services": {"icon": "⚖️", "color": "#92400E", "description": "Law firms & legal consultants"},
    "agriculture": {"icon": "🚜", "color": "#15803D", "description": "Farming, organic produce & agricultural services"},
    "hotel": {"icon": "🏨", "color": "#0369A1", "description": "Hotels, resorts, guesthouses & hospitality"},
    "clinic": {"icon": "🏥", "color": "#0F766E", "description": "Medical clinics, dental clinics & health centers"},
}


@router.get("")
async def list_templates():
    sectors = []
    for sector_id, meta in SECTOR_META.items():
        template_path = os.path.join(TEMPLATES_DIR, f"{sector_id}.json")
        variants = ["modern", "bold", "classic"]
        if os.path.exists(template_path):
            with open(template_path, encoding="utf-8") as f:
                data = json.load(f)
                variants = data.get("variants", variants)
        sectors.append({
            "id": sector_id,
            "display_name": sector_id.replace("_", " ").title(),
            "icon": meta["icon"],
            "color": meta["color"],
            "description": meta["description"],
            "variants": variants,
        })
    return {"sectors": sectors}


@router.get("/{sector}")
async def get_sector_template(sector: str):
    template_path = os.path.join(TEMPLATES_DIR, f"{sector}.json")
    if not os.path.exists(template_path):
        raise HTTPException(status_code=404, detail=f"Template '{sector}' not found")
    with open(template_path, encoding="utf-8") as f:
        data = json.load(f)
    return {"template": data}


@router.get("/{sector}/preview/{variant}")
async def get_variant_preview(sector: str, variant: str):
    template_path = os.path.join(TEMPLATES_DIR, f"{sector}.json")
    if not os.path.exists(template_path):
        raise HTTPException(status_code=404, detail="Template not found")
    with open(template_path, encoding="utf-8") as f:
        data = json.load(f)
    variant_data = next((v for v in data.get("variant_themes", []) if v.get("id") == variant), None)
    return {"sector": sector, "variant": variant, "theme": variant_data or data.get("theme", {})}

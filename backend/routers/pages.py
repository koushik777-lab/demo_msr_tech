from fastapi import APIRouter, HTTPException, Depends, Request
from datetime import datetime, timezone

from models.site import PageUpdate
from middleware.auth import get_current_user_db

router = APIRouter(prefix="/api/sites", tags=["pages"])


def get_db(request: Request):
    return request.app.state.db


async def ensure_legal_pages(site_id: str, pages: list, pages_coll) -> list:
    existing_slugs = {p["slug"] for p in pages}
    legal_defs = {
        "terms": {
            "title": "Terms & Conditions",
            "heading": "Terms & Conditions",
            "body": "Welcome to our website. By browsing this website, you agree to comply with our terms and conditions."
        },
        "privacy": {
            "title": "Privacy Policy",
            "heading": "Privacy Policy",
            "body": "We value your privacy. We do not sell or share your personal data with third parties."
        },
        "cookie": {
            "title": "Cookie Policy",
            "heading": "Cookie Policy",
            "body": "We use cookies to improve your experience on our website."
        }
    }
    
    import uuid
    for slug, info in legal_defs.items():
        if slug not in existing_slugs:
            new_page = {
                "id": str(uuid.uuid4()),
                "site_id": site_id,
                "slug": slug,
                "title": info["title"],
                "page_type": slug,
                "sections": [{
                    "id": f"{slug}-body",
                    "type": "about",
                    "order": 1,
                    "visible": True,
                    "content": {
                        "heading": info["heading"],
                        "body": info["body"]
                    }
                }],
                "seo": {
                    "title": info["title"],
                    "description": f"Read our {info['title']}.",
                    "og_image": "",
                    "canonical": ""
                }
            }
            await pages_coll.insert_one(new_page)
            new_page.pop("_id", None)
            pages.append(new_page)
            
    return pages


@router.get("/{site_id}/pages")
async def list_pages(site_id: str, request: Request,
                     current_user: dict = Depends(get_current_user_db)):
    db = get_db(request)
    is_demo = current_user["role"] == "demo_user"
    pages_coll = db.demo_pages if is_demo else db.pages
    pages = await pages_coll.find({"site_id": site_id}, {"_id": 0}).to_list(50)
    if not pages and not is_demo:
        pages = await db.demo_pages.find({"site_id": site_id}, {"_id": 0}).to_list(50)
        if pages:
            pages_coll = db.demo_pages
    pages = await ensure_legal_pages(site_id, pages, pages_coll)
    return {"pages": pages}


@router.get("/{site_id}/pages/{page_id}")
async def get_page(site_id: str, page_id: str, request: Request,
                   current_user: dict = Depends(get_current_user_db)):
    db = get_db(request)
    is_demo = current_user["role"] == "demo_user"
    pages_coll = db.demo_pages if is_demo else db.pages
    page = await pages_coll.find_one({"id": page_id, "site_id": site_id}, {"_id": 0})
    if not page and not is_demo:
        page = await db.demo_pages.find_one({"id": page_id, "site_id": site_id}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"page": page}


@router.put("/{site_id}/pages/{page_id}")
async def update_page(site_id: str, page_id: str, body: PageUpdate,
                      request: Request, current_user: dict = Depends(get_current_user_db)):
    db = get_db(request)
    is_demo = current_user["role"] == "demo_user"
    pages_coll = db.demo_pages if is_demo else db.pages

    update_data = body.model_dump(exclude_none=True)
    if "sections" in update_data:
        # Serialize section objects
        sections = update_data["sections"]
        if sections and hasattr(sections[0], "model_dump"):
            update_data["sections"] = [s.model_dump() for s in sections]

    page = await pages_coll.find_one({"id": page_id, "site_id": site_id}, {"_id": 0})
    if not page and not is_demo:
        page = await db.demo_pages.find_one({"id": page_id, "site_id": site_id}, {"_id": 0})
        if page:
            pages_coll = db.demo_pages

    result = await pages_coll.update_one({"id": page_id, "site_id": site_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"message": "Page updated"}


@router.post("/{site_id}/pages/{page_id}/sections/reorder")
async def reorder_sections(site_id: str, page_id: str, request: Request,
                           current_user: dict = Depends(get_current_user_db)):
    """Receives ordered array of section IDs and updates order field."""
    db = get_db(request)
    is_demo = current_user["role"] == "demo_user"
    pages_coll = db.demo_pages if is_demo else db.pages

    body = await request.json()
    ordered_ids = body.get("section_ids", [])

    page = await pages_coll.find_one({"id": page_id, "site_id": site_id}, {"_id": 0})
    if not page and not is_demo:
        page = await db.demo_pages.find_one({"id": page_id, "site_id": site_id}, {"_id": 0})
        if page:
            pages_coll = db.demo_pages

    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    sections = page.get("sections", [])
    id_to_section = {s["id"]: s for s in sections}
    reordered = []
    for i, sec_id in enumerate(ordered_ids):
        if sec_id in id_to_section:
            s = id_to_section[sec_id]
            s["order"] = i
            reordered.append(s)

    await pages_coll.update_one({"id": page_id}, {"$set": {"sections": reordered}})
    return {"message": "Sections reordered"}

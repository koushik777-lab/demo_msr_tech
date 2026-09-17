from fastapi import APIRouter, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
import logging

from models.lead import LeadCreate, LeadInDB

router = APIRouter(prefix="/api/leads", tags=["leads"])
logger = logging.getLogger(__name__)


def get_db(request: Request):
    return request.app.state.db


@router.post("", status_code=201)
async def submit_lead(lead_in: LeadCreate, request: Request):
    """Save a customer contact inquiry / lead in MongoDB."""
    db = get_db(request)
    try:
        lead_obj = LeadInDB(
            name=lead_in.name.strip(),
            email=lead_in.email.strip().lower(),
            phone=lead_in.phone.strip() if lead_in.phone else "",
            company=lead_in.company.strip() if lead_in.company else "",
            service=lead_in.service.strip() if lead_in.service else "",
            message=lead_in.message.strip(),
            source=lead_in.source or "marketing_contact_form",
            status="new",
            created_at=datetime.now(timezone.utc),
        )
        doc = lead_obj.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        
        result = await db.leads.insert_one(doc)
        logger.info(f"New lead received from {lead_obj.email} (ID: {lead_obj.id})")
        
        return {
            "success": True,
            "message": "Thank you! Your inquiry has been submitted successfully. Our team will contact you within 24 hours.",
            "lead_id": lead_obj.id,
        }
    except Exception as e:
        logger.error(f"Error saving lead: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to record your inquiry. Please try again or reach out directly via phone.")


@router.get("")
async def list_leads(request: Request, limit: int = 50):
    """Retrieve recent inquiries (for admin review)."""
    db = get_db(request)
    leads = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return {"leads": leads, "total": len(leads)}

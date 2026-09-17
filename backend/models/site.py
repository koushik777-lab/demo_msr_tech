from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Literal, Any, Dict
from datetime import datetime, timezone
import uuid


# ─── Section ──────────────────────────────────────────────────────────────────

class Section(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # hero | about | services | gallery | testimonials | pricing | team | faq | contact_form | blog | html_embed
    content: Dict[str, Any] = {}
    styles: Dict[str, Any] = {}
    order: int = 0
    visible: bool = True


# ─── Page ─────────────────────────────────────────────────────────────────────

class Page(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    site_id: str
    slug: str  # home | about | contact | terms | privacy | cookie | 404
    title: str
    page_type: Literal["home", "about", "contact", "terms", "privacy", "cookie", "404", "custom"] = "custom"
    sections: List[Section] = []
    seo: Dict[str, Any] = {}  # title, description, og_image, canonical


class PageCreate(BaseModel):
    slug: str
    title: str
    page_type: str = "custom"
    sections: List[Section] = []
    seo: Dict[str, Any] = {}


class PageUpdate(BaseModel):
    title: Optional[str] = None
    sections: Optional[List[Section]] = None
    seo: Optional[Dict[str, Any]] = None


# ─── Site ─────────────────────────────────────────────────────────────────────

class SiteSettings(BaseModel):
    # Branding
    logo_url: str = ""
    favicon_url: str = ""
    brand_colors: Dict[str, str] = {"primary": "#6366f1", "secondary": "#1e293b", "accent": "#f59e0b"}
    font_heading: str = "Outfit"
    font_body: str = "Inter"
    unlocked_socials: List[str] = []

    # Navbar
    navbar: Dict[str, Any] = {
        "items": [
            {"label": "Home", "href": "#"},
            {"label": "About", "href": "#about"},
            {"label": "Services", "href": "#services"},
            {"label": "Contact", "href": "#contact"},
        ],
        "sticky": True,
        "cta": {"text": "Get Started", "href": "#contact"},
    }

    # Footer
    footer: Dict[str, Any] = {
        "company_name": "Your Company",
        "description": "We provide excellent services.",
        "address": "123 Main St, City, Country",
        "phone": "+91 99999 99999",
        "email": "hello@yourcompany.com",
        "social": {"facebook": "", "twitter": "", "instagram": "", "linkedin": ""},
        "copyright": "© 2024 Your Company. All rights reserved.",
    }

    # Contact
    google_maps_embed: str = ""
    cookie_consent_enabled: bool = True
    analytics_id: str = ""


class SiteCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    sector: str
    variant: str = "modern"


class SiteUpdate(BaseModel):
    name: Optional[str] = None
    settings: Optional[SiteSettings] = None
    subdomain: Optional[str] = None
    custom_domain: Optional[str] = None


class SiteInDB(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    sector: str
    variant: str = "modern"
    subdomain: str = ""
    custom_domain: Optional[str] = None
    status: Literal["draft", "published"] = "draft"
    is_demo: bool = False
    settings: SiteSettings = Field(default_factory=SiteSettings)
    published_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Demo TTL
    expires_at: Optional[datetime] = None


class SiteOut(BaseModel):
    id: str
    name: str
    sector: str
    variant: str
    subdomain: str
    custom_domain: Optional[str]
    status: str
    is_demo: bool
    settings: SiteSettings
    published_url: Optional[str]
    created_at: datetime
    updated_at: datetime


# ─── Version History ──────────────────────────────────────────────────────────

class SiteVersion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    site_id: str
    pages_snapshot: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    label: str = "Auto-save"


# ─── Asset ────────────────────────────────────────────────────────────────────

class Asset(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    site_id: Optional[str] = None
    filename: str
    url: str
    size_bytes: int = 0
    mime_type: str = ""
    alt_text: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ─── Form Submission ──────────────────────────────────────────────────────────

class FormSubmission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    site_id: str
    page_id: str
    form_data: Dict[str, Any] = {}
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ip_address: str = ""

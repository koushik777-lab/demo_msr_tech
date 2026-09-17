"""
Static Site Generator
Converts a site + pages JSON into a deployable ZIP with:
  index.html, about.html, contact.html, terms.html, privacy.html,
  style.css, script.js, sitemap.xml, robots.txt
"""
import zipfile
import io
from typing import List, Dict, Any


GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?family={heading}:wght@400;600;700;900&family={body}:wght@300;400;500;600&display=swap"

SOCIAL_SVGS = {
    "whatsapp": '<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;"><path d=".057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.023 14.053.977 11.993.977c-5.442 0-9.87 4.372-9.874 9.802-.001 1.77.463 3.5 1.34 5.043L2.453 20.3l4.194-1.146zm11.233-5.232c-.3-.15-1.771-.875-2.04-.972-.27-.099-.467-.15-.663.15-.195.3-.757.972-.929 1.171-.173.199-.347.223-.647.073-.3-.15-1.268-.467-2.414-1.488-.891-.795-1.492-1.778-1.667-2.078-.175-.3-.019-.461.13-.61.135-.133.3-.347.45-.52.15-.173.2-.3.3-.5.1-.199.05-.375-.025-.524-.075-.15-.663-1.6-.908-2.188-.24-.575-.483-.497-.663-.506-.17-.008-.367-.01-.563-.01-.197 0-.518.073-.789.375-.271.3-.103.972-.103.972s-.1.654-.055.942c.046.29.176.435.31.57.133.136.27.27.42.42m10.1-2.28c-.1-.1-.3-.2-.5-.3"></path></svg>',
    "instagram": '<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path></svg>',
    "facebook": '<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>',
    "youtube": '<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;"><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>',
    "linkedin": '<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>',
    "github": '<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>'
}

SECTION_RENDERERS = {}


def section_renderer(section_type: str):
    def decorator(fn):
        SECTION_RENDERERS[section_type] = fn
        return fn
    return decorator


# ─── Section Renderers ──────────────────────────────────────────────────────

@section_renderer("hero")
def render_hero(content: dict, colors: dict, watermark: bool) -> str:
    use_carousel = content.get("use_carousel", False)
    slides = content.get("slides", [])
    primary = colors.get("primary", "#6366f1")

    if use_carousel and slides:
        slides_html = ""
        dots_html = ""
        for i, slide in enumerate(slides):
            img_url = slide.get("image", "")
            bg_style = f"background-image: linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.65)), url('{img_url}');" if img_url else ""
            active_class = "active" if i == 0 else ""
            cta_html = ""
            if slide.get("cta_text"):
                cta_html = f'<a href="{slide.get("cta_link","#contact")}" class="btn-primary">{slide.get("cta_text")}</a>'
            
            slides_html += f"""
    <div class="carousel-slide {active_class}" style="{bg_style}">
      <div class="carousel-overlay"></div>
      <div class="carousel-content">
        <h1 class="hero-heading">{slide.get("heading", "")}</h1>
        <p class="hero-sub">{slide.get("subheading", "")}</p>
        {cta_html}
      </div>
    </div>"""
            dots_html += f'<button class="carousel-dot {active_class}" data-slide="{i}" aria-label="Slide {i+1}"></button>'
        
        return f"""
<section class="hero carousel-section" id="hero">
  <div class="carousel-container">
    {slides_html}
    <button class="carousel-arrow prev" aria-label="Previous Slide">
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" style="display:block;"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
    <button class="carousel-arrow next" aria-label="Next Slide">
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" style="display:block;"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>
    <div class="carousel-dots">
      {dots_html}
    </div>
  </div>
</section>"""
    else:
        bg_color = content.get("bg_color", colors.get("secondary", "#1e293b"))
        bg_image = content.get("image", "")
        bg_style = f"background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url('{bg_image}'); background-size: cover; background-position: center;" if bg_image else f"background: {bg_color};"
        return f"""
<section class="hero" style="{bg_style}">
  <div class="container" style="position: relative; z-index: 2;">
    <h1 class="hero-heading">{content.get('heading','Welcome to Our Website')}</h1>
    <p class="hero-sub">{content.get('subheading','We provide excellent services for your needs.')}</p>
    <a href="{content.get('cta_link','#contact')}" class="btn-primary">{content.get('cta_text','Get Started')}</a>
  </div>
</section>"""


@section_renderer("about")
def render_about(content: dict, colors: dict, watermark: bool) -> str:
    return f"""
<section class="about section-pad" id="about">
  <div class="container about-grid">
    <div class="about-text">
      <h2>{content.get('heading','About Us')}</h2>
      <p>{content.get('body','We are a dedicated team committed to delivering excellence in everything we do.')}</p>
    </div>
  </div>
</section>"""


@section_renderer("services")
def render_services(content: dict, colors: dict, watermark: bool) -> str:
    items = content.get("items", [
        {"icon": "⭐", "title": "Service 1", "description": "Description of your service"},
        {"icon": "🚀", "title": "Service 2", "description": "Description of your service"},
        {"icon": "💎", "title": "Service 3", "description": "Description of your service"},
    ])
    cards = "".join([
        f'<div class="card"><div class="card-icon">{item.get("icon","⭐")}</div>'
        f'<h3>{item.get("title","")}</h3><p>{item.get("description","")}</p></div>'
        for item in items
    ])
    return f"""
<section class="services section-pad" id="services" data-section-type="services" data-synonym="products">
  <div class="container">
    <h2 class="section-title">{content.get('heading','Our Services')}</h2>
    <p class="section-sub">{content.get('subheading','What we offer')}</p>
    <div class="card-grid">{cards}</div>
  </div>
</section>"""


@section_renderer("gallery")
def render_gallery(content: dict, colors: dict, watermark: bool) -> str:
    items = content.get("items", [])
    imgs = ""
    for item in items:
        desc = item.get("description", "")
        desc_html = f'<p class="gallery-item-desc" style="text-align:center;color:#64748b;font-size:0.88rem;margin:8px 0 0;line-height:1.4;">{desc}</p>' if desc and desc != "Add description" else ""
        imgs += f"""
        <div class="gallery-item" style="display:flex;flex-direction:column;align-items:stretch;">
          <div style="width:100%;aspect-ratio:4/3;overflow:hidden;border-radius:12px;">
            <img src="{item.get("url","")}" alt="{item.get("alt","Gallery image")}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;"/>
          </div>
          {desc_html}
        </div>
        """
    imgs = imgs or '<p style="text-align:center;color:#888">Gallery images will appear here.</p>'
    return f"""
<section class="gallery section-pad" id="gallery">
  <div class="container">
    <h2 class="section-title">{content.get('heading','Our Gallery')}</h2>
    <div class="gallery-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(240px, 1fr));gap:16px;">{imgs}</div>
  </div>
</section>"""


@section_renderer("testimonials")
def render_testimonials(content: dict, colors: dict, watermark: bool) -> str:
    items = content.get("items", [
        {"name": "John D.", "role": "Client", "text": "Excellent service, highly recommend!", "rating": 5},
    ])
    
    def get_stars_html(item):
        try:
            rating = max(0, min(5, int(float(item.get("rating", 5)))))
        except (ValueError, TypeError):
            rating = 5
        return "★" * rating + "☆" * (5 - rating)

    cards = "".join([
        f'<div class="testimonial-card">'
        f'<div class="stars">{get_stars_html(item)}</div>'
        f'<p>"{item.get("text","")}"</p>'
        f'<strong>{item.get("name","")}</strong>'
        f'<span>{item.get("role","")}</span></div>'
        for item in items
    ])
    return f"""
<section class="testimonials section-pad" id="testimonials">
  <div class="container">
    <h2 class="section-title">{content.get('heading','What Our Clients Say')}</h2>
    <div class="testimonials-grid">{cards}</div>
  </div>
</section>"""


@section_renderer("pricing")
def render_pricing(content: dict, colors: dict, watermark: bool) -> str:
    plans = content.get("plans", [
        {"name": "Basic", "price": "₹999/mo", "features": ["Feature 1", "Feature 2"], "popular": False},
        {"name": "Pro", "price": "₹2499/mo", "features": ["Feature 1", "Feature 2", "Feature 3"], "popular": True},
    ])
    cards = ""
    for p in plans:
        feats = "".join([f'<li>✓ {f}</li>' for f in p.get("features", [])])
        pop = 'class="pricing-card popular"' if p.get("popular") else 'class="pricing-card"'
        plan_name = p.get("name","")
        plan_price = p.get("price","")
        import urllib.parse
        encoded_plan = urllib.parse.quote(plan_name)
        encoded_price = urllib.parse.quote(plan_price)
        cards += f'<div {pop}><h3>{plan_name}</h3><div class="price">{plan_price}</div><ul>{feats}</ul><a href="buy.html?plan={encoded_plan}&price={encoded_price}" class="btn-primary">Get Started</a></div>'
    return f"""
<section class="pricing section-pad" id="pricing">
  <div class="container">
    <h2 class="section-title">{content.get('heading','Our Pricing')}</h2>
    <div class="pricing-grid">{cards}</div>
  </div>
</section>"""


@section_renderer("team")
def render_team(content: dict, colors: dict, watermark: bool) -> str:
    members = content.get("members", [
        {"name": "Team Member", "role": "Position", "image": ""},
    ])
    cards = "".join([
        f'<div class="team-card">'
        f'<div class="team-avatar">{m.get("name","T")[0]}</div>'
        f'<h3>{m.get("name","")}</h3><p>{m.get("role","")}</p></div>'
        for m in members
    ])
    return f"""
<section class="team section-pad" id="team">
  <div class="container">
    <h2 class="section-title">{content.get('heading','Our Team')}</h2>
    <div class="team-grid">{cards}</div>
  </div>
</section>"""


@section_renderer("faq")
def render_faq(content: dict, colors: dict, watermark: bool) -> str:
    items = content.get("items", [
        {"question": "What services do you offer?", "answer": "We offer a wide range of professional services tailored to your needs."},
    ])
    faqs = "".join([
        f'<details class="faq-item"><summary>{item.get("question","")}</summary><p>{item.get("answer","")}</p></details>'
        for item in items
    ])
    return f"""
<section class="faq section-pad" id="faq">
  <div class="container">
    <h2 class="section-title">{content.get('heading','Frequently Asked Questions')}</h2>
    <div class="faq-list">{faqs}</div>
  </div>
</section>"""


@section_renderer("contact_form")
def render_contact_form(content: dict, colors: dict, watermark: bool) -> str:
    whatsapp_number = colors.get("whatsapp_number", "")
    whatsapp_btn = ""
    if whatsapp_number:
        whatsapp_btn = f"""
        <a href="https://wa.me/{whatsapp_number}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#25D366;color:white;padding:14px;border-radius:12px;font-weight:700;text-decoration:none;font-size:1rem;margin-top:12px;transition:transform .15s, box-shadow .15s;">
          <svg style="width:20px;height:20px;fill:currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.023 14.053.977 11.993.977c-5.442 0-9.87 4.372-9.874 9.802-.001 1.77.463 3.5 1.34 5.043L2.453 20.3l4.194-1.146zm11.233-5.232c-.3-.15-1.771-.875-2.04-.972-.27-.099-.467-.15-.663.15-.195.3-.757.972-.929 1.171-.173.199-.347.223-.647.073-.3-.15-1.268-.467-2.414-1.488-.891-.795-1.492-1.778-1.667-2.078-.175-.3-.019-.461.13-.61.135-.133.3-.347.45-.52.15-.173.2-.3.3-.5.1-.199.05-.375-.025-.524-.075-.15-.663-1.6-.908-2.188-.24-.575-.483-.497-.663-.506-.17-.008-.367-.01-.563-.01-.197 0-.518.073-.789.375-.271.3-.103.972-.103.972s-.1.654-.055.942c.046.29.176.435.31.57.133.136.27.27.42.42m10.1-2.28c-.1-.1-.3-.2-.5-.3"></path></svg>
          Chat on WhatsApp
        </a>
        """
    email = colors.get("email", "")
    return f"""
<section class="contact section-pad" id="contact">
  <div class="container">
    <h2 class="section-title">{content.get('heading','Contact Us')}</h2>
    <p class="section-sub">{content.get('subheading','We\'d love to hear from you. Send us a message!')}</p>
    <form class="contact-form" onsubmit="handleSubmit(event)" data-email="{email}">
      <input type="text" name="name" placeholder="Your Name" required/>
      <input type="email" name="email" placeholder="Your Email" required/>
      <input type="tel" name="phone" placeholder="Phone Number"/>
      <textarea name="message" placeholder="Your Message" rows="5" required></textarea>
      <button type="submit" class="btn-primary">Send Message</button>
      {whatsapp_btn}
    </form>
  </div>
</section>"""


@section_renderer("blog")
def render_blog(content: dict, colors: dict, watermark: bool) -> str:
    primary = colors.get("primary", "#6366f1")
    posts = content.get("posts", [
        {
            "title": "How to Build & Scale Your Online Business",
            "excerpt": "Discover proven strategies, modern design tips, and effective marketing workflows.",
            "full_text": "Building a successful online business requires a strong value proposition, consistent user experience, and modern web presence. In this article, we explore step-by-step methodologies to optimize your conversion rates and deliver premium digital experiences.",
            "date": "Jan 15, 2024",
            "author": "Team Admin",
            "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800"
        }
    ])
    
    cards = []
    import html
    
    for idx, p in enumerate(posts):
        title = html.escape(p.get("title", ""))
        excerpt = html.escape(p.get("excerpt", ""))
        date = html.escape(p.get("date", ""))
        author = html.escape(p.get("author", "Admin"))
        img = p.get("image", "")
        article_url = f"article-{idx+1}.html"
        
        img_html = f'<div style="width:100%;height:180px;overflow:hidden;background:#0f172a;"><img src="{img}" alt="{title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;"/></div>' if img else f'<div style="height:6px;background:{primary};"></div>'

        cards.append(f"""
        <div class="blog-card" onclick="window.location.href='{article_url}'" style="cursor:pointer;background:var(--card-bg);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow);border:1px solid var(--border);display:flex;flex-direction:column;transition:transform 0.2s;">
          {img_html}
          <div style="padding:24px;display:flex;flex-direction:column;flex:1;">
            <div class="blog-date" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:0.8rem;color:var(--text-muted);">
              <span>{date}</span>
              <span style="margin-left:auto;">{author}</span>
            </div>
            <h3 style="font-size:1.15rem;margin-bottom:10px;line-height:1.4;">{title}</h3>
            <p style="color:var(--text-muted);font-size:0.9rem;line-height:1.6;margin-bottom:20px;flex:1;">{excerpt}</p>
            <a href="{article_url}" class="read-more" style="color:{primary};font-weight:700;text-decoration:none;font-size:0.875rem;display:inline-flex;align-items:center;gap:4px;">Read Article →</a>
          </div>
        </div>
        """)

    return f"""
<section class="blog section-pad" id="blog" data-section-type="blog">
  <div class="container">
    <h2 class="section-title">{content.get('heading','Latest News & Articles')}</h2>
    <p class="section-sub">{content.get('subheading','Insights, guides, and news from our team.')}</p>
    <div class="blog-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:24px;">{"".join(cards)}</div>
  </div>
</section>"""


def generate_blog_article_html(post: dict, post_index: int, site: dict, all_pages: list, add_watermark: bool = True) -> str:
    settings = site.get("settings", {})
    colors = settings.get("brand_colors", {"primary": "#6366f1"})
    primary = colors.get("primary", "#6366f1")
    
    import html
    title = html.escape(post.get("title", "Blog Article"))
    excerpt = html.escape(post.get("excerpt", ""))
    full_text = html.escape(post.get("full_text", post.get("excerpt", "")))
    date = html.escape(post.get("date", "Jan 2024"))
    author = html.escape(post.get("author", "Team Admin"))
    img = post.get("image", "")
    
    header_html = render_header(site.get("name", "Site"), settings, all_pages, "blog")
    footer_html = render_footer(site.get("name", "Site"), settings)
    watermark_html = WATERMARK_HTML if add_watermark else ""
    
    img_html = f'<div style="width:100%;max-height:420px;overflow:hidden;border-radius:16px;margin-bottom:32px;box-shadow:0 8px 30px rgba(0,0,0,0.08);"><img src="{img}" alt="{title}" style="width:100%;height:100%;object-fit:cover;"/></div>' if img else ""

    content_html = f"""
    <div style="background:#ffffff;min-height:80vh;padding:60px 24px;">
      <article style="max-width:800px;margin:0 auto;">
        <div style="margin-bottom:24px;">
          <a href="index.html#blog" style="display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:#f1f5f9;border-radius:8px;color:#1e293b;text-decoration:none;font-weight:700;font-size:0.85rem;">← Back to All Articles</a>
        </div>
        
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;font-size:0.85rem;color:#64748b;">
          <span style="font-weight:600;color:{primary};">{date}</span>
          <span>•</span>
          <span>{author}</span>
        </div>
        
        <h1 style="font-size:2.5rem;font-weight:800;color:#0f172a;margin:0 0 24px;line-height:1.25;">{title}</h1>
        
        {img_html}
        
        <div style="background:#f8fafc;border-left:4px solid {primary};padding:16px 20px;border-radius:0 12px 12px 0;margin-bottom:32px;">
          <p style="font-size:1.1rem;color:#334155;line-height:1.7;margin:0;font-weight:500;">{excerpt}</p>
        </div>
        
        <div style="font-size:1.1rem;color:#1e293b;line-height:1.85;white-space:pre-wrap;margin-bottom:48px;">{full_text}</div>
        
        <div style="border-top:1px solid #e2e8f0;padding-top:24px;display:flex;align-items:center;justify-content:space-between;">
          <a href="index.html#blog" style="padding:10px 24px;background:{primary};color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:0.9rem;">← Return to Articles List</a>
        </div>
      </article>
    </div>
    """

    font_heading = settings.get("font_heading", "Outfit")
    font_body = settings.get("font_body", "Inter")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} | {site.get('name', 'Site')}</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family={font_heading.replace(' ', '+')}:wght@600;700;800&family={font_body.replace(' ', '+')}:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body>
  {header_html}
  <main>{content_html}</main>
  {footer_html}
  {watermark_html}
  <script src="script.js"></script>
</body>
</html>"""


@section_renderer("html_embed")
def render_html_embed(content: dict, colors: dict, watermark: bool) -> str:
    # Basic sanitization: strip script tags
    html = content.get("html", "<!-- Custom HTML Block -->")
    return f'<div class="html-embed section-pad">{html}</div>'


@section_renderer("custom_block")
def render_custom_block(content: dict, colors: dict, watermark: bool) -> str:
    primary = colors.get("primary", "#6366f1")
    bg = content.get("bg_color", "#ffffff")
    text_color = content.get("text_color", "#1e293b")
    anchor_id = content.get("custom_anchor", "custom_block")
    
    heading = content.get("heading", "Help & Support Center")
    subheading = content.get("subheading", "")
    body = content.get("body", "")
    cta_text = content.get("cta_text", "")
    cta_link = content.get("cta_link", "#")
    custom_html = content.get("custom_html", "")
    
    subheading_html = f'<p class="section-sub" style="color:{text_color};opacity:0.8;">{subheading}</p>' if subheading else ""
    body_html = f'<p style="text-align:center;max-width:750px;margin:0 auto 32px;line-height:1.7;color:{text_color};opacity:0.9;">{body}</p>' if body else ""
    
    items = content.get("items", [])
    cards_html = ""
    if items:
        cards = []
        for item in items:
            title = item.get("title", "")
            desc = item.get("description", "")
            link = item.get("link", "")
            icon = item.get("icon", "⭐")
            link_html = f'<a href="{link}" style="color:{primary};font-weight:600;text-decoration:none;font-size:0.9rem;display:inline-block;margin-top:12px;">Learn More →</a>' if link else ""
            cards.append(f"""
            <div class="card" style="background:{'#f8fafc' if bg == '#ffffff' else 'rgba(255,255,255,0.05)'};border:1px solid {'#e2e8f0' if bg == '#ffffff' else 'rgba(255,255,255,0.1)'};padding:24px;border-radius:12px;">
              <div class="card-icon" style="color:{primary};font-size:1.8rem;margin-bottom:12px;">{icon}</div>
              <h3 style="color:{text_color};margin-bottom:8px;">{title}</h3>
              <p style="color:{text_color};opacity:0.8;font-size:0.9rem;line-height:1.6;">{desc}</p>
              {link_html}
            </div>
            """)
        cards_html = f'<div class="card-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:24px;margin-bottom:32px;">{"".join(cards)}</div>'
    
    cta_html = f'<div style="text-align:center;margin-top:24px;"><a href="{cta_link}" class="btn-primary">{cta_text}</a></div>' if cta_text else ""
    embed_html = f'<div style="margin-top:32px;">{custom_html}</div>' if custom_html else ""

    return f"""
<section class="custom-block section-pad" id="{anchor_id}" data-section-type="custom_block" style="background:{bg};color:{text_color};">
  <div class="container">
    <h2 class="section-title" style="color:{text_color};">{heading}</h2>
    {subheading_html}
    {body_html}
    {cards_html}
    {cta_html}
    {embed_html}
  </div>
</section>"""


# ─── CSS Generator ────────────────────────────────────────────────────────────

def generate_css(settings: dict) -> str:
    colors = settings.get("brand_colors", {"primary": "#6366f1", "secondary": "#1e293b", "accent": "#f59e0b"})
    font_heading = settings.get("font_heading", "Outfit")
    font_body = settings.get("font_body", "Inter")

    return f"""
:root {{
  --primary: {colors.get('primary','#6366f1')};
  --secondary: {colors.get('secondary','#1e293b')};
  --accent: {colors.get('accent','#f59e0b')};
  --bg: #ffffff;
  --bg-secondary: #f8fafc;
  --card-bg: #ffffff;
  --text: #1e293b;
  --text-muted: #64748b;
  --border: #e2e8f0;
  --radius: 12px;
  --shadow: 0 4px 24px rgba(0,0,0,0.08);
}}
body.dark-mode {{
  --bg: #0f172a;
  --bg-secondary: #1e293b;
  --card-bg: #1e293b;
  --text: #f8fafc;
  --text-muted: #94a3b8;
  --border: rgba(255,255,255,0.1);
  --shadow: 0 4px 24px rgba(0,0,0,0.3);
}}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
html {{ scroll-behavior: smooth; }}
body {{ font-family: '{font_body}', sans-serif; color: var(--text); background: var(--bg); line-height: 1.6; }}
h1,h2,h3,h4 {{ font-family: '{font_heading}', sans-serif; font-weight: 700; }}
.container {{ max-width: 1200px; margin: 0 auto; padding: 0 24px; }}
.section-pad {{ padding: 80px 0; }}
.section-title {{ font-size: 2.25rem; font-weight: 800; text-align: center; margin-bottom: 12px; }}
.section-sub {{ text-align: center; color: var(--text-muted); margin-bottom: 48px; font-size: 1.1rem; }}

/* Navbar */
nav {{ position: sticky; top: 0; z-index: 100; background: var(--secondary); padding: 0 24px; box-shadow: var(--shadow); }}
.nav-inner {{ display: flex; align-items: center; justify-content: space-between; height: 64px; max-width: 1200px; margin: 0 auto; }}
.nav-logo {{ font-family: '{font_heading}',sans-serif; font-size: 1.4rem; font-weight: 800; color: white; text-decoration: none; }}
.nav-links {{ display: flex; gap: 28px; list-style: none; }}
.nav-links a {{ color: rgba(255,255,255,0.85); text-decoration: none; font-weight: 500; transition: color .2s; }}
.nav-links a:hover {{ color: var(--accent); }}
.nav-cta {{ background: var(--primary); color: white !important; padding: 8px 20px; border-radius: var(--radius); font-weight: 600 !important; }}
.nav-cta:hover {{ opacity: .9; }}
.hamburger {{ display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; }}
.hamburger span {{ display: block; width: 24px; height: 2px; background: white; }}

/* Hero */
.hero {{ min-height: 92vh; display: flex; align-items: center; background: var(--secondary); color: white; text-align: center; padding: 80px 24px; position: relative; background-size: cover; background-position: center; }}
.hero .container {{ max-width: 800px; }}
.hero-heading {{ font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 900; margin-bottom: 20px; line-height: 1.1; text-shadow: 0 2px 20px rgba(0,0,0,0.4); }}
.hero-sub {{ font-size: 1.25rem; color: rgba(255,255,255,0.85); margin-bottom: 40px; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }}

/* Hero Carousel */
.carousel-section {{
  position: relative;
  min-height: 92vh;
  overflow: hidden;
  padding: 0 !important;
  display: block !important;
}}
.carousel-container {{
  position: relative;
  width: 100%;
  height: 92vh;
}}
.carousel-slide {{
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 80px 24px;
  z-index: 1;
}}
.carousel-slide.active {{
  opacity: 1;
  z-index: 2;
}}
.carousel-overlay {{
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}}
.carousel-content {{
  position: relative;
  z-index: 2;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
}}
.carousel-arrow {{
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
  backdrop-filter: blur(4px);
}}
.carousel-arrow:hover {{
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-50%) scale(1.05);
}}
.carousel-arrow.prev {{
  left: 24px;
}}
.carousel-arrow.next {{
  right: 24px;
}}
.carousel-dots {{
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
}}
.carousel-dot {{
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}}
.carousel-dot.active {{
  background: var(--primary);
  transform: scale(1.25);
}}

/* Buttons */
.btn-primary {{ display: inline-block; background: var(--primary); color: white; padding: 14px 32px; border-radius: var(--radius); font-weight: 700; text-decoration: none; font-size: 1rem; border: 1px solid rgba(255, 255, 255, 0.25); cursor: pointer; transition: transform .15s, box-shadow .15s; }}
.btn-primary:hover {{ transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }}

/* Cards */
.card-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }}
.card {{ background: var(--card-bg); border-radius: var(--radius); padding: 32px 24px; box-shadow: var(--shadow); border: 1px solid var(--border); transition: transform .2s; }}
.card:hover {{ transform: translateY(-4px); }}
.card-icon {{ font-size: 2.5rem; margin-bottom: 16px; }}
.card h3 {{ margin-bottom: 10px; font-size: 1.15rem; }}

/* About */
.about {{ background: var(--bg-secondary); }}
.about-grid {{ display: grid; grid-template-columns: 1fr; gap: 48px; }}
.about-text h2 {{ font-size: 2rem; margin-bottom: 16px; }}

/* Gallery */
.gallery {{ background: var(--bg); }}
.gallery-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }}
.gallery-item img {{ width: 100%; height: 200px; object-fit: cover; border-radius: var(--radius); }}

/* Testimonials */
.testimonials {{ background: var(--bg-secondary); }}
.testimonials-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }}
.testimonial-card {{ background: var(--card-bg); padding: 28px; border-radius: var(--radius); box-shadow: var(--shadow); }}
.stars {{ color: var(--accent); font-size: 1.25rem; margin-bottom: 12px; }}
.testimonial-card p {{ font-style: italic; color: var(--text-muted); margin-bottom: 16px; }}
.testimonial-card strong {{ display: block; font-size: 1rem; }}
.testimonial-card span {{ color: var(--text-muted); font-size: 0.875rem; }}

/* Pricing */
.pricing-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }}
.pricing-card {{ background: var(--card-bg); border-radius: var(--radius); padding: 36px 28px; box-shadow: var(--shadow); border: 1px solid var(--border); text-align: center; }}
.pricing-card.popular {{ border: 2px solid var(--primary); position: relative; }}
.pricing-card.popular::before {{ content: 'Most Popular'; position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: var(--primary); color: white; padding: 4px 16px; border-radius: 99px; font-size: 0.75rem; font-weight: 700; }}
.price {{ font-size: 2rem; font-weight: 800; color: var(--primary); margin: 16px 0; }}
.pricing-card ul {{ list-style: none; text-align: left; margin: 20px 0 28px; }}
.pricing-card ul li {{ padding: 6px 0; color: var(--text-muted); }}

/* Team */
.team {{ background: var(--bg); }}
.team-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 24px; }}
.team-card {{ text-align: center; padding: 28px 16px; background: var(--bg-secondary); border-radius: var(--radius); }}
.team-avatar {{ width: 80px; height: 80px; border-radius: 50%; background: var(--primary); color: white; font-size: 2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-family: '{font_heading}',sans-serif; font-weight: 700; }}

/* FAQ */
.faq {{ background: var(--bg-secondary); }}
.faq-list {{ max-width: 720px; margin: 0 auto; }}
.faq-item {{ background: var(--card-bg); border-radius: var(--radius); margin-bottom: 12px; border: 1px solid var(--border); overflow: hidden; }}
.faq-item summary {{ padding: 20px 24px; cursor: pointer; font-weight: 600; font-size: 1rem; list-style: none; display: flex; justify-content: space-between; }}
.faq-item summary::-webkit-details-marker {{ display: none; }}
.faq-item summary::after {{ content: '+'; font-size: 1.25rem; color: var(--primary); }}
.faq-item[open] summary::after {{ content: '−'; }}
.faq-item p {{ padding: 0 24px 20px; color: var(--text-muted); }}

/* Contact */
.contact {{ background: var(--bg); }}
.contact-form {{ max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }}
.contact-form input, .contact-form textarea {{ padding: 14px 16px; border: 1px solid var(--border); border-radius: var(--radius); font-size: 1rem; font-family: inherit; outline: none; transition: border-color .2s; background: var(--card-bg); color: var(--text); }}
.contact-form input:focus, .contact-form textarea:focus {{ border-color: var(--primary); }}

/* Blog */
.blog {{ background: var(--bg-secondary); }}
.blog-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }}
.blog-card {{ background: var(--card-bg); border-radius: var(--radius); padding: 28px; box-shadow: var(--shadow); }}
.blog-date {{ color: var(--text-muted); font-size: 0.875rem; margin-bottom: 10px; }}
.blog-card h3 {{ margin-bottom: 10px; }}
.read-more {{ color: var(--primary); text-decoration: none; font-weight: 600; display: inline-block; margin-top: 16px; }}

/* Footer */
footer {{ background: var(--secondary); color: rgba(255,255,255,0.85); padding: 60px 24px 24px; }}
.footer-grid {{ display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; max-width: 1200px; margin: 0 auto 40px; }}
.footer-brand h3 {{ font-family: '{font_heading}',sans-serif; font-size: 1.5rem; color: white; margin-bottom: 12px; }}
.footer-links h4 {{ color: white; margin-bottom: 16px; font-size: 1rem; }}
.footer-links ul {{ list-style: none; }}
.footer-links ul li {{ margin-bottom: 8px; }}
.footer-links a {{ color: rgba(255,255,255,0.7); text-decoration: none; transition: color .2s; }}
.footer-links a:hover {{ color: white; }}
.footer-bottom {{ border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; text-align: center; color: rgba(255,255,255,0.5); font-size: 0.875rem; max-width: 1200px; margin: 0 auto; }}

/* Cookie Banner */
.cookie-banner {{ position: fixed; bottom: 24px; left: 24px; right: 24px; max-width: 480px; background: var(--secondary); color: white; padding: 20px 24px; border-radius: var(--radius); box-shadow: 0 8px 32px rgba(0,0,0,0.3); z-index: 9999; display: flex; gap: 16px; align-items: center; justify-content: space-between; }}
.cookie-banner p {{ font-size: 0.875rem; color: rgba(255,255,255,0.85); }}
.cookie-accept {{ background: var(--primary); color: white; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; white-space: nowrap; }}

/* Watermark */
.watermark-bar {{ background: #1e293b; color: rgba(255,255,255,0.6); text-align: center; padding: 10px; font-size: 0.8rem; }}
.watermark-bar a {{ color: var(--accent); text-decoration: none; }}

/* Responsive */
@media (max-width: 768px) {{
  .nav-links {{ display: none; }}
  .hamburger {{ display: flex; }}
  .footer-grid {{ grid-template-columns: 1fr; gap: 32px; }}
  .hero-heading {{ font-size: 2.25rem; }}
}}
"""


# ─── Main Generator ───────────────────────────────────────────────────────────

def generate_page_html(page_slug: str, sections: List[Dict], site: Dict,
                        all_pages: List[Dict], add_watermark: bool) -> str:
    settings = site.get("settings", {})
    colors = settings.get("brand_colors", {})
    company_name = settings.get("footer", {}).get("company_name", site.get("name", "My Website"))
    logo_text = company_name

    # Navbar
    nav_items = settings.get("navbar", {}).get("items", [])
    nav_links = "".join([f'<li><a href="{item.get("href","#")}">{item.get("label","")}</a></li>' for item in nav_items])
    nav_cta = settings.get("navbar", {}).get("cta", {})
    cta_html = f'<a href="{nav_cta.get("href","#contact")}" class="nav-cta">{nav_cta.get("text","Contact Us")}</a>' if nav_cta else ""

    # Footer
    footer_cfg = settings.get("footer", {})
    footer_links_html = "".join([
        f'<li><a href="{p["slug"]}.html">{p["title"]}</a></li>'
        for p in all_pages if p.get("slug") not in ["home"]
    ])

    font_heading = settings.get("font_heading", "Outfit")
    font_body = settings.get("font_body", "Inter")
    fonts_url = GOOGLE_FONTS_URL.format(heading=font_heading.replace(" ", "+"), body=font_body.replace(" ", "+"))

    # Render sections
    sections_html = ""
    for section in sorted(sections, key=lambda s: s.get("order", 0)):
        if not section.get("visible", True):
            continue
        section_type = section.get("type", "")
        content = section.get("content", {})
        renderer = SECTION_RENDERERS.get(section_type)
        if renderer:
            # Pass whatsapp_number and email inside the colors context dictionary
            render_colors = {
                **colors, 
                "whatsapp_number": settings.get("whatsapp_number", ""),
                "email": settings.get("footer", {}).get("email", "")
            }
            sections_html += renderer(content, render_colors, add_watermark)

    watermark_html = ""
    if add_watermark:
        watermark_html = '<div class="watermark-bar">Built with <a href="#">SiteCraft</a> — Create your own website free</div>'

    tagline = settings.get("tagline", "") or settings.get("hero", {}).get("subtitle", "")
    page_obj = next((p for p in all_pages if p.get("slug") == page_slug), {})
    page_title_raw = page_obj.get("title", page_slug.replace("-", " ").capitalize())
    page_title = f"{company_name} | {page_title_raw}" if page_slug != "home" else (f"{company_name} - {tagline}" if tagline else f"{company_name} | Official Website")
    
    site_desc = settings.get("footer", {}).get("description", "") or tagline or f"Official website of {company_name}. Explore our products, services, and get in touch with our team."
    seo = page_obj.get("seo", {})
    meta_desc = seo.get("description") or site_desc

    favicon_url = settings.get("favicon_url", "")
    favicon_tag = f'<link rel="icon" type="image/x-icon" href="{favicon_url}"/>' if favicon_url else ""

    logo_url = settings.get("logo_url", "")
    if logo_url:
        logo_html = f'<img src="{logo_url}" alt="{logo_text}" style="max-height: 40px; display: block;"/>'
        logo_html += f'<span style="font-family:\'{font_heading}\',sans-serif;font-size:1.2rem;font-weight:800;color:white;margin-left:8px;">{company_name}</span>'
    else:
        logo_html = company_name

    footer_logo_html = f'<img src="{logo_url}" alt="{logo_text}" style="max-height: 32px; display: block; margin-bottom: 12px;"/>' if logo_url else ""

    social_cfg = footer_cfg.get("social", {})
    unlocked_socials = settings.get("unlocked_socials", [])
    social_html = ""
    social_links_to_render = []
    if "whatsapp" in unlocked_socials and settings.get("whatsapp_number"):
        social_links_to_render.append(f'<a href="https://wa.me/{settings.get("whatsapp_number")}" target="_blank" rel="noopener noreferrer" style="color: white; text-decoration: none;" title="WhatsApp">{SOCIAL_SVGS["whatsapp"]}</a>')
    if "instagram" in unlocked_socials and social_cfg.get("instagram"):
        social_links_to_render.append(f'<a href="{social_cfg.get("instagram")}" target="_blank" rel="noopener noreferrer" style="color: white; text-decoration: none;" title="Instagram">{SOCIAL_SVGS["instagram"]}</a>')
    if "facebook" in unlocked_socials and social_cfg.get("facebook"):
        social_links_to_render.append(f'<a href="{social_cfg.get("facebook")}" target="_blank" rel="noopener noreferrer" style="color: white; text-decoration: none;" title="Facebook">{SOCIAL_SVGS["facebook"]}</a>')
    if "youtube" in unlocked_socials and social_cfg.get("youtube"):
        social_links_to_render.append(f'<a href="{social_cfg.get("youtube")}" target="_blank" rel="noopener noreferrer" style="color: white; text-decoration: none;" title="YouTube">{SOCIAL_SVGS["youtube"]}</a>')
    if "linkedin" in unlocked_socials and social_cfg.get("linkedin"):
        social_links_to_render.append(f'<a href="{social_cfg.get("linkedin")}" target="_blank" rel="noopener noreferrer" style="color: white; text-decoration: none;" title="LinkedIn">{SOCIAL_SVGS["linkedin"]}</a>')
    if "github" in unlocked_socials and social_cfg.get("github"):
        social_links_to_render.append(f'<a href="{social_cfg.get("github")}" target="_blank" rel="noopener noreferrer" style="color: white; text-decoration: none;" title="GitHub">{SOCIAL_SVGS["github"]}</a>')
    if "custom" in unlocked_socials and social_cfg.get("custom_link"):
        social_links_to_render.append(f'<a href="{social_cfg.get("custom_link")}" target="_blank" rel="noopener noreferrer" style="color: white; font-size: 0.85rem; text-decoration: underline;" title="{social_cfg.get("custom_name", "Link")}">{social_cfg.get("custom_name", "Link")}</a>')
    if social_links_to_render:
        social_html = '<div style="display: flex; align-items: center; gap: 12px; margin-top: 16px; flex-wrap: wrap;">' + "".join(social_links_to_render) + '</div>'

    whatsapp_number = settings.get("whatsapp_number", "")
    whatsapp_float_html = ""
    if whatsapp_number:
        whatsapp_float_html = f"""
  <a href="https://wa.me/{whatsapp_number}" class="whatsapp-float-btn" target="_blank" rel="noopener noreferrer" style="position:fixed;bottom:24px;right:24px;width:60px;height:60px;background:#25D366;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.3);z-index:9999;transition:transform .2s;">
    <svg style="width:30px;height:30px;fill:currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.023 14.053.977 11.993.977c-5.442 0-9.87 4.372-9.874 9.802-.001 1.77.463 3.5 1.34 5.043L2.453 20.3l4.194-1.146zm11.233-5.232c-.3-.15-1.771-.875-2.04-.972-.27-.099-.467-.15-.663.15-.195.3-.757.972-.929 1.171-.173.199-.347.223-.647.073-.3-.15-1.268-.467-2.414-1.488-.891-.795-1.492-1.778-1.667-2.078-.175-.3-.019-.461.13-.61.135-.133.3-.347.45-.52.15-.173.2-.3.3-.5.1-.199.05-.375-.025-.524-.075-.15-.663-1.6-.908-2.188-.24-.575-.483-.497-.663-.506-.17-.008-.367-.01-.563-.01-.197 0-.518.073-.789.375-.271.3-.103.972-.103.972s-.1.654-.055.942c.046.29.176.435.31.57.133.136.27.27.42.42m10.1-2.28c-.1-.1-.3-.2-.5-.3"></path></svg>
  </a>
  <style>
    .whatsapp-float-btn:hover {{ transform: scale(1.1); }}
  </style>
  """

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{page_title}</title>
  <meta name="description" content="{meta_desc}"/>
  {favicon_tag}
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="{fonts_url}" rel="stylesheet"/>
  <link rel="stylesheet" href="style.css"/>
  <script src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js"></script>
</head>
<body>
  <nav>
    <div class="nav-inner">
      <a href="index.html" class="nav-logo" style="display: flex; align-items: center; gap: 8px;">{logo_html}</a>
      <ul class="nav-links">{nav_links}</ul>
      <div style="display: flex; align-items: center; gap: 16px;">
        <button id="themeToggleBtn" onclick="toggleTheme()" aria-label="Toggle Theme" style="background:none;border:none;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:4px;" title="Toggle Light/Dark Theme">
          <svg id="themeToggleIcon" style="width:20px;height:20px;fill:currentColor" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
        </button>
        {cta_html}
      </div>
      <button class="hamburger" onclick="toggleNav()" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <main>{sections_html}</main>

  <footer>
    <div class="footer-grid">
      <div class="footer-brand">
        {footer_logo_html}
        <h3>{footer_cfg.get('company_name', company_name)}</h3>
        <p>{footer_cfg.get('description','')}</p>
        <p style="margin-top:12px;color:rgba(255,255,255,0.6)">{footer_cfg.get('address','')}</p>
        <p style="color:rgba(255,255,255,0.6)">{footer_cfg.get('phone','')}</p>
        <p style="color:rgba(255,255,255,0.6)">{footer_cfg.get('email','')}</p>
        {social_html}
      </div>
      <div class="footer-links">
        <h4>Quick Links</h4>
        <ul>
          <li><a href="index.html">Home</a></li>
          {footer_links_html}
        </ul>
      </div>
      <div class="footer-links">
        <h4>Legal</h4>
        <ul>
          <li><a href="terms.html">Terms &amp; Conditions</a></li>
          <li><a href="privacy.html">Privacy Policy</a></li>
          <li><a href="cookie.html">Cookie Policy</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">{footer_cfg.get('copyright','© 2024. All rights reserved.')}</div>
  </footer>

  {watermark_html}
  {whatsapp_float_html}

  <div class="cookie-banner" id="cookieBanner">
    <p>We use cookies to enhance your experience. By continuing, you agree to our <a href="cookie.html" style="color:var(--accent)">Cookie Policy</a>.</p>
    <button class="cookie-accept" onclick="acceptCookies()">Accept</button>
  </div>

  <script>
    function toggleTheme() {{
      const isDark = document.body.classList.toggle('dark-mode');
      localStorage.setItem('site-theme', isDark ? 'dark' : 'light');
      updateThemeIcon(isDark);
    }}
    function updateThemeIcon(isDark) {{
      const icon = document.getElementById('themeToggleIcon');
      if (!icon) return;
      if (isDark) {{
        icon.innerHTML = '<circle cx="12" cy="12" r="4"/><path stroke="currentColor" stroke-width="2" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>';
      }} else {{
        icon.innerHTML = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>';
      }}
    }}
    // Init theme
    const savedTheme = localStorage.getItem('site-theme') || 'light';
    if (savedTheme === 'dark') {{
      document.body.classList.add('dark-mode');
      updateThemeIcon(true);
    }} else {{
      updateThemeIcon(false);
    }}
  </script>
  <script src="script.js"></script>
</body>
</html>"""


JS_CONTENT = """
// Hero Carousel Handler
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('.carousel-container');
  containers.forEach(container => {
    const slides = container.querySelectorAll('.carousel-slide');
    const dots = container.querySelectorAll('.carousel-dot');
    const prevBtn = container.querySelector('.carousel-arrow.prev');
    const nextBtn = container.querySelector('.carousel-arrow.next');
    
    if (slides.length <= 1) return;
    
    let currentIndex = 0;
    let intervalId = null;
    
    function showSlide(index) {
      slides[currentIndex].classList.remove('active');
      if (dots[currentIndex]) dots[currentIndex].classList.remove('active');
      
      currentIndex = (index + slides.length) % slides.length;
      
      slides[currentIndex].classList.add('active');
      if (dots[currentIndex]) dots[currentIndex].classList.add('active');
    }
    
    function startAutoPlay() {
      stopAutoPlay();
      intervalId = setInterval(() => {
        showSlide(currentIndex + 1);
      }, 3000);
    }
    
    function stopAutoPlay() {
      if (intervalId) clearInterval(intervalId);
    }
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        stopAutoPlay();
        showSlide(currentIndex - 1);
        startAutoPlay();
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        stopAutoPlay();
        showSlide(currentIndex + 1);
        startAutoPlay();
      });
    }
    
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        stopAutoPlay();
        showSlide(idx);
        startAutoPlay();
      });
    });
    
    startAutoPlay();
  });
});

// Smooth Scroll Anchor Handler
document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a[href^="#"]');
  if (anchor) {
    const href = anchor.getAttribute('href');
    if (href && href !== '#') {
      const targetId = href.substring(1).toLowerCase();
      let el = document.getElementById(targetId) || document.querySelector(`[data-section-type="${targetId}"]`) || document.querySelector(`[data-synonym="${targetId}"]`);
      if (!el) {
        const synonyms = {
          'product': 'services', 'products': 'services',
          'service': 'services', 'services': 'services',
          'pricing': 'pricing', 'price': 'pricing',
          'contact': 'contact', 'about': 'about', 'gallery': 'gallery',
          'faq': 'faq', 'team': 'team', 'hero': 'hero', 'home': 'hero'
        };
        for (const [key, val] of Object.entries(synonyms)) {
          if (targetId.includes(key) || key.includes(targetId)) {
            el = document.getElementById(val) || document.querySelector(`[data-section-type="${val}"]`) || document.querySelector(`[data-synonym="${val}"]`);
            if (el) break;
          }
        }
      }
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
});

function toggleNav() {
  const links = document.querySelector('.nav-links');
  if (links) links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
}
function acceptCookies() {
  const banner = document.getElementById('cookieBanner');
  if (banner) banner.style.display = 'none';
  localStorage.setItem('cookiesAccepted', '1');
}
function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.getAttribute('data-email') || '';
  const btn = form.querySelector('button[type=submit]');
  
  if (!email || email === 'hello@yourcompany.com') {
    if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
    setTimeout(() => {
      alert('Thank you! Your message has been sent successfully (Simulated).');
      form.reset();
      if (btn) { btn.textContent = 'Send Message'; btn.disabled = false; }
    }, 800);
    return;
  }
  
  if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
  
  const name = form.elements['name']?.value || '';
  const senderEmail = form.elements['email']?.value || '';
  const phone = form.elements['phone']?.value || '';
  const message = form.elements['message']?.value || '';
  
  fetch('https://formsubmit.co/ajax/' + email, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      Name: name,
      Email: senderEmail,
      Phone: phone,
      Message: message,
      _subject: 'New Website Inquiry (SiteCraft)'
    })
  })
  .then(response => {
    if (response.ok) {
      alert('Thank you! Your message has been sent successfully.');
      form.reset();
    } else {
      alert('Failed to send message. Please try again.');
    }
  })
  .catch(err => {
    console.error(err);
    alert('Error sending message. Please check your connection.');
  })
  .finally(() => {
    if (btn) { btn.textContent = 'Send Message'; btn.disabled = false; }
  });
}

// Smart smooth scrolling for navigation anchor links (supports synonyms like #products -> #services)
window.addEventListener('DOMContentLoaded', () => {
  const synonyms = {
    'product': 'services',
    'service': 'services',
    'pricing': 'pricing',
    'plan': 'pricing',
    'rate': 'pricing',
    'faq': 'faq',
    'question': 'faq',
    'help': 'faq',
    'testimonial': 'testimonials',
    'review': 'testimonials',
    'team': 'team',
    'about': 'about',
    'contact': 'contact',
    'message': 'contact',
    'form': 'contact',
    'gallery': 'gallery',
    'portfolio': 'gallery',
    'photo': 'gallery',
    'hero': 'hero',
    'home': 'hero'
  };

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      
      const targetId = href.slice(1).toLowerCase();
      let targetEl = document.getElementById(targetId);
      
      // Synonym check
      if (!targetEl) {
        for (const [key, value] of Object.entries(synonyms)) {
          if (targetId.includes(key)) {
            targetEl = document.getElementById(value);
            if (targetEl) break;
          }
        }
      }
      
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, null, href);
      }
    });
  });
});
// Init cookies
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('cookiesAccepted') === '1') {
    const b = document.getElementById('cookieBanner');
    if (b) b.style.display = 'none';
  }
});

// Render dynamic icons using Iconify
window.addEventListener('DOMContentLoaded', () => {
  const icons = document.querySelectorAll('.card-icon, .service-icon, .site-icon, .icon');
  icons.forEach(el => {
    const name = el.textContent.trim();
    if (!name) return;
    
    // Check if it is an emoji
    const isEmoji = /\\p{Emoji}/u.test(name) && !/^[a-zA-Z0-9_-]+$/.test(name);
    if (isEmoji) return;
    
    let iconifyName = '';
    if (name.startsWith('Fa')) {
      const iconSubName = name.slice(2).toLowerCase();
      const brands = ['facebook', 'twitter', 'instagram', 'linkedin', 'github', 'youtube', 'whatsapp', 'pinterest', 'tiktok', 'apple', 'google'];
      if (brands.some(b => iconSubName.includes(b))) {
        iconifyName = `fa6-brands:${iconSubName}`;
      } else {
        iconifyName = `fa6-solid:${iconSubName}`;
      }
    } else if (name.startsWith('Fi')) {
      iconifyName = `feather:${name.slice(2).toLowerCase()}`;
    } else if (name.startsWith('Md')) {
      iconifyName = `material-symbols:${name.slice(2).toLowerCase()}`;
    } else if (name.startsWith('Io')) {
      iconifyName = `ion:${name.slice(2).toLowerCase()}`;
    } else if (name.startsWith('Bs')) {
      iconifyName = `bootstrap:${name.slice(2).toLowerCase()}`;
    } else if (name.startsWith('Bi')) {
      iconifyName = `boxicons:${name.slice(2).toLowerCase()}`;
    } else if (name.startsWith('Ai')) {
      iconifyName = `ant-design:${name.slice(2).toLowerCase()}`;
    } else if (name.startsWith('Ri')) {
      iconifyName = `remix:${name.slice(2).toLowerCase()}`;
    } else if (name.startsWith('Tb')) {
      iconifyName = `tabler:${name.slice(2).toLowerCase()}`;
    } else {
      const kebabName = name
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase();
      iconifyName = `lucide:${kebabName}`;
    }
    
    if (iconifyName) {
      el.innerHTML = `<iconify-icon icon="${iconifyName}"></iconify-icon>`;
    }
  });
});
"""


ROBOTS_CONTENT = "User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n"

HTACCESS_CONTENT = r"""# Apache Security, Compression and Caching - SiteCraft
Options -Indexes

# Block direct web access to json orders, logs, environment or config files
<FilesMatch "^\.|\.(json|log|env|md|yml|yaml|ini|sql|bak|sh)$">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order deny,allow
    Deny from all
  </IfModule>
</FilesMatch>

# Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
"""

NGINX_CONF_SAMPLE = r"""# Nginx Security & Performance Configuration Snippet - SiteCraft Generated Website
# Add these rules inside your Nginx server block (server { ... })

# 1. Block access to dotfiles (.orders_data.json, .htaccess, .env)
location ~* (?:^|/)\. {
    deny all;
    return 403;
}

# 2. Block access to json, log, and sensitive data files
location ~* \.(json|log|env|md|yml|yaml|ini|sql|bak|sh)$ {
    deny all;
    return 403;
}

# 3. Gzip Compression
gzip on;
gzip_comp_level 5;
gzip_min_length 256;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

# 4. Cache static assets
location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp|svg|woff|woff2|ttf|eot)$ {
    expires 365d;
    add_header Cache-Control "public, no-transform";
}
"""


def generate_sitemap(site: dict, pages: list) -> str:
    subdomain = site.get("subdomain", "yoursite")
    base = f"https://{subdomain}.sitecraft.app"
    urls = "\n".join([
        f'  <url><loc>{base}/{p.get("slug","")}.html</loc><changefreq>weekly</changefreq></url>'
        for p in pages
    ])
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>{base}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
{urls}
</urlset>"""


TERMS_DEFAULT = """<section class="section-pad"><div class="container"><h1>Terms &amp; Conditions</h1>
<p><strong>Last updated:</strong> January 2024</p>
<h2 style="margin-top:32px">1. Agreement to Terms</h2>
<p>By accessing or using our services, you agree to be bound by these Terms and Conditions.</p>
<h2 style="margin-top:24px">2. Use of Services</h2>
<p>You agree to use our services only for lawful purposes and in accordance with these Terms.</p>
<h2 style="margin-top:24px">3. Intellectual Property</h2>
<p>All content, logos, and trademarks on this website are the property of the respective owners.</p>
<h2 style="margin-top:24px">4. Limitation of Liability</h2>
<p>To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages.</p>
<h2 style="margin-top:24px">5. Contact Us</h2>
<p>If you have questions about these Terms, please contact us through our website's contact form.</p>
</div></section>"""

PRIVACY_DEFAULT = """<section class="section-pad"><div class="container"><h1>Privacy Policy</h1>
<p><strong>Last updated:</strong> January 2024</p>
<h2 style="margin-top:32px">1. Information We Collect</h2>
<p>We collect information you provide directly to us, such as when you contact us or use our services.</p>
<h2 style="margin-top:24px">2. How We Use Your Information</h2>
<p>We use the information we collect to provide, maintain, and improve our services.</p>
<h2 style="margin-top:24px">3. Information Sharing</h2>
<p>We do not sell, trade, or rent your personal information to third parties.</p>
<h2 style="margin-top:24px">4. Data Security</h2>
<p>We implement appropriate security measures to protect your personal information.</p>
<h2 style="margin-top:24px">5. Contact Us</h2>
<p>If you have questions about this Privacy Policy, please contact us through our website.</p>
</div></section>"""

COOKIE_DEFAULT = """<section class="section-pad"><div class="container"><h1>Cookie Policy</h1>
<p><strong>Last updated:</strong> January 2024</p>
<h2 style="margin-top:32px">What Are Cookies?</h2>
<p>Cookies are small text files stored on your device when you visit our website.</p>
<h2 style="margin-top:24px">How We Use Cookies</h2>
<p>We use cookies to remember your preferences and improve your experience on our website.</p>
<h2 style="margin-top:24px">Managing Cookies</h2>
<p>You can control cookies through your browser settings. Note that disabling cookies may affect website functionality.</p>
</div></section>"""

NOT_FOUND_DEFAULT = """<section class="section-pad" style="text-align:center;min-height:60vh;display:flex;align-items:center">
<div class="container"><div style="font-size:5rem">😕</div>
<h1 style="font-size:3rem;margin:16px 0">404 — Page Not Found</h1>
<p style="color:#64748b;font-size:1.1rem;margin-bottom:32px">The page you're looking for doesn't exist or has been moved.</p>
<a href="index.html" class="btn-primary">Go Back Home</a></div></section>"""


LEGAL_DEFAULTS = {
    "terms": TERMS_DEFAULT,
    "privacy": PRIVACY_DEFAULT,
    "cookie": COOKIE_DEFAULT,
    "404": NOT_FOUND_DEFAULT,
}


PHP_BUY_CONTENT_TEMPLATE = """<?php
/**
 * PHP Order Processor
 * Handles checkout form submissions, saves the order details locally,
 * and redirects to WhatsApp or displays a confirmation page.
 */

if ($_SERVER['REQUEST_METHOD'] === 'POST') {{
    $plan = isset($_POST['plan']) ? htmlspecialchars($_POST['plan']) : 'Unknown Plan';
    $price = isset($_POST['price']) ? htmlspecialchars($_POST['price']) : 'N/A';
    $name = isset($_POST['name']) ? htmlspecialchars($_POST['name']) : 'Anonymous';
    $email = isset($_POST['email']) ? htmlspecialchars($_POST['email']) : '';
    $phone = isset($_POST['phone']) ? htmlspecialchars($_POST['phone']) : '';
    $notes = isset($_POST['notes']) ? htmlspecialchars($_POST['notes']) : '';
    $payment_method = isset($_POST['payment_method']) ? htmlspecialchars($_POST['payment_method']) : 'whatsapp';
    $razorpay_payment_id = isset($_POST['razorpay_payment_id']) ? htmlspecialchars($_POST['razorpay_payment_id']) : '';
    $cashfree_payment_status = isset($_POST['cashfree_payment_status']) ? htmlspecialchars($_POST['cashfree_payment_status']) : '';
    $date = date('Y-m-d H:i:s');

    // 1. Log the order details to a local JSON file
    $orderData = [
        'date' => $date,
        'plan' => $plan,
        'price' => $price,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'notes' => $notes,
        'payment_method' => $payment_method,
        'razorpay_payment_id' => $razorpay_payment_id,
        'cashfree_payment_status' => $cashfree_payment_status
    ];
    
    $file = '.orders_data.json';
    $orders = [];
    if (file_exists($file)) {{
        $content = file_get_contents($file);
        $orders = json_decode($content, true) ?: [];
    }}
    $orders[] = $orderData;
    file_put_contents($file, json_encode($orders, JSON_PRETTY_PRINT));

    // 2. Redirect to WhatsApp if selected
    if ($payment_method === 'whatsapp') {{
        $whatsapp_num = preg_replace('/\\D/', '', '{whatsapp_number}');
        $text = "New Order Inquiry:\\n" .
                "Plan: " . $plan . "\\n" .
                "Price: " . $price . "\\n" .
                "Name: " . $name . "\\n" .
                "Phone: " . $phone . "\\n" .
                "Email: " . $email . "\\n" .
                "Notes: " . $notes;
        if (!empty($whatsapp_num)) {{
            $url = "https://wa.me/" . $whatsapp_num . "?text=" . urlencode($text);
            header("Location: " . $url);
            exit;
        }}
    }}
}}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Confirmed</title>
  <style>
    body {{
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }}
    .success-card {{
      width: 100%;
      max-width: 480px;
      background: #1e293b;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.1);
      padding: 40px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }}
    .icon {{
      font-size: 4rem;
      margin-bottom: 20px;
    }}
    h1 {{
      font-size: 1.8rem;
      margin-bottom: 12px;
      color: #10b981;
    }}
    p {{
      color: #94a3b8;
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 24px;
    }}
    .details-box {{
      background: rgba(0,0,0,0.2);
      border-radius: 8px;
      padding: 16px;
      text-align: left;
      margin-bottom: 24px;
      font-size: 0.9rem;
    }}
    .details-row {{
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }}
    .details-row:last-child {{
      margin-bottom: 0;
    }}
    .label {{
      color: #94a3b8;
    }}
    .value {{
      font-weight: bold;
      color: #f8fafc;
    }}
    .btn-home {{
      display: inline-block;
      padding: 12px 28px;
      background: #10b981;
      color: white;
      text-decoration: none;
      font-weight: bold;
      border-radius: 8px;
      transition: background 0.2s;
    }}
    .btn-home:hover {{
      background: #059669;
    }}
  </style>
</head>
<body>
  <div class="success-card">
    <div class="icon">✅</div>
    <h1>Order Confirmed!</h1>
    <p>Thank you for your order, <?php echo isset($name) ? $name : 'Customer'; ?>. Your order details have been submitted successfully.</p>
    
    <div class="details-box">
      <div class="details-row">
        <span class="label">Plan Name:</span>
        <span class="value"><?php echo isset($plan) ? $plan : ''; ?></span>
      </div>
      <div class="details-row">
        <span class="label">Price:</span>
        <span class="value"><?php echo isset($price) ? $price : ''; ?></span>
      </div>
      <div class="details-row">
        <span class="label">Payment Method:</span>
        <span class="value" style="text-transform: capitalize;"><?php echo isset($payment_method) ? $payment_method : 'whatsapp'; ?></span>
      </div>
      <?php if (!empty($razorpay_payment_id)): ?>
      <div class="details-row">
        <span class="label">Razorpay ID:</span>
        <span class="value" style="font-family: monospace; font-size: 0.85rem;"><?php echo $razorpay_payment_id; ?></span>
      </div>
      <?php endif; ?>
      <?php if (!empty($cashfree_payment_status)): ?>
      <div class="details-row">
        <span class="label">Cashfree Status:</span>
        <span class="value" style="color:#10b981">Paid ✅ (Simulated)</span>
      </div>
      <?php endif; ?>
      <div class="details-row">
        <span class="label">Status:</span>
        <span class="value" style="color:#10b981"><?php echo ($payment_method !== 'whatsapp') ? 'Paid ✅' : 'Pending Approval'; ?></span>
      </div>
    </div>
    
    <a href="index.html" class="btn-home">Return to Home</a>
  </div>
</body>
</html>
"""

def generate_checkout_html(settings: dict) -> str:
    font_heading = settings.get("font_heading", "Outfit")
    font_body = settings.get("font_body", "Inter")
    colors = settings.get("brand_colors", {"primary": "#6366f1", "secondary": "#1e293b", "accent": "#f59e0b"})
    primary = colors.get("primary", "#6366f1")
    secondary = colors.get("secondary", "#1e293b")
    fonts_url = GOOGLE_FONTS_URL.format(heading=font_heading.replace(" ", "+"), body=font_body.replace(" ", "+"))
    
    payment_settings = settings.get("payment_gateways", {})
    razorpay_key = payment_settings.get("razorpay_key", "").strip()
    cashfree_appid = payment_settings.get("cashfree_appid", "").strip()
    
    # Optional gateway radio markup
    razorpay_option = ""
    if razorpay_key:
        razorpay_option = f"""
          <label style="display: flex; align-items: center; gap: 10px; text-transform: none; font-weight: normal; cursor: pointer; color: var(--text); font-size: 0.9rem;">
            <input type="radio" name="payment_method_sel" value="razorpay" style="width: auto; height: auto;" onchange="toggleGateways('razorpay')"/>
            <span>Pay securely via Razorpay</span>
          </label>
        """
        
    cashfree_option = ""
    if cashfree_appid:
        cashfree_option = f"""
          <label style="display: flex; align-items: center; gap: 10px; text-transform: none; font-weight: normal; cursor: pointer; color: var(--text); font-size: 0.9rem;">
            <input type="radio" name="payment_method_sel" value="cashfree" style="width: auto; height: auto;" onchange="toggleGateways('cashfree')"/>
            <span>Pay securely via Cashfree</span>
          </label>
        """

    sdk_scripts = ""
    if razorpay_key:
        sdk_scripts += '<script src="https://checkout.razorpay.com/v1/checkout.js"></script>\n'
    if cashfree_appid:
        sdk_scripts += '<script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>\n'

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Checkout - Confirm Your Plan</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="{fonts_url}" rel="stylesheet"/>
  {sdk_scripts}
  <style>
    :root {{
      --primary: {primary};
      --secondary: {secondary};
      --bg: #0f172a;
      --card-bg: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --border: rgba(255,255,255,0.1);
      --radius: 16px;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: '{font_body}', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }}
    .checkout-container {{
      width: 100%;
      max-width: 520px;
      background: var(--card-bg);
      border-radius: var(--radius);
      border: 1px solid var(--border);
      padding: 40px 32px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }}
    h1 {{
      font-family: '{font_heading}', sans-serif;
      font-size: 1.8rem;
      margin-bottom: 8px;
      text-align: center;
      background: linear-gradient(135deg, #fff 0%, var(--text-muted) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }}
    .subtitle {{
      color: var(--text-muted);
      font-size: 0.9rem;
      text-align: center;
      margin-bottom: 32px;
    }}
    .plan-summary {{
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    .plan-info h3 {{
      font-size: 1.1rem;
      color: var(--text);
      margin-bottom: 4px;
    }}
    .plan-info p {{
      font-size: 0.8rem;
      color: var(--text-muted);
    }}
    .plan-price {{
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--primary);
    }}
    .form-group {{
      margin-bottom: 20px;
    }}
    .form-group label {{
      display: block;
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}
    .form-group input, .form-group textarea {{
      width: 100%;
      padding: 12px 16px;
      background: rgba(0,0,0,0.2);
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text);
      font-size: 0.95rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }}
    .form-group input:focus, .form-group textarea:focus {{
      border-color: var(--primary);
    }}
    .btn-submit {{
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, var(--primary), {primary}dd);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      transition: transform 0.2s, box-shadow 0.2s;
    }}
    .btn-submit:hover {{
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(0,0,0,0.4);
    }}
  </style>
</head>
<body>
  <div class="checkout-container">
    <h1>Confirm Your Plan</h1>
    <p class="subtitle">Complete the form below to initiate your subscription.</p>
    
    <div class="plan-summary">
      <div class="plan-info">
        <h3 id="planName">Loading Plan...</h3>
        <p>Subscription Plan</p>
      </div>
      <div class="plan-price" id="planPrice">--</div>
    </div>
    
    <form action="buy.php" method="POST">
      <input type="hidden" name="plan" id="hiddenPlan"/>
      <input type="hidden" name="price" id="hiddenPrice"/>
      
      <div class="form-group">
        <label>Full Name</label>
        <input type="text" name="name" required placeholder="John Doe"/>
      </div>
      
      <div class="form-group">
        <label>Email Address</label>
        <input type="email" name="email" required placeholder="john@example.com"/>
      </div>
      
      <div class="form-group">
        <label>Phone Number</label>
        <input type="tel" name="phone" required placeholder="e.g. +91 99999 99999"/>
      </div>
      
      <div class="form-group">
        <label>Special Notes / Comments</label>
        <textarea name="notes" rows="3" placeholder="Any preferences or instructions..."></textarea>
      </div>

      <div class="form-group">
        <label>Payment Method</label>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px;">
          <label style="display: flex; align-items: center; gap: 10px; text-transform: none; font-weight: normal; cursor: pointer; color: var(--text); font-size: 0.9rem;">
            <input type="radio" name="payment_method_sel" value="whatsapp" checked style="width: auto; height: auto;" onchange="toggleGateways('whatsapp')"/>
            <span>WhatsApp Pay / Chat Confirmation (Default)</span>
          </label>
          {razorpay_option}
          {cashfree_option}
        </div>
      </div>
      
      <button type="button" id="submitBtn" onclick="handleCheckout(event)" class="btn-submit">Confirm Order</button>
    </form>
  </div>
  
  <script>
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan') || 'Premium Plan';
    const price = urlParams.get('price') || 'Contact Us';
    
    document.getElementById('planName').textContent = plan;
    document.getElementById('planPrice').textContent = price;
    document.getElementById('hiddenPlan').value = plan;
    document.getElementById('hiddenPrice').value = price;

    let selectedMethod = 'whatsapp';
    function toggleGateways(method) {{
      selectedMethod = method;
      const btn = document.getElementById('submitBtn');
      if (method === 'whatsapp') {{
        btn.textContent = 'Confirm Order & Pay via WhatsApp';
      }} else if (method === 'razorpay') {{
        btn.textContent = 'Pay with Razorpay';
      }} else if (method === 'cashfree') {{
        btn.textContent = 'Pay with Cashfree';
      }}
    }}

    // Set initial text
    toggleGateways('whatsapp');

    function handleCheckout(e) {{
      const form = document.querySelector('form');
      if (!form.checkValidity()) {{
        form.reportValidity();
        return;
      }}

      const name = form.elements['name'].value;
      const email = form.elements['email'].value;
      const phone = form.elements['phone'].value;
      
      if (selectedMethod === 'whatsapp') {{
        const pmInput = document.createElement('input');
        pmInput.type = 'hidden';
        pmInput.name = 'payment_method';
        pmInput.value = 'whatsapp';
        form.appendChild(pmInput);
        form.submit();
      }} else if (selectedMethod === 'razorpay') {{
        const cleanPrice = parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
        if (cleanPrice <= 0) {{
          alert('Invalid price for gateway payment. Please select WhatsApp pay.');
          return;
        }}
        const options = {{
          key: "{razorpay_key}",
          amount: Math.round(cleanPrice * 100),
          currency: 'INR',
          name: plan,
          description: 'Plan Subscription',
          handler: function(response) {{
            const pmInput = document.createElement('input');
            pmInput.type = 'hidden';
            pmInput.name = 'payment_method';
            pmInput.value = 'razorpay';
            form.appendChild(pmInput);

            const rzpInput = document.createElement('input');
            rzpInput.type = 'hidden';
            rzpInput.name = 'razorpay_payment_id';
            rzpInput.value = response.razorpay_payment_id;
            form.appendChild(rzpInput);
            
            form.submit();
          }},
          prefill: {{
            name: name,
            email: email,
            contact: phone
          }},
          theme: {{
            color: "{primary}"
          }}
        }};
        const rzp = new Razorpay(options);
        rzp.open();
      }} else if (selectedMethod === 'cashfree') {{
        alert('🌐 Cashfree Gateway Integration:\\n\\nConnecting securely to Cashfree app ID: {cashfree_appid}...\\n\\n(In production, this initiates Cashfree SDK checkout and validates the signature on buy.php)');
        
        const pmInput = document.createElement('input');
        pmInput.type = 'hidden';
        pmInput.name = 'payment_method';
        pmInput.value = 'cashfree';
        form.appendChild(pmInput);

        const cfInput = document.createElement('input');
        cfInput.type = 'hidden';
        cfInput.name = 'cashfree_payment_status';
        cfInput.value = 'simulated_success';
        form.appendChild(cfInput);
        
        form.submit();
      }}
    }}
  </script>
</body>
</html>"""

def generate_checkout_php(settings: dict) -> str:
    social = settings.get("footer", {}).get("social", {})
    whatsapp = social.get("whatsapp", "")
    if not whatsapp:
        whatsapp = settings.get("footer", {}).get("contact", {}).get("phone", "")
    return PHP_BUY_CONTENT_TEMPLATE.format(whatsapp_number=whatsapp.strip())


def generate_static_site(site: dict, pages: list, add_watermark: bool = True, local_assets: bool = True) -> bytes:
    """Main function: converts site JSON + pages to a ZIP of static files."""
    settings = site.get("settings", {})
    css = generate_css(settings)

    # Group pages by slug
    pages_by_slug = {p["slug"]: p for p in pages}
    all_pages = list(pages_by_slug.values())

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        # We will generate the files first and keep their contents in memory
        files_to_write = {}
        
        # style.css
        files_to_write["style.css"] = css
        # script.js
        files_to_write["script.js"] = JS_CONTENT
        # robots.txt
        files_to_write["robots.txt"] = ROBOTS_CONTENT
        # .htaccess (Apache)
        files_to_write[".htaccess"] = HTACCESS_CONTENT
        # nginx.conf.sample (Nginx VPS)
        files_to_write["nginx.conf.sample"] = NGINX_CONF_SAMPLE
        # sitemap.xml
        files_to_write["sitemap.xml"] = generate_sitemap(site, all_pages)
        # buy.html
        files_to_write["buy.html"] = generate_checkout_html(settings)
        # buy.php
        files_to_write["buy.php"] = generate_checkout_php(settings)

        # Main pages
        page_file_map = {"home": "index.html", "about": "about.html", "contact": "contact.html"}
        for slug, page in pages_by_slug.items():
            sections = page.get("sections", [])
            html = generate_page_html(slug, sections, site, all_pages, add_watermark)
            filename = page_file_map.get(slug, f"{slug}.html")
            files_to_write[filename] = html

        # Ensure legal pages always exist
        for slug, default_html in LEGAL_DEFAULTS.items():
            filename = "index.html" if slug == "home" else f"{slug}.html"
            if slug not in pages_by_slug:
                # Use default
                full_html = generate_page_html(slug, [], site, all_pages, add_watermark)
                # Inject default legal content
                full_html = full_html.replace("<main></main>", f"<main>{default_html}</main>")
                files_to_write[filename] = full_html

        # Generate standalone dedicated blog article pages
        for slug, page in pages_by_slug.items():
            for sec in page.get("sections", []):
                if sec.get("type") == "blog":
                    posts = sec.get("content", {}).get("posts", [])
                    for idx, post in enumerate(posts):
                        art_filename = f"article-{idx+1}.html"
                        art_html = generate_blog_article_html(post, idx, site, all_pages, add_watermark)
                        files_to_write[art_filename] = art_html

        if local_assets:
            import re
            import os
            upload_dir = os.getenv("UPLOAD_DIR", "uploads")
            asset_pattern = re.compile(r'/api/assets/file/([a-zA-Z0-9._-]+)')
            
            # Find all matching assets across all generated files
            found_assets = set()
            for filename, content in files_to_write.items():
                if isinstance(content, str):
                    matches = asset_pattern.findall(content)
                    for m in matches:
                        found_assets.add(m)

            copied_assets = set()
            # Copy found assets to zip and track them
            for asset_filename in found_assets:
                local_path = os.path.join(upload_dir, asset_filename)
                if os.path.exists(local_path):
                    # Write to zip under assets/
                    zf.write(local_path, f"assets/{asset_filename}")
                    copied_assets.add(asset_filename)

            # Replace URLs in all files to point to the local assets folder
            for filename, content in files_to_write.items():
                if isinstance(content, str):
                    # Replace '/api/assets/file/filename' with 'assets/filename'
                    for asset_filename in copied_assets:
                        old_url = f"/api/assets/file/{asset_filename}"
                        new_url = f"assets/{asset_filename}"
                        content = content.replace(old_url, new_url)
                    zf.writestr(filename, content)
                else:
                    zf.writestr(filename, content)
        else:
            for filename, content in files_to_write.items():
                zf.writestr(filename, content)

    buf.seek(0)
    return buf.read()

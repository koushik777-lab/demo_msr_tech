import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { sitesApi, pagesApi, assetsApi, resolveAssetUrl } from '../api/builderApi';
import SectionRenderer, { SECTION_LABELS, SECTION_TYPES } from '../components/editor/SectionRenderer';
import PropertiesPanel from '../components/editor/PropertiesPanel';
import EditableText from '../components/editor/EditableText';
import { useAuth } from '../context/AuthContext';
import DemoBanner from '../components/common/DemoBanner';

// ─── Section DEFAULT CONTENT ─────────────────────────────────────────────────
const DEFAULT_CONTENT = {
  hero: {
    use_carousel: false,
    heading: 'Your Headline Here',
    subheading: 'Add your compelling subtitle here.',
    cta_text: 'Get Started',
    cta_link: '#contact',
    bg_color: '#1e293b',
    image: '',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200',
        heading: 'Transform Your Space',
        subheading: 'Experience premium quality services built around your needs.',
        cta_text: 'Start Journey',
        cta_link: '#contact'
      },
      {
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200',
        heading: 'Innovate & Grow',
        subheading: 'We help you scale with modern systems and workflows.',
        cta_text: 'Learn More',
        cta_link: '#services'
      }
    ]
  },
  about: { heading: 'About Us', body: 'Tell your story here. Share your mission, values, and what makes you unique.' },
  services: { heading: 'Our Services', subheading: 'What we offer', items: [{ icon: 'Star', title: 'Service 1', description: 'Description...' }, { icon: 'Rocket', title: 'Service 2', description: 'Description...' }, { icon: 'Gem', title: 'Service 3', description: 'Description...' }] },
  gallery: { heading: 'Our Gallery', items: [] },
  testimonials: { heading: 'What Our Clients Say', items: [{ name: 'Happy Client', role: 'Customer', text: 'Great service!', rating: 5 }] },
  pricing: { heading: 'Our Pricing', plans: [{ name: 'Basic', price: '₹999/mo', features: ['Feature 1', 'Feature 2'], popular: false }, { name: 'Pro', price: '₹2,499/mo', features: ['Feature 1', 'Feature 2', 'Feature 3'], popular: true }] },
  team: { heading: 'Our Team', members: [{ name: 'Team Member', role: 'Position', image: '' }] },
  faq: { heading: 'FAQ', items: [{ question: 'Your question here?', answer: 'Your answer here.' }] },
  contact_form: { heading: 'Contact Us', subheading: "We'd love to hear from you." },
  blog: { heading: 'Latest News', posts: [{ title: 'Post Title', excerpt: 'Brief excerpt...', date: 'Jan 2024' }] },
  html_embed: { html: '<p>Your custom HTML here</p>' },
  custom_block: {
    custom_anchor: 'help',
    heading: 'Help & Support Center',
    subheading: 'Find answers, guides, and assistance for your queries.',
    body: 'We are here to support you 24/7. Explore our help resources or reach out to our team.',
    bg_color: '#ffffff',
    text_color: '#1e293b',
    cta_text: 'Contact Support',
    cta_link: '#contact',
    items: [
      { icon: 'HelpCircle', title: 'Help & Knowledgebase', description: 'Find detailed guides, tutorials, and answers to common questions.', link: '#faq' },
      { icon: 'MessageCircle', title: 'Live Support & Chat', description: 'Get direct help from our team via chat or message.', link: '#contact' },
      { icon: 'BookOpen', title: 'Documentation & Guides', description: 'Explore documentation and step-by-step instructions.', link: '#' }
    ]
  },
};

import LucideIcon from '../components/common/LucideIcon';

// ─── Sortable Section Wrapper ─────────────────────────────────────────────────
function SortableSection({ section, siteSettings, isSelected, onSelect, onDelete, onToggleVisibility, onUpdate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, position: 'relative' };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Section toolbar */}
      <div
        className="section-toolbar"
        style={{
          position: 'absolute', top: 8, right: 8, zIndex: 10,
          display: 'flex', gap: 4, opacity: isSelected ? 1 : 0,
          transition: 'opacity .15s',
          background: 'rgba(0,0,0,0.9)', borderRadius: 8, padding: '4px 6px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <button {...listeners} {...attributes} title="Drag to reorder" style={tbBtn}>
          <LucideIcon name="GripVertical" size={14} color="#00FFD1" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onToggleVisibility(section.id); }} title={section.visible ? 'Hide' : 'Show'} style={tbBtn}>
          <LucideIcon name={section.visible ? 'Eye' : 'EyeOff'} size={14} color="rgba(255,255,255,0.8)" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(section.id); }} title="Delete" style={{ ...tbBtn }}>
          <LucideIcon name="Trash2" size={14} color="#f87171" />
        </button>
      </div>

      {/* Hover effect */}
      <div
        style={{
          outline: isSelected ? '2px solid #00FFD1' : '2px solid transparent',
          outlineOffset: '-2px',
          transition: 'outline-color .15s',
        }}
        onClick={() => onSelect(section)}
        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.outlineColor = 'rgba(0,255,209,0.3)'; }}
        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.outlineColor = 'transparent'; }}
      >
        {section.visible ? (
          <SectionRenderer section={section} siteSettings={siteSettings} isSelected={isSelected} onUpdate={onUpdate} />
        ) : (
          <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.01)', border: '2px dashed rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.4)' }}>
            <LucideIcon name="EyeOff" size={16} />
            <span style={{ fontSize: '0.85rem' }}>
              {SECTION_LABELS[section.type]?.label || section.type} — Hidden (click eye icon to show)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const tbBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  padding: '4px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center'
};

// ─── Social Icon SVGs ────────────────────────────────────────────────────────
const SOCIAL_SVGS = {
  whatsapp: (
    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'currentColor' }}>
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.023 14.053.977 11.993.977c-5.442 0-9.87 4.372-9.874 9.802-.001 1.77.463 3.5 1.34 5.043L2.453 20.3l4.194-1.146zm11.233-5.232c-.3-.15-1.771-.875-2.04-.972-.27-.099-.467-.15-.663.15-.195.3-.757.972-.929 1.171-.173.199-.347.223-.647.073-.3-.15-1.268-.467-2.414-1.488-.891-.795-1.492-1.778-1.667-2.078-.175-.3-.019-.461.13-.61.135-.133.3-.347.45-.52.15-.173.2-.3.3-.5.1-.199.05-.375-.025-.524-.075-.15-.663-1.6-.908-2.188-.24-.575-.483-.497-.663-.506-.17-.008-.367-.01-.563-.01-.197 0-.518.073-.789.375-.271.3-.103.972-.103.972s-.1.654-.055.942c.046.29.176.435.31.57.133.136.27.27.42.42m10.1-2.28c-.1-.1-.3-.2-.5-.3" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'currentColor' }}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'currentColor' }}>
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'currentColor' }}>
      <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'currentColor' }}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'currentColor' }}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
};

// ─── Main Editor ──────────────────────────────────────────────────────────────
export default function Editor() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { isDemo } = useAuth();
  const [site, setSite] = useState(null);
  const [pages, setPages] = useState([]);
  const [activePage, setActivePage] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [leftTab, setLeftTab] = useState('sections'); // sections | pages | settings
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef(null);
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop | tablet | mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const autosaveTimer = useRef(null);
  const [editorTheme, setEditorTheme] = useState(() => localStorage.getItem('sitecraft_editor_theme') || 'dark');
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [showCashfreeSecret, setShowCashfreeSecret] = useState(false);

  const toggleEditorTheme = () => {
    const nextTheme = editorTheme === 'dark' ? 'light' : 'dark';
    setEditorTheme(nextTheme);
    localStorage.setItem('sitecraft_editor_theme', nextTheme);
  };

  const [leftPanelWidth, setLeftPanelWidth] = useState(240);
  const [rightPanelWidth, setRightPanelWidth] = useState(300);

  const handleLeftMouseDown = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftPanelWidth;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(200, Math.min(480, startWidth + deltaX));
      setLeftPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [leftPanelWidth]);

  const handleRightMouseDown = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightPanelWidth;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(240, Math.min(480, startWidth - deltaX));
      setRightPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [rightPanelWidth]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    Promise.all([
      sitesApi.get(siteId),
      pagesApi.list(siteId),
    ]).then(([siteRes, pagesRes]) => {
      setSite(siteRes.data.site);
      const ps = pagesRes.data.pages || [];
      setPages(ps);
      const home = ps.find(p => p.slug === 'home') || ps[0];
      if (home) {
        setActivePage(home);
        setSections(home.sections || []);
      }
    }).catch(err => {
      console.error('Error loading site data:', err);
      alert('Error loading site: Site not found or session expired.');
      navigate('/builder/dashboard');
    }).finally(() => setLoading(false));
  }, [siteId, navigate]);

  const pushUndo = useCallback((sects) => {
    setUndoStack(s => [...s.slice(-19), sects]);
    setRedoStack([]);
  }, []);

  const updateSections = useCallback((newSections, record = true) => {
    if (record) pushUndo(sections);
    setSections(newSections);
    // Auto-save after 1.5s of inactivity
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      if (activePage) {
        pagesApi.update(siteId, activePage.id, { sections: newSections }).catch(() => {});
      }
    }, 1500);
  }, [sections, activePage, siteId, pushUndo]);

  const handleUndo = () => {
    if (!undoStack.length) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, sections]);
    setUndoStack(s => s.slice(0, -1));
    setSections(prev);
  };

  const handleRedo = () => {
    if (!redoStack.length) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(u => [...u, sections]);
    setRedoStack(r => r.slice(0, -1));
    setSections(next);
  };

  const handleSave = async () => {
    if (!activePage) return;
    setSaving(true);
    try {
      await pagesApi.update(siteId, activePage.id, { sections });
      await sitesApi.saveVersion(siteId);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { alert('Save failed'); }
    setSaving(false);
  };

  const addSection = (type) => {
    const newSection = {
      id: `${type}-${Date.now()}`,
      type,
      content: DEFAULT_CONTENT[type] || {},
      styles: {},
      order: sections.length,
      visible: true,
    };
    const updated = [...sections, newSection];
    updateSections(updated);
    setSelectedSection(newSection);
  };

  const deleteSection = (id) => {
    updateSections(sections.filter(s => s.id !== id));
    if (selectedSection?.id === id) setSelectedSection(null);
  };

  const toggleVisibility = (id) => {
    updateSections(sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const updateSectionContent = (id, newContent) => {
    const updated = sections.map(s => s.id === id ? { ...s, content: { ...s.content, ...newContent } } : s);
    updateSections(updated);
    const sel = updated.find(s => s.id === id);
    if (sel) setSelectedSection(sel);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIdx = sections.findIndex(s => s.id === active.id);
      const newIdx = sections.findIndex(s => s.id === over.id);
      updateSections(arrayMove(sections, oldIdx, newIdx));
    }
  };

  // ─── Settings helpers ────────────────────────────────────────────────────
  const updateSiteSettings = async (newSettings) => {
    if (!site) return;
    const merged = { ...site.settings, ...newSettings };
    setSite(prev => ({ ...prev, settings: merged }));
    try {
      await sitesApi.update(siteId, { settings: merged });
    } catch { /* silent */ }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const res = await assetsApi.upload(file);
      const url = res.data?.asset?.url || res.data?.url;
      if (url) {
        await updateSiteSettings({ logo_url: url, favicon_url: url });
      } else {
        console.error('Upload response missing url:', res.data);
        alert('Logo upload failed: unexpected response');
      }
    } catch (err) {
      console.error('Logo upload error:', err?.response?.data || err.message);
      alert('Logo upload failed: ' + (err?.response?.data?.detail || err.message));
    }
    setLogoUploading(false);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const removeLogo = async () => {
    await updateSiteSettings({ logo_url: '', favicon_url: '' });
  };

  const switchPage = (page) => {
    setActivePage(page);
    setSections(page.sections || []);
    setSelectedSection(null);
  };

  const handleCanvasClick = (e) => {
    // Find closest anchor tag or button
    const target = e.target.closest('a');
    
    // Check if click was inside an EditableText edit mode (avoid navigation)
    if (e.target.contentEditable === 'true' || e.target.closest('[contenteditable="true"]')) {
      return;
    }

    // Check if they clicked an <li> item in the footer Quick Links/Legal
    const li = e.target.closest('li');
    if (li && li.closest('ul')) {
      const pageTitle = li.textContent.trim();
      const matchedPage = pages.find(p => 
        p.title.toLowerCase() === pageTitle.toLowerCase() ||
        p.slug.toLowerCase() === pageTitle.toLowerCase() ||
        (pageTitle.toLowerCase().includes('terms') && p.slug === 'terms') ||
        (pageTitle.toLowerCase().includes('privacy') && p.slug === 'privacy') ||
        (pageTitle.toLowerCase().includes('cookie') && p.slug === 'cookie')
      );
      if (matchedPage) {
        e.preventDefault();
        e.stopPropagation();
        switchPage(matchedPage);
        return;
      }
    }

    if (target) {
      const href = target.getAttribute('href') || '';
      if (href) {
        if (href.startsWith('#')) {
          e.preventDefault();
          e.stopPropagation();
          const targetId = href.slice(1).toLowerCase();
          if (!targetId || targetId === 'top') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            let element = document.getElementById(targetId) || document.querySelector(`[data-section-type="${targetId}"]`) || document.querySelector(`[data-synonym="${targetId}"]`);
            if (!element) {
              const synonyms = {
                'product': 'services',
                'products': 'services',
                'service': 'services',
                'services': 'services',
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
                'gallery': 'gallery',
                'hero': 'hero',
                'home': 'hero'
              };
              for (const [key, value] of Object.entries(synonyms)) {
                if (targetId.includes(key) || key.includes(targetId)) {
                  element = document.getElementById(value) || document.querySelector(`[data-section-type="${value}"]`) || document.querySelector(`[data-synonym="${value}"]`);
                  if (element) break;
                }
              }
            }
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }
        } else {
          const urlPath = href.split('?')[0];
          const pageSlug = urlPath.replace('.html', '').toLowerCase();
          const matchedPage = pages.find(p => p.slug === pageSlug);
          if (matchedPage) {
            e.preventDefault();
            e.stopPropagation();
            switchPage(matchedPage);
          } else if (href.startsWith('buy.html') || href.includes('buy.html')) {
            e.preventDefault();
            e.stopPropagation();
            const urlParams = new URLSearchParams(href.split('?')[1] || '');
            const planName = urlParams.get('plan') || 'Selected Plan';
            const planPrice = urlParams.get('price') || '';
            alert(`🛒 Checkout Simulation:\n\nIn the published site, this button opens the Checkout page (buy.html) to process the subscription for:\nPlan: ${planName}\nPrice: ${planPrice}\n\nPayment Gateways Status:\n- Razorpay: ${site?.settings?.payment_gateways?.razorpay_key ? 'Enabled ✅' : 'Not Configured ❌'}\n- Cashfree: ${site?.settings?.payment_gateways?.cashfree_appid ? 'Enabled ✅' : 'Not Configured ❌'}\n- WhatsApp Pay/Chat: ${site?.settings?.whatsapp_number ? 'Enabled ✅' : 'Not Configured ❌'}\n\nThe order details will be saved to "orders.json" on your PHP host.`);
          }
        }
      }
    }
  };

  const PREVIEW_WIDTHS = { desktop: '100%', tablet: '768px', mobile: '390px' };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', marginBottom: 16 }}>
            <LucideIcon name="Settings" size={32} color="var(--brand-primary)" className="animate-spin" />
          </div>
          <p>Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={editorTheme === 'light' ? 'editor-light-mode' : ''} style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--editor-bg)', color: 'var(--editor-text-primary)', fontFamily: "'Outfit', sans-serif", overflow: 'hidden' }}>

      {/* ── Top Bar ── */}
      <div style={{
        height: 56, background: 'var(--editor-bg-subtle)', borderBottom: '1px solid var(--editor-border)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0,
        position: 'relative', zIndex: 10
      }}>
        <button onClick={() => navigate('/builder/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }} title="Dashboard">
          <LucideIcon name="ChevronLeft" size={20} />
        </button>
        <span style={{ color: 'var(--editor-text-primary)', fontWeight: 700, fontSize: '0.95rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {site?.name || 'Editor'}
        </span>

        {/* Preview toggle */}
        <div style={{ display: 'flex', background: 'var(--editor-bg)', borderRadius: 8, padding: 3, gap: 2, marginLeft: 'auto', border: '1px solid var(--editor-border)' }}>
          {[['desktop','Monitor'],['tablet','Tablet'],['mobile','Smartphone']].map(([mode, icon]) => (
            <button key={mode} onClick={() => setPreviewMode(mode)} style={{
              padding: '6px 12px', border: 'none', borderRadius: 6,
              background: previewMode === mode ? 'var(--brand-hover)' : 'transparent',
              color: previewMode === mode ? 'var(--brand-primary)' : 'var(--editor-text-secondary)', cursor: 'pointer', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <LucideIcon name={icon} size={15} />
            </button>
          ))}
        </div>

        {/* Undo/Redo */}
        <button onClick={handleUndo} disabled={!undoStack.length} style={{ ...iconBtn, opacity: undoStack.length ? 1 : 0.3 }} title="Undo">
          <LucideIcon name="Undo2" size={15} />
        </button>
        <button onClick={handleRedo} disabled={!redoStack.length} style={{ ...iconBtn, opacity: redoStack.length ? 1 : 0.3 }} title="Redo">
          <LucideIcon name="Redo2" size={15} />
        </button>

        {/* Theme Toggle */}
        <button onClick={toggleEditorTheme} style={iconBtn} title={editorTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          <LucideIcon name={editorTheme === 'dark' ? 'Sun' : 'Moon'} size={15} />
        </button>

        {/* Save */}
        <motion.button
          onClick={handleSave}
          disabled={saving}
          animate={{
            borderColor: saved ? 'var(--brand-primary)' : 'var(--border-subtle)',
            color: saved ? 'var(--brand-primary)' : 'var(--text-primary)'
          }}
          style={{
            padding: '7px 16px', background: 'var(--bg-overlay)',
            border: '1px solid var(--border-subtle)', borderRadius: 8,
            fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          <LucideIcon name={saved ? 'Check' : 'Save'} size={14} />
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
        </motion.button>

        {/* Publish */}
        <button
          onClick={() => navigate(`/builder/publish/${siteId}`)}
          style={{
            padding: '7px 16px', border: 'none', borderRadius: 8,
            background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-active))', color: '#fff',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 4px 12px var(--brand-hover)'
          }}
        >
          <LucideIcon name="Rocket" size={14} />
          Publish
        </button>
      </div>

      {/* Demo Banner */}
      {isDemo && (
        <div style={{ padding: '6px 16px', background: 'var(--brand-hover)', borderBottom: '1px solid var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexShrink: 0, position: 'relative', zIndex: 9 }}>
          <span style={{ color: 'var(--brand-primary)', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
            <LucideIcon name="Beaker" size={14} color="var(--brand-primary)" /> Demo Mode — Changes expire in 24h
          </span>
          <button onClick={() => navigate('/builder/login')} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Sign Up Free
          </button>
        </div>
      )}

      {/* ── Main 3-Column Layout ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 1 }}>

        {/* ── Left Panel ── */}
        <div style={{ width: leftPanelWidth, background: 'var(--editor-bg-subtle)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--editor-border)', background: 'var(--editor-bg-overlay)' }}>
            {[['sections','Sections'], ['pages','Pages'], ['settings','Settings']].map(([tab, label]) => (
              <button key={tab} onClick={() => setLeftTab(tab)} style={{
                flex: 1, padding: '12px 4px', border: 'none', background: 'none', cursor: 'pointer',
                color: leftTab === tab ? 'var(--brand-primary)' : 'var(--editor-text-muted)',
                fontWeight: leftTab === tab ? 700 : 500, fontSize: '0.8rem', fontFamily: 'inherit',
                borderBottom: leftTab === tab ? '2px solid var(--brand-primary)' : '2px solid transparent',
                transition: 'all .2s'
              }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {leftTab === 'sections' && (
              <div>
                <p style={{ color: 'var(--editor-text-muted)', fontSize: '0.68rem', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Add Section</p>
                {SECTION_TYPES.map(type => {
                  const info = SECTION_LABELS[type];
                  return (
                    <motion.button
                      key={type}
                      onClick={() => addSection(type)}
                      whileHover={{ x: 4 }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', marginBottom: 6, border: '1px solid transparent', borderRadius: 8,
                        background: 'var(--editor-btn-bg)', cursor: 'pointer', textAlign: 'left',
                        color: 'var(--editor-text-secondary)', fontFamily: 'inherit', fontSize: '0.82rem',
                        transition: 'all .15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(0,255,209,0.05)';
                        e.currentTarget.style.borderColor = 'rgba(0,255,209,0.15)';
                        e.currentTarget.style.color = '#00FFD1';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'var(--editor-btn-bg)';
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.color = 'var(--editor-text-secondary)';
                      }}
                    >
                      <LucideIcon name={info.icon} size={15} />
                      <span>{info.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {leftTab === 'pages' && (
              <div>
                <p style={{ color: 'var(--editor-text-muted)', fontSize: '0.68rem', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Pages</p>
                {pages.map(page => (
                  <button
                    key={page.id}
                    onClick={() => switchPage(page)}
                    style={{
                      width: '100%', padding: '10px 12px', marginBottom: 6, border: '1px solid transparent', borderRadius: 8,
                      background: activePage?.id === page.id ? 'rgba(0,255,209,0.05)' : 'var(--editor-btn-bg)',
                      borderColor: activePage?.id === page.id ? 'rgba(0,255,209,0.15)' : 'transparent',
                      cursor: 'pointer', textAlign: 'left', color: activePage?.id === page.id ? '#00FFD1' : 'var(--editor-text-secondary)',
                      fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: activePage?.id === page.id ? 700 : 500,
                      display: 'flex', alignItems: 'center', gap: 8
                    }}
                  >
                    <LucideIcon name="FileText" size={14} />
                    {page.title}
                  </button>
                ))}
              </div>
            )}

            {leftTab === 'settings' && (
              <div>
                {/* ── Company Name ── */}
                <p style={{ color: 'var(--editor-text-muted)', fontSize: '0.68rem', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Company Branding</p>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: 'var(--editor-text-secondary)', fontSize: '0.72rem', display: 'block', marginBottom: 4, fontWeight: 600 }}>Company Name</label>
                  <input
                    type="text"
                    value={site?.settings?.footer?.company_name || ''}
                    onChange={(e) => {
                      const updatedFooter = { ...site?.settings?.footer, company_name: e.target.value };
                      updateSiteSettings({ footer: updatedFooter });
                    }}
                    style={{
                      width: '100%', padding: '8px 10px', background: 'var(--editor-input-bg)',
                      border: '1px solid var(--editor-input-border)', borderRadius: 8, color: 'var(--editor-text-primary)',
                      fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none'
                    }}
                  />
                </div>

                {/* ── Logo Upload ── */}
                <p style={{ color: 'var(--editor-text-muted)', fontSize: '0.68rem', margin: '16px 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Site Logo / Favicon</p>
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                {site?.settings?.logo_url ? (
                  <div style={{ marginBottom: 16 }}>
                    <div 
                      onClick={() => logoInputRef.current?.click()}
                      style={{ background: 'var(--editor-input-bg)', borderRadius: 12, padding: 16, border: '1px solid var(--editor-border-subtle)', textAlign: 'center', marginBottom: 8, cursor: 'pointer', transition: 'border-color 0.2s' }}
                      title="Click to change logo"
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--editor-border-subtle)'}
                    >
                      <img src={resolveAssetUrl(site.settings.logo_url)} alt="Logo" style={{ maxHeight: 48, maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => logoInputRef.current?.click()} style={{ flex: 1, padding: '8px', background: 'var(--editor-input-bg)', border: '1px solid var(--editor-input-border)', borderRadius: 8, color: 'var(--editor-text-primary)', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit', fontWeight: 600 }}>
                        Change
                      </button>
                      <button onClick={removeLogo} style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit', fontWeight: 600 }}>
                        <LucideIcon name="Trash2" size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => logoInputRef.current?.click()} disabled={logoUploading} style={{ width: '100%', padding: '20px', background: 'rgba(0,255,209,0.03)', border: '2px dashed rgba(0,255,209,0.15)', borderRadius: 12, color: '#00FFD1', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit', fontWeight: 600, marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <LucideIcon name="Upload" size={20} />
                    {logoUploading ? 'Uploading...' : 'Upload Logo'}
                    <span style={{ color: 'var(--editor-text-muted)', fontSize: '0.7rem', fontWeight: 400 }}>Used as site logo &amp; browser favicon</span>
                  </button>
                )}

                {/* ── Brand Colors ── */}
                <p style={{ color: 'var(--editor-text-muted)', fontSize: '0.68rem', margin: '16px 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Brand Colors</p>
                {['primary', 'secondary', 'accent'].map(key => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <input type="color" value={site?.settings?.brand_colors?.[key] || '#6366f1'}
                      onChange={e => updateSiteSettings({ brand_colors: { ...site?.settings?.brand_colors, [key]: e.target.value } })}
                      style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 6 }} />
                    <span style={{ color: 'var(--editor-text-secondary)', fontSize: '0.78rem', textTransform: 'capitalize' }}>{key}</span>
                    <span style={{ color: 'var(--editor-text-muted)', fontSize: '0.72rem', marginLeft: 'auto' }}>{site?.settings?.brand_colors?.[key] || '#6366f1'}</span>
                  </div>
                ))}

                {/* ── Typography ── */}
                <p style={{ color: 'var(--editor-text-muted)', fontSize: '0.68rem', margin: '16px 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Typography</p>
                {[['font_heading', 'Heading Font'], ['font_body', 'Body Font']].map(([key, label]) => (
                  <div key={key} style={{ marginBottom: 10 }}>
                    <label style={{ color: 'var(--editor-text-secondary)', fontSize: '0.72rem', display: 'block', marginBottom: 4, fontWeight: 600 }}>{label}</label>
                    <select value={site?.settings?.[key] || 'Outfit'}
                      onChange={e => updateSiteSettings({ [key]: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', background: 'var(--editor-input-bg)', border: '1px solid var(--editor-input-border)', borderRadius: 8, color: 'var(--editor-text-primary)', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
                      {['Outfit', 'Inter', 'Roboto', 'Poppins', 'Montserrat', 'Open Sans', 'Lato', 'Raleway', 'Playfair Display', 'Merriweather'].map(f => (
                        <option key={f} value={f} style={{ background: 'var(--editor-bg)', color: 'var(--editor-text-primary)' }}>{f}</option>
                      ))}
                    </select>
                  </div>
                ))}

                {/* ── Navbar Links Editor ── */}
                <p style={{ color: 'var(--editor-text-muted)', fontSize: '0.68rem', margin: '16px 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Navbar Links &amp; Section Targets</p>
                {(site?.settings?.navbar?.items || []).map((item, i) => (
                  <div key={i} style={{ marginBottom: 12, background: 'var(--editor-input-bg)', border: '1px solid var(--editor-input-border)', padding: 10, borderRadius: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <label style={{ color: 'var(--editor-text-secondary)', fontSize: '0.72rem', fontWeight: 700 }}>Link #{i+1}</label>
                      <button
                        onClick={() => {
                          const updatedItems = site.settings.navbar.items.filter((_, idx) => idx !== i);
                          updateSiteSettings({ navbar: { ...site.settings.navbar, items: updatedItems } });
                        }}
                        style={{
                          padding: '4px 6px', background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#f87171',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          outline: 'none', fontSize: '0.7rem'
                        }}
                        title="Delete Link"
                      >
                        <LucideIcon name="Trash2" size={12} />
                      </button>
                    </div>

                    {/* Link Label */}
                    <div style={{ marginBottom: 8 }}>
                      <label style={{ color: 'var(--editor-text-muted)', fontSize: '0.68rem', display: 'block', marginBottom: 3 }}>Button / Link Title</label>
                      <input
                        type="text"
                        value={item.label || ''}
                        onChange={(e) => {
                          const updatedItems = [...site.settings.navbar.items];
                          updatedItems[i] = { ...updatedItems[i], label: e.target.value };
                          updateSiteSettings({ navbar: { ...site.settings.navbar, items: updatedItems } });
                        }}
                        style={{
                          width: '100%', padding: '6px 10px', background: 'var(--editor-bg)',
                          border: '1px solid var(--editor-input-border)', borderRadius: 6, color: 'var(--editor-text-primary)',
                          fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box'
                        }}
                        placeholder="e.g. Products, Services, About"
                      />
                    </div>

                    {/* Link Target / Destination */}
                    <div style={{ marginTop: 8 }}>
                      <label style={{ color: 'var(--editor-text-muted)', fontSize: '0.68rem', display: 'block', marginBottom: 3 }}>Target Section / URL</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {(() => {
                          const stdTargets = [
                            { value: '#services', label: 'Services / Products Section (#services)' },
                            { value: '#products', label: 'Products Section (#products)' },
                            { value: '#hero', label: 'Hero Banner (#hero)' },
                            { value: '#about', label: 'About Us Section (#about)' },
                            { value: '#pricing', label: 'Pricing Table (#pricing)' },
                            { value: '#gallery', label: 'Gallery (#gallery)' },
                            { value: '#testimonials', label: 'Testimonials (#testimonials)' },
                            { value: '#team', label: 'Team (#team)' },
                            { value: '#faq', label: 'FAQ Accordion (#faq)' },
                            { value: '#contact', label: 'Contact Form (#contact)' },
                            { value: '#blog', label: 'Blog / News (#blog)' },
                          ];
                          (sections || []).forEach(sec => {
                            if (sec.type === 'custom_block') {
                              const anchor = sec.content?.custom_anchor ? `#${sec.content.custom_anchor}` : `#${sec.id}`;
                              const title = sec.content?.heading || 'Custom Section';
                              if (!stdTargets.some(t => t.value === anchor)) {
                                stdTargets.push({ value: anchor, label: `${title} (${anchor})` });
                              }
                            }
                          });
                          const knownValues = stdTargets.map(t => t.value);
                          const isKnown = knownValues.includes(item.href);
                          return (
                            <>
                              <select
                                value={isKnown ? item.href : 'custom'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val !== 'custom') {
                                    const updatedItems = [...site.settings.navbar.items];
                                    updatedItems[i] = { ...updatedItems[i], href: val };
                                    updateSiteSettings({ navbar: { ...site.settings.navbar, items: updatedItems } });
                                  }
                                }}
                                style={{
                                  width: '100%', padding: '6px 8px', background: 'var(--editor-bg)',
                                  border: '1px solid var(--editor-input-border)', borderRadius: 6, color: 'var(--editor-text-primary)',
                                  fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', boxSizing: 'border-box'
                                }}
                              >
                                {stdTargets.map(t => (
                                  <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                                <option value="custom">Custom Link / Target...</option>
                              </select>
                              <input
                                type="text"
                                value={item.href || ''}
                                onChange={(e) => {
                                  const updatedItems = [...site.settings.navbar.items];
                                  updatedItems[i] = { ...updatedItems[i], href: e.target.value };
                                  updateSiteSettings({ navbar: { ...site.settings.navbar, items: updatedItems } });
                                }}
                                style={{
                                  width: '100%', padding: '6px 10px', background: 'var(--editor-bg)',
                                  border: '1px solid var(--editor-input-border)', borderRadius: 6, color: 'var(--editor-text-primary)',
                                  fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box'
                                }}
                                placeholder="e.g. #help, #support, about.html, or external URL"
                              />
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const currentItems = site?.settings?.navbar?.items || [];
                    const updatedItems = [...currentItems, { label: `Products`, href: '#services' }];
                    updateSiteSettings({ navbar: { ...site.settings.navbar, items: updatedItems } });
                  }}
                  style={{
                    width: '100%', padding: '8px 12px', background: 'rgba(0,255,209,0.05)',
                    border: '1px dashed rgba(0,255,209,0.3)', borderRadius: 8, color: '#00FFD1',
                    cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    marginBottom: 16, outline: 'none'
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>+</span> Add Link
                </button>
                {site?.settings?.navbar?.cta && (
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ color: 'var(--editor-text-secondary)', fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>Navbar CTA Button Text</label>
                    <input
                      type="text"
                      value={site.settings.navbar.cta.text || ''}
                      onChange={(e) => {
                        updateSiteSettings({ navbar: { ...site.settings.navbar, cta: { ...site.settings.navbar.cta, text: e.target.value } } });
                      }}
                      style={{
                        width: '100%', padding: '8px 10px', background: 'var(--editor-input-bg)',
                        border: '1px solid var(--editor-input-border)', borderRadius: 8, color: 'var(--editor-text-primary)',
                        fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none'
                      }}
                      placeholder="Button Text"
                    />
                  </div>
                )}

                {/* ── Footer Settings ── */}
                <p style={{ color: 'var(--editor-text-muted)', fontSize: '0.68rem', margin: '20px 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Footer Info</p>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ color: 'var(--editor-text-secondary)', fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>Footer Description</label>
                  <textarea
                    value={site?.settings?.footer?.description || ''}
                    onChange={(e) => {
                      const updatedFooter = { ...site?.settings?.footer, description: e.target.value };
                      updateSiteSettings({ footer: updatedFooter });
                    }}
                    rows={3}
                    style={{
                      width: '100%', padding: '8px 10px', background: 'var(--editor-input-bg)',
                      border: '1px solid var(--editor-input-border)', borderRadius: 8, color: 'var(--editor-text-primary)',
                      fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical'
                    }}
                    placeholder="Short description of your business..."
                  />
                </div>
                {[['address', 'Address'], ['phone', 'Phone Number'], ['email', 'Email Address'], ['copyright', 'Copyright Text']].map(([field, label]) => (
                  <div key={field} style={{ marginBottom: 10 }}>
                    <label style={{ color: 'var(--editor-text-secondary)', fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>{label}</label>
                    <input
                      type="text"
                      value={site?.settings?.footer?.[field] || ''}
                      onChange={(e) => {
                        const updatedFooter = { ...site?.settings?.footer, [field]: e.target.value };
                        updateSiteSettings({ footer: updatedFooter });
                      }}
                      style={{
                        width: '100%', padding: '8px 10px', background: 'var(--editor-input-bg)',
                        border: '1px solid var(--editor-input-border)', borderRadius: 8, color: 'var(--editor-text-primary)',
                        fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none'
                      }}
                      placeholder={label}
                    />
                  </div>
                ))}

                {/* ── Social Links & Integrations (Paid Add-ons) ── */}
                <p style={{ color: 'var(--editor-text-muted)', fontSize: '0.68rem', margin: '20px 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Social Links & Integrations</p>

                {[
                  { key: 'whatsapp', label: 'WhatsApp Number (with Country Code)', placeholder: 'e.g. 919999999999', value: site?.settings?.whatsapp_number || '', onChange: (v) => updateSiteSettings({ whatsapp_number: v.replace(/\D/g, '') }) },
                  { key: 'instagram', label: 'Instagram Profile Link', placeholder: 'e.g. https://instagram.com/mybrand', value: site?.settings?.footer?.social?.instagram || '', onChange: (v) => updateSiteSettings({ footer: { ...site.settings.footer, social: { ...site.settings.footer.social, instagram: v } } }) },
                  { key: 'facebook', label: 'Facebook Page Link', placeholder: 'e.g. https://facebook.com/mybrand', value: site?.settings?.footer?.social?.facebook || '', onChange: (v) => updateSiteSettings({ footer: { ...site.settings.footer, social: { ...site.settings.footer.social, facebook: v } } }) },
                  { key: 'youtube', label: 'YouTube Channel Link', placeholder: 'e.g. https://youtube.com/@mybrand', value: site?.settings?.footer?.social?.youtube || '', onChange: (v) => updateSiteSettings({ footer: { ...site.settings.footer, social: { ...site.settings.footer.social, youtube: v } } }) },
                  { key: 'linkedin', label: 'LinkedIn Profile Link', placeholder: 'e.g. https://linkedin.com/in/mybrand', value: site?.settings?.footer?.social?.linkedin || '', onChange: (v) => updateSiteSettings({ footer: { ...site.settings.footer, social: { ...site.settings.footer.social, linkedin: v } } }) },
                  { key: 'github', label: 'GitHub Profile Link', placeholder: 'e.g. https://github.com/mybrand', value: site?.settings?.footer?.social?.github || '', onChange: (v) => updateSiteSettings({ footer: { ...site.settings.footer, social: { ...site.settings.footer.social, github: v } } }) }
                ].map(({ key, label, placeholder, value, onChange }) => {
                  const isUnlocked = site?.settings?.unlocked_socials?.includes(key);
                  return (
                    <div key={key} style={{ marginBottom: 12, position: 'relative' }}>
                      <label style={{ color: 'var(--editor-text-secondary)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>{label}</span>
                        {!isUnlocked && (
                          <span style={{ color: '#ffb703', fontSize: '0.65rem', fontWeight: 700, background: 'rgba(255,183,3,0.1)', padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <LucideIcon name="Lock" size={10} color="#ffb703" /> Locked
                          </span>
                        )}
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <input
                          type="text"
                          value={isUnlocked ? value : ''}
                          onChange={(e) => isUnlocked && onChange(e.target.value)}
                          onClick={() => !isUnlocked && setShowUpgradeModal(key)}
                          readOnly={!isUnlocked}
                          placeholder={isUnlocked ? placeholder : 'Click lock to purchase & unlock'}
                          style={{
                            width: '100%', padding: '8px 10px', background: isUnlocked ? 'var(--editor-input-bg)' : 'rgba(255,183,3,0.02)',
                            border: isUnlocked ? '1px solid var(--editor-input-border)' : '1px solid rgba(255,183,3,0.2)', borderRadius: 8, color: isUnlocked ? 'var(--editor-text-primary)' : 'var(--editor-text-muted)',
                            fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', cursor: isUnlocked ? 'text' : 'pointer'
                          }}
                        />
                        {!isUnlocked && (
                          <button
                            onClick={() => setShowUpgradeModal(key)}
                            style={{ position: 'absolute', right: 8, background: '#ffb703', border: 'none', borderRadius: 4, color: '#121212', padding: '3px 8px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Unlock
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Custom Social Link */}
                {(() => {
                  const isUnlocked = site?.settings?.unlocked_socials?.includes('custom');
                  return (
                    <div style={{ marginBottom: 12, border: '1px solid var(--editor-border)', padding: 10, borderRadius: 8, background: 'var(--editor-bg-subtle)', boxSizing: 'border-box' }}>
                      <label style={{ color: 'var(--editor-text-secondary)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span>Custom Social Link (e.g. LinkedIn, Linktree)</span>
                        {!isUnlocked && (
                          <span style={{ color: '#ffb703', fontSize: '0.65rem', fontWeight: 700, background: 'rgba(255,183,3,0.1)', padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <LucideIcon name="Lock" size={10} color="#ffb703" /> Locked
                          </span>
                        )}
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, boxSizing: 'border-box' }}>
                        <input
                          type="text"
                          value={isUnlocked ? (site?.settings?.footer?.social?.custom_name || '') : ''}
                          onChange={(e) => isUnlocked && updateSiteSettings({ footer: { ...site.settings.footer, social: { ...site.settings.footer.social, custom_name: e.target.value } } })}
                          onClick={() => !isUnlocked && setShowUpgradeModal('custom')}
                          readOnly={!isUnlocked}
                          placeholder={isUnlocked ? "Link Name (e.g. LinkedIn)" : "Link Name (Locked)"}
                          style={{
                            width: '100%', padding: '8px 10px', background: isUnlocked ? 'var(--editor-input-bg)' : 'rgba(255,183,3,0.02)',
                            border: isUnlocked ? '1px solid var(--editor-input-border)' : '1px solid rgba(255,183,3,0.2)', borderRadius: 8, color: isUnlocked ? 'var(--editor-text-primary)' : 'var(--editor-text-muted)',
                            fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', cursor: isUnlocked ? 'text' : 'pointer', boxSizing: 'border-box'
                          }}
                        />
                        <input
                          type="text"
                          value={isUnlocked ? (site?.settings?.footer?.social?.custom_link || '') : ''}
                          onChange={(e) => isUnlocked && updateSiteSettings({ footer: { ...site.settings.footer, social: { ...site.settings.footer.social, custom_link: e.target.value } } })}
                          onClick={() => !isUnlocked && setShowUpgradeModal('custom')}
                          readOnly={!isUnlocked}
                          placeholder={isUnlocked ? "URL (https://...)" : "URL (Locked)"}
                          style={{
                            width: '100%', padding: '8px 10px', background: isUnlocked ? 'var(--editor-input-bg)' : 'rgba(255,183,3,0.02)',
                            border: isUnlocked ? '1px solid var(--editor-input-border)' : '1px solid rgba(255,183,3,0.2)', borderRadius: 8, color: isUnlocked ? 'var(--editor-text-primary)' : 'var(--editor-text-muted)',
                            fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', cursor: isUnlocked ? 'text' : 'pointer', boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      {!isUnlocked && (
                        <button
                          onClick={() => setShowUpgradeModal('custom')}
                          style={{ width: '100%', marginTop: 8, background: '#ffb703', border: 'none', borderRadius: 6, color: '#121212', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Unlock Custom Named Link (₹149)
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* ── Payment Gateway Settings ── */}
                <p style={{ color: 'var(--editor-text-muted)', fontSize: '0.68rem', margin: '24px 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Payment Gateways (Razorpay &amp; Cashfree)</p>
                
                {/* Razorpay Credentials Card */}
                <div style={{ marginBottom: 16, background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: 12, borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }}></div>
                    <span style={{ color: 'var(--editor-text-primary)', fontSize: '0.82rem', fontWeight: 700 }}>Razorpay Credentials (2 IDs)</span>
                  </div>
                  
                  {/* Razorpay Key ID */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ color: 'var(--editor-text-secondary)', fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>1. Razorpay Key ID (Public Key)</label>
                    <input
                      type="text"
                      value={site?.settings?.payment_gateways?.razorpay_key || ''}
                      onChange={(e) => {
                        const gateways = { ...site?.settings?.payment_gateways, razorpay_key: e.target.value };
                        updateSiteSettings({ payment_gateways: gateways });
                      }}
                      style={{
                        width: '100%', padding: '8px 10px', background: 'var(--editor-input-bg)',
                        border: '1px solid var(--editor-input-border)', borderRadius: 8, color: 'var(--editor-text-primary)',
                        fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box'
                      }}
                      placeholder="e.g. rzp_live_... or rzp_test_..."
                    />
                  </div>

                  {/* Razorpay Key Secret */}
                  <div>
                    <label style={{ color: 'var(--editor-text-secondary)', fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>2. Razorpay Key Secret (Private Secret)</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showRazorpaySecret ? 'text' : 'password'}
                        value={site?.settings?.payment_gateways?.razorpay_secret || ''}
                        onChange={(e) => {
                          const gateways = { ...site?.settings?.payment_gateways, razorpay_secret: e.target.value };
                          updateSiteSettings({ payment_gateways: gateways });
                        }}
                        style={{
                          width: '100%', padding: '8px 32px 8px 10px', background: 'var(--editor-input-bg)',
                          border: '1px solid var(--editor-input-border)', borderRadius: 8, color: 'var(--editor-text-primary)',
                          fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box'
                        }}
                        placeholder="e.g. secret_..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                        style={{ position: 'absolute', right: 8, background: 'none', border: 'none', color: 'var(--editor-text-muted)', cursor: 'pointer', padding: 2 }}
                        title={showRazorpaySecret ? "Hide Secret" : "Show Secret"}
                      >
                        <LucideIcon name={showRazorpaySecret ? "EyeOff" : "Eye"} size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cashfree Credentials Card */}
                <div style={{ marginBottom: 16, background: 'rgba(0, 255, 209, 0.05)', border: '1px solid rgba(0, 255, 209, 0.2)', padding: 12, borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FFD1' }}></div>
                    <span style={{ color: 'var(--editor-text-primary)', fontSize: '0.82rem', fontWeight: 700 }}>Cashfree Credentials (2 IDs)</span>
                  </div>

                  {/* Cashfree App ID */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ color: 'var(--editor-text-secondary)', fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>1. Cashfree App ID (Client ID)</label>
                    <input
                      type="text"
                      value={site?.settings?.payment_gateways?.cashfree_appid || ''}
                      onChange={(e) => {
                        const gateways = { ...site?.settings?.payment_gateways, cashfree_appid: e.target.value };
                        updateSiteSettings({ payment_gateways: gateways });
                      }}
                      style={{
                        width: '100%', padding: '8px 10px', background: 'var(--editor-input-bg)',
                        border: '1px solid var(--editor-input-border)', borderRadius: 8, color: 'var(--editor-text-primary)',
                        fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box'
                      }}
                      placeholder="e.g. cf_app_id_..."
                    />
                  </div>

                  {/* Cashfree Secret Key */}
                  <div>
                    <label style={{ color: 'var(--editor-text-secondary)', fontSize: '0.72rem', display: 'block', marginBottom: 4 }}>2. Cashfree Secret Key (Client Secret)</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showCashfreeSecret ? 'text' : 'password'}
                        value={site?.settings?.payment_gateways?.cashfree_secret || ''}
                        onChange={(e) => {
                          const gateways = { ...site?.settings?.payment_gateways, cashfree_secret: e.target.value };
                          updateSiteSettings({ payment_gateways: gateways });
                        }}
                        style={{
                          width: '100%', padding: '8px 32px 8px 10px', background: 'var(--editor-input-bg)',
                          border: '1px solid var(--editor-input-border)', borderRadius: 8, color: 'var(--editor-text-primary)',
                          fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box'
                        }}
                        placeholder="e.g. cfsecret_..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowCashfreeSecret(!showCashfreeSecret)}
                        style={{ position: 'absolute', right: 8, background: 'none', border: 'none', color: 'var(--editor-text-muted)', cursor: 'pointer', padding: 2 }}
                        title={showCashfreeSecret ? "Hide Secret" : "Show Secret"}
                      >
                        <LucideIcon name={showCashfreeSecret ? "EyeOff" : "Eye"} size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Left Resizer */}
        <div
          onMouseDown={handleLeftMouseDown}
          className="resizer-bar"
        />

        {/* ── Center Canvas ── */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#080808', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '24px' }}>
          <div 
            onClickCapture={handleCanvasClick}
            style={{
            width: PREVIEW_WIDTHS[previewMode],
            maxWidth: '100%',
            background: 'white',
            minHeight: '100%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
            borderRadius: previewMode !== 'desktop' ? 16 : 0,
            overflow: 'hidden',
            transition: 'width .3s',
            border: previewMode !== 'desktop' ? '6px solid #1c1c1c' : 'none',
            position: 'relative'
          }}>
            {/* ── Live Navbar Preview ── */}
            <div style={{ background: site?.settings?.brand_colors?.secondary || '#1e293b', padding: '0 12px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 48, maxWidth: 1200, margin: '0 auto', gap: 8 }}>
                {/* Logo & Company Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {/* Logo — click to upload */}
                  {site?.settings?.logo_url ? (
                    <div
                      onClick={(e) => { e.stopPropagation(); logoInputRef.current?.click(); }}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'transform 0.15s' }}
                      title="Click to change logo"
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                    >
                      <img src={resolveAssetUrl(site.settings.logo_url)} alt="Logo" style={{ maxHeight: 28, objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <div
                      onClick={(e) => { e.stopPropagation(); logoInputRef.current?.click(); }}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.45)', border: '1px dashed rgba(255,255,255,0.2)', padding: '4px', borderRadius: 6, transition: 'all 0.2s' }}
                      title="Upload Logo"
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,255,209,0.5)'; e.currentTarget.style.color = '#00FFD1'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                    >
                      <LucideIcon name="Image" size={14} />
                    </div>
                  )}
                  {/* Company Name — click to edit */}
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <EditableText
                      tag="span"
                      value={site?.settings?.footer?.company_name || site?.name || 'My Website'}
                      onSave={(v) => {
                        const updatedFooter = { ...site?.settings?.footer, company_name: v };
                        updateSiteSettings({ footer: updatedFooter });
                      }}
                      style={{
                        fontFamily: `'${site?.settings?.font_heading || 'Outfit'}', sans-serif`,
                        fontSize: previewMode === 'mobile' ? '0.85rem' : '1rem',
                        fontWeight: 800,
                        color: 'white',
                        whiteSpace: 'nowrap'
                      }}
                    />
                  </span>
                </div>
                {/* Nav items — Desktop */}
                {previewMode === 'desktop' && (
                  <div style={{ display: 'flex', gap: 16, overflow: 'hidden', flex: 1, justifyContent: 'center' }}>
                    {(site?.settings?.navbar?.items || []).map((item, i) => (
                      <a
                        key={i}
                        href={item.href || '#'}
                        onClick={(e) => {
                          const href = item.href || '#';
                          if (href.startsWith('#')) {
                            e.preventDefault();
                            const targetId = href.slice(1).toLowerCase();
                            let el = document.getElementById(targetId);
                            if (!el) {
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
                              for (const [key, value] of Object.entries(synonyms)) {
                                if (targetId.includes(key)) {
                                  el = document.getElementById(value);
                                  if (el) break;
                                }
                              }
                            }
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            const pageSlug = href.replace('.html', '').toLowerCase();
                            const matchedPage = pages.find(p => p.slug === pageSlug);
                            if (matchedPage) {
                              e.preventDefault();
                              switchPage(matchedPage);
                            }
                          }
                        }}
                        style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap', textDecoration: 'none', cursor: 'pointer' }}
                      >
                        <EditableText
                          tag="span"
                          value={item.label || ''}
                          onSave={(v) => {
                            const updatedItems = [...site.settings.navbar.items];
                            updatedItems[i] = { ...updatedItems[i], label: v };
                            updateSiteSettings({ navbar: { ...site.settings.navbar, items: updatedItems } });
                          }}
                          style={{ color: 'rgba(255,255,255,0.75)' }}
                        />
                      </a>
                    ))}
                  </div>
                )}
                {/* CTA / hamburger */}
                {previewMode === 'desktop' ? (
                  site?.settings?.navbar?.cta && (
                    <a
                      href={site.settings.navbar.cta.href || '#contact'}
                      onClick={(e) => {
                        const href = site.settings.navbar.cta.href || '#contact';
                        if (href.startsWith('#')) {
                          e.preventDefault();
                          const el = document.getElementById(href.slice(1));
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      style={{ background: site?.settings?.brand_colors?.primary || '#6366f1', color: 'white', padding: '5px 14px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, textDecoration: 'none', display: 'inline-block' }}
                    >
                      <EditableText
                        tag="span"
                        value={site.settings.navbar.cta.text || 'Contact Us'}
                        onSave={(v) => {
                          updateSiteSettings({ navbar: { ...site.settings.navbar, cta: { ...site.settings.navbar.cta, text: v } } });
                        }}
                        style={{ color: 'white' }}
                      />
                    </a>
                  )
                ) : (
                  <div
                    onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(!mobileMenuOpen); }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '6px 8px', cursor: 'pointer', borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    title="Toggle menu"
                  >
                    <div style={{ width: 18, height: 2, background: 'rgba(255,255,255,0.8)', borderRadius: 1 }} />
                    <div style={{ width: 14, height: 2, background: 'rgba(255,255,255,0.6)', borderRadius: 1 }} />
                    <div style={{ width: 18, height: 2, background: 'rgba(255,255,255,0.8)', borderRadius: 1 }} />
                  </div>
                )}
              </div>

              {/* Mobile Menu Dropdown */}
              {previewMode !== 'desktop' && mobileMenuOpen && (
                <div style={{
                  position: 'absolute', top: 48, left: 0, right: 0,
                  background: site?.settings?.brand_colors?.secondary || '#1e293b',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 14,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)', zIndex: 9999, textAlign: 'center'
                }}>
                  {(site?.settings?.navbar?.items || []).map((item, i) => (
                    <div key={i} style={{ padding: '6px 0' }}>
                      <a
                        href={item.href || '#'}
                        onClick={(e) => {
                          const href = item.href || '#';
                          if (href.startsWith('#')) {
                            e.preventDefault();
                            const el = document.getElementById(href.slice(1));
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            const pageSlug = href.replace('.html', '').toLowerCase();
                            const matchedPage = pages.find(p => p.slug === pageSlug);
                            if (matchedPage) {
                              e.preventDefault();
                              switchPage(matchedPage);
                            }
                          }
                          setMobileMenuOpen(false);
                        }}
                        style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none', display: 'block', cursor: 'pointer' }}
                      >
                        <EditableText
                          tag="span"
                          value={item.label || ''}
                          onSave={(v) => {
                            const updatedItems = [...site.settings.navbar.items];
                            updatedItems[i] = { ...updatedItems[i], label: v };
                            updateSiteSettings({ navbar: { ...site.settings.navbar, items: updatedItems } });
                          }}
                          style={{ color: 'rgba(255,255,255,0.85)' }}
                        />
                      </a>
                    </div>
                  ))}
                  {site?.settings?.navbar?.cta && (
                    <div style={{ marginTop: 8 }}>
                      <a
                        href={site.settings.navbar.cta.href || '#contact'}
                        onClick={(e) => {
                          const href = site.settings.navbar.cta.href || '#contact';
                          if (href.startsWith('#')) {
                            e.preventDefault();
                            const el = document.getElementById(href.slice(1));
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }
                          setMobileMenuOpen(false);
                        }}
                        style={{ display: 'inline-block', background: site?.settings?.brand_colors?.primary || '#6366f1', color: 'white', padding: '6px 20px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}
                      >
                        <EditableText
                          tag="span"
                          value={site.settings.navbar.cta.text || 'Contact Us'}
                          onSave={(v) => {
                            updateSiteSettings({ navbar: { ...site.settings.navbar, cta: { ...site.settings.navbar.cta, text: v } } });
                          }}
                          style={{ color: 'white' }}
                        />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
            {sections.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 40, background: '#000' }}>
                <div style={{ display: 'inline-flex', marginBottom: 16 }}>
                  <LucideIcon name="Sparkles" size={40} color="#00FFD1" />
                </div>
                <h3 style={{ color: 'white', marginBottom: 8, fontWeight: 700 }}>Canvas is empty</h3>
                <p style={{ fontSize: '0.85rem', maxWidth: 300, lineHeight: 1.5 }}>Click sections in the left sidebar to add them to your page.</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  {sections.map(section => (
                    <SortableSection
                      key={section.id}
                      section={section}
                      siteSettings={site?.settings}
                      isSelected={selectedSection?.id === section.id}
                      onSelect={setSelectedSection}
                      onDelete={deleteSection}
                      onToggleVisibility={toggleVisibility}
                      onUpdate={(newContent) => updateSectionContent(section.id, newContent)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}

            {/* ── Live Footer Preview ── */}
            <div style={{ background: site?.settings?.brand_colors?.secondary || '#1e293b', color: 'white', padding: '32px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: previewMode === 'mobile' ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, maxWidth: 1200, margin: '0 auto', textAlign: 'left' }}>
                <div>
                  {site?.settings?.logo_url && (
                    <div 
                      onClick={(e) => { e.stopPropagation(); logoInputRef.current?.click(); }}
                      style={{ cursor: 'pointer', display: 'inline-flex', transition: 'transform 0.15s' }}
                      title="Click to change logo"
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                    >
                      <img src={resolveAssetUrl(site.settings.logo_url)} alt="Logo" style={{ maxHeight: 32, objectFit: 'contain', display: 'block', marginBottom: 12 }} />
                    </div>
                  )}
                  <h3 style={{ fontFamily: `'${site?.settings?.font_heading || 'Outfit'}', sans-serif`, fontSize: '1.05rem', fontWeight: 700, margin: '0 0 12px' }}>
                    <EditableText
                      tag="span"
                      value={site?.settings?.footer?.company_name || site?.name || 'My Website'}
                      onSave={(v) => {
                        const updatedFooter = { ...site.settings.footer, company_name: v };
                        updateSiteSettings({ footer: updatedFooter });
                      }}
                      style={{ color: 'white' }}
                    />
                  </h3>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.5, margin: '0 0 12px' }}>
                    <EditableText
                      tag="div"
                      value={site?.settings?.footer?.description || 'Your company description here.'}
                      onSave={(v) => {
                        const updatedFooter = { ...site.settings.footer, description: v };
                        updateSiteSettings({ footer: updatedFooter });
                      }}
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <LucideIcon name="MapPin" size={12} color="rgba(255,255,255,0.5)" />
                      <EditableText
                        tag="span"
                        value={site?.settings?.footer?.address || 'Click to edit address'}
                        onSave={(v) => {
                          const updatedFooter = { ...site.settings.footer, address: v };
                          updateSiteSettings({ footer: updatedFooter });
                        }}
                        style={{ color: 'rgba(255,255,255,0.5)' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <LucideIcon name="Phone" size={12} color="rgba(255,255,255,0.5)" />
                      <EditableText
                        tag="span"
                        value={site?.settings?.footer?.phone || 'Click to edit phone'}
                        onSave={(v) => {
                          const updatedFooter = { ...site.settings.footer, phone: v };
                          updateSiteSettings({ footer: updatedFooter });
                        }}
                        style={{ color: 'rgba(255,255,255,0.5)' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <LucideIcon name="Mail" size={12} color="rgba(255,255,255,0.5)" />
                      <EditableText
                        tag="span"
                        value={site?.settings?.footer?.email || 'Click to edit email'}
                        onSave={(v) => {
                          const updatedFooter = { ...site.settings.footer, email: v };
                          updateSiteSettings({ footer: updatedFooter });
                        }}
                        style={{ color: 'rgba(255,255,255,0.5)' }}
                      />
                    </div>
                  </div>
                  {/* Footer Social Links Preview */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
                    {site?.settings?.unlocked_socials?.includes('whatsapp') && site?.settings?.whatsapp_number && (
                      <span title="WhatsApp" style={{ fontSize: '1.2rem', color: 'white', display: 'inline-flex' }}>{SOCIAL_SVGS.whatsapp}</span>
                    )}
                    {site?.settings?.unlocked_socials?.includes('instagram') && site?.settings?.footer?.social?.instagram && (
                      <span title="Instagram" style={{ fontSize: '1.2rem', color: 'white', display: 'inline-flex' }}>{SOCIAL_SVGS.instagram}</span>
                    )}
                    {site?.settings?.unlocked_socials?.includes('facebook') && site?.settings?.footer?.social?.facebook && (
                      <span title="Facebook" style={{ fontSize: '1.2rem', color: 'white', display: 'inline-flex' }}>{SOCIAL_SVGS.facebook}</span>
                    )}
                    {site?.settings?.unlocked_socials?.includes('youtube') && site?.settings?.footer?.social?.youtube && (
                      <span title="YouTube" style={{ fontSize: '1.2rem', color: 'white', display: 'inline-flex' }}>{SOCIAL_SVGS.youtube}</span>
                    )}
                    {site?.settings?.unlocked_socials?.includes('linkedin') && site?.settings?.footer?.social?.linkedin && (
                      <span title="LinkedIn" style={{ fontSize: '1.2rem', color: 'white', display: 'inline-flex' }}>{SOCIAL_SVGS.linkedin}</span>
                    )}
                    {site?.settings?.unlocked_socials?.includes('github') && site?.settings?.footer?.social?.github && (
                      <span title="GitHub" style={{ fontSize: '1.2rem', color: 'white', display: 'inline-flex' }}>{SOCIAL_SVGS.github}</span>
                    )}
                    {site?.settings?.unlocked_socials?.includes('custom') && site?.settings?.footer?.social?.custom_link && (
                      <a href={site.settings.footer.social.custom_link} target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontSize: '0.85rem', textDecoration: 'underline' }}>
                        {site.settings.footer.social.custom_name || 'Link'}
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#00FFD1', margin: '0 0 12px' }}>Quick Links</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                    <li style={{ cursor: 'pointer' }}>Home</li>
                    {pages.filter(p => p.slug !== 'home').map(p => (
                      <li key={p.id} style={{ cursor: 'pointer' }}>{p.title}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#00FFD1', margin: '0 0 12px' }}>Legal</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                    <li style={{ cursor: 'pointer' }}>Terms &amp; Conditions</li>
                    <li style={{ cursor: 'pointer' }}>Privacy Policy</li>
                    <li style={{ cursor: 'pointer' }}>Cookie Policy</li>
                  </ul>
                </div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 24, paddingTop: 16, textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                <EditableText
                  tag="span"
                  value={site?.settings?.footer?.copyright || `© ${new Date().getFullYear()} ${site?.settings?.footer?.company_name || site?.name || 'My Website'}. All rights reserved.`}
                  onSave={(v) => {
                    const updatedFooter = { ...site.settings.footer, copyright: v };
                    updateSiteSettings({ footer: updatedFooter });
                  }}
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                />
              </div>
            </div>

            {/* ── Floating WhatsApp Preview ── */}
            {site?.settings?.whatsapp_number && (
              <a
                href={`https://wa.me/${site.settings.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: 'absolute', bottom: 24, right: 24,
                  width: 50, height: 50, borderRadius: '50%',
                  background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 1000, color: 'white', fontSize: '1.5rem',
                  textDecoration: 'none'
                }}
              >
                <svg style={{ width: 24, height: 24, fill: 'currentColor' }} viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.023 14.053.977 11.993.977c-5.442 0-9.87 4.372-9.874 9.802-.001 1.77.463 3.5 1.34 5.043L2.453 20.3l4.194-1.146zm11.233-5.232c-.3-.15-1.771-.875-2.04-.972-.27-.099-.467-.15-.663.15-.195.3-.757.972-.929 1.171-.173.199-.347.223-.647.073-.3-.15-1.268-.467-2.414-1.488-.891-.795-1.492-1.778-1.667-2.078-.175-.3-.019-.461.13-.61.135-.133.3-.347.45-.52.15-.173.2-.3.3-.5.1-.199.05-.375-.025-.524-.075-.15-.663-1.6-.908-2.188-.24-.575-.483-.497-.663-.506-.17-.008-.367-.01-.563-.01-.197 0-.518.073-.789.375-.271.3-.103.972-.103.972s-.1.654-.055.942c.046.29.176.435.31.57.133.136.27.27.42.42m10.1-2.28c-.1-.1-.3-.2-.5-.3"></path></svg>
              </a>
            )}
          </div>
        </div>

        {/* Right Resizer */}
        <div
          onMouseDown={handleRightMouseDown}
          className="resizer-bar"
        />

        {/* ── Right Panel ── */}
        <div style={{ width: rightPanelWidth, background: 'var(--editor-bg-subtle)', borderLeft: '1px solid var(--editor-border)', overflowY: 'auto', flexShrink: 0 }}>
          {selectedSection ? (
            <PropertiesPanel
              key={selectedSection.id}
              section={selectedSection}
              siteSettings={site?.settings}
              onUpdate={(newContent) => updateSectionContent(selectedSection.id, newContent)}
              onClose={() => setSelectedSection(null)}
            />
          ) : (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--editor-text-muted)', paddingTop: 80 }}>
              <div style={{ display: 'inline-flex', marginBottom: 16 }}>
                <LucideIcon name="MousePointerClick" size={32} color="#00FFD1" />
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>Click any section on the canvas to edit its content</p>
            </div>
          )}
        </div>

      </div>
      {/* ── Upgrade Dialog Overlay ── */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 99999, padding: 24, backdropFilter: 'blur(8px)'
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: '#121212', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
                width: '100%', maxWidth: 480, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
              }}
            >
              {/* Header */}
              <div style={{ padding: 24, borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
                <button
                  onClick={() => setShowUpgradeModal(null)}
                  style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.25rem', cursor: 'pointer', outline: 'none' }}
                >
                  ✕
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ffb703', fontWeight: 800, fontSize: '1.15rem', marginBottom: 6 }}>
                  <LucideIcon name="Gem" size={16} color="#ffb703" /> Premium Add-on
                </div>
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem', fontWeight: 800 }}>
                  Unlock Integrations & Social Links
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', margin: '6px 0 0' }}>
                  Enable premium social media linkages to connect with your customers.
                </p>
              </div>

              {/* Options */}
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Single Option */}
                  <div
                    onClick={() => {
                      sitesApi.unlockSocial(site.id, showUpgradeModal).then((res) => {
                        setSite({ ...site, settings: { ...site.settings, unlocked_socials: res.data.unlocked_socials } });
                        setShowUpgradeModal(null);
                        alert(`Successfully unlocked ${showUpgradeModal}!`);
                      });
                    }}
                    style={{
                      padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'border-color 0.2s, background-color 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#ffb703'; e.currentTarget.style.background = 'rgba(255,183,3,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
                        Unlock {showUpgradeModal.toUpperCase()} Link Only
                      </span>
                      <span style={{ color: '#00FFD1', fontWeight: 800, fontSize: '1rem' }}>₹149</span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', margin: 0 }}>
                      Unlock access to configure your personal {showUpgradeModal} profile link.
                    </p>
                  </div>

                  {/* Bundle Option */}
                  <div
                    onClick={() => {
                      sitesApi.unlockSocial(site.id, 'all').then((res) => {
                        setSite({ ...site, settings: { ...site.settings, unlocked_socials: res.data.unlocked_socials } });
                        setShowUpgradeModal(null);
                        alert('Successfully unlocked the All-in-One Social Bundle!');
                      });
                    }}
                    style={{
                      padding: 16, borderRadius: 12, border: '2px solid #ffb703',
                      background: 'rgba(255,183,3,0.05)', cursor: 'pointer', transition: 'transform 0.15s',
                      position: 'relative', overflow: 'hidden'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = ''}
                  >
                    <div style={{ position: 'absolute', top: 0, right: 0, background: '#ffb703', color: '#121212', padding: '2px 8px', fontSize: '0.6rem', fontWeight: 800, borderBottomLeftRadius: 8 }}>
                      BEST VALUE (SAVE 45%)
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ color: '#ffb703', fontWeight: 800, fontSize: '0.95rem' }}>
                        Unlock All Social Links Bundle
                      </span>
                      <span style={{ color: '#ffb703', fontWeight: 800, fontSize: '1.1rem' }}>₹499</span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', margin: 0 }}>
                      Unlock WhatsApp, Instagram, Facebook, YouTube, GitHub, and Custom Named Links instantly.
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <button
                    onClick={() => setShowUpgradeModal(null)}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', outline: 'none' }}
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const iconBtn = {
  background: 'var(--editor-bg-overlay)', border: '1px solid var(--editor-border-subtle)', borderRadius: 6,
  color: 'var(--editor-text-primary)', cursor: 'pointer', padding: '6px 10px', fontSize: '1rem',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import LucideIcon from '../components/common/LucideIcon';
import MagneticButton from '../components/landing/MagneticButton';
import TiltCard from '../components/landing/TiltCard';
import CountUpStat from '../components/landing/CountUpStat';
import PricingSection from '../components/landing/PricingSection';

const SECTORS = [
  { id: 'all', label: 'All Sectors' },
  { id: 'construction', icon: 'HardHat', label: 'Construction', desc: 'Commercial builders, contractors & heavy infrastructure', color: '#2563EB', count: 6 },
  { id: 'medical', icon: 'Activity', label: 'Medical & Dental', desc: 'Clinics, specialized healthcare & patient portals', color: '#0D9488', count: 6 },
  { id: 'salon', icon: 'Sparkles', label: 'Salon & Spa', desc: 'Luxury beauty studios & booking funnels', color: '#DB2777', count: 6 },
  { id: 'ecommerce', icon: 'ShoppingBag', label: 'E-Commerce', desc: 'Modern digital storefronts & product showcases', color: '#7C3AED', count: 6 },
  { id: 'restaurant', icon: 'Utensils', label: 'Restaurant', desc: 'Fine dining, cafés & online menu systems', color: '#DC2626', count: 6 },
  { id: 'realestate', icon: 'Home', label: 'Real Estate', desc: 'Property listings, brokerages & virtual tours', color: '#2563EB', count: 6 },
  { id: 'education', icon: 'GraduationCap', label: 'Education', desc: 'Academies, online courses & institute portals', color: '#4338CA', count: 6 },
  { id: 'fitness', icon: 'Dumbbell', label: 'Fitness & Gym', desc: 'Wellness centers, trainers & membership sites', color: '#16A34A', count: 6 },
  { id: 'hardware', icon: 'Wrench', label: 'Hardware Supply', desc: 'Tools, industrial equipment & B2B distributors', color: '#D97706', count: 6 },
  { id: 'legal', icon: 'Scale', label: 'Legal Services', desc: 'Law firms, corporate counsel & consultation', color: '#475569', count: 6 },
];

const TEMPLATE_PREVIEWS = [
  {
    title: 'Apex Construction & Heavy Build',
    subtitle: 'Engineered for Scale, Commercial Safety & High Structural Impact',
    sector: 'Construction',
    tag: 'Industrial Suite',
    accent: '#2563EB',
    heroBtn: 'Request Project Audit',
    services: ['Commercial Heavy Building', 'Architectural Design', 'Infrastructure Contracting']
  },
  {
    title: 'Lumina Health & Clinical Care',
    subtitle: 'Patient-First Clinical Funnel & Instant Online Appointment Desk',
    sector: 'Medical',
    tag: 'Clinical Care',
    accent: '#0D9488',
    heroBtn: 'Schedule Consultation',
    services: ['General Dental Care', 'Orthodontic Surgery', '24/7 Virtual Triage']
  },
  {
    title: 'Velvet Rose Spa & Beauty Studio',
    subtitle: 'Bespoke Aesthetic Treatments & Instant Appointment Scheduler',
    sector: 'Salon & Spa',
    tag: 'Luxury Beauty',
    accent: '#DB2777',
    heroBtn: 'Book Treatment',
    services: ['Hair Styling & Color Lab', 'Organic Skin Therapies', 'Bridal Package Suites']
  },
  {
    title: 'Urban Storefront E-Commerce',
    subtitle: 'Curated Apparel, Instant Cart Checkout & Lifestyle Collections',
    sector: 'E-Commerce',
    tag: 'Digital Store',
    accent: '#7C3AED',
    heroBtn: 'Explore Catalog',
    services: ['Summer Apparel Line', 'Handcrafted Accessories', 'Global Shipping Desk']
  },
  {
    title: 'Savory Table Gourmet & Bistro',
    subtitle: 'Fine Dining Menus, Table Reservations & Catering Enquiries',
    sector: 'Restaurant',
    tag: 'Gourmet Bistro',
    accent: '#DC2626',
    heroBtn: 'Reserve Table Now',
    services: ['Chef Special Tasting', 'Private Dining Suite', 'Event Catering Services']
  },
  {
    title: 'Horizon Grand Real Estate',
    subtitle: 'Luxury Property Showcases, Virtual Tours & Broker Listings',
    sector: 'Real Estate',
    tag: 'Estate Sapphire',
    accent: '#2563EB',
    heroBtn: 'View Estates',
    services: ['Penthouse Collection', 'Commercial Leasing', 'Mortgage Estimator']
  }
];

const STEPS = [
  {
    step: '01',
    codeTag: 'INIT_PRESET',
    title: 'Select Handcrafted Sector Preset',
    desc: 'Choose from 13 commercial industry kits complete with human-written copy, conversion forms, and structural blocks.',
    icon: 'LayoutTemplate',
    color: '#2563EB'
  },
  {
    step: '02',
    codeTag: 'VISUAL_CANVAS',
    title: 'Visual Drag-and-Drop Editor',
    desc: 'Customize section hierarchy, tweak typography token scales, and update images in a real-time responsive viewport.',
    icon: 'MousePointerClick',
    color: '#2563EB'
  },
  {
    step: '03',
    codeTag: 'DEPLOY_BUILD',
    title: 'Instant Production Deployment',
    desc: 'Publish directly to your custom domain with free SSL, or download a clean static HTML/CSS ZIP bundle anytime.',
    icon: 'Rocket',
    color: '#2563EB'
  }
];

const TESTIMONIALS = [
  { name: 'Rohan Sharma', role: 'Construction Director', text: 'MSR Tech Hub allowed us to deploy our commercial site in under 30 minutes. The layout precision is remarkable.', avatar: 'RS' },
  { name: 'Dr. Ananya Roy', role: 'Clinic Lead', text: 'The medical template had our appointment funnel ready out of the box. Patient inquiries increased by 40%.', avatar: 'AR' },
  { name: 'Kavita Patel', role: 'Salon Founder', text: 'Zero code needed. I updated our service menu and pricing right from my tablet with total ease.', avatar: 'KP' },
  { name: 'Vikram Sethi', role: 'E-Store Operator', text: 'Fastest template engine I have used. Mobile responsiveness and page load times are exceptionally crisp.', avatar: 'VS' },
  { name: 'Priya Malhotra', role: 'Real Estate Broker', text: 'The property showcase layout gave our agency an ultra-premium aesthetic. Clients notice the difference.', avatar: 'PM' },
  { name: 'Amit Verma', role: 'Supply Store Manager', text: 'Direct static HTML ZIP export saved us hundreds of hosting dollars. Clean, reliable, and solid.', avatar: 'AV' }
];

export default function BuilderLanding() {
  const navigate = useNavigate();
  const [selectedSector, setSelectedSector] = useState('all');
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [previewHovered, setPreviewHovered] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [activeLayer, setActiveLayer] = useState('hero');
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 30 });

  const stepsContainerRef = useRef(null);
  const { scrollYProgress: stepsScroll } = useScroll({
    target: stepsContainerRef,
    offset: ["start center", "end center"]
  });
  const lineHeight = useTransform(stepsScroll, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePreviewIndex((prev) => (prev + 1) % TEMPLATE_PREVIEWS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredSectors = selectedSector === 'all' 
    ? SECTORS.filter(s => s.id !== 'all') 
    : SECTORS.filter(s => s.id === selectedSector);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      color: '#0F172A',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      overflowX: 'hidden',
      backgroundImage: 'radial-gradient(#E2E8F0 1.2px, transparent 1.2px)',
      backgroundSize: '24px 24px'
    }}>
      
      {/* Top Reading Progress Bar */}
      <motion.div
        style={{
          scaleX,
          transformOrigin: '0%',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: '#2563EB',
          zIndex: 1000
        }}
      />

      {/* Sleek Top Navbar */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: isScrolled ? '12px 28px' : '18px 28px',
        background: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(248, 250, 252, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: isScrolled ? '1px solid #E2E8F0' : '1px solid transparent',
        boxShadow: isScrolled ? '0 4px 20px rgba(15,23,42,0.04)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <img 
              src="/logo.png" 
              alt="MSR Tech Hub Logo" 
              style={{ height: 38, width: 'auto', objectFit: 'contain' }} 
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A' }}>
                MSR Tech Hub
              </span>
              <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', fontWeight: 700, background: '#DBEAFE', color: '#2563EB', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: 4 }}>
                STUDIO v2.4
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="hidden md:flex">
            <a href="#templates" style={{ color: '#334155', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem', transition: 'color 0.2s' }}>
              Sector Presets
            </a>
            <a href="#how-it-works" style={{ color: '#334155', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem', transition: 'color 0.2s' }}>
              Workflow
            </a>
            <a href="#pricing" style={{ color: '#334155', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem', transition: 'color 0.2s' }}>
              Pricing
            </a>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={() => navigate('/builder/login')}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#0F172A',
                padding: '8px 18px',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.86rem',
                boxShadow: '0 2px 6px rgba(15,23,42,0.04)',
                transition: 'all 0.2s'
              }}
            >
              Sign In
            </button>

            <MagneticButton
              onClick={() => navigate('/builder/login')}
              style={{
                background: '#2563EB',
                color: '#FFFFFF',
                padding: '8px 20px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: '0.86rem',
                boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              Launch Studio →
            </MagneticButton>
          </div>
        </div>
      </nav>

      {/* 1. BESPOKE HUMAN LIGHT HERO SECTION (NO AI DARK WIREFRAME) */}
      <section style={{ textAlign: 'center', padding: '80px 24px 70px', position: 'relative', zIndex: 5 }}>
        
        {/* Soft Ambient Radial Light Glow */}
        <div style={{
          position: 'absolute',
          top: -60,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800,
          height: 450,
          background: 'radial-gradient(circle, #DBEAFE 0%, rgba(219, 234, 254, 0.3) 45%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: -1
        }} />

        {/* Product Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 99,
            padding: '6px 18px',
            marginBottom: 32,
            boxShadow: '0 4px 14px rgba(15,23,42,0.04)'
          }}
        >
          <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 800, color: '#2563EB', background: '#DBEAFE', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: 4 }}>
            RELEASE v2.4
          </span>
          <span style={{ width: 1, height: 14, background: '#E2E8F0' }} />
          <span style={{ color: '#334155', fontSize: '0.84rem', fontWeight: 600 }}>
            13 Commercial Sector Suites Built & Ready
          </span>
          <LucideIcon name="ChevronRight" size={14} color="#334155" />
        </motion.div>

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ maxWidth: 940, margin: '0 auto 24px' }}
        >
          <h1 style={{
            fontSize: 'clamp(2.6rem, 5.8vw, 4.8rem)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.04em',
            margin: 0,
            color: '#0F172A'
          }}>
            Design & Launch Commercial Websites.<br />
            <span style={{ color: '#2563EB' }}>
              Visual precision. Zero code complexity.
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ color: '#334155', fontSize: '1.12rem', maxWidth: 660, margin: '0 auto 40px', lineHeight: 1.6, fontWeight: 500 }}
        >
          Pick a handcrafted sector preset, edit typography, layouts, and lead funnels visually in real time, and publish directly to your domain or export clean static HTML.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}
        >
          <MagneticButton
            onClick={() => navigate('/builder/login')}
            style={{
              background: '#2563EB',
              color: '#FFFFFF',
              padding: '14px 34px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: '0.98rem',
              boxShadow: '0 6px 20px rgba(37,99,235,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            Start Building Free
            <span style={{ background: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', fontFamily: 'monospace', padding: '2px 6px', borderRadius: 4 }}>
              ⌘ K
            </span>
          </MagneticButton>

          <button
            onClick={() => document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#0F172A',
              padding: '14px 28px',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: '0.98rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
              transition: 'all 0.2s'
            }}
          >
            <LucideIcon name="Eye" size={16} color="#334155" /> Explore Presets
          </button>
        </motion.div>

        {/* Bento Technical Metrics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 14,
          maxWidth: 920,
          margin: '0 auto'
        }}>
          {[
            { end: 10000, suffix: '+', label: 'Sites Published Globally' },
            { end: 13, suffix: ' Sectors', label: 'Handcrafted Preset Kits' },
            { end: 99.9, suffix: '%', label: 'Uptime SLA' },
            { end: 4.9, prefix: '★ ', suffix: '/5', label: 'Verified Client Rating' }
          ].map((st, i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 14,
                padding: '18px 14px',
                textAlign: 'center',
                boxShadow: '0 4px 16px rgba(15,23,42,0.03)'
              }}
            >
              <CountUpStat end={st.end} prefix={st.prefix} suffix={st.suffix} label={st.label} />
            </div>
          ))}
        </div>
      </section>

      {/* 2. MAC STUDIO INTERACTIVE WORKSPACE CANVAS (LIGHT MODE STUDIO) */}
      <section style={{ padding: '0 24px 90px', position: 'relative', zIndex: 5 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          
          <TiltCard maxTilt={4} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 20px 60px rgba(15,23,42,0.08)', background: '#FFFFFF' }}>
            
            {/* Window Top Title Bar */}
            <div style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F56' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FFBD2E' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#27C93F' }} />
              </div>

              {/* Center Address Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6, padding: '4px 16px', color: '#334155', fontSize: '0.75rem', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                  msrtechhub.com/studio/{TEMPLATE_PREVIEWS[activePreviewIndex].sector.toLowerCase()}
                </div>
              </div>

              {/* Viewport controls & dots */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ display: 'flex', gap: 4, background: '#E2E8F0', padding: 2, borderRadius: 6 }}>
                  {[['desktop', 'Monitor'], ['mobile', 'Smartphone']].map(([mode, icon]) => (
                    <button
                      key={mode}
                      onClick={() => setPreviewMode(mode)}
                      style={{
                        background: previewMode === mode ? '#2563EB' : 'transparent',
                        border: 'none',
                        color: previewMode === mode ? '#FFFFFF' : '#334155',
                        padding: '4px 8px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <LucideIcon name={icon} size={13} />
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  {TEMPLATE_PREVIEWS.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActivePreviewIndex(idx)}
                      style={{
                        width: activePreviewIndex === idx ? 20 : 6,
                        height: 6,
                        borderRadius: 3,
                        background: activePreviewIndex === idx ? '#2563EB' : '#CBD5E1',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Studio Workspace Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: previewMode === 'mobile' ? '1fr' : '200px 1fr 220px', minHeight: 420 }}>
              
              {/* Left Layers Tree Sidebar */}
              {previewMode === 'desktop' && (
                <div style={{ borderRight: '1px solid #E2E8F0', background: '#F8FAFC', padding: 16 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
                    LAYOUT LAYERS
                  </div>
                  
                  {[
                    { id: 'hero', name: 'Hero Header Block', icon: 'Layout' },
                    { id: 'services', name: 'Services Grid', icon: 'Grid' },
                    { id: 'cta', name: 'Booking Funnel Form', icon: 'FileText' },
                    { id: 'footer', name: 'Footer & Navigation', icon: 'Menu' }
                  ].map(layer => (
                    <div
                      key={layer.id}
                      onClick={() => setActiveLayer(layer.id)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 6,
                        marginBottom: 4,
                        cursor: 'pointer',
                        background: activeLayer === layer.id ? '#DBEAFE' : 'transparent',
                        border: activeLayer === layer.id ? '1px solid #BFDBFE' : '1px solid transparent',
                        color: activeLayer === layer.id ? '#2563EB' : '#334155',
                        fontSize: '0.78rem',
                        fontWeight: activeLayer === layer.id ? 700 : 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <LucideIcon name={layer.icon} size={14} />
                      {layer.name}
                    </div>
                  ))}
                </div>
              )}

              {/* Center Canvas Preview Area */}
              <div style={{
                padding: previewMode === 'mobile' ? '30px 16px' : '36px 40px',
                maxWidth: previewMode === 'mobile' ? 380 : '100%',
                margin: '0 auto',
                background: '#FFFFFF',
                transition: 'all 0.3s ease'
              }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePreviewIndex}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span style={{
                      background: '#DBEAFE',
                      color: '#2563EB',
                      border: '1px solid #BFDBFE',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 4,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {TEMPLATE_PREVIEWS[activePreviewIndex].tag}
                    </span>

                    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '14px 0 10px', color: '#0F172A', lineHeight: 1.25 }}>
                      {TEMPLATE_PREVIEWS[activePreviewIndex].title}
                    </h3>
                    
                    <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 24 }}>
                      {TEMPLATE_PREVIEWS[activePreviewIndex].subtitle}
                    </p>

                    <button style={{
                      background: TEMPLATE_PREVIEWS[activePreviewIndex].accent || '#2563EB',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '10px 22px',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      marginBottom: 28,
                      boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
                    }}>
                      {TEMPLATE_PREVIEWS[activePreviewIndex].heroBtn} →
                    </button>

                    <div style={{ display: 'grid', gridTemplateColumns: previewMode === 'mobile' ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
                      {TEMPLATE_PREVIEWS[activePreviewIndex].services.map((serv, sIdx) => (
                        <div
                          key={sIdx}
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: 8,
                            padding: '12px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                          }}
                        >
                          <LucideIcon name="CheckCircle2" size={15} color={TEMPLATE_PREVIEWS[activePreviewIndex].accent || '#2563EB'} />
                          <span style={{ color: '#0F172A', fontWeight: 600, fontSize: '0.8rem' }}>
                            {serv}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Inspector Sidebar */}
              {previewMode === 'desktop' && (
                <div style={{ borderLeft: '1px solid #E2E8F0', background: '#F8FAFC', padding: 16 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
                    INSPECTOR TOKENS
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.76rem' }}>
                    <div>
                      <div style={{ color: '#334155', marginBottom: 4 }}>SECTOR THEME</div>
                      <div style={{ color: '#0F172A', fontFamily: 'monospace', background: '#FFFFFF', padding: '4px 8px', borderRadius: 4, border: '1px solid #E2E8F0' }}>
                        {TEMPLATE_PREVIEWS[activePreviewIndex].accent}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#334155', marginBottom: 4 }}>TYPOGRAPHY</div>
                      <div style={{ color: '#0F172A', fontFamily: 'monospace', background: '#FFFFFF', padding: '4px 8px', borderRadius: 4, border: '1px solid #E2E8F0' }}>
                        Inter Display (-0.03em)
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#334155', marginBottom: 4 }}>EXPORT TARGET</div>
                      <div style={{ color: '#2563EB', fontFamily: 'monospace', background: '#DBEAFE', padding: '4px 8px', borderRadius: 4, border: '1px solid #BFDBFE' }}>
                        Static HTML5 / Zip
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </TiltCard>

        </div>
      </section>

      {/* 3. BENTO SHOWCASE: SECTOR PRESETS */}
      <section id="templates" style={{ padding: '90px 24px', position: 'relative', zIndex: 5, background: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 800, margin: '0 0 14px', letterSpacing: '-0.03em', color: '#0F172A' }}>
              Handcrafted <span style={{ color: '#2563EB' }}>Sector Kits</span>
            </h2>
            <p style={{ color: '#334155', fontSize: '1rem', maxWidth: 520, margin: '0 auto' }}>
              Pre-populated commercial layout suites engineered with industry-specific copy, forms, and hero blocks.
            </p>
          </div>

          {/* Sector Category Filters */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            {SECTORS.map((sec) => {
              const isSelected = selectedSector === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSector(sec.id)}
                  style={{
                    position: 'relative',
                    padding: '8px 18px',
                    borderRadius: 99,
                    border: isSelected ? 'none' : '1px solid #E2E8F0',
                    background: isSelected ? '#2563EB' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#334155',
                    fontWeight: 600,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {sec.label}
                </button>
              );
            })}
          </div>

          {/* Bento Cards Grid */}
          <motion.div
            layout
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}
          >
            <AnimatePresence>
              {filteredSectors.map((s, idx) => (
                <motion.div
                  layout
                  key={s.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  onMouseEnter={() => setPreviewHovered(s.id)}
                  onMouseLeave={() => setPreviewHovered(null)}
                >
                  <TiltCard maxTilt={6} style={{ borderRadius: 14, height: '100%' }}>
                    <div style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: 14,
                      padding: '28px 22px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 4px 16px rgba(15,23,42,0.04)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                          <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            background: '#DBEAFE',
                            border: '1px solid #BFDBFE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <LucideIcon name={s.icon} size={22} color="#2563EB" />
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace', color: '#2563EB', background: '#DBEAFE', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: 4 }}>
                            {s.count} PRESETS
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.18rem', fontWeight: 700, margin: '0 0 6px', color: '#0F172A' }}>{s.label}</h3>
                        <p style={{ color: '#334155', fontSize: '0.85rem', margin: '0 0 20px', lineHeight: 1.5 }}>{s.desc}</p>
                      </div>

                      {previewHovered === s.id && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(10px)', padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', zIndex: 20 }}>
                          <LucideIcon name="Sparkles" size={26} color="#2563EB" style={{ marginBottom: 10 }} />
                          <h4 style={{ color: '#0F172A', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px' }}>{s.label} Suite</h4>
                          <p style={{ color: '#334155', fontSize: '0.78rem', marginBottom: 16 }}>Pre-populated with real copy, lead capture form & high-converting layout.</p>
                          <button onClick={() => navigate('/builder/login')} style={{ background: '#2563EB', color: '#FFFFFF', border: 'none', padding: '9px 20px', borderRadius: 7, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                            Launch Studio →
                          </button>
                        </motion.div>
                      )}

                      <button onClick={() => navigate('/builder/login')} style={{ width: '100%', padding: '10px 16px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        Explore Preset Suite →
                      </button>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* 4. TECHNICAL WORKFLOW ARCHITECTURE */}
      <section id="how-it-works" style={{ padding: '90px 24px', position: 'relative', zIndex: 5, background: '#F8FAFC' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 800, margin: '0 0 14px', letterSpacing: '-0.03em', color: '#0F172A' }}>
              Engine <span style={{ color: '#2563EB' }}>Workflow</span>
            </h2>
            <p style={{ color: '#334155', fontSize: '1rem' }}>Three simple technical stages from zero to live production deployment.</p>
          </div>

          <div ref={stepsContainerRef} style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 2, background: '#E2E8F0', zIndex: 1, borderRadius: 1 }}>
              <motion.div style={{ height: lineHeight, width: '100%', background: '#2563EB', borderRadius: 1 }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 48, position: 'relative', zIndex: 2 }}>
              {STEPS.map((s, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.45, delay: idx * 0.1 }} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', alignItems: 'center' }}>
                  <div style={{ textAlign: idx % 2 === 0 ? 'right' : 'left', order: idx % 2 === 0 ? 1 : 3 }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: 26, boxShadow: '0 4px 16px rgba(15,23,42,0.04)' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: idx % 2 === 0 ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 700, color: '#2563EB', background: '#DBEAFE', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: 4 }}>
                          STAGE {s.step} // {s.codeTag}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0', color: '#0F172A' }}>{s.title}</h3>
                      <p style={{ color: '#334155', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', order: 2 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FFFFFF', border: '2px solid #2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(37,99,235,0.2)', color: '#2563EB' }}>
                      <LucideIcon name={s.icon} size={18} />
                    </div>
                  </div>
                  <div style={{ order: idx % 2 === 0 ? 3 : 1 }} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <PricingSection onSelectPlan={(planId) => navigate(`/builder/login?plan=${planId}`)} />

      {/* 6. TESTIMONIALS MARQUEE */}
      <section style={{ padding: '80px 0', position: 'relative', zIndex: 5, overflow: 'hidden', background: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto 40px', padding: '0 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, margin: '0 0 10px', color: '#0F172A' }}>
            Trusted by Commercial Businesses Nationwide
          </h2>
          <div style={{ color: '#F59E0B', fontSize: '1.2rem', marginBottom: 4 }}>★★★★★</div>
          <p style={{ color: '#334155', fontSize: '0.9rem' }}>4.9/5 verified rating from active site owners</p>
        </div>

        <div style={{ display: 'flex', width: '200%', overflow: 'hidden' }} className="marquee-container">
          <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 34, ease: 'linear', repeat: Infinity }} style={{ display: 'flex', gap: 20, paddingRight: 20 }} className="marquee-track">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => (
              <div key={idx} style={{ width: 320, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: 22, flexShrink: 0 }}>
                <div style={{ color: '#F59E0B', marginBottom: 8, fontSize: '0.9rem' }}>★★★★★</div>
                <p style={{ color: '#334155', fontSize: '0.86rem', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 16 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#2563EB', color: '#FFFFFF', fontWeight: 700, fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.avatar}</div>
                  <div>
                    <div style={{ color: '#0F172A', fontWeight: 600, fontSize: '0.84rem' }}>{t.name}</div>
                    <div style={{ color: '#334155', fontSize: '0.74rem' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
        <style>{`.marquee-container:hover .marquee-track { animation-play-state: paused !important; }`}</style>
      </section>

      {/* FOOTER CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center', position: 'relative', zIndex: 5, background: '#F8FAFC' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', background: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)', border: '1px solid #BFDBFE', borderRadius: 20, padding: '50px 32px', boxShadow: '0 8px 30px rgba(37,99,235,0.08)' }}>
          <LucideIcon name="Rocket" size={34} color="#2563EB" style={{ marginBottom: 14 }} />
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, margin: '0 0 12px', color: '#0F172A' }}>Ready to Launch Your Site Today?</h2>
          <p style={{ color: '#334155', fontSize: '0.98rem', marginBottom: 30, lineHeight: 1.6 }}>Join thousands of business owners and teams. Build free with instant live visual previews.</p>
          <MagneticButton onClick={() => navigate('/builder/login')} style={{ background: '#2563EB', color: '#FFFFFF', padding: '14px 38px', borderRadius: 8, fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 8px 24px rgba(37,99,235,0.25)' }}>
            Launch Studio Free →
          </MagneticButton>
        </div>
      </section>
      <footer style={{ padding: '28px 24px', borderTop: '1px solid #E2E8F0', textAlign: 'center', color: '#334155', fontSize: '0.82rem', background: '#F8FAFC' }}>
        © {new Date().getFullYear()} MSR Tech Hub Website Builder · Engineered by <span style={{ color: '#0F172A', fontWeight: 700 }}>MSR Tech Hub</span>
      </footer>

    </div>
  );
}




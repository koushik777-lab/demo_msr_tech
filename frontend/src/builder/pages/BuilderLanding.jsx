import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LucideIcon from '../components/common/LucideIcon';

const SECTORS = [
  { icon: 'HardHat',       label: 'Construction',   desc: 'Builders & contractors',    color: '#ea580c', grad: 'linear-gradient(135deg,#431407,#7c2d12)', light: '#fed7aa', count: 6 },
  { icon: 'Activity',      label: 'Medical',         desc: 'Clinics & healthcare',       color: '#0d9488', grad: 'linear-gradient(135deg,#042f2e,#0f766e)', light: '#99f6e4', count: 6 },
  { icon: 'Sparkles',      label: 'Salon & Beauty',  desc: 'Salons, spas & studios',     color: '#db2777', grad: 'linear-gradient(135deg,#4a0020,#9d174d)', light: '#fbcfe8', count: 6 },
  { icon: 'ShoppingBag',   label: 'E-Commerce',      desc: 'Online stores & shops',      color: '#7c3aed', grad: 'linear-gradient(135deg,#2e1065,#5b21b6)', light: '#ddd6fe', count: 6 },
  { icon: 'Utensils',      label: 'Restaurant',      desc: 'Cafés & food delivery',      color: '#dc2626', grad: 'linear-gradient(135deg,#450a0a,#991b1b)', light: '#fecaca', count: 6 },
  { icon: 'Home',          label: 'Real Estate',     desc: 'Property & agencies',        color: '#1d4ed8', grad: 'linear-gradient(135deg,#172554,#1e40af)', light: '#bfdbfe', count: 6 },
  { icon: 'GraduationCap', label: 'Education',       desc: 'Schools & online courses',   color: '#4338ca', grad: 'linear-gradient(135deg,#1e1b4b,#3730a3)', light: '#c7d2fe', count: 6 },
  { icon: 'Dumbbell',      label: 'Fitness',         desc: 'Gyms & wellness studios',    color: '#16a34a', grad: 'linear-gradient(135deg,#052e16,#166534)', light: '#bbf7d0', count: 6 },
  { icon: 'Wrench',        label: 'Hardware',        desc: 'Tools & supply stores',      color: '#ca8a04', grad: 'linear-gradient(135deg,#1a1200,#854d0e)', light: '#fde68a', count: 6 },
  { icon: 'Scale',         label: 'Legal Services',  desc: 'Law firms & consultants',    color: '#78350f', grad: 'linear-gradient(135deg,#1c0a00,#92400e)', light: '#fde68a', count: 6 },
  { icon: 'Sprout',        label: 'Agriculture',     desc: 'Farms & organic produce',    color: '#15803d', grad: 'linear-gradient(135deg,#052e16,#14532d)', light: '#bbf7d0', count: 6 },
  { icon: 'Bed',           label: 'Hotel',           desc: 'Hotels & resorts',           color: '#0369a1', grad: 'linear-gradient(135deg,#082f49,#0c4a6e)', light: '#bae6fd', count: 6 },
  { icon: 'Activity',      label: 'Clinic',          desc: 'Medical & dental clinics',   color: '#0891b2', grad: 'linear-gradient(135deg,#042f2e,#155e75)', light: '#a5f3fc', count: 6 },
];

const STEPS = [
  { icon: 'LayoutTemplate', step: '01', title: 'Pick a Template', desc: 'Choose from 10+ industry-specific designs. Each one comes pre-filled with real content.' },
  { icon: 'MousePointerClick', step: '02', title: 'Customize It', desc: 'Drag and drop sections, change colors, upload your logo. No code needed.' },
  { icon: 'Globe', step: '03', title: 'Publish & Go Live', desc: 'Download a ready-to-host ZIP or connect your own domain in one click.' },
];

const FEATURES = [
  ['LayoutGrid', 'Drag & Drop Editor', 'Visually arrange sections on a live canvas. No coding skills needed.'],
  ['Smartphone', 'Mobile Responsive', 'Every website looks perfect on desktop, tablet, and mobile.'],
  ['Search', 'SEO Ready', 'Auto-generated sitemap, meta tags, and robots.txt on every publish.'],
  ['ShieldCheck', 'Legal Pages Included', 'Terms, Privacy, Cookie Policy, and 404 page auto-generated.'],
  ['CreditCard', 'Flexible Plans', 'Start free. Upgrade to unlock custom domains and more sites.'],
  ['DownloadCloud', '1-Click Publish', 'Download a ready-to-host ZIP or connect your own domain.'],
];

const TESTIMONIALS = [
  { name: 'Sarah Ahmed', role: 'Salon Owner', text: 'I had my salon website live in under an hour. It looks amazing on mobile too!', avatar: 'SA' },
  { name: 'Tariq Hussain', role: 'Restaurant Manager', text: 'The restaurant template was perfect. Added my menu, photos, and went live same day.', avatar: 'TH' },
  { name: 'Fatima Khan', role: 'Real Estate Agent', text: 'Clients love the professional look. I got 3 new leads in the first week.', avatar: 'FK' },
];

const viewportOptions = { once: true, margin: '-80px' };

export default function BuilderLanding() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden', color: 'var(--text-primary)' }}>
      {/* Background Orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', left: '25%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.06), transparent 70%)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(15,118,110,0.04), transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {/* Navbar */}
      <nav style={{ padding: '0 40px', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg-secondary)', backdropFilter: 'blur(16px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img src="/logo.png" alt="MSR Tech Hub Logo" style={{ height: 38, width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>MSR TECH HUB</span>
          </span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={() => navigate('/builder/login')} style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.875rem', transition: 'all .2s' }}>
              Sign In
            </button>
            <motion.button
              onClick={() => navigate('/builder/login')}
              whileHover={{ scale: 1.05 }}
              style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-active))', border: 'none', borderRadius: 99, color: '#fff', padding: '8px 20px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 4px 12px var(--brand-hover)' }}
            >
              Get Started Free
            </motion.button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ textAlign: 'center', padding: '100px 24px 60px', position: 'relative', zIndex: 5 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--brand-hover)', border: '1px solid var(--brand-primary)', borderRadius: 99, padding: '6px 16px', marginBottom: 28, color: 'var(--brand-primary)', fontSize: '0.85rem', fontWeight: 600 }}>
            <LucideIcon name="Sparkles" size={14} /> No Code Required
          </div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: 'clamp(2.8rem, 6vw, 4.8rem)', fontWeight: 800, margin: '0 0 20px', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            Build a Professional<br />
            <span style={{ background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-active) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Website in Minutes
            </span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Choose from 10 industry-specific templates, customize every detail with our drag-and-drop editor, and publish to the world.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
            <motion.button
              onClick={() => navigate('/builder/login')}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-active))', border: 'none', borderRadius: 14, color: '#fff', padding: '16px 36px', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 12px 40px var(--brand-hover)' }}
            >
              Start Building Free →
            </motion.button>
            <motion.button
              onClick={() => navigate('/builder/login')}
              whileHover={{ scale: 1.04 }}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '16px 36px', fontWeight: 600, fontSize: '1.05rem', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 14 }}
            >
              View Templates
            </motion.button>
          </div>

          {/* Trust Badges */}
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['Users', '2,400+ businesses'], ['Star', '4.9/5 rating'], ['Zap', 'Live in minutes'], ['ShieldCheck', 'Free to start']].map(([icon, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
                <LucideIcon name={icon} size={16} color="var(--brand-primary)" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Visual Preview Mockup ── */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOptions}
        transition={{ duration: 0.7 }}
        style={{ padding: '0 24px 80px', position: 'relative', zIndex: 5 }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border-subtle)', boxShadow: '0 24px 80px rgba(0,0,0,0.12)', background: 'var(--bg-secondary)' }}>
          {/* Browser chrome */}
          <div style={{ background: 'var(--bg-tertiary, var(--bg-secondary))', borderBottom: '1px solid var(--border-subtle)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
            </div>
            <div style={{ flex: 1, background: 'var(--bg-primary)', borderRadius: 6, height: 28, display: 'flex', alignItems: 'center', paddingLeft: 12, color: 'var(--text-muted)', fontSize: '0.75rem', gap: 6 }}>
              <LucideIcon name="Lock" size={11} /> sitecraft.io/preview
            </div>
          </div>
          {/* Website Preview Content */}
          <div style={{ padding: '40px 40px 40px', background: 'var(--bg-primary)' }}>
            {/* Fake hero */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center', marginBottom: 40 }}>
              <div>
                <div style={{ width: '40%', height: 12, background: 'var(--brand-primary)', borderRadius: 4, marginBottom: 16, opacity: 0.6 }} />
                <div style={{ width: '90%', height: 28, background: 'var(--border-subtle)', borderRadius: 6, marginBottom: 10 }} />
                <div style={{ width: '75%', height: 28, background: 'var(--border-subtle)', borderRadius: 6, marginBottom: 24 }} />
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 120, height: 36, borderRadius: 8, background: 'var(--brand-primary)', opacity: 0.8 }} />
                  <div style={{ width: 100, height: 36, borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'transparent' }} />
                </div>
              </div>
              <div style={{ height: 160, borderRadius: 16, background: `linear-gradient(135deg, var(--brand-hover) 0%, var(--bg-secondary) 100%)`, border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LucideIcon name="Globe" size={48} color="var(--brand-primary)" />
              </div>
            </div>
            {/* Fake service cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[['LayoutGrid', 'Web Design'], ['Smartphone', 'Mobile App'], ['Search', 'SEO & Growth']].map(([icon, label]) => (
                <div key={label} style={{ padding: '20px', borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', textAlign: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--brand-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <LucideIcon name={icon} size={20} color="var(--brand-primary)" />
                  </div>
                  <div style={{ height: 10, background: 'var(--border-subtle)', borderRadius: 4, width: '80%', margin: '0 auto 8px' }} />
                  <div style={{ height: 8, background: 'var(--border-subtle)', borderRadius: 4, width: '60%', margin: '0 auto', opacity: 0.6 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── How it Works ── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={viewportOptions}
        transition={{ duration: 0.5 }}
        style={{ padding: '80px 24px', position: 'relative', zIndex: 5, background: 'var(--bg-secondary)' }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              From Idea to Live Website — 3 Simple Steps
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No technical skills. No designer needed. Just results.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            {STEPS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOptions}
                transition={{ delay: i * 0.1 }}
                style={{ position: 'relative', padding: '36px 28px', borderRadius: 20, border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', backdropFilter: 'blur(12px)' }}
              >
                <div style={{ position: 'absolute', top: 20, right: 24, fontSize: '3rem', fontWeight: 900, color: 'var(--brand-primary)', opacity: 0.1 }}>{s.step}</div>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--brand-hover)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <LucideIcon name={s.icon} size={26} color="var(--brand-primary)" />
                </div>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 10px' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Sectors ── */}
      <section style={{ padding: '100px 24px', position: 'relative', zIndex: 5, background: 'var(--bg-primary)' }}>
        {/* Decorative background */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(13,148,136,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        </div>
        <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOptions}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--brand-hover)', border: '1px solid var(--brand-primary)', borderRadius: 99, padding: '6px 18px', marginBottom: 20, color: 'var(--brand-primary)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              <LucideIcon name="Layers" size={13} color="var(--brand-primary)" />
              13 Industries · 78 Unique Designs
            </div>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '2.6rem', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
              Templates for <span style={{ background: 'linear-gradient(135deg, var(--brand-primary), #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Every Industry</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto' }}>
              Real content, real layouts — built specifically for your type of business. Pick yours and go live today.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 18 }}>
            {SECTORS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOptions}
                transition={{ delay: i * 0.045, type: 'spring', stiffness: 200, damping: 20 }}
                whileHover={{ y: -8, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/builder/login')}
                style={{
                  position: 'relative',
                  background: s.grad,
                  border: `1px solid ${s.color}33`,
                  borderRadius: 20,
                  padding: '28px 20px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: 'box-shadow .25s, border-color .25s',
                  boxShadow: `0 2px 16px ${s.color}18`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = `0 16px 48px ${s.color}44`;
                  e.currentTarget.style.borderColor = `${s.color}88`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = `0 2px 16px ${s.color}18`;
                  e.currentTarget.style.borderColor = `${s.color}33`;
                }}
              >
                {/* Decorative glow dot */}
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `${s.color}22`, filter: 'blur(20px)', pointerEvents: 'none' }} />
                {/* Number badge */}
                <div style={{ position: 'absolute', top: 12, right: 14, background: `${s.color}22`, border: `1px solid ${s.color}44`, borderRadius: 99, padding: '2px 8px', fontSize: '0.62rem', fontWeight: 700, color: s.light, letterSpacing: '0.04em' }}>
                  {s.count} templates
                </div>
                {/* Icon */}
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: 18, background: `${s.color}33`, border: `1.5px solid ${s.color}55`, marginBottom: 16, backdropFilter: 'blur(4px)' }}>
                  <LucideIcon name={s.icon} size={26} color={s.light} />
                </div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: 5, letterSpacing: '-0.01em' }}>{s.label}</div>
                <div style={{ color: s.light, fontSize: '0.72rem', opacity: 0.7, lineHeight: 1.4 }}>{s.desc}</div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOptions}
            style={{ textAlign: 'center', marginTop: 56 }}
          >
            <motion.button
              onClick={() => navigate('/builder/login')}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-active))', border: 'none', borderRadius: 99, color: '#fff', padding: '14px 40px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px var(--brand-hover)', display: 'inline-flex', alignItems: 'center', gap: 10 }}
            >
              <LucideIcon name="Wand2" size={18} color="#fff" />
              Browse All Templates
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '80px 24px', position: 'relative', zIndex: 5, background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOptions}
            style={{ color: 'var(--text-primary)', textAlign: 'center', fontSize: '2rem', fontWeight: 700, margin: '0 0 48px', letterSpacing: '-0.02em' }}
          >
            Everything You Need
          </motion.h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {FEATURES.map(([icon, title, desc], i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOptions}
                transition={{ delay: i * 0.07 }}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 20, padding: '32px 28px',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 12, background: 'var(--brand-hover)', border: '1px solid var(--border-subtle)', marginBottom: 20 }}>
                  <LucideIcon name={icon} size={22} color="var(--brand-primary)" />
                </div>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, margin: '0 0 10px', fontSize: '1.1rem' }}>{title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: '80px 24px', position: 'relative', zIndex: 5 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOptions}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <h2 style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              Loved by Business Owners
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
              {[1,2,3,4,5].map(s => <span key={s} style={{ color: '#f59e0b', fontSize: '1.2rem' }}>★</span>)}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>4.9/5 average from 2,400+ businesses</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOptions}
                transition={{ delay: i * 0.1 }}
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 20, padding: '28px', backdropFilter: 'blur(12px)' }}
              >
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ color: '#f59e0b', fontSize: '0.9rem' }}>★</span>)}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, margin: '0 0 24px', fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-active))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOptions}
        transition={{ duration: 0.6 }}
        style={{ padding: '80px 24px', textAlign: 'center', position: 'relative', zIndex: 5, background: 'var(--bg-secondary)' }}
      >
        <div style={{
          background: 'linear-gradient(135deg, var(--brand-hover) 0%, var(--bg-primary) 100%)',
          border: '1px solid var(--brand-primary)',
          borderRadius: 28, padding: '72px 48px', maxWidth: 640, margin: '0 auto',
          backdropFilter: 'blur(16px)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, var(--brand-primary) 0%, transparent 70%)', opacity: 0.08 }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, var(--brand-active) 0%, transparent 70%)', opacity: 0.06 }} />
          <LucideIcon name="Rocket" size={40} color="var(--brand-primary)" style={{ marginBottom: 20 }} />
          <h2 style={{ color: 'var(--text-primary)', fontSize: '2.2rem', fontWeight: 800, margin: '16px 0 12px', letterSpacing: '-0.03em' }}>
            Ready to Build?
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 36, fontSize: '1.05rem', lineHeight: 1.6 }}>
            Join thousands of businesses who launched their online presence with SiteCraft. It's free to start.
          </p>
          <motion.button
            onClick={() => navigate('/builder/login')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-active))', border: 'none', borderRadius: 14, color: '#fff', padding: '16px 44px', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 32px var(--brand-hover)' }}
          >
            Get Started — It's Free →
          </motion.button>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 16 }}>No credit card required · Live in minutes</p>
        </div>
      </motion.section>

      {/* Footer */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', position: 'relative', zIndex: 5 }}>
        © {new Date().getFullYear()} SiteCraft · Powered by <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>MSR Tech Hub</span>
      </footer>
    </div>
  );
}

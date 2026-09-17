import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { sitesApi } from '../api/builderApi';
import DemoBanner from '../components/common/DemoBanner';
import LucideIcon from '../components/common/LucideIcon';

const SECTOR_ICONS = {
  construction: 'HardHat', medical: 'Activity', salon: 'Sparkles', hardware: 'Wrench',
  ecommerce: 'ShoppingBag', restaurant: 'Utensils', real_estate: 'Home', education: 'GraduationCap',
  fitness: 'Dumbbell', legal_services: 'Scale',
};

const SECTOR_COLORS = {
  construction: '#00FFD1', medical: '#00FFD1', salon: '#00FFD1', hardware: '#00FFD1',
  ecommerce: '#00FFD1', restaurant: '#00FFD1', real_estate: '#00FFD1',
  education: '#00FFD1', fitness: '#00FFD1', legal_services: '#00FFD1',
};

export default function Dashboard() {
  const { user, subscription, isDemo, logout } = useAuth();
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    sitesApi.list().then(res => setSites(res.data.sites || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await sitesApi.delete(id);
      setSites(s => s.filter(x => x.id !== id));
    } catch { alert('Could not delete site.'); }
    setDeleting(null);
  };

  const planColor = { free: '#4D4D4D', trial: '#00FFD1', starter: '#00FFD1', pro: '#6FD2C0', agency: '#00FFD1' };
  const planName = subscription?.plan_name || subscription?.plan || 'Free';
  const sitesLimit = subscription?.limits?.sites || 1;
  const usedSlots = sites.length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'Outfit', sans-serif", color: 'var(--text-primary)', position: 'relative', overflowX: 'hidden' }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.04), transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {/* Navbar */}
      <nav style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', padding: '0 24px', backdropFilter: 'blur(12px)', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => navigate('/builder')}>
            <img src="/logo.png" alt="MSR Tech Hub Logo" style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
            <span>MSR TECH HUB</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {user?.email}
            </span>
            <span style={{
              background: 'var(--brand-hover)',
              border: '1px solid var(--brand-primary)',
              color: 'var(--brand-primary)', fontSize: '0.7rem', fontWeight: 700,
              padding: '3px 10px', borderRadius: 99, letterSpacing: '0.05em'
            }}>
              {planName.toUpperCase()}
            </span>
            <button
              onClick={() => navigate('/builder/billing')}
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit', fontWeight: 600 }}
            >
              Billing
            </button>
            <button
              onClick={logout}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 5 }}>
        {isDemo && <DemoBanner />}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
              My Websites
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: '6px 0 0', fontSize: '0.9rem' }}>
              {usedSlots} of {sitesLimit === 999 ? 'unlimited' : sitesLimit} sites used
            </p>
          </div>
          <motion.button
            onClick={() => navigate('/builder/templates')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={!isDemo && usedSlots >= sitesLimit && sitesLimit !== 999}
            style={{
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-active))',
              border: 'none', borderRadius: 12, color: '#fff',
              padding: '12px 24px', fontWeight: 700, fontSize: '0.9rem',
              cursor: 'pointer', fontFamily: 'inherit',
              opacity: (!isDemo && usedSlots >= sitesLimit && sitesLimit !== 999) ? 0.5 : 1,
              boxShadow: '0 8px 24px var(--brand-hover)',
            }}
          >
            + Create New Site
          </motion.button>
        </div>

        {/* Site Limit Warning */}
        {!isDemo && usedSlots >= sitesLimit && sitesLimit !== 999 && (
          <div style={{ background: 'var(--brand-hover)', border: '1px solid var(--brand-primary)', borderRadius: 12, padding: '14px 20px', marginBottom: 24, color: 'var(--brand-primary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <LucideIcon name="AlertTriangle" size={16} /> You've reached your {sitesLimit}-site limit.{' '}
            <button onClick={() => navigate('/builder/billing')} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: 700, padding: 0, fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline' }}>
              Upgrade your plan →
            </button>
          </div>
        )}

        {/* Sites Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: 220, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : sites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '80px 24px', background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', borderRadius: 24, backdropFilter: 'blur(8px)' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: '50%', background: 'var(--brand-hover)', border: '1px solid var(--border-subtle)', marginBottom: 20 }}>
              <LucideIcon name="Globe" size={36} color="var(--brand-primary)" />
            </div>
            <h2 style={{ color: 'var(--text-primary)', margin: '0 0 12px', fontSize: '1.5rem', fontWeight: 700 }}>
              No Websites Yet
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.6 }}>
              Create your first website in minutes. Choose from 10 industry templates.
            </p>
            <button
              onClick={() => navigate('/builder/templates')}
              style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-active))', border: 'none', borderRadius: 12, color: '#fff', padding: '14px 32px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px var(--brand-hover)' }}
            >
              Create Your First Website
            </button>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {sites.map((site, i) => (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
                  borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'border-color .2s, box-shadow .2s',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--brand-primary)';
                  e.currentTarget.style.boxShadow = '0 8px 30px var(--brand-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Preview Banner */}
                <div style={{
                  height: 120,
                  background: 'linear-gradient(135deg, var(--bg-overlay) 0%, var(--brand-hover) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '50%', background: 'var(--brand-hover)', border: '1px solid var(--border-subtle)' }}>
                    <LucideIcon name={SECTOR_ICONS[site.sector] || 'Globe'} size={24} color="var(--brand-primary)" />
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
                      {site.name}
                    </h3>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                      background: site.status === 'published' ? 'var(--brand-hover)' : 'var(--bg-overlay)',
                      color: site.status === 'published' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      border: site.status === 'published' ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                      letterSpacing: '0.05em',
                    }}>
                      {site.status.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 16px', textTransform: 'capitalize' }}>
                    {site.sector?.replace('_', ' ')} • {site.variant}
                  </p>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => navigate(`/builder/editor/${site.id}`)}
                      style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit', transition: 'all .2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/builder/publish/${site.id}`)}
                      style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit', transition: 'all .2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                    >
                      Publish
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirmDelete === site.id) {
                          handleDelete(site.id);
                          setConfirmDelete(null);
                        } else {
                          setConfirmDelete(site.id);
                        }
                      }}
                      onMouseLeave={() => setConfirmDelete(null)}
                      disabled={deleting === site.id}
                      style={{
                        width: confirmDelete === site.id ? 'auto' : 36,
                        padding: confirmDelete === site.id ? '0 12px' : '0',
                        background: confirmDelete === site.id ? '#dc2626' : 'rgba(239,68,68,0.05)',
                        border: confirmDelete === site.id ? '1px solid #dc2626' : '1px solid rgba(239,68,68,0.15)',
                        borderRadius: 8,
                        color: confirmDelete === site.id ? '#ffffff' : '#dc2626',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        transition: 'all 0.25s ease',
                      }}
                    >
                      <LucideIcon name="Trash2" size={14} />
                      {confirmDelete === site.id && <span>Confirm</span>}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

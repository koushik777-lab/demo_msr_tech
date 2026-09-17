import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { publishApi } from '../api/builderApi';
import { useAuth } from '../context/AuthContext';
import LucideIcon from '../components/common/LucideIcon';

export default function PublishPage() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { isDemo, canPublish, subscription } = useAuth();
  const [publishing, setPublishing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handlePublish = async () => {
    if (isDemo) { setError('Demo accounts cannot publish. Sign up to publish your website.'); return; }
    if (!canPublish) { setError('Please upgrade your plan to publish websites.'); return; }
    setPublishing(true);
    setError('');
    try {
      const res = await publishApi.publish(siteId);
      // Download the ZIP
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `website-${siteId}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Publish failed. Please try again.');
    }
    setPublishing(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'Outfit', sans-serif", color: 'var(--text-primary)', position: 'relative', overflowX: 'hidden' }}>
      {/* Background orb */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '20%', left: '25%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.03), transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', padding: '0 24px', backdropFilter: 'blur(12px)', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate(`/builder/editor/${siteId}`)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LucideIcon name="ChevronLeft" size={20} />
          </button>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Publish Website</span>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '60px auto', padding: '0 24px', position: 'relative', zIndex: 5 }}>
        {done ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 24, padding: '48px 32px', backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: '50%', background: 'var(--brand-hover)', border: '1px solid var(--border-subtle)', marginBottom: 24 }}>
              <LucideIcon name="CheckCircle" size={40} color="var(--brand-primary)" />
            </div>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>
              Your Website is Ready!
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
              Your website ZIP has been downloaded. Extract and host it on any web server.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setDone(false)} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '12px 24px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Download Again
              </button>
              <button onClick={() => navigate('/builder/dashboard')} style={{ background: 'linear-gradient(135deg,var(--brand-primary),var(--brand-active))', border: 'none', borderRadius: 10, color: '#fff', padding: '12px 24px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px var(--brand-hover)' }}>
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        ) : (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 24, padding: '40px 32px', backdropFilter: 'blur(12px)' }}>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
              Ready to go live?
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '0.95rem', lineHeight: 1.5 }}>
              We'll generate a complete static website package (HTML, CSS, JS, sitemap) ready to deploy anywhere.
            </p>

            {/* Checklist */}
            {[
              'Static HTML/CSS/JS generated from your design',
              'SEO meta tags & sitemap.xml included',
              'Legal pages (Terms, Privacy, Cookie Policy) included',
              'Mobile responsive layout',
              'Contact form with validation',
              'Cookie consent banner included',
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.9rem', alignItems: 'center' }}>
                <LucideIcon name="Check" size={16} color="var(--brand-primary)" /> {text}
              </div>
            ))}

            {/* Subscription status */}
            {isDemo && (
              <div style={{ marginTop: 32, background: 'var(--brand-hover)', border: '1px solid var(--brand-primary)', borderRadius: 12, padding: '16px 20px', color: 'var(--brand-primary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <LucideIcon name="Lock" size={14} /> Demo accounts cannot publish. <button onClick={() => navigate('/builder/login')} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: 700, padding: 0, fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline' }}>Sign up free →</button>
              </div>
            )}

            {!isDemo && !canPublish && (
              <div style={{ marginTop: 32, background: 'var(--brand-hover)', border: '1px solid var(--brand-primary)', borderRadius: 12, padding: '16px 20px', color: 'var(--brand-primary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <LucideIcon name="Lock" size={14} /> Publishing requires an active plan. <button onClick={() => navigate('/builder/billing')} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: 700, padding: 0, fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline' }}>Upgrade now →</button>
              </div>
            )}

            {error && (
              <div style={{ marginTop: 16, color: '#dc2626', fontSize: '0.875rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 16px' }}>
                {error}
              </div>
            )}

            <motion.button
              onClick={handlePublish}
              disabled={publishing || isDemo || !canPublish}
              whileHover={!publishing && !isDemo && canPublish ? { scale: 1.02 } : {}}
              style={{
                marginTop: 32, width: '100%', padding: '16px',
                background: (publishing || isDemo || !canPublish) ? 'var(--bg-overlay)' : 'linear-gradient(135deg,var(--brand-primary),var(--brand-active))',
                border: (publishing || isDemo || !canPublish) ? '1px solid var(--border-subtle)' : 'none',
                borderRadius: 12, color: (publishing || isDemo || !canPublish) ? 'var(--text-muted)' : '#fff',
                fontWeight: 700, fontSize: '1rem', cursor: (publishing || isDemo || !canPublish) ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', boxShadow: (publishing || isDemo || !canPublish) ? 'none' : '0 8px 24px var(--brand-hover)',
              }}
            >
              {publishing ? 'Generating website...' : 'Download Website ZIP'}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}

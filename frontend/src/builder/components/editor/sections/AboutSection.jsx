import React from 'react';
import EditableText from '../EditableText';

export default function AboutSection({ content, styles, siteSettings, onUpdate }) {
  const fontH = siteSettings?.font_heading || 'Outfit';
  const primary = siteSettings?.brand_colors?.primary || '#6366f1';
  return (
    <section style={{ padding: '80px 24px', background: '#f8fafc' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <div style={{ width: 4, height: 40, background: primary, borderRadius: 2 }} />
          <EditableText
            tag="h2"
            value={content.heading || 'About Us'}
            onSave={(v) => onUpdate?.({ heading: v })}
            style={{ fontFamily: `'${fontH}', sans-serif`, fontSize: '2rem', fontWeight: 800, margin: 0, color: '#1e293b' }}
          />
        </div>
        <EditableText
          tag="p"
          value={content.body || 'We are a dedicated team committed to delivering excellence in everything we do. Our passion drives us to create solutions that make a real difference.'}
          onSave={(v) => onUpdate?.({ body: v })}
          style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#475569', maxWidth: 720 }}
        />
      </div>
    </section>
  );
}

import React from 'react';
import EditableText from '../EditableText';
import EditableImage from '../EditableImage';
import { resolveAssetUrl } from '../../../api/builderApi';

export default function TeamSection({ content, siteSettings, onUpdate }) {
  const fontH = siteSettings?.font_heading || 'Outfit';
  const primary = siteSettings?.brand_colors?.primary || '#6366f1';
  const members = content.members || [
    { name: 'Team Member', role: 'Position', image: '' },
    { name: 'Team Member', role: 'Position', image: '' },
    { name: 'Team Member', role: 'Position', image: '' },
  ];

  const updateMember = (index, field, value) => {
    const updated = members.map((m, i) => i === index ? { ...m, [field]: value } : m);
    onUpdate?.({ members: updated });
  };

  return (
    <section style={{ padding: '80px 24px', background: 'white' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <EditableText
          tag="h2"
          value={content.heading || 'Our Team'}
          onSave={(v) => onUpdate?.({ heading: v })}
          style={{ fontFamily: `'${fontH}', sans-serif`, textAlign: 'center', fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: 48 }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
          {members.map((m, i) => (
            <div key={i} style={{ textAlign: 'center', background: 'white', borderRadius: 16, padding: '32px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
              {m.image ? (
                <EditableImage
                  src={m.image}
                  alt={m.name}
                  onSave={(url) => updateMember(i, 'image', url)}
                  style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px', display: 'block', border: `3px solid ${primary}33` }}
                />
              ) : (
                <EditableImage
                  src=""
                  onSave={(url) => updateMember(i, 'image', url)}
                  emptyText="Add Photo"
                  emptyStyle={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px', padding: 8 }}
                />
              )}
              <EditableText
                tag="h3"
                value={m.name}
                onSave={(v) => updateMember(i, 'name', v)}
                style={{ fontFamily: `'${fontH}', sans-serif`, fontWeight: 700, color: '#1e293b', marginBottom: 4, fontSize: '1rem' }}
              />
              <EditableText
                tag="div"
                value={m.role}
                onSave={(v) => updateMember(i, 'role', v)}
                style={{ color: '#64748b', fontSize: '0.85rem' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

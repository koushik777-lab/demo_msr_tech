import React from 'react';
import LucideIcon from '../../common/LucideIcon';
import EditableText from '../EditableText';

export default function ServicesSection({ content, styles, siteSettings, onUpdate }) {
  const fontH = siteSettings?.font_heading || 'Outfit';
  const primary = siteSettings?.brand_colors?.primary || '#6366f1';
  const items = content.items || [
    { icon: 'Star', title: 'Service 1', description: 'Description of your first service offering.' },
    { icon: 'Rocket', title: 'Service 2', description: 'Description of your second service offering.' },
    { icon: 'Gem', title: 'Service 3', description: 'Description of your third service offering.' },
  ];

  const updateItem = (index, field, value) => {
    const updated = items.map((item, i) => i === index ? { ...item, [field]: value } : item);
    onUpdate?.({ items: updated });
  };

  return (
    <section style={{ padding: '80px 24px', background: 'white' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <EditableText
            tag="h2"
            value={content.heading || 'Our Services'}
            onSave={(v) => onUpdate?.({ heading: v })}
            style={{ fontFamily: `'${fontH}', sans-serif`, fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', margin: '0 0 12px' }}
          />
          <EditableText
            tag="p"
            value={content.subheading || 'What we offer'}
            onSave={(v) => onUpdate?.({ subheading: v })}
            style={{ color: '#64748b', fontSize: '1.05rem' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
          {items.map((item, i) => (
            <div key={i} style={{
              background: '#f8fafc', borderRadius: 16, padding: '32px 24px',
              border: '1px solid #e2e8f0', transition: 'transform .2s, box-shadow .2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ marginBottom: 16, display: 'flex' }}>
                <LucideIcon name={item.icon} size={36} color={primary} />
              </div>
              <EditableText
                tag="h3"
                value={item.title}
                onSave={(v) => updateItem(i, 'title', v)}
                style={{ fontFamily: `'${fontH}', sans-serif`, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: 10 }}
              />
              <EditableText
                tag="p"
                value={item.description}
                onSave={(v) => updateItem(i, 'description', v)}
                style={{ color: '#64748b', lineHeight: 1.6, margin: 0, fontSize: '0.9rem' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

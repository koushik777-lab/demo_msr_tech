import React from 'react';
import EditableText from '../EditableText';

export default function TestimonialsSection({ content, siteSettings, onUpdate }) {
  const fontH = siteSettings?.font_heading || 'Outfit';
  const primary = siteSettings?.brand_colors?.primary || '#6366f1';
  const items = content.items || [
    { name: 'Client Name', role: 'Role', text: 'This is a wonderful service. Highly recommended!', rating: 5 },
    { name: 'Happy Customer', role: 'Customer', text: 'Professional team with exceptional results.', rating: 5 },
  ];

  const updateItem = (index, field, value) => {
    const updated = items.map((item, i) => i === index ? { ...item, [field]: value } : item);
    onUpdate?.({ items: updated });
  };

  return (
    <section style={{ padding: '80px 24px', background: '#f8fafc' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <EditableText
          tag="h2"
          value={content.heading || 'What Our Clients Say'}
          onSave={(v) => onUpdate?.({ heading: v })}
          style={{ fontFamily: `'${fontH}', sans-serif`, textAlign: 'center', fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: 48 }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {items.map((item, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 16, padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
              <div style={{ color: primary, fontSize: '1.25rem', marginBottom: 12 }}>
                {'★'.repeat(Math.max(0, Math.min(5, Math.floor(Number(item.rating) || 0))))}
                {'☆'.repeat(Math.max(0, 5 - Math.max(0, Math.min(5, Math.floor(Number(item.rating) || 0)))))}
              </div>
              <EditableText
                tag="p"
                value={`"${item.text}"`}
                onSave={(v) => updateItem(i, 'text', v.replace(/^"|"$/g, ''))}
                style={{ color: '#475569', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 16 }}
              />
              <div>
                <EditableText
                  tag="strong"
                  value={item.name}
                  onSave={(v) => updateItem(i, 'name', v)}
                  style={{ color: '#1e293b', display: 'block' }}
                />
                <EditableText
                  tag="div"
                  value={item.role}
                  onSave={(v) => updateItem(i, 'role', v)}
                  style={{ color: '#94a3b8', fontSize: '0.8rem' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

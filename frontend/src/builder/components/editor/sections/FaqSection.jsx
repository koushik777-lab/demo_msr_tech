import React, { useState } from 'react';
import EditableText from '../EditableText';

export default function FaqSection({ content, siteSettings, onUpdate }) {
  const fontH = siteSettings?.font_heading || 'Outfit';
  const primary = siteSettings?.brand_colors?.primary || '#6366f1';
  const [open, setOpen] = useState(null);
  const items = content.items || [
    { question: 'What services do you offer?', answer: 'We offer a comprehensive range of professional services tailored to your specific needs and goals.' },
    { question: 'How can I get started?', answer: 'Simply contact us through our form and we\'ll schedule a free consultation to discuss your requirements.' },
  ];

  const updateItem = (index, field, value) => {
    const updated = items.map((item, i) => i === index ? { ...item, [field]: value } : item);
    onUpdate?.({ items: updated });
  };

  return (
    <section style={{ padding: '80px 24px', background: 'white' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <EditableText
          tag="h2"
          value={content.heading || 'Frequently Asked Questions'}
          onSave={(v) => onUpdate?.({ heading: v })}
          style={{ fontFamily: `'${fontH}', sans-serif`, textAlign: 'center', fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: 48 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: 12, border: `1px solid ${open === i ? primary + '44' : '#e2e8f0'}`, overflow: 'hidden', transition: 'border-color .2s' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(open === i ? null : i); }}
                style={{ width: '100%', padding: '20px 24px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'inherit' }}
              >
                <EditableText
                  tag="span"
                  value={item.question}
                  onSave={(v) => updateItem(i, 'question', v)}
                  style={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}
                />
                <span style={{ color: primary, fontSize: '1.25rem', transition: 'transform .2s', transform: open === i ? 'rotate(45deg)' : 'rotate(0)', flexShrink: 0, marginLeft: 12 }}>+</span>
              </button>
              {open === i && (
                <div style={{ padding: '0 24px 20px' }}>
                  <EditableText
                    tag="div"
                    value={item.answer}
                    onSave={(v) => updateItem(i, 'answer', v)}
                    style={{ color: '#64748b', lineHeight: 1.7 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

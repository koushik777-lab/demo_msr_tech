import React, { useState } from 'react';
import LucideIcon from '../../common/LucideIcon';
import EditableText from '../EditableText';
import * as LucideIcons from 'lucide-react';

const POPULAR_ICONS = [
  'HelpCircle', 'MessageCircle', 'BookOpen', 'FileText', 'Headphones',
  'ShieldCheck', 'Zap', 'Star', 'Heart', 'Mail', 'Phone', 'Globe',
  'Code', 'Layers', 'Grid', 'Settings', 'CheckCircle', 'Info'
];

export default function CustomBlockSection({ content, styles, siteSettings, onUpdate }) {
  const fontH = siteSettings?.font_heading || 'Outfit';
  const primary = siteSettings?.brand_colors?.primary || '#6366f1';
  const bg = content.bg_color || '#ffffff';
  const textColor = content.text_color || '#1e293b';
  const [iconPickerIndex, setIconPickerIndex] = useState(null);

  const items = content.items || [
    { icon: 'HelpCircle', title: 'Help & Knowledgebase', description: 'Find detailed guides, tutorials, and answers to common questions.', link: '#faq' },
    { icon: 'MessageCircle', title: 'Live Support & Chat', description: 'Get direct help from our team via chat or message.', link: '#contact' },
    { icon: 'BookOpen', title: 'Documentation & Guides', description: 'Explore documentation and step-by-step instructions.', link: '#' }
  ];

  const updateItem = (index, field, value) => {
    const updated = items.map((item, i) => i === index ? { ...item, [field]: value } : item);
    onUpdate?.({ items: updated });
  };

  const addItem = () => {
    const newItem = {
      icon: 'Star',
      title: 'New Custom Block',
      description: 'Add your custom content or line details here.',
      link: '#'
    };
    onUpdate?.({ items: [...items, newItem] });
  };

  const deleteItem = (index, e) => {
    e.stopPropagation();
    const updated = items.filter((_, i) => i !== index);
    onUpdate?.({ items: updated });
  };

  return (
    <section style={{ padding: '80px 24px', background: bg, color: textColor, position: 'relative' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Section Heading & Subheading */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <EditableText
            tag="h2"
            value={content.heading || 'Custom Section / Help Center'}
            onSave={(v) => onUpdate?.({ heading: v })}
            style={{ fontFamily: `'${fontH}', sans-serif`, fontSize: '2.25rem', fontWeight: 800, color: textColor, margin: '0 0 12px' }}
          />
          <EditableText
            tag="p"
            value={content.subheading || 'Fully customizable section for help, info, or custom content.'}
            onSave={(v) => onUpdate?.({ subheading: v })}
            style={{ color: textColor === '#ffffff' ? 'rgba(255,255,255,0.8)' : '#64748b', fontSize: '1.05rem', margin: '0 0 16px' }}
          />
          {content.body && (
            <EditableText
              tag="p"
              value={content.body}
              onSave={(v) => onUpdate?.({ body: v })}
              style={{ color: textColor === '#ffffff' ? 'rgba(255,255,255,0.9)' : '#475569', fontSize: '1rem', maxWidth: 750, margin: '0 auto', lineHeight: 1.7 }}
            />
          )}
        </div>

        {/* Content Cards Grid */}
        {items && items.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
            {items.map((item, i) => (
              <div key={i} style={{
                background: bg === '#ffffff' ? '#f8fafc' : 'rgba(255,255,255,0.05)',
                borderRadius: 16, padding: '28px 24px',
                border: '1px solid ' + (bg === '#ffffff' ? '#e2e8f0' : 'rgba(255,255,255,0.1)'),
                transition: 'transform .2s, box-shadow .2s', position: 'relative'
              }}>
                {/* Delete Item Button */}
                <button
                  onClick={(e) => deleteItem(i, e)}
                  style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '50%', color: '#f87171', width: 24, height: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}
                  title="Delete Card"
                >
                  <LucideIcon name="X" size={12} />
                </button>

                {/* Clickable Icon to change Icon */}
                <div style={{ marginBottom: 16, position: 'relative' }}>
                  <div
                    onClick={() => setIconPickerIndex(iconPickerIndex === i ? null : i)}
                    style={{
                      display: 'inline-flex', cursor: 'pointer', padding: 6,
                      borderRadius: 10, background: 'rgba(99,102,241,0.08)',
                      border: '1px solid rgba(99,102,241,0.2)', transition: 'transform 0.15s'
                    }}
                    title="Click to change icon"
                  >
                    <LucideIcon name={item.icon || 'HelpCircle'} size={30} color={primary} />
                  </div>

                  {/* Icon Selector Popover */}
                  {iconPickerIndex === i && (
                    <div style={{
                      position: 'absolute', top: 48, left: 0, zIndex: 99,
                      background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 12, padding: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, width: 220
                    }}>
                      {POPULAR_ICONS.map(iconName => (
                        <button
                          key={iconName}
                          onClick={() => {
                            updateItem(i, 'icon', iconName);
                            setIconPickerIndex(null);
                          }}
                          style={{
                            background: item.icon === iconName ? 'rgba(0,255,209,0.2)' : 'rgba(255,255,255,0.05)',
                            border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          <LucideIcon name={iconName} size={16} color={item.icon === iconName ? '#00FFD1' : '#ffffff'} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <EditableText
                  tag="h3"
                  value={item.title || 'Title'}
                  onSave={(v) => updateItem(i, 'title', v)}
                  style={{ fontFamily: `'${fontH}', sans-serif`, fontSize: '1.1rem', fontWeight: 700, color: textColor, marginBottom: 8 }}
                />
                <EditableText
                  tag="p"
                  value={item.description || 'Description'}
                  onSave={(v) => updateItem(i, 'description', v)}
                  style={{ color: textColor === '#ffffff' ? 'rgba(255,255,255,0.75)' : '#64748b', lineHeight: 1.6, margin: '0 0 16px', fontSize: '0.9rem' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <EditableText
                    tag="span"
                    value={item.link_text || 'Learn More →'}
                    onSave={(v) => updateItem(i, 'link_text', v)}
                    style={{ color: primary, fontSize: '0.85rem', fontWeight: 600 }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Card Button */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <button
            onClick={addItem}
            style={{
              padding: '8px 20px', background: 'rgba(0,255,209,0.08)',
              border: '1px dashed rgba(0,255,209,0.4)', borderRadius: 8,
              color: '#00FFD1', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem',
              display: 'inline-flex', alignItems: 'center', gap: 6, outline: 'none'
            }}
          >
            <LucideIcon name="Plus" size={14} color="#00FFD1" /> Add Custom Content Card
          </button>
        </div>

        {/* CTA Button */}
        {content.cta_text && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <a href={content.cta_link || '#'} style={{
              display: 'inline-block', background: primary, color: '#ffffff',
              padding: '12px 32px', borderRadius: 10, fontWeight: 700,
              textDecoration: 'none', fontSize: '0.95rem', boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
            }}>
              {content.cta_text}
            </a>
          </div>
        )}

        {/* Optional Custom HTML */}
        {content.custom_html && (
          <div style={{ marginTop: 32, padding: 16, border: '1px dashed rgba(0,0,0,0.15)', borderRadius: 8 }} dangerouslySetInnerHTML={{ __html: content.custom_html }} />
        )}
      </div>
    </section>
  );
}

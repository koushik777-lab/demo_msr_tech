import React from 'react';
import EditableText from '../EditableText';
import EditableImage from '../EditableImage';

export default function GallerySection({ content, siteSettings, onUpdate }) {
  const fontH = siteSettings?.font_heading || 'Outfit';
  const items = content.items || [];

  const updateItem = (index, field, value) => {
    const updated = items.map((item, i) => i === index ? { ...item, [field]: value } : item);
    onUpdate?.({ items: updated });
  };

  const addImage = (url) => {
    const updated = [...items, { url, alt: `Gallery ${items.length + 1}`, description: 'Add description' }];
    onUpdate?.({ items: updated });
  };

  return (
    <section style={{ padding: '80px 24px', background: 'white' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <EditableText
          tag="h2"
          value={content.heading || 'Our Gallery'}
          onSave={(v) => onUpdate?.({ heading: v })}
          style={{ fontFamily: `'${fontH}', sans-serif`, textAlign: 'center', fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: 48, display: 'block' }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '4/3', background: '#f1f5f9' }}>
                <EditableImage
                  src={item.url}
                  alt={item.alt || `Gallery ${i+1}`}
                  onSave={(newUrl) => updateItem(i, 'url', newUrl)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ marginTop: 8, textAlign: 'center' }}>
                <EditableText
                  tag="p"
                  value={item.description || 'Add description'}
                  onSave={(v) => updateItem(i, 'description', v)}
                  style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, lineHeight: 1.4 }}
                />
              </div>
            </div>
          ))}
          {/* Add image placeholder */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '4/3' }}>
              <EditableImage
                src=""
                onSave={(url) => addImage(url)}
                emptyText="Click to add image"
                emptyStyle={{ height: '100%', borderRadius: 12 }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

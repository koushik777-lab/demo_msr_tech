import React, { useState, useRef } from 'react';
import { SECTION_LABELS } from './SectionRenderer';
import LucideIcon from '../common/LucideIcon';
import { assetsApi, resolveAssetUrl } from '../../api/builderApi';
import * as LucideIcons from 'lucide-react';

// Properties panel — dynamic form based on section type
// Each section type has a schema that generates the right edit controls

const SCHEMAS = {
  hero: [
    { key: 'use_carousel', label: 'Enable Image Carousel', type: 'checkbox' },
    { key: 'heading', label: 'Main Heading (Default)', type: 'text' },
    { key: 'subheading', label: 'Subheading (Default)', type: 'textarea' },
    { key: 'image', label: 'Single Background Image', type: 'image' },
    { key: 'bg_color', label: 'Background Color (Fallback)', type: 'color' },
    { key: 'cta_text', label: 'Button Text (Default)', type: 'text' },
    { key: 'cta_link', label: 'Button Link (Default)', type: 'text' },
    { key: 'slides', label: 'Carousel Slides', type: 'items', fields: [
      { key: 'image', label: 'Slide Image', type: 'image' },
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'subheading', label: 'Subheading', type: 'textarea' },
      { key: 'cta_text', label: 'Button Text', type: 'text' },
      { key: 'cta_link', label: 'Button Link', type: 'text' },
    ]}
  ],
  about: [
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'body', label: 'Content', type: 'textarea', rows: 6 },
  ],
  services: [
    { key: 'heading', label: 'Section Heading', type: 'text' },
    { key: 'subheading', label: 'Subheading', type: 'text' },
    { key: 'items', label: 'Services', type: 'items', fields: [
      { key: 'icon', label: 'Icon', type: 'icon' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea', rows: 2 },
    ]},
  ],
  gallery: [
    { key: 'heading', label: 'Section Heading', type: 'text' },
  ],
  testimonials: [
    { key: 'heading', label: 'Section Heading', type: 'text' },
    { key: 'items', label: 'Testimonials', type: 'items', fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'role', label: 'Role/Title', type: 'text' },
      { key: 'text', label: 'Quote', type: 'textarea', rows: 3 },
      { key: 'rating', label: 'Rating (1-5)', type: 'number' },
    ]},
  ],
  pricing: [
    { key: 'heading', label: 'Section Heading', type: 'text' },
    { key: 'plans', label: 'Plans', type: 'items', fields: [
      { key: 'name', label: 'Plan Name', type: 'text' },
      { key: 'price', label: 'Price', type: 'text', placeholder: '₹999/mo' },
      { key: 'popular', label: 'Mark as Popular', type: 'checkbox' },
    ]},
  ],
  team: [
    { key: 'heading', label: 'Section Heading', type: 'text' },
    { key: 'members', label: 'Team Members', type: 'items', fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'role', label: 'Role/Title', type: 'text' },
      { key: 'image', label: 'Image', type: 'image' },
    ]},
  ],
  faq: [
    { key: 'heading', label: 'Section Heading', type: 'text' },
    { key: 'items', label: 'FAQ Items', type: 'items', fields: [
      { key: 'question', label: 'Question', type: 'text' },
      { key: 'answer', label: 'Answer', type: 'textarea', rows: 3 },
    ]},
  ],
  contact_form: [
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'subheading', label: 'Subheading', type: 'text' },
  ],
  blog: [
    { key: 'heading', label: 'Section Heading', type: 'text' },
    { key: 'subheading', label: 'Subheading', type: 'text' },
    { key: 'posts', label: 'Blog Articles', type: 'items', fields: [
      { key: 'title', label: 'Article Title', type: 'text' },
      { key: 'date', label: 'Publish Date', type: 'text', placeholder: 'Jan 15, 2024' },
      { key: 'author', label: 'Author Name', type: 'text', placeholder: 'Team Admin' },
      { key: 'image', label: 'Cover Image', type: 'image' },
      { key: 'excerpt', label: 'Short Excerpt / Summary', type: 'textarea', rows: 2 },
      { key: 'full_text', label: 'Full Article Content', type: 'textarea', rows: 5 },
    ]},
  ],
  html_embed: [
    { key: 'html', label: 'HTML Code', type: 'textarea', rows: 8 },
  ],
  custom_block: [
    { key: 'custom_anchor', label: 'Section Anchor ID (e.g. help, support)', type: 'text', placeholder: 'e.g. help' },
    { key: 'heading', label: 'Section Title', type: 'text' },
    { key: 'subheading', label: 'Subheading / Tagline', type: 'text' },
    { key: 'body', label: 'Main Description / Paragraph', type: 'textarea', rows: 4 },
    { key: 'bg_color', label: 'Background Color', type: 'color' },
    { key: 'text_color', label: 'Text Color', type: 'color' },
    { key: 'cta_text', label: 'Button Text (Optional)', type: 'text' },
    { key: 'cta_link', label: 'Button Link (Optional)', type: 'text' },
    { key: 'items', label: 'Custom Content Cards / Blocks', type: 'items', fields: [
      { key: 'icon', label: 'Icon', type: 'icon' },
      { key: 'title', label: 'Card Title', type: 'text' },
      { key: 'description', label: 'Card Description', type: 'textarea', rows: 2 },
      { key: 'link', label: 'Card Button/Link URL', type: 'text' },
    ]},
    { key: 'custom_html', label: 'Custom HTML Embed (Optional)', type: 'textarea', rows: 4 },
  ],
};

function ImageUploadControl({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await assetsApi.upload(file);
      const url = res.data?.asset?.url || res.data?.url;
      if (url) {
        onChange(url);
      } else {
        alert('Upload failed: no URL returned');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + (err?.response?.data?.detail || err.message));
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
          placeholder="Paste URL or upload image"
          style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
          onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'}
          onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
        />
        <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" style={{ display: 'none' }} />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '10px 14px', background: 'var(--brand-primary)', color: 'white',
            border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', transition: 'all 0.2s',
            height: 38
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-active)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--brand-primary)'}
        >
          <LucideIcon name="Upload" size={13} />
          {uploading ? '...' : 'Upload'}
        </button>
      </div>
      {value && (
        <div style={{ position: 'relative', width: '100%', height: 100, borderRadius: 8, overflow: 'hidden', background: '#0f172a', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={resolveAssetUrl(value)} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
          <button
            onClick={() => onChange('')}
            style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(239, 68, 68, 0.85)', border: 'none', borderRadius: '50%', color: 'white', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.85)'}
          >
            <LucideIcon name="X" size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

function IconPickerControl({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const iconNames = Object.keys(LucideIcons).filter(name => 
    /^[A-Z]/.test(name) && name !== 'createReactComponent' && name !== 'default'
  );

  const filtered = iconNames
    .filter(name => name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 48);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ 
          width: 40, height: 40, borderRadius: 8, background: 'var(--bg-secondary)', 
          border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', color: 'var(--brand-primary)', flexShrink: 0
        }}>
          <LucideIcon name={value || 'HelpCircle'} size={20} />
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '10px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)',
            borderRadius: 8, color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.82rem',
            fontWeight: 600, flex: 1, textAlign: 'left', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', height: 40, outline: 'none'
          }}
        >
          <span>{value || 'Select Icon...'}</span>
          <LucideIcon name="ChevronDown" size={14} color="var(--text-muted)" />
        </button>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6,
          background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)',
          borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.35)', padding: 12,
          zIndex: 999, display: 'flex', flexDirection: 'column', gap: 8
        }}>
          <input
            type="text"
            placeholder="Search icons (e.g. Activity, Dumbbell)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            style={{
              width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-primary)',
              fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box'
            }}
          />

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6,
            maxHeight: 180, overflowY: 'auto', padding: 2
          }}>
            {filtered.map(name => (
              <button
                key={name}
                title={name}
                onClick={() => {
                  onChange(name);
                  setIsOpen(false);
                  setSearch('');
                }}
                style={{
                  background: value === name ? 'var(--brand-primary)' : 'transparent',
                  border: 'none', borderRadius: 6, padding: 8, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: value === name ? 'white' : 'var(--text-secondary)',
                  transition: 'background 0.15s, color 0.15s', height: 32
                }}
              >
                <LucideIcon name={name} size={16} />
              </button>
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: 'span 6', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '16px 0', textAlign: 'center' }}>
                No icons found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FieldControl({ field, value, onChange }) {
  if (field.type === 'text') return (
    <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder || ''}
      style={inputStyle}
      onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'}
      onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
  );
  if (field.type === 'number') return (
    <input type="number" min={1} max={5} value={value || 5} onChange={e => onChange(Number(e.target.value))}
      style={{ ...inputStyle, width: 60 }}
      onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'}
      onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
  );
  if (field.type === 'textarea') return (
    <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={field.rows || 4}
      style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
      onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'}
      onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
  );
  if (field.type === 'color') return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input type="color" value={value || '#1e293b'} onChange={e => onChange(e.target.value)}
        style={{ width: 40, height: 36, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 6 }} />
      <input type="text" value={value || '#1e293b'} onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, width: '100%' }}
        onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'}
        onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
    </div>
  );
  if (field.type === 'checkbox') return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)}
        style={{ width: 16, height: 16, accentColor: 'var(--brand-primary)' }} />
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Yes</span>
    </label>
  );
  if (field.type === 'image') return (
    <ImageUploadControl value={value} onChange={onChange} />
  );
  if (field.type === 'icon') return (
    <IconPickerControl value={value} onChange={onChange} />
  );
  return null;
}

function ItemsEditor({ field, items = [], onChange }) {
  const [expanded, setExpanded] = useState(0);

  const updateItem = (idx, key, val) => {
    const updated = items.map((item, i) => i === idx ? { ...item, [key]: val } : item);
    onChange(updated);
  };

  const addItem = () => {
    const newItem = {};
    field.fields.forEach(f => { newItem[f.key] = ''; });
    onChange([...items, newItem]);
    setExpanded(items.length);
  };

  const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div>
      {items.map((item, idx) => (
        <div key={idx} style={{ marginBottom: 8, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <div
            onClick={() => setExpanded(expanded === idx ? null : idx)}
            style={{ padding: '10px 12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span style={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
              {item.name || item.title || item.question || `Item ${idx + 1}`}
            </span>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <LucideIcon name={expanded === idx ? 'ChevronUp' : 'ChevronDown'} size={14} color="var(--text-muted)" />
              <button onClick={(e) => { e.stopPropagation(); removeItem(idx); }}
                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 2 }}>
                <LucideIcon name="Trash2" size={13} />
              </button>
            </div>
          </div>
          {expanded === idx && (
            <div style={{ padding: '0 12px 12px' }}>
              {field.fields.map(f => (
                <div key={f.key} style={{ marginBottom: 10 }}>
                  <label style={labelStyle}>{f.label}</label>
                  <FieldControl field={f} value={item[f.key]} onChange={val => updateItem(idx, f.key, val)} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <button onClick={addItem}
        style={{ width: '100%', padding: '10px', background: 'var(--brand-hover)', border: '1px dashed var(--brand-primary)', borderRadius: 8, color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .2s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--brand-hover)'}>
        <LucideIcon name="Plus" size={14} /> Add {field.label.replace('s','').trim()}
      </button>
    </div>
  );
}

export default function PropertiesPanel({ section, siteSettings, onUpdate, onClose }) {
  const schema = SCHEMAS[section.type] || [];
  const info = SECTION_LABELS[section.type] || { icon: 'FileText', label: section.type };

  const handleFieldChange = (key, value) => {
    onUpdate({ [key]: value });
  };

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LucideIcon name={info.icon} size={16} color="var(--brand-primary)" />
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem', fontFamily: "'Outfit', sans-serif" }}>{info.label}</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
          <LucideIcon name="X" size={16} />
        </button>
      </div>

      {schema.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No editable properties for this section.</p>
      )}

      {schema.map(field => (
        <div key={field.key} style={{ marginBottom: 18 }}>
          <label style={labelStyle}>{field.label}</label>
          {field.type === 'items' ? (
            <ItemsEditor
              field={field}
              items={section.content?.[field.key] || []}
              onChange={(val) => handleFieldChange(field.key, val)}
            />
          ) : (
            <FieldControl
              field={field}
              value={section.content?.[field.key]}
              onChange={(val) => handleFieldChange(field.key, val)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

const labelStyle = { display: 'block', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = { width: '100%', padding: '10px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: "'Outfit', sans-serif", outline: 'none', boxSizing: 'border-box', display: 'block', transition: 'border-color .2s' };

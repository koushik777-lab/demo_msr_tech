import React, { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { assetsApi, resolveAssetUrl } from '../../api/builderApi';

/**
 * EditableImage — renders an image with click-to-upload.
 * Props:
 *   src       — current image URL (can be relative)
 *   alt       — alt text
 *   onSave    — callback(newUrl) fired after successful upload
 *   style     — inline styles for the image
 *   emptyStyle — inline styles for the empty placeholder
 *   emptyText — text to show when no image
 */
export default function EditableImage({ src, alt, onSave, style, emptyStyle, emptyText, ...rest }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const resolved = resolveAssetUrl(src);

  const handleClick = (e) => {
    e.stopPropagation();
    inputRef.current?.click();
  };

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await assetsApi.upload(file);
      const url = res.data?.asset?.url || res.data?.url;
      if (url && onSave) onSave(url);
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} style={{ display: 'none' }} />
      {resolved ? (
        <div style={{ position: 'relative', cursor: 'pointer', ...rest.containerStyle }}>
          <img src={resolved} alt={alt || ''} style={{ ...style }} {...rest} />
          {/* Hover overlay */}
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.2s', borderRadius: style?.borderRadius || 0,
          }}
            onClick={handleClick}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0}
          >
            <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Camera size={14} /> Change Image
                </>
              )}
            </span>

            {/* Delete Image button */}
            {!uploading && onSave && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Are you sure you want to remove this image?")) {
                    onSave("");
                  }
                }}
                style={{
                  position: 'absolute', top: 8, right: 8, background: 'rgba(239, 68, 68, 0.9)',
                  border: 'none', borderRadius: '50%', color: 'white', width: 26, height: 26,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  zIndex: 10, transition: 'background 0.2s'
                }}
                title="Remove Image"
                onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)'}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 8, cursor: 'pointer', background: '#f1f5f9', border: '2px dashed #cbd5e1',
            borderRadius: 12, padding: '24px 16px', transition: 'border-color 0.2s',
            ...emptyStyle,
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
        >
          {uploading ? (
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--brand-primary)' }} />
          ) : (
            <Camera size={28} style={{ color: '#94a3b8' }} />
          )}
          <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 500 }}>
            {uploading ? 'Uploading...' : (emptyText || 'Click to upload image')}
          </span>
        </div>
      )}
    </>
  );
}

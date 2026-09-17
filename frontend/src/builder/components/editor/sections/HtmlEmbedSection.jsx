import React from 'react';
import { Code } from 'lucide-react';

export default function HtmlEmbedSection({ content }) {
  return (
    <div style={{ padding: '24px', background: '#fffbeb', border: '1px dashed #fbbf24' }}>
      <div style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Code size={14} color="#92400e" /> Custom HTML Block
      </div>
      <div dangerouslySetInnerHTML={{ __html: content.html || '<p style="color:#64748b">Your custom HTML will appear here.</p>' }} />
    </div>
  );
}

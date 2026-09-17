import React, { useState } from 'react';
import EditableText from '../EditableText';
import LucideIcon from '../../common/LucideIcon';

export default function BlogSection({ content, siteSettings, onUpdate }) {
  const fontH = siteSettings?.font_heading || 'Outfit';
  const primary = siteSettings?.brand_colors?.primary || '#6366f1';
  
  // Active article index when viewing a dedicated article page in builder
  const [activeArticleIndex, setActiveArticleIndex] = useState(null);

  const posts = content.posts || [
    {
      title: 'How to Build & Scale Your Online Business',
      excerpt: 'Discover proven strategies, modern design tips, and effective marketing workflows to grow your brand.',
      full_text: `Building a successful online business requires a strong value proposition, consistent user experience, and modern web presence.\n\nIn this comprehensive guide, we explore step-by-step methodologies to optimize your conversion rates, streamline customer communication via WhatsApp, and deliver premium digital experiences.\n\nKey Takeaways:\n1. Focus on mobile-first responsive aesthetics.\n2. Enable instant WhatsApp ordering & automated customer inquiry forms.\n3. Keep your branding consistent across all digital touchpoints.`,
      date: 'Jan 15, 2024',
      author: 'Team Admin',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800'
    },
    {
      title: 'Top 10 Trends in Modern Web Design',
      excerpt: 'Stay ahead of the curve with glassmorphism, responsive typography, micro-interactions, and dark mode dynamics.',
      full_text: `Modern web design has evolved beyond static pages. Today, users expect instant feedback, smooth transitions, dark mode support, and seamless mobile responsiveness.\n\nLearn how to incorporate micro-animations and harmonious color palettes to elevate your site aesthetics and keep visitors engaged.`,
      date: 'Feb 10, 2024',
      author: 'Design Lead',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800'
    }
  ];

  const updatePost = (index, field, value) => {
    const updated = posts.map((post, i) => i === index ? { ...post, [field]: value } : post);
    onUpdate?.({ posts: updated });
  };

  const addPost = () => {
    const newPost = {
      title: 'New Article Title',
      excerpt: 'Brief summary of your new blog article...',
      full_text: 'Write your full detailed blog article content here. You can add paragraphs, lists, and guides.',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      author: 'Author Name',
      image: ''
    };
    const newIndex = posts.length;
    onUpdate?.({ posts: [...posts, newPost] });
    setActiveArticleIndex(newIndex);
  };

  const deletePost = (index, e) => {
    e.stopPropagation();
    const updated = posts.filter((_, i) => i !== index);
    onUpdate?.({ posts: updated });
    if (activeArticleIndex === index) setActiveArticleIndex(null);
  };

  const activePost = activeArticleIndex !== null ? posts[activeArticleIndex] : null;

  // ── DEDICATED ARTICLE PAGE VIEW ──────────────────────────────────────────────
  if (activePost !== null && activeArticleIndex !== null) {
    return (
      <div style={{ background: '#ffffff', minHeight: '100vh', padding: '40px 24px' }}>
        {/* Navigation Bar Back to Blog List */}
        <div style={{ maxWidth: 800, margin: '0 auto 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
          <button
            onClick={() => setActiveArticleIndex(null)}
            style={{
              padding: '8px 18px', background: '#f1f5f9', border: '1px solid #cbd5e1',
              borderRadius: 8, color: '#1e293b', fontWeight: 700, cursor: 'pointer',
              fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 8
            }}
          >
            <LucideIcon name="ArrowLeft" size={16} /> ← Back to All Articles
          </button>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
            Dedicated Article Page (Page #{activeArticleIndex + 1})
          </span>
        </div>

        {/* Article Page Content Container */}
        <article style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Article Header Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, fontSize: '0.85rem', color: '#64748b' }}>
            <EditableText
              tag="span"
              value={activePost.date || 'Jan 2024'}
              onSave={(v) => updatePost(activeArticleIndex, 'date', v)}
              style={{ fontWeight: 600, color: primary }}
            />
            <span>•</span>
            <EditableText
              tag="span"
              value={activePost.author || 'Admin'}
              onSave={(v) => updatePost(activeArticleIndex, 'author', v)}
              style={{ fontWeight: 500 }}
            />
          </div>

          {/* Article Title */}
          <EditableText
            tag="h1"
            value={activePost.title || 'Article Title'}
            onSave={(v) => updatePost(activeArticleIndex, 'title', v)}
            style={{ fontFamily: `'${fontH}', sans-serif`, fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 24px', lineHeight: 1.25 }}
          />

          {/* Featured Cover Image */}
          {activePost.image && (
            <div style={{ width: '100%', maxHeight: 420, overflow: 'hidden', borderRadius: 16, marginBottom: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
              <img src={activePost.image} alt={activePost.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {/* Article Lead Summary / Excerpt */}
          <div style={{ background: '#f8fafc', borderLeft: `4px solid ${primary}`, padding: '16px 20px', borderRadius: '0 12px 12px 0', marginBottom: 32 }}>
            <EditableText
              tag="p"
              value={activePost.excerpt || 'Short introduction...'}
              onSave={(v) => updatePost(activeArticleIndex, 'excerpt', v)}
              style={{ fontSize: '1.1rem', color: '#334155', lineHeight: 1.7, margin: 0, fontWeight: 500 }}
            />
          </div>

          {/* Dedicated Full Article Body Text */}
          <div style={{ marginBottom: 48 }}>
            <EditableText
              tag="div"
              value={activePost.full_text || activePost.excerpt}
              onSave={(v) => updatePost(activeArticleIndex, 'full_text', v)}
              style={{ fontSize: '1.1rem', color: '#1e293b', lineHeight: 1.85, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}
            />
          </div>

          {/* Article Footer & Return Link */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => setActiveArticleIndex(null)}
              style={{
                padding: '10px 24px', background: primary, color: '#ffffff',
                border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer',
                fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 8
              }}
            >
              ← Return to Blog List
            </button>

            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Article URL: article-{activeArticleIndex + 1}.html
            </span>
          </div>
        </article>
      </div>
    );
  }

  // ── BLOG GRID VIEW ─────────────────────────────────────────────────────────
  return (
    <section style={{ padding: '80px 24px', background: '#f8fafc', position: 'relative' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <EditableText
            tag="h2"
            value={content.heading || 'Latest News & Articles'}
            onSave={(v) => onUpdate?.({ heading: v })}
            style={{ fontFamily: `'${fontH}', sans-serif`, fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', margin: '0 0 12px' }}
          />
          <EditableText
            tag="p"
            value={content.subheading || 'Insights, guides, and news from our team.'}
            onSave={(v) => onUpdate?.({ subheading: v })}
            style={{ color: '#64748b', fontSize: '1.05rem' }}
          />
        </div>

        {/* Blog Posts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {posts.map((post, i) => (
            <div
              key={i}
              onClick={() => setActiveArticleIndex(i)}
              style={{
                background: 'white', borderRadius: 16, overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0',
                display: 'flex', flexDirection: 'column', cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)'; }}
            >
              {/* Delete button on hover */}
              <button
                onClick={(e) => deletePost(i, e)}
                style={{
                  position: 'absolute', top: 12, right: 12, zIndex: 5,
                  background: 'rgba(239, 68, 68, 0.9)', border: 'none', borderRadius: '50%',
                  color: 'white', width: 26, height: 26, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer'
                }}
                title="Delete Post"
              >
                <LucideIcon name="Trash2" size={13} />
              </button>

              {/* Cover Image if available */}
              {post.image ? (
                <div style={{ width: '100%', height: 180, overflow: 'hidden', background: '#0f172a' }}>
                  <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ width: '100%', height: 8, background: primary }} />
              )}

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.78rem', color: '#94a3b8' }}>
                  <span>{post.date || 'Jan 2024'}</span>
                  <span>{post.author || 'Admin'}</span>
                </div>
                
                <h3 style={{ fontFamily: `'${fontH}', sans-serif`, fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', margin: '0 0 10px', lineHeight: 1.4 }}>
                  {post.title}
                </h3>
                
                <p style={{ color: '#64748b', lineHeight: 1.6, margin: '0 0 20px', fontSize: '0.9rem', flex: 1 }}>
                  {post.excerpt}
                </p>

                {/* Read Article Button -> Navigates to Dedicated Article Page View */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: primary, fontWeight: 700, fontSize: '0.88rem' }}>
                  <span>Read Article</span>
                  <LucideIcon name="ArrowRight" size={14} color={primary} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Post Button */}
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <button
            onClick={addPost}
            style={{
              padding: '10px 24px', background: 'rgba(99, 102, 241, 0.08)',
              border: '1px dashed rgba(99, 102, 241, 0.4)', borderRadius: 10,
              color: primary, fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem',
              display: 'inline-flex', alignItems: 'center', gap: 8, outline: 'none'
            }}
          >
            <LucideIcon name="Plus" size={16} color={primary} /> Add New Blog Article
          </button>
        </div>
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import EditableText from '../EditableText';
import LucideIcon from '../../common/LucideIcon';
import { resolveAssetUrl } from '../../../api/builderApi';

export default function HeroSection({ content, styles, siteSettings, onUpdate }) {
  const colors = siteSettings?.brand_colors || {};
  const primary = colors.primary || '#6366f1';
  const secondary = colors.secondary || '#1e293b';
  const bg = content.bg_color || secondary;
  const fontH = siteSettings?.font_heading || 'Outfit';

  const slides = content.slides || [];
  const useCarousel = content.use_carousel && slides.length > 0;

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const currentSlide = useCarousel ? slides[activeSlideIndex] : null;

  // Autoplay carousel slides in editor every 3 seconds (pauses on hover)
  React.useEffect(() => {
    if (!useCarousel || isHovered || slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [useCarousel, slides.length, isHovered]);

  const updateSlide = (field, val) => {
    if (!useCarousel) {
      onUpdate?.({ [field]: val });
      return;
    }
    const updated = slides.map((s, idx) =>
      idx === activeSlideIndex ? { ...s, [field]: val } : s
    );
    onUpdate?.({ slides: updated });
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    setActiveSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setActiveSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Determine background
  let backgroundStyle = `linear-gradient(135deg, ${bg} 0%, ${bg}dd 100%)`;
  if (useCarousel && currentSlide?.image) {
    backgroundStyle = `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.65)), url(${resolveAssetUrl(currentSlide.image)}) center/cover no-repeat`;
  } else if (!useCarousel && content.image) {
    backgroundStyle = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url(${resolveAssetUrl(content.image)}) center/cover no-repeat`;
  }

  return (
    <section 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: backgroundStyle,
        color: 'white', textAlign: 'center', padding: '100px 24px',
        position: 'relative', overflow: 'hidden', transition: 'background 0.5s ease-in-out'
      }}
    >
      {/* Background patterns if no image */}
      {!(useCarousel && currentSlide?.image) && !(!useCarousel && content.image) && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.03) 0%, transparent 50%)' }} />
      )}

      <div style={{ maxWidth: 800, position: 'relative', zIndex: 2, width: '100%' }}>
        {useCarousel ? (
          <div key={activeSlideIndex}>
            <EditableText
              tag="h1"
              value={currentSlide?.heading || 'Welcome to Our Website'}
              onSave={(v) => updateSlide('heading', v)}
              style={{
                fontFamily: `'${fontH}', sans-serif`,
                fontSize: 'clamp(2.25rem, 5.5vw, 3.8rem)', fontWeight: 900, margin: '0 0 20px',
                lineHeight: 1.1, textShadow: '0 2px 20px rgba(0,0,0,0.4)',
              }}
            />
            <EditableText
              tag="p"
              value={currentSlide?.subheading || 'We provide excellent services tailored to your needs.'}
              onSave={(v) => updateSlide('subheading', v)}
              style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.85)', marginBottom: 36, lineHeight: 1.6, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
            />
            {currentSlide?.cta_text && (
              <a href={currentSlide.cta_link || '#contact'} style={{
                display: 'inline-block', background: primary, color: 'white',
                padding: '14px 38px', borderRadius: 12, fontWeight: 700, fontSize: '1rem',
                textDecoration: 'none', boxShadow: `0 8px 24px ${primary}55`, transition: 'transform .15s',
              }}>
                <EditableText
                  tag="span"
                  value={currentSlide.cta_text}
                  onSave={(v) => updateSlide('cta_text', v)}
                  style={{ color: 'white' }}
                />
              </a>
            )}
          </div>
        ) : (
          <div>
            <EditableText
              tag="h1"
              value={content.heading || 'Welcome to Our Website'}
              onSave={(v) => updateSlide('heading', v)}
              style={{
                fontFamily: `'${fontH}', sans-serif`,
                fontSize: 'clamp(2.25rem, 5.5vw, 3.8rem)', fontWeight: 900, margin: '0 0 20px',
                lineHeight: 1.1, textShadow: '0 2px 20px rgba(0,0,0,0.4)',
              }}
            />
            <EditableText
              tag="p"
              value={content.subheading || 'We provide excellent services tailored to your needs.'}
              onSave={(v) => updateSlide('subheading', v)}
              style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.85)', marginBottom: 36, lineHeight: 1.6, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
            />
            <a href={content.cta_link || '#contact'} style={{
              display: 'inline-block', background: primary, color: 'white',
              padding: '14px 38px', borderRadius: 12, fontWeight: 700, fontSize: '1rem',
              textDecoration: 'none', boxShadow: `0 8px 24px ${primary}55`, transition: 'transform .15s',
            }}>
              <EditableText
                tag="span"
                value={content.cta_text || 'Get Started'}
                onSave={(v) => updateSlide('cta_text', v)}
                style={{ color: 'white' }}
              />
            </a>
          </div>
        )}
      </div>

      {/* Carousel Controls */}
      {useCarousel && (
        <>
          <button onClick={prevSlide} style={arrowStyle} className="carousel-control-btn prev" title="Previous Slide">
            <LucideIcon name="ChevronLeft" size={24} />
          </button>
          <button onClick={nextSlide} style={{ ...arrowStyle, right: 24, left: 'auto' }} className="carousel-control-btn next" title="Next Slide">
            <LucideIcon name="ChevronRight" size={24} />
          </button>
          <div style={{
            position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 10, zIndex: 10
          }}>
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setActiveSlideIndex(idx); }}
                style={{
                  width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: activeSlideIndex === idx ? primary : 'rgba(255,255,255,0.4)',
                  transform: activeSlideIndex === idx ? 'scale(1.2)' : 'none',
                  transition: 'all 0.2s'
                }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

const arrowStyle = {
  position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 24,
  background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none',
  width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', zIndex: 10,
  display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center',
  transition: 'all 0.2s', backdropFilter: 'blur(4px)', outline: 'none'
};

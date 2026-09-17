import React from 'react';

// Generic section renderer — reads section.type and renders the right component
// Adding a new section type = adding one case here + one component file
import HeroSection from './sections/HeroSection';
import AboutSection from './sections/AboutSection';
import ServicesSection from './sections/ServicesSection';
import GallerySection from './sections/GallerySection';
import TestimonialsSection from './sections/TestimonialsSection';
import PricingSection from './sections/PricingSection';
import TeamSection from './sections/TeamSection';
import FaqSection from './sections/FaqSection';
import ContactFormSection from './sections/ContactFormSection';
import BlogSection from './sections/BlogSection';
import HtmlEmbedSection from './sections/HtmlEmbedSection';
import CustomBlockSection from './sections/CustomBlockSection';

const SECTION_MAP = {
  hero: HeroSection,
  about: AboutSection,
  services: ServicesSection,
  gallery: GallerySection,
  testimonials: TestimonialsSection,
  pricing: PricingSection,
  team: TeamSection,
  faq: FaqSection,
  contact_form: ContactFormSection,
  blog: BlogSection,
  html_embed: HtmlEmbedSection,
  custom_block: CustomBlockSection,
};

export const SECTION_TYPES = Object.keys(SECTION_MAP);

export const SECTION_LABELS = {
  hero: { icon: 'LayoutTemplate', label: 'Hero Banner' },
  about: { icon: 'BookOpen', label: 'About Us' },
  services: { icon: 'Briefcase', label: 'Services / Products' },
  gallery: { icon: 'Image', label: 'Photo Gallery' },
  testimonials: { icon: 'MessageSquare', label: 'Testimonials' },
  pricing: { icon: 'Tag', label: 'Pricing Table' },
  team: { icon: 'Users', label: 'Team Members' },
  faq: { icon: 'HelpCircle', label: 'FAQ Accordion' },
  contact_form: { icon: 'Mail', label: 'Contact Form' },
  blog: { icon: 'FileText', label: 'Blog / News' },
  html_embed: { icon: 'Code', label: 'Custom HTML' },
  custom_block: { icon: 'Sliders', label: 'Custom / Help Page Section' },
};

export default function SectionRenderer({ section, siteSettings, isSelected, onSelect, onUpdate }) {
  const Component = SECTION_MAP[section.type];
  if (!Component) {
    return (
      <div style={{ padding: '24px', background: '#fff3cd', borderRadius: 8, margin: 8, color: '#856404' }}>
        Unknown section type: <strong>{section.type}</strong>
      </div>
    );
  }

  if (!section.visible) return null;

  const sectionId = section.content?.custom_anchor || (section.type === 'contact_form' ? 'contact' : section.type);

  return (
    <div
      id={sectionId}
      data-section-type={section.type}
      data-section-id={section.id}
      {...(section.type === 'services' ? { 'data-synonym': 'products' } : {})}
      onClick={() => onSelect?.(section)}
      style={{ position: 'relative', outline: isSelected ? '2px solid #6366f1' : 'none', outlineOffset: '-2px', cursor: 'pointer' }}
    >
      <Component
        content={section.content || {}}
        styles={section.styles || {}}
        siteSettings={siteSettings}
        onUpdate={onUpdate}
      />
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { templatesApi, sitesApi } from '../api/builderApi';
import { useAuth } from '../context/AuthContext';
import LucideIcon from '../components/common/LucideIcon';

const SECTOR_ICONS = {
  construction: 'HardHat', medical: 'Activity', salon: 'Sparkles', hardware: 'Wrench',
  ecommerce: 'ShoppingBag', restaurant: 'Utensils', real_estate: 'Home', education: 'GraduationCap',
  fitness: 'Dumbbell', legal_services: 'Scale', agriculture: 'Sprout', hotel: 'Bed', clinic: 'Activity',
};

const SECTOR_STYLES = {
  construction:   { color: '#ea580c', grad: 'linear-gradient(135deg,#431407,#7c2d12)', light: '#fed7aa' },
  medical:        { color: '#0d9488', grad: 'linear-gradient(135deg,#042f2e,#0f766e)', light: '#99f6e4' },
  salon:          { color: '#db2777', grad: 'linear-gradient(135deg,#4a0020,#9d174d)', light: '#fbcfe8' },
  ecommerce:      { color: '#7c3aed', grad: 'linear-gradient(135deg,#2e1065,#5b21b6)', light: '#ddd6fe' },
  restaurant:     { color: '#dc2626', grad: 'linear-gradient(135deg,#450a0a,#991b1b)', light: '#fecaca' },
  real_estate:    { color: '#1d4ed8', grad: 'linear-gradient(135deg,#172554,#1e40af)', light: '#bfdbfe' },
  education:      { color: '#4338ca', grad: 'linear-gradient(135deg,#1e1b4b,#3730a3)', light: '#c7d2fe' },
  fitness:        { color: '#16a34a', grad: 'linear-gradient(135deg,#052e16,#166534)', light: '#bbf7d0' },
  hardware:       { color: '#ca8a04', grad: 'linear-gradient(135deg,#1a1200,#854d0e)', light: '#fde68a' },
  legal_services: { color: '#78350f', grad: 'linear-gradient(135deg,#1c0a00,#92400e)', light: '#fde68a' },
  agriculture:    { color: '#15803d', grad: 'linear-gradient(135deg,#052e16,#14532d)', light: '#bbf7d0' },
  hotel:          { color: '#0369a1', grad: 'linear-gradient(135deg,#082f49,#0c4a6e)', light: '#bae6fd' },
  clinic:         { color: '#0891b2', grad: 'linear-gradient(135deg,#042f2e,#155e75)', light: '#a5f3fc' },
};

// 6 totally different templates per industry - each with unique colors, layout, personality
const INDUSTRY_TEMPLATES = {
  medical: [
    { id: 'modern', label: 'ClearCare', tag: 'Clean & Trustworthy', palette: ['#0d9488','#e0f2fe','#14b8a6'], font: 'Inter',
      preview: { bg: 'linear-gradient(135deg,#e0f2fe 0%,#f0fdfa 100%)', header: '#0d9488', accent: '#14b8a6', layout: 'split', hero: 'light', desc: 'Bright teal on white, two-column hero with doctor photo' } },
    { id: 'bold', label: 'PulsePro', tag: 'Bold & High-Contrast', palette: ['#0284c7','#0f172a','#38bdf8'], font: 'Outfit',
      preview: { bg: 'linear-gradient(135deg,#0f172a 0%,#0c4a6e 100%)', header: '#0284c7', accent: '#38bdf8', layout: 'centered', hero: 'dark', desc: 'Dark navy with cyan, full-width banner, high impact' } },
    { id: 'classic', label: 'MediTrust', tag: 'Classic & Professional', palette: ['#166534','#f0fdf4','#4ade80'], font: 'Merriweather',
      preview: { bg: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)', header: '#15803d', accent: '#22c55e', layout: 'sidebar', hero: 'light', desc: 'Forest green, sidebar nav, classic serif headings' } },
    { id: 'luxury', label: 'PremierHealth', tag: 'Luxury & Premium', palette: ['#b45309','#1c1917','#fcd34d'], font: 'Playfair Display',
      preview: { bg: 'linear-gradient(135deg,#1c1917 0%,#292524 100%)', header: '#d97706', accent: '#fcd34d', layout: 'magazine', hero: 'dark', desc: 'Deep brown & gold, magazine-style, elegant serif' } },
    { id: 'minimal', label: 'CalmClinic', tag: 'Minimal & Serene', palette: ['#475569','#f8fafc','#94a3b8'], font: 'Inter',
      preview: { bg: 'linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%)', header: '#475569', accent: '#64748b', layout: 'centered', hero: 'light', desc: 'Pure white, slate gray, generous whitespace' } },
    { id: 'vibrant', label: 'VitaClinic', tag: 'Vibrant & Energetic', palette: ['#7c3aed','#1e1b4b','#a78bfa'], font: 'Outfit',
      preview: { bg: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)', header: '#7c3aed', accent: '#a78bfa', layout: 'grid', hero: 'dark', desc: 'Purple gradients, card grid layout, bold & modern' } },
  ],
  restaurant: [
    { id: 'modern', label: 'FreshTable', tag: 'Modern & Airy', palette: ['#ea580c','#fff7ed','#fdba74'], font: 'Inter',
      preview: { bg: 'linear-gradient(135deg,#fff7ed 0%,#ffedd5 100%)', header: '#ea580c', accent: '#fb923c', layout: 'split', hero: 'light', desc: 'Warm orange on white, food photography focus' } },
    { id: 'bold', label: 'FireGrill', tag: 'Bold & Dramatic', palette: ['#dc2626','#1a0000','#fca5a5'], font: 'Outfit',
      preview: { bg: 'linear-gradient(135deg,#1a0000 0%,#450a0a 100%)', header: '#dc2626', accent: '#ef4444', layout: 'fullscreen', hero: 'dark', desc: 'Deep red & black, full-screen hero, fiery atmosphere' } },
    { id: 'classic', label: 'BistroCharm', tag: 'Classic European', palette: ['#92400e','#fefce8','#f59e0b'], font: 'Playfair Display',
      preview: { bg: 'linear-gradient(135deg,#fefce8 0%,#fef9c3 100%)', header: '#92400e', accent: '#b45309', layout: 'magazine', hero: 'light', desc: 'Cream & amber, serif typography, old-world bistro' } },
    { id: 'luxury', label: 'GoldPlate', tag: 'Fine Dining Luxury', palette: ['#b45309','#0c0a09','#fcd34d'], font: 'Cormorant Garamond',
      preview: { bg: 'linear-gradient(135deg,#0c0a09 0%,#1c1917 100%)', header: '#ca8a04', accent: '#fcd34d', layout: 'centered', hero: 'dark', desc: 'Black & gold, minimalist luxury, fine dining vibes' } },
    { id: 'minimal', label: 'PureFlavour', tag: 'Clean Minimal', palette: ['#059669','#f0fdf4','#6ee7b7'], font: 'DM Sans',
      preview: { bg: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)', header: '#059669', accent: '#10b981', layout: 'sidebar', hero: 'light', desc: 'Crisp white & mint green, health-food aesthetic' } },
    { id: 'vibrant', label: 'SpiceFusion', tag: 'Colorful & Festive', palette: ['#d946ef','#1e1b4b','#f472b6'], font: 'Poppins',
      preview: { bg: 'linear-gradient(135deg,#4a1942 0%,#1e1b4b 100%)', header: '#d946ef', accent: '#e879f9', layout: 'grid', hero: 'dark', desc: 'Purple & magenta, fusion cuisine, lively & festive' } },
  ],
  construction: [
    { id: 'modern', label: 'BuildPro', tag: 'Modern Industrial', palette: ['#ea580c','#111827','#fdba74'], font: 'Outfit',
      preview: { bg: 'linear-gradient(135deg,#111827 0%,#1f2937 100%)', header: '#ea580c', accent: '#fb923c', layout: 'fullscreen', hero: 'dark', desc: 'Dark steel with orange, industrial bold look' } },
    { id: 'bold', label: 'SteelForce', tag: 'Bold & Strong', palette: ['#eab308','#0f172a','#fde047'], font: 'Barlow Condensed',
      preview: { bg: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)', header: '#eab308', accent: '#facc15', layout: 'magazine', hero: 'dark', desc: 'Black & safety yellow, construction industry icon' } },
    { id: 'classic', label: 'TrustBuild', tag: 'Classic & Reliable', palette: ['#2563eb','#eff6ff','#60a5fa'], font: 'Inter',
      preview: { bg: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)', header: '#1d4ed8', accent: '#2563eb', layout: 'split', hero: 'light', desc: 'Professional navy blue, corporate contractor style' } },
    { id: 'luxury', label: 'EliteConstruct', tag: 'Luxury Contractor', palette: ['#b45309','#1c1917','#fcd34d'], font: 'Playfair Display',
      preview: { bg: 'linear-gradient(135deg,#1c1917 0%,#292524 100%)', header: '#d97706', accent: '#fbbf24', layout: 'centered', hero: 'dark', desc: 'Dark brown & gold, premium high-end contractors' } },
    { id: 'minimal', label: 'ClearBuild', tag: 'Clean & Minimal', palette: ['#4b5563','#f9fafb','#9ca3af'], font: 'Inter',
      preview: { bg: 'linear-gradient(135deg,#f9fafb 0%,#f3f4f6 100%)', header: '#374151', accent: '#6b7280', layout: 'sidebar', hero: 'light', desc: 'Clean white & gray, portfolio-style minimal layout' } },
    { id: 'vibrant', label: 'UrbanCraft', tag: 'Urban & Creative', palette: ['#7c3aed','#1e1b4b','#a78bfa'], font: 'Space Grotesk',
      preview: { bg: 'linear-gradient(135deg,#1e1b4b 0%,#3730a3 100%)', header: '#7c3aed', accent: '#818cf8', layout: 'grid', hero: 'dark', desc: 'Bold violet, urban architecture, creative contractors' } },
  ],
  ecommerce: [
    { id: 'modern', label: 'ShopWave', tag: 'Modern Storefront', palette: ['#7c3aed','#faf5ff','#a78bfa'], font: 'Inter',
      preview: { bg: 'linear-gradient(135deg,#faf5ff 0%,#ede9fe 100%)', header: '#7c3aed', accent: '#8b5cf6', layout: 'grid', hero: 'light', desc: 'Purple & white, product grid, e-commerce classic' } },
    { id: 'bold', label: 'HypeStore', tag: 'Bold Streetwear', palette: ['#000','#ef4444','#fff'], font: 'Space Grotesk',
      preview: { bg: 'linear-gradient(135deg,#000 0%,#111 100%)', header: '#ef4444', accent: '#f87171', layout: 'fullscreen', hero: 'dark', desc: 'Black & red, streetwear culture, high-impact design' } },
    { id: 'classic', label: 'BoutiqueCart', tag: 'Classic Boutique', palette: ['#be185d','#fff0f6','#f9a8d4'], font: 'Playfair Display',
      preview: { bg: 'linear-gradient(135deg,#fff0f6 0%,#fce7f3 100%)', header: '#be185d', accent: '#ec4899', layout: 'magazine', hero: 'light', desc: 'Pink & rose gold, fashion boutique, serif elegance' } },
    { id: 'luxury', label: 'LuxMart', tag: 'Premium Luxury', palette: ['#a16207','#0c0a09','#fbbf24'], font: 'Cormorant Garamond',
      preview: { bg: 'linear-gradient(135deg,#0c0a09 0%,#1c1917 100%)', header: '#ca8a04', accent: '#fbbf24', layout: 'centered', hero: 'dark', desc: 'Black & gold, ultra-premium products, luxury feel' } },
    { id: 'minimal', label: 'PureShop', tag: 'Minimal & Clean', palette: ['#111827','#fff','#6b7280'], font: 'DM Sans',
      preview: { bg: 'linear-gradient(135deg,#fff 0%,#f9fafb 100%)', header: '#111827', accent: '#6b7280', layout: 'sidebar', hero: 'light', desc: 'Pure white, product-first, zero-distraction design' } },
    { id: 'vibrant', label: 'NeonCart', tag: 'Tech & Futuristic', palette: ['#06b6d4','#042f2e','#22d3ee'], font: 'Outfit',
      preview: { bg: 'linear-gradient(135deg,#042f2e 0%,#0f172a 100%)', header: '#06b6d4', accent: '#22d3ee', layout: 'grid', hero: 'dark', desc: 'Neon cyan on dark, tech/gadget store aesthetic' } },
  ],
  fitness: [
    { id: 'modern', label: 'FitFlow', tag: 'Modern & Fresh', palette: ['#16a34a','#f0fdf4','#4ade80'], font: 'Outfit',
      preview: { bg: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)', header: '#16a34a', accent: '#22c55e', layout: 'split', hero: 'light', desc: 'Bright green, energetic split-screen, fresh gym vibe' } },
    { id: 'bold', label: 'BeastMode', tag: 'Dark & Intense', palette: ['#dc2626','#0a0a0a','#fca5a5'], font: 'Barlow Condensed',
      preview: { bg: 'linear-gradient(135deg,#0a0a0a 0%,#1a0000 100%)', header: '#dc2626', accent: '#ef4444', layout: 'fullscreen', hero: 'dark', desc: 'Black & blood red, hardcore gym, intense atmosphere' } },
    { id: 'classic', label: 'ProAthletes', tag: 'Sports Professional', palette: ['#1d4ed8','#eff6ff','#60a5fa'], font: 'Inter',
      preview: { bg: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)', header: '#1d4ed8', accent: '#3b82f6', layout: 'magazine', hero: 'light', desc: 'Navy & white, sports club, professional athlete style' } },
    { id: 'luxury', label: 'EliteSpa', tag: 'Luxury Wellness', palette: ['#a16207','#1c1917','#fbbf24'], font: 'Playfair Display',
      preview: { bg: 'linear-gradient(135deg,#1c1917 0%,#292524 100%)', header: '#d97706', accent: '#fbbf24', layout: 'centered', hero: 'dark', desc: 'Dark gold, premium spa & wellness center feel' } },
    { id: 'minimal', label: 'ZenFit', tag: 'Yoga & Wellness', palette: ['#0891b2','#f0f9ff','#67e8f9'], font: 'DM Sans',
      preview: { bg: 'linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)', header: '#0891b2', accent: '#06b6d4', layout: 'sidebar', hero: 'light', desc: 'Sky blue, calm & minimal, perfect for yoga/meditation' } },
    { id: 'vibrant', label: 'PowerPulse', tag: 'Neon Energy', palette: ['#d946ef','#1e1b4b','#f0abfc'], font: 'Outfit',
      preview: { bg: 'linear-gradient(135deg,#0f0520 0%,#1e1b4b 100%)', header: '#a855f7', accent: '#d946ef', layout: 'grid', hero: 'dark', desc: 'Purple neon, electric energy, modern CrossFit aesthetic' } },
  ],
  real_estate: [
    { id: 'modern', label: 'HomeFinder', tag: 'Clean Property Portal', palette: ['#1d4ed8','#eff6ff','#93c5fd'], font: 'Inter',
      preview: { bg: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)', header: '#1d4ed8', accent: '#3b82f6', layout: 'grid', hero: 'light', desc: 'Blue & white, property card grid, portal style' } },
    { id: 'bold', label: 'MetroRealty', tag: 'Urban & Bold', palette: ['#111827','#f59e0b','#1f2937'], font: 'Space Grotesk',
      preview: { bg: 'linear-gradient(135deg,#111827 0%,#1f2937 100%)', header: '#f59e0b', accent: '#fbbf24', layout: 'magazine', hero: 'dark', desc: 'Charcoal & amber, bold urban property agency' } },
    { id: 'classic', label: 'TrustEstate', tag: 'Traditional Agency', palette: ['#7c3aed','#faf5ff','#a78bfa'], font: 'Merriweather',
      preview: { bg: 'linear-gradient(135deg,#faf5ff 0%,#ede9fe 100%)', header: '#6d28d9', accent: '#7c3aed', layout: 'split', hero: 'light', desc: 'Purple & cream, traditional serif, trusted agency look' } },
    { id: 'luxury', label: 'PlatinumProp', tag: 'Ultra Luxury', palette: ['#a16207','#0a0800','#fbbf24'], font: 'Cormorant Garamond',
      preview: { bg: 'linear-gradient(135deg,#0a0800 0%,#1c1505 100%)', header: '#ca8a04', accent: '#fbbf24', layout: 'centered', hero: 'dark', desc: 'Black & gold, ultra-premium luxury real estate' } },
    { id: 'minimal', label: 'CleanListings', tag: 'Minimal & Modern', palette: ['#059669','#f0fdf4','#34d399'], font: 'DM Sans',
      preview: { bg: 'linear-gradient(135deg,#fff 0%,#f9fafb 100%)', header: '#059669', accent: '#10b981', layout: 'sidebar', hero: 'light', desc: 'White & mint, distraction-free listing browsing' } },
    { id: 'vibrant', label: 'UrbanNest', tag: 'Colorful & Lively', palette: ['#0891b2','#042f2e','#22d3ee'], font: 'Outfit',
      preview: { bg: 'linear-gradient(135deg,#042f2e 0%,#0f172a 100%)', header: '#0891b2', accent: '#06b6d4', layout: 'fullscreen', hero: 'dark', desc: 'Teal & dark navy, contemporary urban living vibe' } },
  ],
  education: [
    { id: 'modern', label: 'LearnHub', tag: 'Modern eLearning', palette: ['#4338ca','#eef2ff','#a5b4fc'], font: 'Inter',
      preview: { bg: 'linear-gradient(135deg,#eef2ff 0%,#e0e7ff 100%)', header: '#4338ca', accent: '#6366f1', layout: 'grid', hero: 'light', desc: 'Indigo, course card grid, modern online academy' } },
    { id: 'bold', label: 'SmartAcademy', tag: 'Bold & Impactful', palette: ['#dc2626','#0f172a','#fca5a5'], font: 'Outfit',
      preview: { bg: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)', header: '#dc2626', accent: '#ef4444', layout: 'fullscreen', hero: 'dark', desc: 'Dark with red, strong call-to-action, bootcamp style' } },
    { id: 'classic', label: 'ScholarHall', tag: 'Traditional Academic', palette: ['#7c2d12','#fffbeb','#fcd34d'], font: 'Merriweather',
      preview: { bg: 'linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%)', header: '#92400e', accent: '#b45309', layout: 'magazine', hero: 'light', desc: 'Maroon & cream, traditional university, serif fonts' } },
    { id: 'luxury', label: 'EliteSchool', tag: 'Premium Institution', palette: ['#0c4a6e','#082f49','#38bdf8'], font: 'Playfair Display',
      preview: { bg: 'linear-gradient(135deg,#082f49 0%,#0c4a6e 100%)', header: '#0369a1', accent: '#38bdf8', layout: 'centered', hero: 'dark', desc: 'Deep ocean blue, prestigious institution feel' } },
    { id: 'minimal', label: 'KidsLearn', tag: 'Fun & Playful', palette: ['#d946ef','#fdf4ff','#f0abfc'], font: 'Nunito',
      preview: { bg: 'linear-gradient(135deg,#fdf4ff 0%,#fae8ff 100%)', header: '#a21caf', accent: '#d946ef', layout: 'sidebar', hero: 'light', desc: 'Purple & pink, cheerful & fun, kids learning center' } },
    { id: 'vibrant', label: 'TechBootcamp', tag: 'Tech & Coding', palette: ['#059669','#022c22','#34d399'], font: 'Space Grotesk',
      preview: { bg: 'linear-gradient(135deg,#020d09 0%,#052e16 100%)', header: '#059669', accent: '#10b981', layout: 'split', hero: 'dark', desc: 'Terminal green on black, coding bootcamp / tech school' } },
  ],
  salon: [
    { id: 'modern', label: 'GlamStudio', tag: 'Modern & Chic', palette: ['#ec4899','#fff0f6','#f9a8d4'], font: 'Outfit',
      preview: { bg: 'linear-gradient(135deg,#fff0f6 0%,#fce7f3 100%)', header: '#db2777', accent: '#ec4899', layout: 'split', hero: 'light', desc: 'Hot pink & white, trendy salon, Insta-worthy aesthetic' } },
    { id: 'bold', label: 'EdgeSalon', tag: 'Bold & Edgy', palette: ['#dc2626','#0f172a','#fca5a5'], font: 'Space Grotesk',
      preview: { bg: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)', header: '#dc2626', accent: '#ef4444', layout: 'fullscreen', hero: 'dark', desc: 'Black & red, edgy salon, bold statement design' } },
    { id: 'classic', label: 'ClassicBeauty', tag: 'Elegant & Classic', palette: ['#92400e','#fef9ee','#fbbf24'], font: 'Cormorant Garamond',
      preview: { bg: 'linear-gradient(135deg,#fef9ee 0%,#fef3c7 100%)', header: '#92400e', accent: '#b45309', layout: 'magazine', hero: 'light', desc: 'Cream & gold, classic beauty parlor, serif elegance' } },
    { id: 'luxury', label: 'BlackRose', tag: 'Dark Luxury Spa', palette: ['#be185d','#0a0008','#f9a8d4'], font: 'Playfair Display',
      preview: { bg: 'linear-gradient(135deg,#0a0008 0%,#1a0016 100%)', header: '#be185d', accent: '#ec4899', layout: 'centered', hero: 'dark', desc: 'Black & rose pink, mysterious luxury day spa' } },
    { id: 'minimal', label: 'PureGlow', tag: 'Minimalist & Serene', palette: ['#0d9488','#f0fdfa','#5eead4'], font: 'DM Sans',
      preview: { bg: 'linear-gradient(135deg,#f0fdfa 0%,#ccfbf1 100%)', header: '#0d9488', accent: '#14b8a6', layout: 'sidebar', hero: 'light', desc: 'Teal & white, organic beauty, calm spa aesthetic' } },
    { id: 'vibrant', label: 'NeonGlam', tag: 'Trendy & Vibrant', palette: ['#d946ef','#1e1b4b','#f0abfc'], font: 'Poppins',
      preview: { bg: 'linear-gradient(135deg,#2e0050 0%,#1e1b4b 100%)', header: '#d946ef', accent: '#e879f9', layout: 'grid', hero: 'dark', desc: 'Neon purple & fuchsia, vibrant youth salon trend' } },
  ],
  legal_services: [
    { id: 'modern', label: 'LexModern', tag: 'Modern Law Firm', palette: ['#1d4ed8','#eff6ff','#93c5fd'], font: 'Inter',
      preview: { bg: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)', header: '#1d4ed8', accent: '#3b82f6', layout: 'split', hero: 'light', desc: 'Clean blue, modern corporate law firm, trustworthy' } },
    { id: 'bold', label: 'IronLaw', tag: 'Strong & Authoritative', palette: ['#111827','#6b7280','#030712'], font: 'Barlow Condensed',
      preview: { bg: 'linear-gradient(135deg,#030712 0%,#111827 100%)', header: '#4b5563', accent: '#9ca3af', layout: 'fullscreen', hero: 'dark', desc: 'Near-black with steel, powerful & intimidating' } },
    { id: 'classic', label: 'LegacyFirm', tag: 'Traditional & Prestigious', palette: ['#92400e','#fef9ee','#fbbf24'], font: 'Playfair Display',
      preview: { bg: 'linear-gradient(135deg,#fef9ee 0%,#fef3c7 100%)', header: '#78350f', accent: '#b45309', layout: 'magazine', hero: 'light', desc: 'Deep brown & gold, established law firm, prestige' } },
    { id: 'luxury', label: 'PlatinumLex', tag: 'Elite Law Chambers', palette: ['#a16207','#0a0800','#fbbf24'], font: 'Cormorant Garamond',
      preview: { bg: 'linear-gradient(135deg,#0a0800 0%,#1c1505 100%)', header: '#ca8a04', accent: '#fbbf24', layout: 'centered', hero: 'dark', desc: 'Black & gold, ultra-elite chambers, luxury legal brand' } },
    { id: 'minimal', label: 'ClearLegal', tag: 'Accessible & Friendly', palette: ['#059669','#f0fdf4','#34d399'], font: 'DM Sans',
      preview: { bg: 'linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%)', header: '#059669', accent: '#10b981', layout: 'sidebar', hero: 'light', desc: 'Clean white & green, approachable community legal' } },
    { id: 'vibrant', label: 'JusticeHub', tag: 'Progressive & Bold', palette: ['#7c3aed','#1e1b4b','#a78bfa'], font: 'Space Grotesk',
      preview: { bg: 'linear-gradient(135deg,#1e1b4b 0%,#2e1065 100%)', header: '#7c3aed', accent: '#8b5cf6', layout: 'grid', hero: 'dark', desc: 'Purple & indigo, progressive legal aid, modern justice' } },
  ],
  agriculture: [
    { id: 'modern', label: 'GreenHarvest', tag: 'Modern Organic', palette: ['#15803d','#f0fdf4','#4ade80'], font: 'Inter',
      preview: { bg: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)', header: '#15803d', accent: '#22c55e', layout: 'split', hero: 'light', desc: 'Bright green & white, organic farm, fresh & clean' } },
    { id: 'bold', label: 'AgriForce', tag: 'Industrial & Strong', palette: ['#eab308','#1a1400','#fde047'], font: 'Barlow Condensed',
      preview: { bg: 'linear-gradient(135deg,#1a1400 0%,#1c1005 100%)', header: '#eab308', accent: '#facc15', layout: 'magazine', hero: 'dark', desc: 'Earthy yellow on black, industrial farm machinery' } },
    { id: 'classic', label: 'FarmTradition', tag: 'Heritage & Natural', palette: ['#92400e','#fef9ee','#d97706'], font: 'Merriweather',
      preview: { bg: 'linear-gradient(135deg,#fef9ee 0%,#fef3c7 100%)', header: '#78350f', accent: '#b45309', layout: 'sidebar', hero: 'light', desc: 'Warm brown & amber, heritage farm, old-world charm' } },
    { id: 'luxury', label: 'OrganicGold', tag: 'Premium Organic', palette: ['#166534','#052e16','#4ade80'], font: 'Playfair Display',
      preview: { bg: 'linear-gradient(135deg,#052e16 0%,#14532d 100%)', header: '#16a34a', accent: '#4ade80', layout: 'centered', hero: 'dark', desc: 'Deep forest green, premium organic produce brand' } },
    { id: 'minimal', label: 'PureFarm', tag: 'Minimal & Fresh', palette: ['#0891b2','#f0f9ff','#67e8f9'], font: 'DM Sans',
      preview: { bg: 'linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)', header: '#0891b2', accent: '#0ea5e9', layout: 'grid', hero: 'light', desc: 'Sky blue & white, modern agri-tech, clean minimal' } },
    { id: 'vibrant', label: 'HarvestFest', tag: 'Colorful & Festive', palette: ['#ea580c','#431407','#fbbf24'], font: 'Poppins',
      preview: { bg: 'linear-gradient(135deg,#431407 0%,#7c2d12 100%)', header: '#ea580c', accent: '#fb923c', layout: 'fullscreen', hero: 'dark', desc: 'Harvest orange & rust red, festive farmers market' } },
  ],
  hotel: [
    { id: 'modern', label: 'StayModern', tag: 'Contemporary Hotel', palette: ['#0369a1','#f0f9ff','#38bdf8'], font: 'Inter',
      preview: { bg: 'linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)', header: '#0369a1', accent: '#0284c7', layout: 'split', hero: 'light', desc: 'Ocean blue, modern boutique hotel, airy and fresh' } },
    { id: 'bold', label: 'UrbanLodge', tag: 'Bold Urban Hotel', palette: ['#111827','#f59e0b','#030712'], font: 'Space Grotesk',
      preview: { bg: 'linear-gradient(135deg,#030712 0%,#111827 100%)', header: '#f59e0b', accent: '#fbbf24', layout: 'fullscreen', hero: 'dark', desc: 'Near-black & amber, bold urban city hotel brand' } },
    { id: 'classic', label: 'GrandHotel', tag: 'Classic Grand', palette: ['#7c2d12','#fef9ee','#fbbf24'], font: 'Playfair Display',
      preview: { bg: 'linear-gradient(135deg,#fef9ee 0%,#fef3c7 100%)', header: '#92400e', accent: '#d97706', layout: 'magazine', hero: 'light', desc: 'Warm terracotta & gold, grand classic hotel elegance' } },
    { id: 'luxury', label: 'PalaceStay', tag: 'Ultra Luxury Resort', palette: ['#a16207','#0a0800','#fbbf24'], font: 'Cormorant Garamond',
      preview: { bg: 'linear-gradient(135deg,#0a0800 0%,#1c1505 100%)', header: '#ca8a04', accent: '#fbbf24', layout: 'centered', hero: 'dark', desc: 'Black & gold, 5-star palace resort, ultra-luxury' } },
    { id: 'minimal', label: 'ZenRetreat', tag: 'Minimal Boutique', palette: ['#0d9488','#f0fdfa','#5eead4'], font: 'DM Sans',
      preview: { bg: 'linear-gradient(135deg,#f0fdfa 0%,#ccfbf1 100%)', header: '#0d9488', accent: '#14b8a6', layout: 'sidebar', hero: 'light', desc: 'Teal & white, peaceful zen boutique, spa retreat' } },
    { id: 'vibrant', label: 'BeachVibes', tag: 'Tropical Resort', palette: ['#0891b2','#042f2e','#22d3ee'], font: 'Outfit',
      preview: { bg: 'linear-gradient(135deg,#042f2e 0%,#0c4a6e 100%)', header: '#06b6d4', accent: '#22d3ee', layout: 'grid', hero: 'dark', desc: 'Cyan & teal, tropical beach resort, paradise vibes' } },
  ],
  hardware: [
    { id: 'modern', label: 'ToolPro', tag: 'Modern Tools Store', palette: ['#dc2626','#fff5f5','#fca5a5'], font: 'Outfit',
      preview: { bg: 'linear-gradient(135deg,#fff5f5 0%,#fee2e2 100%)', header: '#dc2626', accent: '#ef4444', layout: 'grid', hero: 'light', desc: 'Bold red & white, modern hardware product catalog' } },
    { id: 'bold', label: 'IronWorks', tag: 'Industrial Bold', palette: ['#eab308','#0f0f00','#fde047'], font: 'Barlow Condensed',
      preview: { bg: 'linear-gradient(135deg,#0f0f00 0%,#1a1a00 100%)', header: '#eab308', accent: '#facc15', layout: 'magazine', hero: 'dark', desc: 'Black & industrial yellow, heavy-duty tools feel' } },
    { id: 'classic', label: 'HomeBuilder', tag: 'Classic & Trusted', palette: ['#2563eb','#eff6ff','#93c5fd'], font: 'Inter',
      preview: { bg: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)', header: '#1d4ed8', accent: '#3b82f6', layout: 'split', hero: 'light', desc: 'Classic blue, neighborhood hardware store, reliable' } },
    { id: 'luxury', label: 'CraftElite', tag: 'Premium Craftsmen', palette: ['#92400e','#1c1917','#fcd34d'], font: 'Playfair Display',
      preview: { bg: 'linear-gradient(135deg,#1c1917 0%,#292524 100%)', header: '#d97706', accent: '#fbbf24', layout: 'centered', hero: 'dark', desc: 'Dark brown & gold, premium craftsmen tools brand' } },
    { id: 'minimal', label: 'SmartTools', tag: 'Clean & Modern', palette: ['#4b5563','#f9fafb','#9ca3af'], font: 'DM Sans',
      preview: { bg: 'linear-gradient(135deg,#f9fafb 0%,#f3f4f6 100%)', header: '#374151', accent: '#6b7280', layout: 'sidebar', hero: 'light', desc: 'Clean grey & white, smart modern hardware minimal' } },
    { id: 'vibrant', label: 'NeonTech', tag: 'Tech Hardware', palette: ['#0891b2','#042f2e','#22d3ee'], font: 'Space Grotesk',
      preview: { bg: 'linear-gradient(135deg,#042f2e 0%,#0f172a 100%)', header: '#0891b2', accent: '#22d3ee', layout: 'fullscreen', hero: 'dark', desc: 'Cyan & dark teal, tech & electronics hardware store' } },
  ],
  clinic: [
    { id: 'modern', label: 'HealthFirst', tag: 'Modern Clinic', palette: ['#0d9488','#f0fdfa','#5eead4'], font: 'Inter',
      preview: { bg: 'linear-gradient(135deg,#f0fdfa 0%,#ccfbf1 100%)', header: '#0d9488', accent: '#14b8a6', layout: 'split', hero: 'light', desc: 'Teal & white, modern clinic, clean and professional' } },
    { id: 'bold', label: 'CarePlus', tag: 'Bold Medical', palette: ['#0284c7','#0f172a','#38bdf8'], font: 'Outfit',
      preview: { bg: 'linear-gradient(135deg,#0f172a 0%,#0c4a6e 100%)', header: '#0284c7', accent: '#38bdf8', layout: 'fullscreen', hero: 'dark', desc: 'Dark navy & sky blue, confident clinic bold look' } },
    { id: 'classic', label: 'FamilyCare', tag: 'Traditional Clinic', palette: ['#166534','#f0fdf4','#4ade80'], font: 'Merriweather',
      preview: { bg: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)', header: '#15803d', accent: '#22c55e', layout: 'magazine', hero: 'light', desc: 'Medical green, serif font, family doctor warm feel' } },
    { id: 'luxury', label: 'EliteClinic', tag: 'Premium Healthcare', palette: ['#b45309','#1c1917','#fcd34d'], font: 'Playfair Display',
      preview: { bg: 'linear-gradient(135deg,#1c1917 0%,#292524 100%)', header: '#d97706', accent: '#fbbf24', layout: 'centered', hero: 'dark', desc: 'Dark & gold, ultra-premium private healthcare clinic' } },
    { id: 'minimal', label: 'CalmCare', tag: 'Minimal & Serene', palette: ['#475569','#f8fafc','#94a3b8'], font: 'DM Sans',
      preview: { bg: 'linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%)', header: '#475569', accent: '#64748b', layout: 'sidebar', hero: 'light', desc: 'White & slate, minimal clinic, very calming' } },
{ id: 'vibrant', label: 'VitaHealth', tag: 'Vibrant Wellness', palette: ['#7c3aed','#1e1b4b','#a78bfa'], font: 'Poppins',
      preview: { bg: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)', header: '#7c3aed', accent: '#a78bfa', layout: 'grid', hero: 'dark', desc: 'Purple gradient, modern wellness, energetic health brand' } },
  ],
};

// ── Unique card styles for each of the 6 template slots ─────────────────────
const CARD_STYLES = [
  // Slot 0 — Clean & light: white card, colored top stripe, light shadow
  (tmpl, isSel) => ({
    card: {
      background: '#ffffff',
      border: `2px solid ${isSel ? tmpl.preview.header : 'rgba(0,0,0,0.08)'}`,
      borderRadius: 20, overflow: 'hidden',
      boxShadow: isSel ? `0 0 0 3px ${tmpl.preview.header}33, 0 16px 40px ${tmpl.preview.header}22` : '0 4px 16px rgba(0,0,0,0.07)',
    },
    topBar: { height: 5, background: tmpl.preview.header },
    infoArea: { background: '#ffffff', padding: '14px 16px 16px' },
    titleColor: '#111', descColor: '#777', tagColor: tmpl.preview.header,
  }),
  // Slot 1 — Dark full-bleed: uses the template's own dark gradient
  (tmpl, isSel) => ({
    card: {
      background: tmpl.preview.bg,
      border: `2px solid ${isSel ? tmpl.preview.accent : tmpl.preview.header + '55'}`,
      borderRadius: 14, overflow: 'hidden',
      boxShadow: isSel ? `0 0 0 3px ${tmpl.preview.accent}44, 0 20px 50px ${tmpl.preview.header}55` : `0 4px 20px ${tmpl.preview.header}28`,
    },
    topBar: null,
    infoArea: { background: 'rgba(0,0,0,0.55)', padding: '14px 16px 16px', backdropFilter: 'blur(8px)' },
    titleColor: '#fff', descColor: 'rgba(255,255,255,0.6)', tagColor: tmpl.preview.accent,
  }),
  // Slot 2 — Bold left accent: thick left color border on clean card
  (tmpl, isSel) => ({
    card: {
      background: tmpl.preview.hero === 'dark' ? '#0f172a' : '#f8fafc',
      border: `2px solid ${isSel ? tmpl.preview.header : 'transparent'}`,
      borderLeft: `6px solid ${tmpl.preview.header}`,
      borderRadius: 16, overflow: 'hidden',
      boxShadow: isSel ? `0 0 0 3px ${tmpl.preview.header}22, 0 12px 36px ${tmpl.preview.header}33` : '0 2px 12px rgba(0,0,0,0.07)',
    },
    topBar: null,
    infoArea: {
      background: tmpl.preview.hero === 'dark' ? 'rgba(0,0,0,0.6)' : '#ffffff',
      padding: '12px 16px 14px', borderTop: `1px solid ${tmpl.preview.header}22`,
    },
    titleColor: tmpl.preview.hero === 'dark' ? '#fff' : '#111',
    descColor: tmpl.preview.hero === 'dark' ? 'rgba(255,255,255,0.55)' : '#666',
    tagColor: tmpl.preview.header,
  }),
  // Slot 3 — Glassmorphism: translucent with colored glow and blur
  (tmpl, isSel) => ({
    card: {
      background: `linear-gradient(145deg, ${tmpl.preview.header}15, ${tmpl.preview.accent}10, rgba(0,0,0,0.4))`,
      border: `1.5px solid ${isSel ? tmpl.preview.accent : tmpl.preview.header + '40'}`,
      borderRadius: 24, overflow: 'hidden',
      backdropFilter: 'blur(20px)',
      boxShadow: isSel ? `0 0 0 3px ${tmpl.preview.accent}33, 0 20px 60px ${tmpl.preview.header}55` : `0 8px 28px ${tmpl.preview.header}25`,
    },
    topBar: null,
    infoArea: { background: 'rgba(255,255,255,0.05)', padding: '14px 16px 16px', borderTop: `1px solid ${tmpl.preview.header}25`, backdropFilter: 'blur(4px)' },
    titleColor: '#fff', descColor: 'rgba(255,255,255,0.6)', tagColor: tmpl.preview.accent,
  }),
  // Slot 4 — Pill-shaped soft: very rounded with pastel/gradient bg
  (tmpl, isSel) => ({
    card: {
      background: tmpl.preview.bg,
      border: `2px solid ${isSel ? tmpl.preview.header : 'rgba(0,0,0,0.05)'}`,
      borderRadius: 32, overflow: 'hidden',
      boxShadow: isSel ? `0 0 0 4px ${tmpl.preview.header}22, 0 16px 40px ${tmpl.preview.header}22` : '0 2px 12px rgba(0,0,0,0.05)',
    },
    topBar: null,
    infoArea: {
      background: tmpl.preview.hero === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.92)',
      padding: '12px 16px 14px', backdropFilter: 'blur(6px)',
    },
    titleColor: tmpl.preview.hero === 'dark' ? '#fff' : '#111',
    descColor: tmpl.preview.hero === 'dark' ? 'rgba(255,255,255,0.55)' : '#888',
    tagColor: tmpl.preview.header,
  }),
  // Slot 5 — Neon/cyberpunk: dark bg, glowing neon accent borders & shadow
  (tmpl, isSel) => ({
    card: {
      background: tmpl.preview.bg,
      border: `2px solid ${isSel ? tmpl.preview.accent : tmpl.preview.accent + '60'}`,
      borderRadius: 18, overflow: 'hidden',
      boxShadow: isSel
        ? `0 0 0 2px ${tmpl.preview.accent}40, 0 0 30px ${tmpl.preview.accent}55, 0 20px 50px ${tmpl.preview.header}44`
        : `0 0 15px ${tmpl.preview.accent}25, 0 4px 20px ${tmpl.preview.header}22`,
    },
    topBar: { height: 2, background: `linear-gradient(90deg, ${tmpl.preview.header}, ${tmpl.preview.accent}, ${tmpl.preview.header})` },
    infoArea: { background: 'rgba(0,0,0,0.65)', padding: '14px 16px 16px', backdropFilter: 'blur(12px)', borderTop: `1px solid ${tmpl.preview.accent}40` },
    titleColor: '#fff', descColor: tmpl.preview.accent + 'cc', tagColor: tmpl.preview.accent,
  }),
];

// ── Vastly improved layout previews ─────────────────────────────────────────
function MiniPreview({ tmpl }) {
  const { preview } = tmpl;
  const isDark = preview.hero === 'dark';
  const h = preview.header;
  const a = preview.accent;

  const wrap = {
    height: 168, overflow: 'hidden', position: 'relative',
    background: preview.bg,
  };

  // SPLIT — two-column: text left, image right
  if (preview.layout === 'split') return (
    <div style={wrap}>
      {/* Nav */}
      <div style={{ height: 22, background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', borderBottom: `2px solid ${h}` }}>
        <div style={{ width: 36, height: 5, borderRadius: 2, background: h }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {[22, 18, 18].map((w, i) => <div key={i} style={{ width: w, height: 3, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)' }} />)}
        </div>
        <div style={{ width: 30, height: 12, borderRadius: 3, background: h }} />
      </div>
      {/* Split body */}
      <div style={{ display: 'flex', height: 'calc(100% - 22px)' }}>
        <div style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
          <div style={{ fontSize: 7, fontWeight: 800, color: isDark ? '#fff' : '#111', letterSpacing: -0.2 }}>Your Business</div>
          <div style={{ width: '90%', height: 3, borderRadius: 1, background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)' }} />
          <div style={{ width: '75%', height: 2, borderRadius: 1, background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)' }} />
          <div style={{ width: 38, height: 13, borderRadius: 3, background: h, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 20, height: 2, borderRadius: 1, background: 'rgba(255,255,255,0.8)' }} />
          </div>
        </div>
        <div style={{ width: '44%', background: `linear-gradient(145deg, ${h}55, ${a}70)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${h}60`, border: `2px solid ${a}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: a }} />
          </div>
          <div style={{ width: 32, height: 3, borderRadius: 1, background: 'rgba(255,255,255,0.5)' }} />
        </div>
      </div>
    </div>
  );

  // FULLSCREEN — big hero, centered text, feature row below
  if (preview.layout === 'fullscreen') return (
    <div style={{ ...wrap, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 12px', position: 'relative' }}>
        {/* Background pattern dots */}
        {[...Array(6)].map((_, i) => <div key={i} style={{ position: 'absolute', width: 3, height: 3, borderRadius: '50%', background: `${h}40`, top: 10 + (i * 14), left: 14 + (i % 3) * 18, }} />)}
        <div style={{ width: 20, height: 4, borderRadius: 2, background: `${h}88`, marginBottom: 2 }} />
        <div style={{ fontSize: 8, fontWeight: 800, color: isDark ? '#fff' : '#111', letterSpacing: -0.3, textAlign: 'center' }}>BOLD HEADLINE</div>
        <div style={{ width: '55%', height: 2, borderRadius: 1, background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)' }} />
        <div style={{ width: 50, height: 15, borderRadius: 4, background: h, marginTop: 4 }} />
      </div>
      {/* Feature strip */}
      <div style={{ display: 'flex', gap: 4, padding: '6px 8px', background: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.55)', backdropFilter: 'blur(4px)' }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ flex: 1, height: 28, borderRadius: 5, background: isDark ? `${h}22` : `${h}12`, border: `1px solid ${h}33`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: `${h}66` }} />
            <div style={{ width: '70%', height: 2, borderRadius: 1, background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)' }} />
          </div>
        ))}
      </div>
    </div>
  );

  // GRID — product/service cards arranged in a grid
  if (preview.layout === 'grid') return (
    <div style={{ ...wrap, display: 'flex', flexDirection: 'column' }}>
      {/* Top search/filter bar */}
      <div style={{ padding: '6px 8px', display: 'flex', gap: 5, alignItems: 'center', background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)', borderBottom: `1px solid ${h}22` }}>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: h + '44', border: `1.5px solid ${h}` }} />
        <div style={{ width: '30%', height: 4, borderRadius: 2, background: h }} />
        <div style={{ flex: 1, height: 11, borderRadius: 4, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${h}22` }} />
        <div style={{ width: 22, height: 11, borderRadius: 3, background: h }} />
      </div>
      {/* Cards grid 3x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, padding: '6px 8px 6px' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            height: 36, borderRadius: 6,
            background: i === 0 ? `linear-gradient(135deg,${h}55,${a}44)` : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
            border: `1px solid ${i === 0 ? h + '66' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')}`,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 4px 4px', gap: 2,
          }}>
            <div style={{ width: '65%', height: 3, borderRadius: 1, background: i === 0 ? '#fff' : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)') }} />
            <div style={{ width: '45%', height: 2, borderRadius: 1, background: i === 0 ? 'rgba(255,255,255,0.5)' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') }} />
          </div>
        ))}
      </div>
    </div>
  );

  // MAGAZINE — editorial: big image right, text columns left, nav top
  if (preview.layout === 'magazine') return (
    <div style={{ ...wrap, display: 'flex', flexDirection: 'column' }}>
      {/* Thick branded nav */}
      <div style={{ height: 24, background: h, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
        <div style={{ fontSize: 7, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>BRAND</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[16, 14, 14, 14].map((w, i) => <div key={i} style={{ width: w, height: 2, borderRadius: 1, background: 'rgba(255,255,255,0.6)' }} />)}
        </div>
      </div>
      {/* Magazine body */}
      <div style={{ flex: 1, display: 'flex', gap: 0 }}>
        {/* Left columns */}
        <div style={{ flex: 2, padding: '8px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)' }}>
          <div>
            <div style={{ fontSize: 7, color: h, fontWeight: 800, marginBottom: 4, letterSpacing: 0.3 }}>FEATURED</div>
            <div style={{ width: '88%', height: 4, borderRadius: 1, background: isDark ? 'rgba(255,255,255,0.7)' : '#222', marginBottom: 3 }} />
            <div style={{ width: '72%', height: 3, borderRadius: 1, background: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)', marginBottom: 2 }} />
            <div style={{ width: '80%', height: 2, borderRadius: 1, background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }} />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ flex: 1, height: 22, borderRadius: 4, background: `${h}22`, border: `1px solid ${h}33` }} />
            <div style={{ flex: 1, height: 22, borderRadius: 4, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }} />
          </div>
        </div>
        {/* Right image */}
        <div style={{ flex: 1, background: `linear-gradient(160deg, ${h}66, ${a}88)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -10, left: -10, width: 50, height: 50, borderRadius: '50%', background: `${a}44` }} />
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.25)', border: `1.5px solid rgba(255,255,255,0.4)`, zIndex: 1 }} />
          <div style={{ width: 24, height: 2, borderRadius: 1, background: 'rgba(255,255,255,0.6)', zIndex: 1 }} />
        </div>
      </div>
    </div>
  );

  // CENTERED — centered hero with icon, description, CTA, then features row
  if (preview.layout === 'centered') return (
    <div style={{ ...wrap, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Slim nav */}
      <div style={{ width: '100%', height: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)' }}>
        <div style={{ width: 28, height: 4, borderRadius: 2, background: h }} />
        <div style={{ width: 26, height: 10, borderRadius: 3, background: h }} />
      </div>
      {/* Centered hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '0 12px' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${h}30`, border: `2.5px solid ${h}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: h }} />
        </div>
        <div style={{ fontSize: 7, fontWeight: 800, color: isDark ? '#fff' : '#111', letterSpacing: -0.2, textAlign: 'center' }}>Premium Service</div>
        <div style={{ width: '62%', height: 2, borderRadius: 1, background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)' }} />
        <div style={{ width: 42, height: 13, borderRadius: 4, background: h }} />
      </div>
      {/* Bottom stats bar */}
      <div style={{ width: '100%', display: 'flex', borderTop: `1px solid ${h}22`, background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)' }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ flex: 1, padding: '5px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, borderRight: i < 2 ? `1px solid ${h}22` : 'none' }}>
            <div style={{ width: 16, height: 4, borderRadius: 1, background: h + '80' }} />
            <div style={{ width: '60%', height: 2, borderRadius: 1, background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }} />
          </div>
        ))}
      </div>
    </div>
  );

  // SIDEBAR — left nav sidebar, main content with cards
  if (preview.layout === 'sidebar') return (
    <div style={{ ...wrap, display: 'flex', flexDirection: 'column' }}>
      {/* Top nav */}
      <div style={{ height: 18, background: isDark ? 'rgba(0,0,0,0.55)' : '#fff', display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', borderBottom: `1px solid ${h}33` }}>
        <div style={{ width: 22, height: 4, borderRadius: 2, background: h }} />
        <div style={{ flex: 1 }} />
        <div style={{ width: 22, height: 8, borderRadius: 2, background: h }} />
      </div>
      {/* Sidebar + content */}
      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ width: 44, background: isDark ? 'rgba(0,0,0,0.5)' : `${h}12`, borderRight: `2px solid ${h}44`, padding: '6px 5px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {[true, false, false, false, false].map((active, i) => (
            <div key={i} style={{
              height: 13, borderRadius: 4,
              background: active ? h : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
              display: 'flex', alignItems: 'center', padding: '0 4px', gap: 3
            }}>
              <div style={{ width: 5, height: 5, borderRadius: 1, background: active ? 'rgba(255,255,255,0.8)' : (isDark ? 'rgba(255,255,255,0.15)' : `${h}60`) }} />
              <div style={{ flex: 1, height: 2, borderRadius: 1, background: active ? 'rgba(255,255,255,0.7)' : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)') }} />
            </div>
          ))}
        </div>
        {/* Main content */}
        <div style={{ flex: 1, padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ width: '55%', height: 5, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.6)' : '#222' }} />
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, background: i === 0 ? `${h}44` : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'), border: `1px solid ${i === 0 ? h + '55' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')}`, flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ width: '75%', height: 3, borderRadius: 1, background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)' }} />
                <div style={{ width: '55%', height: 2, borderRadius: 1, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return null;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TemplatePicker() {
  const [step, setStep] = useState(1);
  const [sectors, setSectors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [variant, setVariant] = useState('modern');
  const [siteName, setSiteName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const { isDemo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    templatesApi.list().then(res => setSectors(res.data.sectors || [])).finally(() => setLoading(false));
  }, []);

  const handleSelectSector = (sector) => {
    setSelected(sector);
    const templates = INDUSTRY_TEMPLATES[sector.id] || [];
    setVariant(templates[0]?.id || sector.variants?.[0] || 'modern');
    setSiteName(`My ${sector.display_name} Website`);
    setStep(2);
  };

  const handleCreate = async () => {
    if (!siteName.trim()) { setError('Please enter a site name.'); return; }
    setCreating(true); setError('');
    try {
      const res = await sitesApi.create(siteName.trim(), selected.id, variant);
      navigate(`/builder/editor/${res.data.site.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create site. Please try again.');
      setCreating(false);
    }
  };

  const industryTemplates = selected
    ? (INDUSTRY_TEMPLATES[selected.id] || selected.variants.map(v => ({
        id: v, label: v.charAt(0).toUpperCase() + v.slice(1), tag: 'Style variant',
        palette: ['#6366f1', '#1e293b', '#a5b4fc'], font: 'Inter',
        preview: { bg: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)', header: '#6366f1', accent: '#818cf8', layout: 'split', hero: 'light', desc: v },
      })))
    : [];

  const selectedTemplate = industryTemplates.find(t => t.id === variant) || industryTemplates[0];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'Outfit', sans-serif", color: 'var(--text-primary)', position: 'relative', overflowX: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '15%', left: '30%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.04), transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      {/* Top bar */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', padding: '0 24px', backdropFilter: 'blur(12px)', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/builder/dashboard')}
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
            ←
          </button>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>
            {step === 1 ? 'Choose an Industry' : step === 2 ? `${selected?.display_name} — Choose Template` : 'Name Your Site'}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ width: s === step ? 24 : 8, height: 8, borderRadius: 4, transition: 'all .3s', background: s <= step ? 'var(--brand-primary)' : 'var(--border-medium)' }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px', position: 'relative', zIndex: 5 }}>
        <AnimatePresence mode="wait">

          {/* ── Step 1: Sector ─────────────────────────────── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <h1 style={{ color: 'var(--text-primary)', fontSize: '2.5rem', fontWeight: 800, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                  Templates for Every Industry
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                  Ready-to-use designs with real content for your specific sector.
                </p>
              </div>
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 18 }}>
                  {[...Array(10)].map((_, i) => <div key={i} style={{ height: 150, borderRadius: 20, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }} />)}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 18 }}>
                  {sectors.map((sector, i) => {
                    const sty = SECTOR_STYLES[sector.id] || { color: 'var(--brand-primary)', grad: 'var(--bg-secondary)', light: '#99f6e4' };
                    return (
                      <motion.button
                        key={sector.id}
                        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, type: 'spring', stiffness: 200, damping: 20 }}
                        onClick={() => handleSelectSector(sector)}
                        whileHover={{ scale: 1.04, y: -6 }} whileTap={{ scale: 0.97 }}
                        style={{
                          position: 'relative',
                          background: sty.grad,
                          border: `1px solid ${sty.color}33`,
                          borderRadius: 20, padding: '28px 20px 24px', cursor: 'pointer',
                          textAlign: 'center', fontFamily: 'inherit', overflow: 'hidden',
                          transition: 'box-shadow .25s, border-color .25s',
                          boxShadow: `0 2px 16px ${sty.color}18`,
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.boxShadow = `0 16px 40px ${sty.color}44`;
                          e.currentTarget.style.borderColor = `${sty.color}88`;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.boxShadow = `0 2px 16px ${sty.color}18`;
                          e.currentTarget.style.borderColor = `${sty.color}33`;
                        }}
                      >
                        {/* Glow dot */}
                        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `${sty.color}22`, filter: 'blur(20px)', pointerEvents: 'none' }} />
                        {/* Badge */}
                        <div style={{ position: 'absolute', top: 10, right: 12, background: `${sty.color}22`, border: `1px solid ${sty.color}44`, borderRadius: 99, padding: '2px 7px', fontSize: '0.6rem', fontWeight: 700, color: sty.light, letterSpacing: '0.04em' }}>6 templates</div>
                        {/* Icon */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: 18, background: `${sty.color}33`, border: `1.5px solid ${sty.color}55`, marginBottom: 14 }}>
                          <LucideIcon name={SECTOR_ICONS[sector.id] || 'Globe'} size={26} color={sty.light} />
                        </div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{sector.display_name}</div>
                        <div style={{ color: sty.light, fontSize: '0.72rem', opacity: 0.7, lineHeight: 1.4 }}>{sector.description}</div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Step 2: Industry-specific Templates ─────────── */}
          {step === 2 && selected && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--brand-hover)', border: '1px solid var(--border-subtle)', marginBottom: 16 }}>
                  <LucideIcon name={SECTOR_ICONS[selected.id] || 'Globe'} size={28} color="var(--brand-primary)" />
                </div>
                <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                  Choose your {selected.display_name} template
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                  6 completely different designs — each built for {selected.display_name.toLowerCase()} businesses.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 24, marginBottom: 40 }}>
                {industryTemplates.map((tmpl, i) => {
                  const isSel = variant === tmpl.id;
                  const styleFn = CARD_STYLES[i % CARD_STYLES.length];
                  const cs = styleFn(tmpl, isSel);
                  return (
                    <motion.button
                      key={tmpl.id}
                      onClick={() => setVariant(tmpl.id)}
                      initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 180, damping: 22 }}
                      whileHover={{ scale: 1.028, y: -6 }} whileTap={{ scale: 0.97 }}
                      style={{
                        ...cs.card,
                        cursor: 'pointer', textAlign: 'left',
                        fontFamily: 'inherit', transition: 'all .25s', outline: 'none',
                        padding: 0,
                      }}>
                      {/* Colored top bar (for cards that have it) */}
                      {cs.topBar && <div style={cs.topBar} />}
                      {/* Preview */}
                      <MiniPreview tmpl={tmpl} />
                      {/* Info area — styled uniquely per card */}
                      <div style={cs.infoArea}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ color: cs.titleColor, fontWeight: 800, fontSize: '0.98rem', letterSpacing: '-0.01em' }}>{tmpl.label}</span>
                          {isSel && <span style={{ background: tmpl.preview.header, color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '2px 7px', borderRadius: 20, letterSpacing: '0.04em' }}>✓ SELECTED</span>}
                        </div>
                        <div style={{ color: cs.descColor, fontSize: '0.72rem', lineHeight: 1.5, marginBottom: 10 }}>{tmpl.preview.desc}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          {tmpl.palette.map((c, pi) => (
                            <div key={pi} style={{ width: 12, height: 12, borderRadius: '50%', background: c, border: '1.5px solid rgba(255,255,255,0.2)', boxShadow: `0 0 4px ${c}55` }} />
                          ))}
                          <span style={{ marginLeft: 3, color: cs.tagColor, fontSize: '0.65rem', fontWeight: 600, opacity: 0.9 }}>{tmpl.font}</span>
                          <span style={{ marginLeft: 'auto', color: cs.tagColor, fontSize: '0.65rem', fontStyle: 'italic', opacity: 0.7 }}>{tmpl.tag}</span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div style={{ textAlign: 'center' }}>
                <motion.button onClick={() => setStep(3)} whileHover={{ scale: 1.03 }}
                  style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-active))', border: 'none', borderRadius: 12, color: '#fff', padding: '14px 40px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px var(--brand-hover)' }}>
                  Use &ldquo;{selectedTemplate?.label || variant}&rdquo; Template &rarr;
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Name ─────────────────────────────────── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--brand-hover)', border: '1px solid var(--border-subtle)', marginBottom: 20 }}>
                  <LucideIcon name="PenTool" size={28} color="var(--brand-primary)" />
                </div>
                <h1 style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Name your website</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>This is just for your reference — you can change it anytime.</p>

                {selectedTemplate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, textAlign: 'left' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {selectedTemplate.palette.map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem' }}>{selectedTemplate.label}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{selected?.display_name} &middot; {selectedTemplate.tag}</div>
                    </div>
                  </div>
                )}

                <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)}
                  placeholder="e.g. Sunrise Construction Co."
                  style={{ width: '100%', padding: '16px 20px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 12, color: 'var(--text-primary)', fontSize: '1rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', textAlign: 'center', marginBottom: 16, transition: 'border-color .2s' }}
                  onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()} />

                {error && <div style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: 16, background: 'rgba(239,68,68,0.05)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

                {isDemo && (
                  <div style={{ background: 'var(--brand-hover)', border: '1px solid var(--brand-primary)', borderRadius: 10, padding: '10px 16px', marginBottom: 20, color: 'var(--brand-primary)', fontSize: '0.8rem' }}>
                    Demo mode: Your site will be saved for 24 hours only.
                  </div>
                )}

                <motion.button onClick={handleCreate} disabled={creating} whileHover={{ scale: 1.03 }}
                  style={{ background: creating ? 'var(--brand-hover)' : 'linear-gradient(135deg, var(--brand-primary), var(--brand-active))', border: 'none', borderRadius: 12, color: creating ? 'var(--brand-primary)' : '#fff', padding: '14px 40px', fontWeight: 700, fontSize: '1rem', cursor: creating ? 'wait' : 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px var(--brand-hover)' }}>
                  {creating ? 'Creating your website...' : 'Create Website & Open Editor'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

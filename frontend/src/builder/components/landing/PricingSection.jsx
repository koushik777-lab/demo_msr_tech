import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LucideIcon from '../common/LucideIcon';
import MagneticButton from './MagneticButton';
import { toast } from 'sonner';

const PLANS = [
  {
    id: 'free',
    name: 'Free Starter',
    desc: 'Perfect for exploring and trying out template designs.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    popular: false,
    badge: null,
    features: [
      '1 Active Site',
      'All 13 Industry Templates',
      'Drag & Drop Visual Editor',
      'Export HTML/ZIP Export',
      'Basic SEO Settings',
      'Community Support'
    ],
    cta: 'Get Started Free',
    variant: 'secondary'
  },
  {
    id: 'starter',
    name: 'Starter Pro',
    desc: 'Ideal for small businesses launching their first site.',
    monthlyPrice: 1499,
    yearlyPrice: 1199,
    popular: false,
    badge: null,
    features: [
      '3 Active Sites',
      'All Sector Templates & Variants',
      'Connect Custom Domain',
      'Free SSL Certificate',
      'Instant Subdomain Hosting',
      'Auto-generated Legal Pages',
      'Standard Support (24h)'
    ],
    cta: 'Start Starter Trial',
    variant: 'secondary'
  },
  {
    id: 'pro',
    name: 'Business Growth',
    desc: 'For growing businesses needing maximum performance.',
    monthlyPrice: 2999,
    yearlyPrice: 2399,
    popular: true,
    badge: 'MOST POPULAR',
    features: [
      '10 Active Sites',
      'All Templates + Premium Variants',
      'Unlimited Bandwidth & Storage',
      'Custom Domain + Custom Code',
      'Lead Generation Forms & CRM',
      'Priority Support (1 Hour)',
      'Remove MSR Tech Hub Branding'
    ],
    cta: 'Upgrade to Business',
    variant: 'primary'
  },
  {
    id: 'agency',
    name: 'Agency / Unlimited',
    desc: 'Unlimited power for agencies, freelancers & teams.',
    monthlyPrice: 5999,
    yearlyPrice: 4799,
    popular: false,
    badge: 'UNLIMITED',
    features: [
      'Unlimited Sites',
      'White-label Client Portal',
      'Multi-user Team Workspace',
      'Custom HTML/CSS Export',
      'Dedicated Account Manager',
      '99.99% Guaranteed SLA',
      'Custom API Integration'
    ],
    cta: 'Go Unlimited',
    variant: 'secondary'
  }
];

export default function PricingSection({ onSelectPlan }) {
  const [isYearly, setIsYearly] = useState(true);

  // Dynamic Razorpay Loader
  const handleCheckout = async (plan) => {
    if (plan.monthlyPrice === 0) {
      if (onSelectPlan) onSelectPlan(plan.id);
      return;
    }

    const price = isYearly ? plan.yearlyPrice * 12 : plan.monthlyPrice;
    
    // Load Razorpay Script dynamically if needed
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Failed to load payment gateway. Please check connection.");
      if (onSelectPlan) onSelectPlan(plan.id);
      return;
    }

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_live_JoElYfIjnp3ls9",
      amount: price * 100, // Amount in paise
      currency: "INR",
      name: "MSR Tech Hub SaaS",
      description: `Subscription: ${plan.name} (${isYearly ? 'Annual' : 'Monthly'})`,
      image: "/logo.png",
      handler: function (response) {
        toast.success(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
        if (onSelectPlan) onSelectPlan(plan.id, response.razorpay_payment_id);
      },
      prefill: {
        name: "Valued Customer",
        email: "customer@example.com",
        contact: "9999999999"
      },
      theme: {
        color: "#2563EB"
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay Error:", err);
      toast.info(`Redirecting to plan setup for ${plan.name}...`);
      if (onSelectPlan) onSelectPlan(plan.id);
    }
  };

  return (
    <section id="pricing" style={{ padding: '100px 24px', position: 'relative', zIndex: 5, background: '#F8FAFC' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#DBEAFE', border: '1px solid #BFDBFE', borderRadius: 99, padding: '6px 18px', marginBottom: 20, color: '#2563EB', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            <LucideIcon name="Sparkles" size={14} /> Transparent SaaS Pricing
          </div>
          <h2 style={{ color: '#0F172A', fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Simple Plans for <span style={{ color: '#2563EB' }}>Every Stage</span>
          </h2>
          <p style={{ color: '#334155', fontSize: '1.05rem', maxWidth: 560, margin: '0 auto 36px' }}>
            No hidden fees. Start free, upgrade when you need custom domains, instant publishing, or agency scale.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', background: '#FFFFFF', padding: '6px', borderRadius: '999px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
            <button
              onClick={() => setIsYearly(false)}
              style={{
                padding: '8px 22px',
                borderRadius: '999px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: !isYearly ? '#2563EB' : 'transparent',
                color: !isYearly ? '#FFFFFF' : '#334155'
              }}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsYearly(true)}
              style={{
                padding: '8px 22px',
                borderRadius: '999px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: isYearly ? '#2563EB' : 'transparent',
                color: isYearly ? '#FFFFFF' : '#334155'
              }}
            >
              <span>Yearly Billing</span>
              <span style={{ background: '#DBEAFE', color: '#2563EB', padding: '2px 8px', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 800 }}>
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, alignItems: 'stretch' }}>
          {PLANS.map((plan) => {
            const currentPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: 'relative',
                  background: '#FFFFFF',
                  borderRadius: 20,
                  padding: '36px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  border: plan.popular 
                    ? '2px solid #2563EB'
                    : '1px solid #E2E8F0',
                  boxShadow: plan.popular 
                    ? '0 16px 40px rgba(37,99,235,0.15)' 
                    : '0 4px 20px rgba(15,23,42,0.04)',
                  overflow: 'hidden'
                }}
              >
                {/* Card Header & Badge */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ color: '#0F172A', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                      {plan.name}
                    </h3>
                    {plan.badge && (
                      <span style={{
                        background: '#2563EB',
                        color: '#FFFFFF',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '4px 12px',
                        borderRadius: 99,
                        letterSpacing: '0.05em'
                      }}>
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#334155', fontSize: '0.85rem', lineHeight: 1.5, minHeight: 40, margin: '0 0 24px' }}>
                    {plan.desc}
                  </p>

                  {/* Price */}
                  <div style={{ marginBottom: 28, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#334155' }}>₹</span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={currentPrice}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.25 }}
                        style={{ fontSize: '2.8rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}
                      >
                        {currentPrice}
                      </motion.span>
                    </AnimatePresence>
                    <span style={{ color: '#334155', fontSize: '0.88rem', fontWeight: 500 }}>
                      {plan.monthlyPrice === 0 ? '/forever' : isYearly ? '/mo (billed yearly)' : '/month'}
                    </span>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: '#E2E8F0', marginBottom: 24 }} />

                  {/* Feature Checklist */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {plan.features.map((feat, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#0F172A', fontSize: '0.88rem' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <LucideIcon name="Check" size={13} color="#2563EB" />
                        </div>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <MagneticButton
                  onClick={() => handleCheckout(plan)}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    background: plan.popular 
                      ? '#2563EB'
                      : '#FFFFFF',
                    color: plan.popular ? '#FFFFFF' : '#0F172A',
                    border: plan.popular ? 'none' : '1px solid #E2E8F0',
                    boxShadow: plan.popular ? '0 8px 24px rgba(37,99,235,0.25)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  {plan.cta} →
                </MagneticButton>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


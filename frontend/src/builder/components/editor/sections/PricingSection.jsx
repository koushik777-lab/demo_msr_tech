import React from 'react';
import EditableText from '../EditableText';

export default function PricingSection({ content, siteSettings, onUpdate }) {
  const fontH = siteSettings?.font_heading || 'Outfit';
  const primary = siteSettings?.brand_colors?.primary || '#6366f1';
  const plans = content.plans || [
    { name: 'Basic', price: '₹999/mo', features: ['Feature 1', 'Feature 2'], popular: false },
    { name: 'Pro', price: '₹2,499/mo', features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'], popular: true },
  ];

  const updatePlan = (index, field, value) => {
    const updated = plans.map((p, i) => i === index ? { ...p, [field]: value } : p);
    onUpdate?.({ plans: updated });
  };

  return (
    <section style={{ padding: '80px 24px', background: 'white' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <EditableText
          tag="h2"
          value={content.heading || 'Our Pricing'}
          onSave={(v) => onUpdate?.({ heading: v })}
          style={{ fontFamily: `'${fontH}', sans-serif`, textAlign: 'center', fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', marginBottom: 48 }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {plans.map((plan, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: 16, padding: '36px 28px', textAlign: 'center',
              border: plan.popular ? `2px solid ${primary}` : '1px solid #e2e8f0',
              boxShadow: plan.popular ? `0 8px 32px ${primary}22` : '0 2px 12px rgba(0,0,0,0.04)',
              position: 'relative',
            }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: primary, color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '4px 16px', borderRadius: 99 }}>
                  MOST POPULAR
                </div>
              )}
              <EditableText
                tag="h3"
                value={plan.name}
                onSave={(v) => updatePlan(i, 'name', v)}
                style={{ fontFamily: `'${fontH}', sans-serif`, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: 8 }}
              />
              <EditableText
                tag="div"
                value={plan.price}
                onSave={(v) => updatePlan(i, 'price', v)}
                style={{ fontSize: '2rem', fontWeight: 800, color: primary, marginBottom: 20 }}
              />
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', textAlign: 'left' }}>
                {(plan.features || []).map((f, j) => (
                  <li key={j} style={{ padding: '6px 0', color: '#64748b', fontSize: '0.9rem', display: 'flex', gap: 8 }}>
                    <span style={{ color: primary }}>✓</span>
                    <EditableText
                      tag="span"
                      value={f}
                      onSave={(v) => {
                        const updatedFeatures = [...(plan.features || [])];
                        updatedFeatures[j] = v;
                        updatePlan(i, 'features', updatedFeatures);
                      }}
                      style={{ color: '#64748b' }}
                    />
                  </li>
                ))}
              </ul>
              <a href={`buy.html?plan=${encodeURIComponent(plan.name)}&price=${encodeURIComponent(plan.price)}`} style={{ display: 'block', background: plan.popular ? primary : 'transparent', color: plan.popular ? 'white' : primary, border: `2px solid ${primary}`, borderRadius: 10, padding: '10px 20px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
                Get Started
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

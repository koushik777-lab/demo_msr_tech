import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { billingApi } from '../api/builderApi';
import { useAuth } from '../context/AuthContext';
import LucideIcon from '../components/common/LucideIcon';

export default function BillingPage() {
  const { user, subscription, loadSubscription } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    billingApi.getPlans().then(res => setPlans(res.data.plans || [])).finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async (plan) => {
    if (plan.id === 'free') return;
    setPaying(plan.id);
    setMessage('');
    try {
      const orderRes = await billingApi.createOrder(plan.id);
      const { order_id, amount, currency, key_id, mock } = orderRes.data;

      if (mock) {
        // Mock mode — simulate payment
        await billingApi.verifyPayment({
          razorpay_order_id: order_id,
          razorpay_payment_id: 'mock_pay_' + Date.now(),
          razorpay_signature: 'mock_sig',
          plan: plan.id,
        });
        await loadSubscription();
        setMessage(`✅ Successfully upgraded to ${plan.name}!`);
        setPaying(null);
        return;
      }

      // Real Razorpay checkout
      const options = {
        key: key_id,
        amount,
        currency,
        name: 'MSR TECH HUB',
        description: `${plan.name} Plan`,
        order_id,
        handler: async (response) => {
          try {
            await billingApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: plan.id,
            });
            await loadSubscription();
            setMessage(`✅ Successfully upgraded to ${plan.name}!`);
          } catch { setMessage('❌ Payment verification failed. Contact support.'); }
          setPaying(null);
        },
        modal: { ondismiss: () => setPaying(null) },
        prefill: { email: user?.email || '' },
        theme: { color: '#00FFD1' },
      };

      if (!window.Razorpay) {
        // Load Razorpay script dynamically
        await new Promise((res, rej) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = res; script.onerror = rej;
          document.body.appendChild(script);
        });
      }
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.detail || 'Payment failed. Please try again.'));
      setPaying(null);
    }
  };

  const PLAN_ICONS = { free: 'Leaf', starter: 'Rocket', pro: 'Zap', agency: 'Building2' };
  const currentPlan = subscription?.plan || 'free';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'Outfit', sans-serif", color: 'var(--text-primary)', position: 'relative', overflowX: 'hidden' }}>
      {/* Background orb */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '15%', left: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.03), transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      {/* Nav */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', padding: '0 24px', backdropFilter: 'blur(12px)', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/builder/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LucideIcon name="ChevronLeft" size={20} />
          </button>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Billing & Plans</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px', position: 'relative', zIndex: 5 }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '2.5rem', fontWeight: 800, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            Choose Your Plan
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Start free. Upgrade when you're ready to grow.
          </p>
          {subscription && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, background: 'var(--brand-hover)', border: '1px solid var(--brand-primary)', borderRadius: 99, padding: '6px 16px' }}>
              <span style={{ color: 'var(--brand-primary)', fontSize: '0.85rem' }}>
                Current plan: <strong>{subscription.plan_name || currentPlan}</strong> ({subscription.status})
              </span>
            </div>
          )}
        </div>

        {message && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: message.startsWith('✅') ? 'var(--brand-hover)' : 'rgba(239,68,68,0.05)', border: `1px solid ${message.startsWith('✅') ? 'var(--brand-primary)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 12, padding: '14px 20px', marginBottom: 32, textAlign: 'center', color: message.startsWith('✅') ? 'var(--brand-primary)' : '#dc2626' }}>
            {message}
          </motion.div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: 400, borderRadius: 20, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {plans.map((plan, i) => {
              const isCurrent = plan.id === currentPlan;
              const isPro = plan.id === 'pro';
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    background: isPro ? 'var(--brand-hover)' : 'var(--bg-secondary)',
                    border: isPro ? '2px solid var(--brand-primary)' : isCurrent ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                    borderRadius: 20, padding: '36px 28px',
                    position: 'relative',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  {isPro && (
                    <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,var(--brand-primary),var(--brand-active))', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '4px 16px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                      MOST POPULAR
                    </div>
                  )}
                  {isCurrent && (
                    <div style={{ position: 'absolute', top: 16, right: 16, background: 'var(--brand-hover)', border: '1px solid var(--brand-primary)', color: 'var(--brand-primary)', fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99, letterSpacing: '0.05em' }}>
                      CURRENT
                    </div>
                  )}

                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 12, background: 'var(--brand-hover)', border: '1px solid var(--border-subtle)', marginBottom: 16 }}>
                    <LucideIcon name={PLAN_ICONS[plan.id] || 'Sparkles'} size={24} color="var(--brand-primary)" />
                  </div>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '1.3rem', fontWeight: 700, margin: '0 0 4px' }}>{plan.name}</h3>
                  <div style={{ color: isPro ? 'var(--brand-primary)' : 'var(--text-primary)', fontSize: '2rem', fontWeight: 800, margin: '16px 0' }}>
                    {plan.price_inr === 0 ? 'Free' : `₹${plan.price_inr.toLocaleString()}`}
                    {plan.price_inr > 0 && <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)' }}>/mo</span>}
                  </div>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
                    {(plan.features || []).map((f, j) => (
                      <li key={j} style={{ padding: '7px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <LucideIcon name="Check" size={14} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    onClick={() => handleUpgrade(plan)}
                    disabled={isCurrent || paying === plan.id}
                    whileHover={!isCurrent ? { scale: 1.02 } : {}}
                    style={{
                      width: '100%', padding: '12px',
                      background: isCurrent ? 'var(--brand-hover)' : isPro ? 'linear-gradient(135deg,var(--brand-primary),var(--brand-active))' : 'var(--text-primary)',
                      border: isCurrent ? '1px solid var(--brand-primary)' : isPro ? 'none' : '1px solid var(--border-subtle)',
                      borderRadius: 10, color: isCurrent ? 'var(--brand-primary)' : isPro ? '#fff' : 'var(--bg-primary)',
                      fontWeight: 700, fontSize: '0.9rem', cursor: isCurrent ? 'default' : 'pointer',
                      fontFamily: 'inherit',
                      opacity: paying && paying !== plan.id ? 0.5 : 1,
                    }}
                  >
                    {paying === plan.id ? 'Processing...' : isCurrent ? 'Current Plan' : plan.id === 'free' ? 'Downgrade' : `Upgrade to ${plan.name}`}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        )}

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 40 }}>
          All plans include a 7-day money-back guarantee. Prices are in INR and include applicable taxes.
        </p>
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LucideIcon from './LucideIcon';

export default function DemoBanner() {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(0, 255, 209, 0.05)',
        border: '1px solid rgba(0, 255, 209, 0.25)',
        borderRadius: 12, padding: '14px 20px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        flexWrap: 'wrap',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,255,209,0.06)', border: '1px solid rgba(0,255,209,0.15)' }}>
          <LucideIcon name="FlaskConical" size={18} color="#00FFD1" />
        </div>
        <div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
            You're in Demo Mode
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 2 }}>
            Your changes are saved for 24 hours. Sign up to keep your work permanently.
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <motion.button
          onClick={() => navigate('/builder/login')}
          whileHover={{ scale: 1.03 }}
          style={{
            background: 'linear-gradient(135deg, #00FFD1, #6FD2C0)',
            border: 'none', borderRadius: 8, color: '#000',
            padding: '8px 18px', fontWeight: 700, fontSize: '0.82rem',
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 12px rgba(0,255,209,0.15)'
          }}
        >
          Sign Up Free →
        </motion.button>
      </div>
    </motion.div>
  );
}

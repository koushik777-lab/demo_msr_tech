import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

export default function CountUpStat({ end, duration = 2, prefix = "", suffix = "", label = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let startTimestamp = null;
    const numericEnd = typeof end === 'number' ? end : parseFloat(end.replace(/[^0-9.]/g, '')) || 100;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // Ease out quad
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easedProgress * numericEnd));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(numericEnd);
      }
    };

    window.requestAnimationFrame(step);
  }, [isInView, end, duration]);

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: 'clamp(2rem, 4vw, 3.2rem)',
        fontWeight: 800,
        letterSpacing: '-0.03em',
        background: 'linear-gradient(135deg, var(--brand-primary, #0d9488), #38bdf8)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: 1.1
      }}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      {label && (
        <div style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem', marginTop: 6, fontWeight: 500 }}>
          {label}
        </div>
      )}
    </div>
  );
}

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function TiltCard({ children, style = {}, className = "", maxTilt = 12, ...props }) {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rY = ((mouseX / width) - 0.5) * maxTilt * 2;
    const rX = ((mouseY / height) - 0.5) * -maxTilt * 2;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePosition({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100,
      opacity: 0.15
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div style={{ perspective: 1000, width: '100%' }}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX, rotateY, scale: rotateX !== 0 || rotateY !== 0 ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{
          transformStyle: 'preserve-3d',
          position: 'relative',
          overflow: 'hidden',
          willChange: 'transform',
          ...style
        }}
        className={className}
        {...props}
      >
        {children}
        {/* Subtle Glare Layer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
            opacity: glarePosition.opacity,
            transition: 'opacity 0.3s ease',
            zIndex: 10,
          }}
        />
      </motion.div>
    </div>
  );
}

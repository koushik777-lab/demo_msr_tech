import React from 'react';
import { motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import { ArrowRight, Sparkles, Zap, Shield, Globe } from 'lucide-react';
import RotatingText from './RotatingText';

const Hero = () => {
  const scrollToContact = () => {
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPortfolio = () => {
    const element = document.querySelector('#portfolio');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 sm:pt-36 lg:pt-40 pb-16"
      style={{ background: 'var(--hero-bg)' }}
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 grid-pattern opacity-20"></div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-8 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-10"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-colors"
            >
              <Sparkles size={18} className="text-yellow-500" />
              <span className="text-sm font-medium tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                Premium Digital Solutions
              </span>
            </motion.div>
 
            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="display-huge leading-tight">
                Make Your
              </h1>
              <div style={{ height: '90px', display: 'flex', alignItems: 'center', overflow: 'hidden', marginTop: '8px', marginBottom: '8px' }}>
                <RotatingText
                  texts={[
                    "Information Sites",
                    "Business Websites",
                    "Landing Pages",
                    "Static Websites",
                    "Dynamic Websites",
                    "E-Commerce Sites",
                    "Web Applications"
                  ]}
                  animatePresenceInitial={true}
                  initial={{ y: "60%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-60%", opacity: 0 }}
                  mainClassName="text-[var(--brand-primary)] font-black"
                  elementLevelClassName="text-[var(--brand-primary)]"
                  staggerFrom="last"
                  staggerDuration={0.02}
                  splitLevelClassName="overflow-hidden"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2200}
                  splitBy="characters"
                  style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
                />
              </div>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="body-large max-w-xl text-[var(--text-secondary)]"
            >
              We craft stunning, high-performance websites and custom web applications
              that elevate your brand and drive business growth. Experience the future of web design.
            </motion.p>

            {/* CTA Buttons - Premium Liqui Glass Design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-6"
            >
              <motion.button
                onClick={scrollToContact}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-gradient-to-r from-[var(--text-primary)]/10 to-[var(--text-primary)]/5 backdrop-blur-2xl border border-[var(--border-medium)] rounded-full overflow-hidden shadow-[0_0_20px_var(--bg-overlay)] transition-all duration-300 hover:shadow-[0_0_40px_var(--brand-hover)] hover:border-[var(--brand-primary)]"
              >
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-[var(--brand-primary)]/10 to-transparent z-0"></div>
                <div className="relative z-10 flex items-center gap-3 text-[var(--text-primary)] font-semibold tracking-wide">
                  <span>Start Your Project</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </motion.button>

              <motion.button
                onClick={scrollToPortfolio}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-transparent border border-[var(--border-subtle)] rounded-full backdrop-blur-sm transition-all duration-300 hover:bg-[var(--bg-overlay)] hover:border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium tracking-wide"
              >
                View Our Work
              </motion.button>
            </motion.div>

            {/* Stats - Redesigned */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-[var(--border-subtle)]"
            >
              <div className="space-y-1">
                <div className="display-medium text-[var(--text-primary)]">150+</div>
                <div className="text-sm text-[var(--text-muted)] font-medium uppercase tracking-wider">Projects</div>
              </div>
              <div className="space-y-1">
                <div className="display-medium text-[var(--text-primary)]">100+</div>
                <div className="text-sm text-[var(--text-muted)] font-medium uppercase tracking-wider">Clients</div>
              </div>
              <div className="space-y-1">
                <div className="display-medium text-[var(--text-primary)]">8+</div>
                <div className="text-sm text-[var(--text-muted)] font-medium uppercase tracking-wider">Years</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - 3D Spline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative h-[360px] sm:h-[500px] lg:h-[750px] w-full flex items-center justify-center lg:translate-x-10"
          >
            {/* Transparent card wrapper that hosts the Spline so white spheres blend with background */}
            <div
              className="relative w-full h-full rounded-[2.5rem] overflow-hidden"
              style={{
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
              }}
            >
              {/* Spline scene */}
              <div className="w-full h-full relative z-10" style={{ filter: 'saturate(1.15) brightness(0.96)' }}>
                <Spline
                  scene="https://prod.spline.design/NbVmy6DPLhY-5Lvg/scene.splinecode"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Scroll</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-6 h-10 border border-[var(--border-subtle)] rounded-full flex justify-center pt-2 backdrop-blur-sm"
        >
          <div className="w-1 h-2 bg-[var(--text-primary)]/60 rounded-full"></div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;

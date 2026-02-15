import React from 'react';
import { motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import { ArrowRight, Sparkles } from 'lucide-react';

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
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ paddingTop: '80px', background: '#000000' }}
    >
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 grid-pattern opacity-30"></div>

      <div className="container mx-auto px-4 md:px-8 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass"
            >
              <Sparkles size={18} style={{ color: 'var(--brand-primary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Premium Digital Solutions
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="display-huge leading-tight"
            >
              Transform Your
              <br />
              <span style={{ color: 'var(--brand-primary)' }}>Digital Vision</span>
              <br />
              Into Reality
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="body-large max-w-xl"
              style={{ color: 'var(--text-secondary)' }}
            >
              We craft stunning, high-performance websites and custom web applications
              that elevate your brand and drive business growth. From concept to launch,
              we deliver excellence.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                onClick={scrollToContact}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary magnetic-btn"
              >
                Start Your Project
                <ArrowRight size={20} />
              </motion.button>

              <motion.button
                onClick={scrollToPortfolio}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary magnetic-btn"
              >
                View Our Work
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-8 pt-8"
            >
              <div>
                <div className="display-medium" style={{ color: 'var(--brand-primary)' }}>
                  150+
                </div>
                <div className="body-small" style={{ color: 'var(--text-muted)' }}>
                  Projects
                </div>
              </div>
              <div>
                <div className="display-medium" style={{ color: 'var(--brand-primary)' }}>
                  100+
                </div>
                <div className="body-small" style={{ color: 'var(--text-muted)' }}>
                  Clients
                </div>
              </div>
              <div>
                <div className="display-medium" style={{ color: 'var(--brand-primary)' }}>
                  8+
                </div>
                <div className="body-small" style={{ color: 'var(--text-muted)' }}>
                  Years
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - 3D Spline */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[600px] lg:h-[700px] w-full flex items-center justify-center"
          >
            <div className="w-full h-full relative" style={{ overflow: 'visible' }}>
              <Spline
                scene="https://prod.spline.design/NbVmy6DPLhY-5Lvg/scene.splinecode"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-white/60 rounded-full"></div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;

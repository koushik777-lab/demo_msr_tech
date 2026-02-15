import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, TrendingUp, Zap, Wrench, Award, Clock } from 'lucide-react';
import { whyChooseUs } from '../data/mock';

const iconMap = {
  Sparkles,
  TrendingUp,
  Zap,
  Wrench,
  Award,
  Clock
};

const WhyChooseUs = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <section
      id="why-us"
      ref={ref}
      className="relative py-32 overflow-hidden"
      style={{ background: '#000000', padding: '160px 7.6923%' }}
    >
      {/* Grid Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-20"></div>

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-2 rounded-full glass mb-6"
          >
            <span className="text-sm" style={{ color: 'var(--brand-primary)' }}>
              Why Partner With Us
            </span>
          </motion.div>

          <h2 className="display-large mb-6">Why Choose MSRTECH</h2>
          <p className="body-large max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            We don't just build websites. We craft digital experiences that
            transform businesses and captivate audiences.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {whyChooseUs.map((feature, index) => {
            const IconComponent = iconMap[feature.icon];
            
            return (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="p-8 cursor-pointer group relative"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.4s ease-in-out'
                }}
              >
                {/* Glow Effect on Hover */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)]/10 to-transparent pointer-events-none"
                ></motion.div>

                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="mb-6"
                >
                  <IconComponent size={40} style={{ color: 'var(--brand-primary)' }} />
                </motion.div>

                {/* Content */}
                <h3 className="heading-3 mb-4 group-hover:text-[var(--brand-primary)] transition-colors">
                  {feature.title}
                </h3>
                <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>

                {/* Number Badge */}
                <div
                  className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{
                    background: 'rgba(0, 255, 209, 0.1)',
                    color: 'var(--brand-primary)',
                    border: '1px solid rgba(0, 255, 209, 0.3)'
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-20 text-center p-12 glass"
          style={{
            background: 'rgba(0, 255, 209, 0.05)',
            border: '1px solid rgba(0, 255, 209, 0.2)'
          }}
        >
          <h3 className="display-medium mb-6">Ready to Elevate Your Digital Presence?</h3>
          <p className="body-large mb-8 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Let's transform your vision into a stunning digital reality.
            Our team is ready to bring your ideas to life.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary magnetic-btn"
          >
            Get Started Today
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

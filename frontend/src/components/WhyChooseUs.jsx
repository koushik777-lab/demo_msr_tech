import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, TrendingUp, Zap, Wrench, Award, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { whyChooseUs } from '../data/mock';
import TiltCard from '../builder/components/landing/TiltCard';

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
    hidden: { opacity: 0, scale: 0.92, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <section
      id="why-us"
      ref={ref}
      className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-12 overflow-hidden"
      style={{ background: 'var(--bg-primary, #090d16)' }}
    >
      {/* Background Accent Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[150px]" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[140px]" />
      </div>

      <div className="container mx-auto relative z-10 max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 border border-teal-500/30 bg-teal-500/10 backdrop-blur-md"
          >
            <ShieldCheck size={16} className="text-[var(--brand-primary)]" />
            <span className="text-xs md:text-sm font-bold tracking-wider uppercase text-[var(--brand-primary)]">
              Why Partner With Us
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-[var(--text-primary)]">
            Engineering <span className="bg-gradient-to-r from-[var(--brand-primary)] via-sky-400 to-indigo-400 bg-clip-text text-transparent">Digital Excellence</span>
          </h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-[var(--text-secondary)] leading-relaxed">
            We don't just write code — we design scalable digital experiences that transform businesses, delight users, and drive long-term commercial success.
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
            const IconComponent = iconMap[feature.icon] || Sparkles;
            
            return (
              <motion.div key={feature.id} variants={itemVariants}>
                <TiltCard maxTilt={8} className="h-full rounded-2xl">
                  <div
                    className="group relative h-full p-8 md:p-9 rounded-2xl flex flex-col justify-between overflow-hidden transition-all duration-500"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
                    }}
                  >
                    {/* Glow Highlight */}
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Step Index Badge */}
                    <div className="absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-bold tracking-widest text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30">
                      0{index + 1}
                    </div>

                    <div>
                      {/* Icon Container */}
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 relative transition-transform duration-500 group-hover:scale-110"
                        style={{
                          background: 'linear-gradient(135deg, rgba(13,148,136,0.2) 0%, rgba(37,99,235,0.1) 100%)',
                          border: '1.5px solid rgba(13,148,136,0.3)',
                          boxShadow: '0 8px 24px rgba(13,148,136,0.15)'
                        }}
                      >
                        <IconComponent size={28} className="text-[var(--brand-primary)] transition-transform duration-500 group-hover:rotate-12" />
                      </div>

                      {/* Content */}
                      <h3 className="text-2xl font-bold mb-3 text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Next-Level Bottom Glass CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-20 relative rounded-3xl p-10 md:p-14 text-center overflow-hidden border border-teal-500/30"
          style={{
            background: 'linear-gradient(135deg, rgba(13,148,136,0.15) 0%, rgba(15,23,42,0.8) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
        >
          <h3 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-4 tracking-tight">
            Ready to Elevate Your Digital Presence?
          </h3>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-8 leading-relaxed">
            Let's transform your vision into a high-converting digital reality. Our engineering team is ready to build your custom platform.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-10 py-4 rounded-full font-bold text-base text-white shadow-xl inline-flex items-center gap-3 transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--brand-primary, #0d9488), #2563eb)',
              boxShadow: '0 10px 30px rgba(13,148,136,0.4)'
            }}
          >
            <span>Get Started Today</span>
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

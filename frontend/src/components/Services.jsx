import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Globe, Database, ShoppingCart, Code2, Palette, Settings, Sparkles, ArrowRight } from 'lucide-react';
import { services } from '../data/mock';
import TiltCard from '../builder/components/landing/TiltCard';

const iconMap = {
  Globe,
  Database,
  ShoppingCart,
  Code2,
  Palette,
  Settings
};

const Services = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <section
      id="services"
      ref={ref}
      className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-12 overflow-hidden"
      style={{ background: 'var(--bg-primary, #090d16)' }}
    >
      {/* Dynamic Animated Glow Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-teal-500/10 blur-[130px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-600/10 blur-[130px]" />
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 border border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/10 backdrop-blur-md"
          >
            <Sparkles size={16} className="text-[var(--brand-primary)] animate-pulse" />
            <span className="text-xs md:text-sm font-bold tracking-wider uppercase text-[var(--brand-primary)]">
              What We Offer
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-[var(--text-primary)]">
            High-Impact <span className="bg-gradient-to-r from-[var(--brand-primary)] via-teal-400 to-sky-400 bg-clip-text text-transparent">Digital Services</span>
          </h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-[var(--text-secondary)] leading-relaxed">
            Comprehensive digital solutions engineered for growth. From sleek informational sites to complex scalable web systems, we craft every line of code for maximum impact.
          </p>
        </motion.div>

        {/* Services Grid with 3D Tilt Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service) => {
            const IconComponent = iconMap[service.icon] || Globe;
            
            return (
              <motion.div key={service.id} variants={itemVariants}>
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
                    {/* Hover Glow Highlight */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)]/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div>
                      {/* Icon Box */}
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 relative transition-transform duration-500 group-hover:scale-110"
                        style={{
                          background: 'linear-gradient(135deg, rgba(13,148,136,0.2) 0%, rgba(37,99,235,0.1) 100%)',
                          border: '1.5px solid rgba(13,148,136,0.3)',
                          boxShadow: '0 8px 24px rgba(13,148,136,0.15)'
                        }}
                      >
                        <IconComponent size={30} className="text-[var(--brand-primary)] transition-transform duration-500 group-hover:rotate-12" />
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-2xl font-bold mb-4 text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors duration-300">
                        {service.title}
                      </h3>
                      <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-6">
                        {service.description}
                      </p>
                    </div>

                    {/* Learn More Action Footer */}
                    <div className="pt-6 border-t border-white/10 flex items-center justify-between text-sm font-semibold text-[var(--brand-primary)] group-hover:translate-x-1 transition-transform duration-300">
                      <span>Explore Service</span>
                      <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-20"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-10 py-4 rounded-full font-bold text-base text-white shadow-xl flex items-center gap-3 mx-auto transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--brand-primary, #0d9488), #2563eb)',
              boxShadow: '0 10px 30px rgba(13,148,136,0.35)'
            }}
          >
            <span>Discuss Your Custom Project</span>
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;

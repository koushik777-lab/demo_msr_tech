import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Globe, Database, ShoppingCart, Code2, Palette, Settings } from 'lucide-react';
import { services } from '../data/mock';

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
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <section
      id="services"
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
              What We Offer
            </span>
          </motion.div>

          <h2 className="display-large mb-6">Our Services</h2>
          <p className="body-large max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Comprehensive digital solutions tailored to your business needs.
            From simple websites to complex applications, we've got you covered.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon];
            
            return (
              <motion.div
                key={service.id}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="glass p-8 card-hover cursor-pointer group"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.4s ease-in-out'
                }}
              >
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 rounded-lg flex items-center justify-center mb-6"
                  style={{
                    background: 'rgba(0, 255, 209, 0.1)',
                    border: '1px solid var(--brand-primary)'
                  }}
                >
                  <IconComponent size={32} style={{ color: 'var(--brand-primary)' }} />
                </motion.div>

                {/* Content */}
                <h3 className="heading-2 mb-4 group-hover:text-[var(--brand-primary)] transition-colors">
                  {service.title}
                </h3>
                <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>
                  {service.description}
                </p>

                {/* Hover Effect Line */}
                <motion.div
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.4 }}
                  className="h-0.5 mt-6"
                  style={{ background: 'var(--brand-primary)' }}
                ></motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary magnetic-btn"
          >
            Discuss Your Project
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;

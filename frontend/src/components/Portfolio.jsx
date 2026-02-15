import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import { portfolio } from '../data/mock';

const Portfolio = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hoveredId, setHoveredId] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <section
      id="portfolio"
      ref={ref}
      className="relative py-32 overflow-hidden"
      style={{ background: '#121212', padding: '160px 7.6923%' }}
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
              Our Work
            </span>
          </motion.div>

          <h2 className="display-large mb-6">Featured Projects</h2>
          <p className="body-large max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Showcasing our passion for creating exceptional digital experiences
            that drive real business results.
          </p>
        </motion.div>

        {/* Portfolio Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {portfolio.map((project) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              onHoverStart={() => setHoveredId(project.id)}
              onHoverEnd={() => setHoveredId(null)}
              className="group cursor-pointer relative overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.4s ease-in-out'
              }}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <motion.img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  animate={{
                    scale: hoveredId === project.id ? 1.1 : 1
                  }}
                  transition={{ duration: 0.4 }}
                />
                
                {/* Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredId === project.id ? 1 : 0 }}
                  className="absolute inset-0 bg-black/70 flex items-center justify-center gap-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
                  >
                    <ExternalLink size={20} style={{ color: 'var(--brand-primary)' }} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
                  >
                    <Github size={20} style={{ color: 'var(--brand-primary)' }} />
                  </motion.button>
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-sm mb-2" style={{ color: 'var(--brand-primary)' }}>
                  {project.category}
                </div>
                <h3 className="heading-3 mb-3 group-hover:text-[var(--brand-primary)] transition-colors">
                  {project.title}
                </h3>
                <p className="body-small mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs rounded-full"
                      style={{
                        background: 'rgba(0, 255, 209, 0.1)',
                        color: 'var(--brand-primary)',
                        border: '1px solid rgba(0, 255, 209, 0.3)'
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View More CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-16"
        >
          <p className="body-medium mb-6" style={{ color: 'var(--text-secondary)' }}>
            Want to see more? Let's discuss how we can bring your vision to life.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary magnetic-btn"
          >
            Start Your Project
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Portfolio;

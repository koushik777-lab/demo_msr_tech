import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ExternalLink, Sparkles } from 'lucide-react';
import { portfolio } from '../data/mock';

const categories = ["All", "E-Commerce", "Information Sites", "Web Applications"];

const Portfolio = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeTab, setActiveTab] = useState("All");
  const [hoveredId, setHoveredId] = useState(null);

  const filteredProjects = activeTab === "All"
    ? portfolio
    : portfolio.filter(item => item.category === activeTab);

  return (
    <section
      id="portfolio"
      ref={ref}
      className="relative py-20 md:py-28 lg:py-32 px-4 sm:px-6 lg:px-12"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 bg-white/5 border border-white/10">
            <Sparkles size={16} style={{ color: 'var(--brand-primary)' }} />
            <span className="body-small font-semibold tracking-wider uppercase text-white/90">
              Our Featured Projects
            </span>
          </div>
          <h2 className="heading-1 mb-4">
            Recent <span className="gradient-text">Work & Case Studies</span>
          </h2>
          <p className="body-large max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Explore live commercial platforms and web systems crafted for businesses scaling globally.
          </p>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-8">
            {categories.map((cat) => {
              const isActive = activeTab === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`relative px-5 py-2.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-black font-semibold shadow-[0_0_20px_rgba(0,255,209,0.35)]'
                      : 'text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--brand-primary)' : undefined
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Portfolio Grid with AnimatePresence */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -8 }}
                onHoverStart={() => setHoveredId(project.id)}
                onHoverEnd={() => setHoveredId(null)}
                onClick={() => {
                  if (project.link && project.link !== '#') {
                    if (project.link.startsWith('http')) {
                      window.open(project.link, '_blank', 'noopener,noreferrer');
                    } else {
                      navigate(project.link);
                    }
                  }
                }}
                className="group cursor-pointer relative overflow-hidden flex flex-col rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: hoveredId === project.id ? '0 10px 30px rgba(0, 255, 209, 0.15)' : 'none',
                  borderColor: hoveredId === project.id ? 'var(--brand-primary)' : 'rgba(255, 255, 255, 0.08)',
                  transition: 'box-shadow 0.3s ease, border-color 0.3s ease'
                }}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-black/40">
                  <motion.img
                    src={project.image}
                    alt={`${project.title} - ${project.category}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    animate={{
                      scale: hoveredId === project.id ? 1.05 : 1
                    }}
                    transition={{ duration: 0.4 }}
                  />

                  {/* Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredId === project.id ? 1 : 0 }}
                    className="absolute inset-0 bg-black/75 flex items-center justify-center p-4"
                  >
                    {project.link && project.link !== '#' ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (project.link.startsWith('http')) {
                            window.open(project.link, '_blank', 'noopener,noreferrer');
                          } else {
                            navigate(project.link);
                          }
                        }}
                        className="px-5 py-2.5 bg-[var(--brand-primary)] text-black font-semibold rounded-lg flex items-center gap-2 shadow-lg text-sm"
                      >
                        <span>{project.link.startsWith('http') ? 'View Live Site' : 'Open in Builder'}</span>
                        <ExternalLink size={15} />
                      </motion.button>
                    ) : (
                      <div className="px-4 py-2 bg-white/10 text-white rounded-lg text-xs tracking-wide">
                        Enterprise Internal App
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--brand-primary)' }}>
                      {project.category}
                    </div>
                    <h3 className="heading-3 mb-2 group-hover:text-[var(--brand-primary)] transition-colors flex items-center justify-between">
                      <span>{project.title}</span>
                      {project.link && project.link !== '#' && (
                        <ExternalLink size={16} className="text-white/40 group-hover:text-[var(--brand-primary)] transition-colors" />
                      )}
                    </h3>
                    <p className="body-small mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {project.description}
                    </p>
                  </div>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="text-[11px] px-2.5 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-muted)'
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Portfolio;

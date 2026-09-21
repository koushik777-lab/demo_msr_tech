import React, { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, MessageSquareQuote } from 'lucide-react';
import { testimonials } from '../data/mock';

const Testimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section
      id="testimonials"
      ref={ref}
      className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-12 overflow-hidden"
      style={{ background: 'var(--bg-secondary, #0f172a)' }}
    >
      {/* Glow Orbs Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-teal-500/10 blur-[160px]" />
      </div>

      <div className="container mx-auto relative z-10 max-w-5xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 border border-teal-500/30 bg-teal-500/10 backdrop-blur-md"
          >
            <MessageSquareQuote size={16} className="text-[var(--brand-primary)]" />
            <span className="text-xs md:text-sm font-bold tracking-wider uppercase text-[var(--brand-primary)]">
              Client Success Stories
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-[var(--text-primary)]">
            What Our <span className="bg-gradient-to-r from-[var(--brand-primary)] via-sky-400 to-indigo-400 bg-clip-text text-transparent">Clients Say</span>
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-[var(--text-secondary)] leading-relaxed">
            Real feedback from business leaders and founders scaling global platforms with MSR TECH HUB.
          </p>
        </motion.div>

        {/* Testimonials Carousel Box */}
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Glass Card */}
            <div
              className="p-10 md:p-14 relative rounded-3xl overflow-hidden shadow-2xl border border-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
              }}
            >
              {/* Background Quote Watermark */}
              <div className="absolute top-6 left-8 opacity-10 pointer-events-none">
                <Quote size={100} className="text-[var(--brand-primary)]" />
              </div>

              <div className="relative z-10 text-center">
                {/* Rating Stars */}
                <div className="flex gap-1.5 mb-8 justify-center">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <Star size={22} className="fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                    </motion.div>
                  ))}
                </div>

                {/* Animated Text */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35 }}
                    className="text-xl md:text-2xl font-medium text-[var(--text-primary)] leading-relaxed italic mb-10 min-h-[100px] flex items-center justify-center"
                  >
                    "{testimonials[currentIndex].text}"
                  </motion.p>
                </AnimatePresence>

                {/* Animated Client Profile */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`client-${currentIndex}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-4"
                  >
                    <div className="relative">
                      <img
                        src={testimonials[currentIndex].image}
                        alt={`${testimonials[currentIndex].name} - ${testimonials[currentIndex].company}`}
                        loading="lazy"
                        className="w-16 h-16 rounded-full object-cover border-2 border-[var(--brand-primary)] shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--brand-primary)] flex items-center justify-center text-xs text-black font-bold">
                        ✓
                      </div>
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-lg font-bold text-[var(--text-primary)]">
                        {testimonials[currentIndex].name}
                      </div>
                      <div className="text-sm text-[var(--text-muted)] font-medium">
                        {testimonials[currentIndex].position} · <span className="text-[var(--brand-primary)] font-semibold">{testimonials[currentIndex].company}</span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between mt-8">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-md text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all"
              >
                <ChevronLeft size={22} />
              </motion.button>

              {/* Step Pill Indicators */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className="h-2.5 rounded-full transition-all duration-300"
                    style={{
                      background: index === currentIndex ? 'var(--brand-primary, #0d9488)' : 'rgba(255,255,255,0.2)',
                      width: index === currentIndex ? '32px' : '10px'
                    }}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-md text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all"
              >
                <ChevronRight size={22} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
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
              Client Success Stories
            </span>
          </motion.div>

          <h2 className="display-large mb-6">What Our Clients Say</h2>
          <p className="body-large max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Don't just take our word for it. Here's what our clients have to say
            about working with MSRTECH.
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Main Testimonial Card */}
            <div
              className="p-12 relative overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Quote Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="absolute top-8 left-8 opacity-10"
              >
                <Quote size={80} style={{ color: 'var(--brand-primary)' }} />
              </motion.div>

              <div className="relative z-10">
                {/* Stars */}
                <div className="flex gap-1 mb-6 justify-center">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Star size={24} fill="var(--brand-primary)" color="var(--brand-primary)" />
                    </motion.div>
                  ))}
                </div>

                {/* Testimonial Text */}
                <motion.p
                  key={currentIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="body-large text-center mb-8"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  "{testimonials[currentIndex].text}"
                </motion.p>

                {/* Client Info */}
                <motion.div
                  key={`client-${currentIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex items-center justify-center gap-4"
                >
                  <img
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].name}
                    className="w-16 h-16 rounded-full object-cover border-2"
                    style={{ borderColor: 'var(--brand-primary)' }}
                  />
                  <div className="text-left">
                    <div className="heading-3">{testimonials[currentIndex].name}</div>
                    <div className="body-small" style={{ color: 'var(--text-muted)' }}>
                      {testimonials[currentIndex].position}
                    </div>
                    <div className="body-small" style={{ color: 'var(--brand-primary)' }}>
                      {testimonials[currentIndex].company}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <ChevronLeft size={24} style={{ color: 'var(--brand-primary)' }} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <ChevronRight size={24} style={{ color: 'var(--brand-primary)' }} />
              </motion.button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setCurrentIndex(index)}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    background: index === currentIndex ? 'var(--brand-primary)' : 'rgba(255, 255, 255, 0.3)',
                    width: index === currentIndex ? '24px' : '8px'
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

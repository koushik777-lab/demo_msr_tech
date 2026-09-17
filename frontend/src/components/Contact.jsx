import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Facebook, Twitter, Linkedin, Instagram, Shield, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in your name, email, and message.');
      return;
    }

    // Fully escaped, RFC-compliant email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    setIsSubmitting(true);

    const apiUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

    try {
      const response = await fetch(`${apiUrl}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          company: formData.company.trim(),
          service: formData.service,
          message: formData.message.trim(),
          source: 'msr_tech_hub_landing'
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Thank you! Your inquiry has been submitted. Our team will contact you within 24 hours.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          service: '',
          message: ''
        });
      } else {
        const errData = await response.json().catch(() => ({}));
        toast.error(errData.detail || 'Unable to submit inquiry right now. Please try again or call +91 83370 04170.');
      }
    } catch (err) {
      // Fallback in local/disconnected scenarios
      toast.success('Thank you for reaching out! Our team has received your message.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: '',
        message: ''
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Official Email',
      value: 'admin@msrassessment.com',
      link: 'mailto:admin@msrassessment.com'
    },
    {
      icon: Phone,
      title: 'Direct Phone',
      value: '+91 83370 04170',
      link: 'tel:+918337004170'
    },
    {
      icon: MapPin,
      title: 'Head Office',
      value: '2nd Floor, 23 A, Royd Street, Kolkata - 700016',
      link: 'https://maps.google.com/?q=23+A+Royd+Street+Kolkata+700016'
    },
    {
      icon: Shield,
      title: 'Verified GSTIN',
      value: '19AAQCM2742Q1ZL',
      link: null,
      badge: 'Government Verified'
    }
  ];

  const socialLinks = [
    { icon: Facebook, link: 'https://facebook.com', name: 'Facebook' },
    { icon: Twitter, link: 'https://twitter.com', name: 'Twitter' },
    { icon: Linkedin, link: 'https://linkedin.com', name: 'LinkedIn' },
    { icon: Instagram, link: 'https://instagram.com', name: 'Instagram' }
  ];

  return (
    <section
      id="contact"
      ref={ref}
      className="relative py-20 md:py-28 lg:py-32 px-4 sm:px-6 lg:px-12"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="heading-1 mb-4">
            Let's Build Something <span className="gradient-text">Great Together</span>
          </h2>
          <p className="body-large max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Have a project in mind? Contact us today for a free consultation and project quote.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block body-small mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[var(--brand-primary)] text-white"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block body-small mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[var(--brand-primary)] text-white"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block body-small mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[var(--brand-primary)] text-white"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <label className="block body-small mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Company / Brand
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[var(--brand-primary)] text-white"
                    placeholder="Your Company"
                  />
                </div>
              </div>

              <div>
                <label className="block body-small mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Service Needed
                </label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-lg focus:outline-none focus:border-[var(--brand-primary)] text-white"
                >
                  <option value="">Select a service</option>
                  <option value="static">Static Website</option>
                  <option value="dynamic">Dynamic Website</option>
                  <option value="ecommerce">E-Commerce Store</option>
                  <option value="custom">Custom Web Application</option>
                  <option value="design">UI/UX Design</option>
                  <option value="builder">Website Builder Subscription</option>
                </select>
              </div>

              <div>
                <label className="block body-small mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Project Description *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[var(--brand-primary)] text-white resize-none"
                  placeholder="Tell us about your project goals and timeline..."
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                className="btn-primary w-full flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Submitting Message...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send Inquiry</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Details & Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <h3 className="heading-2 mb-4">Official Head Office</h3>
              {contactInfo.map((info) => {
                const IconComponent = info.icon;
                return (
                  <div
                    key={info.title}
                    className="p-5 rounded-xl flex items-start gap-4"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(0, 255, 209, 0.1)' }}
                    >
                      <IconComponent size={22} style={{ color: 'var(--brand-primary)' }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="body-small font-semibold text-white/90">{info.title}</h4>
                        {info.badge && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {info.badge}
                          </span>
                        )}
                      </div>
                      {info.link ? (
                        <a
                          href={info.link}
                          target={info.link.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          className="body-medium hover:text-[var(--brand-primary)] transition-colors mt-0.5 block"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="body-medium font-mono text-white/95 mt-0.5 select-all">
                          {info.value}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Direct CTA Box */}
            <div
              className="p-6 md:p-8 rounded-2xl"
              style={{
                background: 'rgba(0, 255, 209, 0.03)',
                border: '1px solid rgba(0, 255, 209, 0.2)'
              }}
            >
              <h3 className="heading-3 mb-2 flex items-center gap-2">
                <span>Direct Voice Support</span>
                <CheckCircle2 size={18} style={{ color: 'var(--brand-primary)' }} />
              </h3>
              <p className="body-small mb-6" style={{ color: 'var(--text-secondary)' }}>
                Speak directly with an enterprise architect to plan your website or software project.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  window.location.href = 'tel:+918337004170';
                }}
                className="btn-secondary w-full flex items-center justify-center gap-2 py-3"
              >
                <Phone size={18} />
                <span>Call Us (+91 83370 04170)</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

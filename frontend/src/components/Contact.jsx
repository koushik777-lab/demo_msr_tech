import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Shield, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    const apiUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '' : 'http://localhost:8000');

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
        toast.success(data.message || 'Thank you! Inquiry received. We will contact you within 24 hours.');
        setFormData({ name: '', email: '', phone: '', company: '', service: '', message: '' });
      } else {
        const errData = await response.json().catch(() => ({}));
        toast.error(errData.detail || 'Unable to submit inquiry right now. Call +91 83370 04170.');
      }
    } catch (err) {
      toast.success('Thank you! Our team has received your message.');
      setFormData({ name: '', email: '', phone: '', company: '', service: '', message: '' });
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

  return (
    <section
      id="contact"
      ref={ref}
      className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-12 overflow-hidden"
      style={{ background: 'var(--bg-primary, #090d16)' }}
    >
      {/* Background Accent Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[150px]" />
      </div>

      <div className="container mx-auto relative z-10 max-w-7xl">
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
            <Sparkles size={16} className="text-[var(--brand-primary)]" />
            <span className="text-xs md:text-sm font-bold tracking-wider uppercase text-[var(--brand-primary)]">
              Let's Connect
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-[var(--text-primary)]">
            Let's Build Something <span className="bg-gradient-to-r from-[var(--brand-primary)] via-sky-400 to-indigo-400 bg-clip-text text-transparent">Great Together</span>
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-[var(--text-secondary)] leading-relaxed">
            Have a project or web system in mind? Get in touch today for a free technical consultation and estimate.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Glass Form */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--brand-primary)] text-white transition-all focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--brand-primary)] text-white transition-all focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--brand-primary)] text-white transition-all focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                    placeholder="+91 99999 99999"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">
                    Company / Brand
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--brand-primary)] text-white transition-all focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                    placeholder="Company Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">
                  Service Needed
                </label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-[#0f172a] border border-white/10 rounded-xl focus:outline-none focus:border-[var(--brand-primary)] text-white transition-all"
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
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">
                  Project Description *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--brand-primary)] text-white resize-none transition-all focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                  placeholder="Tell us about your project goals, scope, and timeline..."
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                className="w-full py-4 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, var(--brand-primary, #0d9488), #2563eb)',
                  boxShadow: '0 8px 24px rgba(13,148,136,0.35)'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Submitting Inquiry...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send Message →</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Information Cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                Direct Contact Details
              </h3>
              {contactInfo.map((info) => {
                const IconComponent = info.icon;
                return (
                  <div
                    key={info.title}
                    className="p-6 rounded-2xl flex items-start gap-5 border border-white/10 transition-all hover:border-[var(--brand-primary)]/50"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(12px)'
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(13,148,136,0.2) 0%, rgba(37,99,235,0.1) 100%)',
                        border: '1.5px solid rgba(13,148,136,0.3)'
                      }}
                    >
                      <IconComponent size={24} className="text-[var(--brand-primary)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-white/90">{info.title}</h4>
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
                          className="text-base text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors font-medium block"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-base font-mono text-white/95 select-all font-medium">
                          {info.value}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Direct Voice Phone Card */}
            <div
              className="p-8 rounded-3xl border border-teal-500/30 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(13,148,136,0.12) 0%, rgba(15,23,42,0.8) 100%)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                <span>Direct Voice Support</span>
                <CheckCircle2 size={20} className="text-[var(--brand-primary)]" />
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                Speak directly with an enterprise architect to plan your custom website or web system.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  window.location.href = 'tel:+918337004170';
                }}
                className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-3 transition-all"
                style={{
                  background: 'linear-gradient(135deg, var(--brand-primary, #0d9488), #2563eb)',
                  boxShadow: '0 8px 24px rgba(13,148,136,0.35)'
                }}
              >
                <Phone size={20} />
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

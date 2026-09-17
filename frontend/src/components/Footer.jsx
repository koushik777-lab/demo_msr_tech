import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Mail, Phone, MapPin, Shield } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerSections = [
    {
      title: 'Services',
      links: [
        { name: 'Static Websites', href: '#services' },
        { name: 'Dynamic Websites', href: '#services' },
        { name: 'E-Commerce Solutions', href: '#services' },
        { name: 'Custom Web Apps', href: '#services' },
        { name: 'UI/UX Design', href: '#services' },
        { name: 'Maintenance & Support', href: '#services' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '#why-us' },
        { name: 'Featured Work', href: '#portfolio' },
        { name: 'Client Reviews', href: '#testimonials' },
        { name: 'Get In Touch', href: '#contact' }
      ]
    },
    {
      title: 'Builder App',
      links: [
        { name: 'Website Builder', href: '/builder' },
        { name: 'Choose Template', href: '/builder/templates' },
        { name: 'Billing & Plans', href: '/builder/billing' }
      ]
    }
  ];

  return (
    <footer
      className="relative pt-20 pb-8 border-t border-white/10"
      style={{ background: '#070709' }}
    >
      <div className="container mx-auto px-6 lg:px-16 relative">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="absolute -top-6 right-8 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: 'var(--brand-primary)', color: '#000000' }}
          aria-label="Scroll to top"
        >
          <ArrowUp size={22} />
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="MSR TECH HUB Logo" className="h-12 w-auto object-contain" />
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--brand-primary)' }}>
                MSR TECH HUB
              </h3>
            </div>
            <p className="body-medium mb-5 max-w-sm text-white/70">
              Transforming modern businesses with high-converting web applications, scalable e-commerce, and enterprise architectures.
            </p>
            <div className="space-y-2 mb-6 text-xs md:text-sm text-white/75 max-w-sm">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-[var(--brand-primary)] flex-shrink-0" />
                <span>2nd Floor, 23 A, Royd Street, Kolkata, WB 700016</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-[var(--brand-primary)] flex-shrink-0" />
                <span>GSTIN: <strong>19AAQCM2742Q1ZL</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-[var(--brand-primary)] flex-shrink-0" />
                <a href="tel:+918337004170" className="hover:underline text-white/90">+91 83370 04170</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[var(--brand-primary)] flex-shrink-0" />
                <a href="mailto:admin@msrassessment.com" className="hover:underline text-white/90">admin@msrassessment.com</a>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary"
            >
              Let's Talk
            </motion.button>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="heading-3 mb-5 text-white/90">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        if (link.href.startsWith('#')) {
                          e.preventDefault();
                          document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="text-xs md:text-sm text-white/60 hover:text-[var(--brand-primary)] transition-colors cursor-pointer block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} MSR TECH HUB. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/50">
            <span>Enterprise Quality Guaranteed</span>
            <span>•</span>
            <span>ISO Compliant Protocols</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

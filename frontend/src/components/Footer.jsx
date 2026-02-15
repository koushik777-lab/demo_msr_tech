import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    Services: [
      'Static Websites',
      'Dynamic Websites',
      'E-Commerce Solutions',
      'Web Applications',
      'UI/UX Design',
      'Maintenance & Support'
    ],
    Company: [
      'About Us',
      'Our Team',
      'Careers',
      'Blog',
      'Contact Us'
    ],
    Resources: [
      'Portfolio',
      'Case Studies',
      'Pricing',
      'FAQ',
      'Privacy Policy',
      'Terms of Service'
    ]
  };

  return (
    <footer
      className="relative pt-20 pb-8"
      style={{ background: '#000000', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
    >
      <div className="container mx-auto px-8 lg:px-16 relative">
        {/* Scroll to Top Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="absolute -top-6 right-8 w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: 'var(--brand-primary)',
            color: '#000000'
          }}
        >
          <ArrowUp size={24} />
        </motion.button>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-bold mb-4" style={{ color: 'var(--brand-primary)' }}>
              MSRTECH
            </h3>
            <p className="body-medium mb-6 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
              Transforming businesses through innovative digital solutions.
              We build websites and applications that drive growth and success.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary"
            >
              Let's Talk
            </motion.button>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="heading-3 mb-6">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      whileHover={{ x: 5 }}
                      className="body-medium hover:text-[var(--brand-primary)] transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="body-small" style={{ color: 'var(--text-muted)' }}>
            © 2025 MSRTECH. All rights reserved.
          </p>
          <p className="body-small flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            Made with <Heart size={16} fill="var(--brand-primary)" color="var(--brand-primary)" /> by MSRTECH Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

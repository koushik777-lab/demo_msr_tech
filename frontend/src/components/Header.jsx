import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Sun, Moon, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassSurface from './GlassSurface';

const Header = ({ theme, setTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Why Us', href: '#why-us' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' }
  ];

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ y: -100, x: "-50%" }}
        animate={{ y: 0, x: "-50%" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-6 left-1/2 z-50 w-[95%] max-w-5xl"
      >
        <GlassSurface
          borderRadius={40}
          borderWidth={0}
          opacity={0.7}
          brightness={105}
          blur={20}
          className="shadow-[0_10px_30px_rgba(0,0,0,0.06)] ring-1 ring-[var(--border-subtle)]"
          style={{
            boxShadow: `
              0 10px 30px rgba(0,0,0,0.05),
              inset 0 1px 0 0 rgba(255,255,255,0.8),
              inset 0 0 0 1px rgba(0,0,0,0.02)
            `
          }}
        >
          <div className="flex items-center justify-between w-full px-6 py-3">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer relative z-10 flex items-center gap-3"
              onClick={(e) => scrollToSection(e, '#home')}
            >
              <img src="/logo.png" alt="MSR TECH HUB Logo" className="h-10 w-auto object-contain drop-shadow-sm" />
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[var(--text-primary)] via-[var(--text-primary)]/80 to-[var(--text-primary)]/60 bg-clip-text text-transparent hidden sm:block">
                MSR TECH HUB
                <span className="text-[var(--brand-primary)] ml-1">•</span>
              </h1>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="relative px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-300 rounded-full hover:bg-[var(--bg-overlay)]"
                >
                  {link.name}
                </motion.a>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {setTheme && (
                <motion.button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] rounded-full transition-colors"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </motion.button>
              )}
              <motion.button
                onClick={() => navigate('/builder')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm font-semibold rounded-full transition-colors flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-active))', color: '#FFFFFF', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px var(--brand-hover)' }}
              >
                <Wand2 size={16} /> Website Builder
              </motion.button>
              <motion.a
                href="#contact"
                onClick={(e) => scrollToSection(e, '#contact')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 text-sm font-medium bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full hover:bg-[var(--text-secondary)] transition-colors shadow-[0_4px_15px_var(--bg-overlay)]"
              >
                Get Started
              </motion.a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-[var(--text-primary)] p-2 hover:bg-[var(--bg-overlay)] rounded-full transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </GlassSurface>
      </motion.div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="fixed top-24 left-4 right-4 z-40"
        >
          <GlassSurface borderRadius={24} opacity={0.9} blur={30}>
            <nav className="flex flex-col gap-2 p-4 w-full">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-center py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] rounded-xl transition-all font-medium text-lg"
                >
                  {link.name}
                </a>
              ))}
              {setTheme && (
                <button
                  onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setIsMenuOpen(false); }}
                  className="py-3 text-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] rounded-xl transition-all font-medium text-lg flex items-center justify-center gap-2"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun size={20} /> Light Mode
                    </>
                  ) : (
                    <>
                      <Moon size={20} /> Dark Mode
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => { navigate('/builder'); setIsMenuOpen(false); }}
                className="mt-2 py-3 text-center text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-active))', border: 'none', cursor: 'pointer' }}
              >
                <Wand2 size={18} /> Website Builder
              </button>
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, '#contact')}
                className="mt-2 py-3 text-center bg-[var(--text-primary)] text-[var(--bg-primary)] font-semibold rounded-xl text-center"
              >
                Get Started
              </a>
            </nav>
          </GlassSurface>
        </motion.div>
      )}
    </>
  );
};

export default Header;

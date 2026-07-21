import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import GlassSurface from './GlassSurface';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          opacity={0.6}
          brightness={105}
          blur={20}
          className="shadow-[0_20px_50px_rgba(0,0,0,0.5)] shadow-black/20 ring-1 ring-white/10"
          style={{
            boxShadow: `
              0 20px 40px rgba(0,0,0,0.4),
              inset 0 1px 0 0 rgba(255,255,255,0.3),
              inset 0 0 0 1px rgba(255,255,255,0.05)
            `
          }}
        >
          <div className="flex items-center justify-between w-full px-6 py-3">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer relative z-10"
            >
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent">
                MSR  TECH  HUB
                <span className="text-brand-primary ml-1.5">•</span>
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
                  className="relative px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors duration-300 rounded-full hover:bg-white/5"
                >
                  {link.name}
                </motion.a>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden md:block">
              <motion.a
                href="#contact"
                onClick={(e) => scrollToSection(e, '#contact')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Get Started
              </motion.a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white/90 p-2 hover:bg-white/10 rounded-full transition-colors"
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
          <GlassSurface borderRadius={24} opacity={0.8} blur={30}>
            <nav className="flex flex-col gap-2 p-4 w-full">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-center py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium text-lg"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, '#contact')}
                className="mt-2 py-3 text-center bg-white text-black font-semibold rounded-xl"
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

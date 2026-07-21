import React from 'react';
import { motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import { ArrowRight, Sparkles, Zap, Shield, Globe } from 'lucide-react';
import RotatingText from './RotatingText';

const Hero = () => {
  const scrollToContact = () => {
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPortfolio = () => {
    const element = document.querySelector('#portfolio');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ paddingTop: '80px', background: '#000000' }}
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 grid-pattern opacity-20"></div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-8 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-10"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass border border-white/10 hover:border-white/20 transition-colors"
            >
              <Sparkles size={18} className="text-yellow-400" />
              <span className="text-sm font-medium tracking-wide" style={{ color: 'rgba(255,255,255,0.9)' }}>
                Premium Digital Solutions
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="display-huge leading-tight"
            >
              Make Your
              <br />
              <div className="inline-flex items-center my-4 h-[80px] align-middle min-w-[350px]">
                <RotatingText
                  texts={[
                    "Information Sites",
                    "Business Websites",
                    "Landing Pages",
                    "Static Websites",
                    "Dynamic Websites",
                    "E-Commerce Sites",
                    "Web Applications"
                  ]}
                  animatePresenceInitial={true}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-120%", opacity: 0 }}
                  mainClassName="px-8 py-3 bg-[#00FFD1] text-red-600 font-black rounded-full shadow-[0_0_20px_rgba(0,255,209,0.4)] text-3xl md:text-5xl tracking-wide mx-2 overflow-hidden items-center justify-center"
                  elementLevelClassName="text-red-600"
                  staggerFrom="last"
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2000}
                  splitBy="characters"
                />
              </div>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="body-large max-w-xl text-gray-400"
            >
              We craft stunning, high-performance websites and custom web applications
              that elevate your brand and drive business growth. Experience the future of web design.
            </motion.p>

            {/* CTA Buttons - Premium Liqui Glass Design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-6"
            >
              <motion.button
                onClick={scrollToContact}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-full overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:border-white/40"
              >
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
                <div className="relative z-10 flex items-center gap-3 text-white font-medium tracking-wide">
                  <span>Start Your Project</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </motion.button>

              <motion.button
                onClick={scrollToPortfolio}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-transparent border border-white/10 rounded-full backdrop-blur-sm transition-all duration-300 hover:bg-white/5 hover:border-white/20 text-white/90 hover:text-white font-medium tracking-wide"
              >
                View Our Work
              </motion.button>
            </motion.div>

            {/* Stats - Redesigned */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10"
            >
              <div className="space-y-1">
                <div className="display-medium text-white">150+</div>
                <div className="text-sm text-gray-400 font-medium uppercase tracking-wider">Projects</div>
              </div>
              <div className="space-y-1">
                <div className="display-medium text-white">100+</div>
                <div className="text-sm text-gray-400 font-medium uppercase tracking-wider">Clients</div>
              </div>
              <div className="space-y-1">
                <div className="display-medium text-white">8+</div>
                <div className="text-sm text-gray-400 font-medium uppercase tracking-wider">Years</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - 3D Spline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative h-[600px] lg:h-[800px] w-full flex items-center justify-center lg:translate-x-10"
          >
            {/* Glow behind 3D element */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 blur-[100px] rounded-full"></div>

            <div className="w-full h-full relative z-10">
              <Spline
                scene="https://prod.spline.design/NbVmy6DPLhY-5Lvg/scene.splinecode"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Scroll</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-6 h-10 border border-white/20 rounded-full flex justify-center pt-2 backdrop-blur-sm"
        >
          <div className="w-1 h-2 bg-white/60 rounded-full"></div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;

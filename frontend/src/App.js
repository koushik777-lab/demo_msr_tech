import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { Toaster } from "./components/ui/sonner";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Portfolio from "./components/Portfolio";
import WhyChooseUs from "./components/WhyChooseUs";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import PricingSection from "./builder/components/landing/PricingSection";
import BuilderLanding from "./builder/pages/BuilderLanding";
import BuilderRouter from "./builder/BuilderRouter";

// ─── Existing Marketing Homepage ─────────────────────────────────────────────
function MarketingHome() {
  const [theme, setTheme] = useState(localStorage.getItem("landing-theme") || "light");

  useEffect(() => {
    document.documentElement.className = theme === "dark" ? "dark-theme" : "";
    localStorage.setItem("landing-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    const magneticButtons = document.querySelectorAll(".magnetic-btn");
    magneticButtons.forEach((button) => {
      button.addEventListener("mousemove", (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      button.addEventListener("mouseleave", () => {
        button.style.transform = "translate(0, 0)";
      });
    });
    return () => {
      magneticButtons.forEach((button) => {
        button.removeEventListener("mousemove", () => {});
        button.removeEventListener("mouseleave", () => {});
      });
    };
  }, []);

  return (
    <div className="App">
      <Toaster position="top-right" />
      <Header theme={theme} setTheme={setTheme} />
      <Hero />
      <Services />
      <Portfolio />
      <WhyChooseUs />
      <PricingSection />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}

// ─── Root Router ──────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Main MSR Tech Hub Marketing Homepage */}
        <Route path="/" element={<MarketingHome />} />

        {/* Website Builder module — all routes at /builder/* */}
        <Route path="/builder/*" element={<BuilderRouter />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  LineChart, 
  FlaskConical, 
  Search, 
  Info, 
  Leaf 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/", icon: <Home size={20} /> },
    { name: "Forecast", path: "/forecast", icon: <LineChart size={20} /> },
    { name: "Hypothesis", path: "/hypothesis", icon: <FlaskConical size={20} /> },
    { name: "Explore", path: "/explore", icon: <Search size={20} /> },
    { name: "About", path: "/about", icon: <Info size={20} /> },
  ];

  return (
    <div className="layout-container">
      <header className="main-header glass-card">
        <div className="logo">
          <Leaf className="logo-icon" size={32} />
          <span className="logo-text">Tea Analytics</span>
        </div>
        <nav className="main-nav">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`nav-link ${pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </header>
      
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      
      <footer className="main-footer">
        <p>© 2026 Sri Lankan Tea Research Portal. All Rights Reserved.</p>
      </footer>

      <style jsx>{`
        .layout-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .main-header {
          margin: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2.5rem;
          border-radius: 32px;
          position: sticky;
          top: 1.5rem;
          z-index: 1000;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-text {
          font-family: var(--font-header);
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, var(--primary), var(--primary-light));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .logo-icon {
          color: var(--primary);
        }
        .main-nav {
          display: flex;
          gap: 2.5rem;
        }
        .main-content {
          flex: 1;
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }
        .main-footer {
          text-align: center;
          padding: 3rem;
          color: #666;
          font-size: 0.9rem;
        }
        .nav-icon {
          margin-right: 8px;
          display: inline-flex;
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
}

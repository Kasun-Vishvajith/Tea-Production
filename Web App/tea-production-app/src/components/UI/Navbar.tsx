"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Live Map", href: "/" },
  { name: "Forecast", href: "/forecast" },
  { name: "Hypothesis", href: "/hypothesis" },
  { name: "Insights", href: "/insights" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] glass-nav">
      <div className="apple-container h-16 md:h-20 flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white font-extrabold text-xl shadow-[0_8px_16px_rgba(45,156,219,0.3)] group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
            C
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight leading-none text-foreground uppercase">CTI.26</span>
            <span className="text-[9px] font-black text-secondary tracking-widest uppercase opacity-40">Intelligence</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-bold transition-all relative py-1 uppercase tracking-widest ${
                  isActive ? "text-accent" : "text-secondary hover:text-foreground"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-1.5 left-0 right-0 h-1 bg-accent/40 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile Mini Menu */}
        <div className="md:hidden flex items-center gap-4">
           {navLinks.find(l => l.href === pathname) && (
             <span className="text-[10px] font-black text-accent uppercase tracking-widest bg-accent-muted px-3 py-1.5 rounded-lg ring-1 ring-accent/10">
               {navLinks.find(l => l.href === pathname)?.name}
             </span>
           )}
           <Link href="/forecast" className="text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 bg-accent text-white rounded-xl shadow-lg shadow-accent/20">
              Live Yield
           </Link>
        </div>
      </div>
    </nav>
  );
}

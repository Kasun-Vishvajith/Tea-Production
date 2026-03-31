"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMode } from "@/context/ModeContext";

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { mode, setMode, filters, setFilters } = useMode();

  return (
    <div className="fixed bottom-12 right-12 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-80 bg-white/90 backdrop-blur-xl border border-border rounded-[2rem] shadow-2xl p-8 space-y-8"
          >
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Control Center</span>
              <div className="flex bg-surface p-1.5 rounded-2xl border border-border">
                <button
                  onClick={() => setMode("simple")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    mode === "simple" ? "bg-white shadow-sm text-accent" : "text-secondary hover:text-foreground"
                  }`}
                >
                  Simple
                </button>
                <button
                  onClick={() => setMode("expert")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    mode === "expert" ? "bg-white shadow-sm text-accent" : "text-secondary hover:text-foreground"
                  }`}
                >
                  Expert
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary text-right block">Elevation Setting</span>
                <select
                  value={filters.elevation}
                  onChange={(e) => setFilters({ ...filters, elevation: e.target.value })}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 ring-accent/20 appearance-none cursor-pointer"
                >
                  <option value="all">Total Sri Lanka</option>
                  <option value="high">High Grown Zones</option>
                  <option value="medium">Medium Grown Zones</option>
                  <option value="low">Low Grown Zones</option>
                </select>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary text-right block">Market Category</span>
                <select
                  value={filters.teaType}
                  onChange={(e) => setFilters({ ...filters, teaType: e.target.value })}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 ring-accent/20 appearance-none cursor-pointer"
                >
                  <option value="all">Consolidated Types</option>
                  <option value="orthodox">Orthodox Method</option>
                  <option value="ctc">CTC Method</option>
                  <option value="green">Specialty Green</option>
                  <option value="specialty">Premium / White</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
               <p className="text-[9px] text-center text-secondary font-bold leading-relaxed uppercase tracking-tighter opacity-40">
                 Propagating changes to recursive ensemble models...
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all group"
      >
        <div className="relative w-6 h-6 flex flex-col justify-center items-center">
          <motion.span
            animate={isOpen ? { rotate: 45, y: 1 } : { rotate: 0, y: -4 }}
            className={`absolute block w-6 h-0.5 bg-white transition-transform`}
          />
          <motion.span
            animate={isOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
            className={`absolute block w-6 h-0.5 bg-white transition-all`}
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: 1 } : { rotate: 0, y: 6 }}
            className={`absolute block w-6 h-0.5 bg-white transition-transform`}
          />
        </div>
      </motion.button>
    </div>
  );
}

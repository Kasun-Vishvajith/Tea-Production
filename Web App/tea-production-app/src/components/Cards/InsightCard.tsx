"use client";

import { motion } from "framer-motion";

interface InsightCardProps {
  icon: string;
  title: string;
  value: string;
  description: string;
  delay?: number;
}

export function InsightCard({ icon, title, value, description, delay = 0 }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className="premium-card p-8 flex flex-col gap-6 group hover:border-accent/10"
    >
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-secondary/40 whitespace-nowrap">Macro Analytics</span>
      </div>
      
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-accent mb-1">{title}</h4>
        <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      </div>
      
      <p className="text-[13px] text-secondary leading-relaxed font-medium">
        {description}
      </p>
    </motion.div>
  );
}

export function StatBadge({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white px-5 py-3 rounded-full flex items-center gap-3 border border-black/5 shadow-sm group hover:shadow-md transition-all">
      <span className="text-lg opacity-40 group-hover:opacity-100 transition-opacity">{icon}</span>
      <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-secondary/40 leading-none mb-1">{label}</span>
          <span className="text-sm font-bold text-foreground leading-none">{value}</span>
      </div>
    </div>
  );
}

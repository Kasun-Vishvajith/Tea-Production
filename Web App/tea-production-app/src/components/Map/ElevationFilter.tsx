"use client";

import { motion } from "framer-motion";

export type ElevationType = "HIGH" | "MEDIUM" | "LOW";

interface ElevationFilterProps {
  selected: ElevationType[];
  onChange: (selected: ElevationType[]) => void;
}

const elevations: { type: ElevationType; label: string; color: string }[] = [
  { type: "HIGH", label: "High Grown", color: "#2d5a27" },
  { type: "MEDIUM", label: "Mid Grown", color: "#4caf50" },
  { type: "LOW", label: "Low Grown", color: "#8bc34a" },
];

export default function ElevationFilter({ selected, onChange }: ElevationFilterProps) {
  const toggle = (type: ElevationType) => {
    if (selected.includes(type)) {
      onChange(selected.filter((t) => t !== type));
    } else {
      onChange([...selected, type]);
    }
  };

  return (
    <div className="absolute top-20 left-6 z-[500] flex flex-col gap-3">
      {elevations.map((elev) => {
        const isActive = selected.includes(elev.type);
        return (
          <motion.button
            key={elev.type}
            onClick={() => toggle(elev.type)}
            whileHover={{ x: 4 }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all border ${
              isActive
                ? "bg-white shadow-md border-black/5"
                : "bg-white/40 hover:bg-white/60 border-transparent text-secondary"
            }`}
          >
            <div 
               className="w-3 h-3 rounded-full shadow-inner" 
               style={{ backgroundColor: isActive ? elev.color : "#d1d1d6" }} 
            />
            <span className={`text-[11px] font-bold uppercase tracking-widest ${isActive ? "text-foreground" : "text-secondary"}`}>
              {elev.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

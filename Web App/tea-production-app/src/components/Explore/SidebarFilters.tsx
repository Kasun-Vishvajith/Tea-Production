"use client";

import { motion } from "framer-motion";

export type FilterState = {
  year: number | "";
  month: number | "";
  district: string;
  elevation: string;
  tea_type: string;
};

interface SidebarFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const DISTRICTS = [
  "Nuwara Eliya",
  "Badulla",
  "Kandy",
  "Matale",
  "Ratnapura",
  "Galle",
  "Matara",
  "Kegalle",
];

const ELEVATIONS = ["High", "Medium", "Low"];
const TEA_TYPES = ["Orthodox", "CTC", "Green Tea"];
const YEARS = [2024, 2023, 2022, 2021, 2020];
const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export default function SidebarFilters({
  filters,
  setFilters,
}: SidebarFiltersProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value === "all" ? "" : value === "" ? "" : isNaN(Number(value)) || name === "district" || name === "elevation" || name === "tea_type" ? value : Number(value),
    }));
  };

  const clearFilters = () => {
    setFilters({
      year: "",
      month: "",
      district: "",
      elevation: "",
      tea_type: "",
    });
  };

  const activeCount = Object.values(filters).filter((val) => val !== "").length;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 h-full border border-white/5 rounded-2xl flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span>⚙️</span> Filters
          {activeCount > 0 && (
            <span className="bg-primary/20 text-primary text-xs w-5 h-5 flex items-center justify-center rounded-full ml-1">
              {activeCount}
            </span>
          )}
        </h2>
        {activeCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-foreground/50 hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-4 flex-1">
        {/* District Filter */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/70">
            District
          </label>
          <select
            name="district"
            value={filters.district || "all"}
            onChange={handleChange}
            className="w-full bg-background/50 border border-white/10 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white appearance-none"
          >
            <option value="all">All Districts</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Elevation Filter */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/70">
            Elevation
          </label>
          <select
            name="elevation"
            value={filters.elevation || "all"}
            onChange={handleChange}
            className="w-full bg-background/50 border border-white/10 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white appearance-none"
          >
            <option value="all">All Elevations</option>
            {ELEVATIONS.map((e) => (
              <option key={e} value={e}>
                {e} High Grown
              </option>
            ))}
          </select>
        </div>

        {/* Tea Type */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/70">
            Tea Type
          </label>
          <select
            name="tea_type"
            value={filters.tea_type || "all"}
            onChange={handleChange}
            className="w-full bg-background/50 border border-white/10 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white appearance-none"
          >
            <option value="all">All Types</option>
            {TEA_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/70">Year</label>
          <select
            name="year"
            value={filters.year || "all"}
            onChange={handleChange}
            className="w-full bg-background/50 border border-white/10 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white appearance-none"
          >
            <option value="all">All Years</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Month */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/70">
            Month
          </label>
          <select
            name="month"
            value={filters.month || "all"}
            onChange={handleChange}
            className="w-full bg-background/50 border border-white/10 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white appearance-none"
          >
            <option value="all">All Months</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  );
}

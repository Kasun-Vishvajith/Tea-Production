"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SidebarFilters, { FilterState } from "@/components/Explore/SidebarFilters";
import DataTable from "@/components/Explore/DataTable";
import { fetchSummary } from "@/lib/api";

export default function ExplorePage() {
  const [filters, setFilters] = useState<FilterState>({
    year: "",
    month: "",
    district: "",
    elevation: "",
    tea_type: "",
  });

  const [summary, setSummary] = useState({
    total_volume: 0,
    avg_volume: 0,
    record_count: 0,
    top_district: "N/A",
  });

  useEffect(() => {
    let active = true;
    const loadSummary = async () => {
      try {
        const params: Record<string, string | number> = {};
        if (filters.year) params.year = filters.year;
        if (filters.month) params.month = filters.month;
        if (filters.district) params.district = filters.district;
        if (filters.elevation) params.elevation = filters.elevation;
        if (filters.tea_type) params.tea_type = filters.tea_type;

        const data = await fetchSummary(params);
        if (active) setSummary(data);
      } catch (err) {
        console.error("Failed to load summary", err);
      }
    };
    loadSummary();
    return () => {
      active = false;
    };
  }, [filters]);

  return (
    <main className="min-h-screen pt-28 pb-12 px-6 flex flex-col h-screen">
      <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col h-full gap-6">
        
        {/* Header & Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Data <span className="text-gradient">Explorer</span>
            </h1>
            <p className="text-foreground/50 max-w-lg">
              Analyze historical tea production and filter across multiple parameters
              using our interactive grid.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
            <SummaryCard title="Total Volume" value={summary.total_volume.toLocaleString()} unit="kg" />
            <SummaryCard title="Avg per Record" value={summary.avg_volume.toLocaleString()} unit="kg" />
            <SummaryCard title="Top District" value={summary.top_district} />
            <SummaryCard title="Records Found" value={summary.record_count.toLocaleString()} />
          </div>
        </motion.div>

        {/* Main Workspace */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full lg:w-[320px] shrink-0 h-[400px] lg:h-full lg:overflow-y-auto custom-scrollbar"
          >
            <SidebarFilters filters={filters} setFilters={setFilters} />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 w-full h-[600px] lg:h-full min-h-0"
          >
            <DataTable filters={filters} />
          </motion.div>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({ title, value, unit }: { title: string; value: string | number; unit?: string }) {
  return (
    <div className="glass-card p-4 rounded-xl border border-white/5 flex flex-col justify-center min-w-[140px]">
      <span className="text-xs font-medium text-foreground/50 uppercase tracking-wider mb-1">{title}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold">{value}</span>
        {unit && <span className="text-sm text-foreground/40">{unit}</span>}
      </div>
    </div>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { fetchData } from "@/lib/api";
import { useMode } from "@/context/ModeContext";

const TEA_TYPES = [
  { name: "Black Tea", desc: "Most widely produced tea in Sri Lanka, known for robust flavor.", importance: "High", emoji: "🍂" },
  { name: "Green Tea", desc: "Unoxidized leaves, growing rapidly in global popularity.", importance: "Medium", emoji: "🍵" },
  { name: "White Tea", desc: "Premium quality, minimally processed buds with delicate taste.", importance: "Low", emoji: "💮" },
  { name: "Oolong Tea", desc: "Partially oxidized, offering complex and nuanced flavor profiles.", importance: "Low", emoji: "🌿" },
  { name: "CTC Tea", desc: "Crush, Tear, Curl method product, widely used in teabags.", importance: "High", emoji: "📦" },
  { name: "Silver Tips", desc: "Highly prized sun-dried buds, exceptionally rare.", importance: "Low", emoji: "✨" },
];

const ELEVATIONS = [
  { name: "High Elevation", desc: "Cooler climate, slower growth, higher quality (Upcountry).", icon: "⛰️" },
  { name: "Medium Elevation", desc: "Balanced conditions, moderate production and flavor.", icon: "🌄" },
  { name: "Low Elevation", desc: "Warmer climate, faster growth, higher quantity.", icon: "🌴" },
];

const CLIMATE_FACTORS = [
  { name: "Rainfall", desc: "Directly impacts yield through hydration levels.", icon: "🌧️" },
  { name: "Humidity", desc: "Crucial for bud development and flush rates.", icon: "💧" },
  { name: "Temperature", desc: "Determines growth speed and flush timing.", icon: "🌡️" },
];

export default function Insights() {
  const { mode, filters } = useMode();
  const [productionData, setProductionData] = useState<any[]>([]);
  const [stats, setStats] = useState({ min: 0, max: 0, avg: 0 });

  useEffect(() => {
    fetchData({ limit: 1000 }).then((res) => {
      const arr = Array.isArray(res) ? res : res.data || [];
      if (arr.length === 0) return;

      const aggregated = arr.reduce((acc: any, curr: any) => {
        const key = `${curr.year}-${String(curr.month).padStart(2, '0')}`;
        if (!acc[key]) acc[key] = { date: key, production: 0 };
        acc[key].production += curr.production_volume;
        return acc;
      }, {});

      const chartData = Object.values(aggregated).sort((a: any, b: any) => a.date.localeCompare(b.date));
      setProductionData(chartData as any);

      const volumes = arr.map((x: any) => x.production_volume).filter((v: number) => !isNaN(v));
      if (volumes.length > 0) {
        setStats({
          min: Math.min(...volumes),
          max: Math.max(...volumes),
          avg: volumes.reduce((a: number, b: number) => a + b, 0) / volumes.length
        });
      }
    });
  }, []);

  return (
    <main className="min-h-screen pt-40 pb-32 bg-background antialiased overflow-x-hidden">
      <div className="apple-container space-y-32">
        
        {/* Editorial Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          <span className="inline-block px-5 py-2 rounded-full bg-accent/5 text-accent text-[10px] font-black tracking-widest uppercase border border-accent/10">
            Curated Intelligence
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight">
            Insights & <span className="opacity-20 italic underline decoration-accent/10 underline-offset-8">Understanding</span>
          </h1>
          <p className="text-secondary text-xl max-w-3xl mx-auto leading-relaxed">
            A comprehensive breakdown of the variables and methodologies driving the Ceylon Tea forecasting ecosystem.
          </p>
        </motion.div>

        {/* 1. Production Context - Visualization */}
        <section className="space-y-12">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
            <div className="space-y-2">
              <span className="text-accent font-bold text-[10px] tracking-[0.3em] uppercase">01 — MARKET DATA</span>
              <h2 className="text-4xl font-bold tracking-tight text-foreground">Historical Yields</h2>
            </div>
            <div className="flex gap-10">
              <div className="space-y-1 text-right">
                <span className="block text-[10px] uppercase tracking-widest text-secondary font-black">Peak Production</span>
                <span className="text-3xl font-bold text-foreground tracking-tighter">{Math.round(stats.max).toLocaleString()} <small className="text-xs text-secondary/40 font-bold uppercase">kg</small></span>
              </div>
              <div className="space-y-1 text-right border-l border-border pl-10">
                <span className="block text-[10px] uppercase tracking-widest text-secondary font-black">Average Yield</span>
                <span className="text-3xl font-bold text-accent tracking-tighter">{Math.round(stats.avg).toLocaleString()} <small className="text-xs text-accent/40 font-bold uppercase">kg</small></span>
              </div>
            </div>
          </header>
          
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden ring-1 ring-border">
             <div className="h-[450px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={productionData}>
                   <defs>
                     <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.1}/>
                       <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="date" hide />
                   <YAxis hide domain={['dataMin', 'dataMax']} />
                   <Tooltip 
                     contentStyle={{ 
                       backgroundColor: 'rgba(255,255,255,0.92)', 
                       backdropFilter: 'blur(20px)',
                       border: '1px solid var(--border)', 
                       borderRadius: '1.5rem', 
                       padding: '1.2rem',
                       boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
                     }}
                     itemStyle={{ color: 'var(--accent)', fontSize: '14px', fontWeight: 'bold' }}
                     labelStyle={{ color: 'var(--secondary)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}
                   />
                   <Area 
                     type="monotone" 
                     dataKey="production" 
                     stroke="var(--accent)" 
                     strokeWidth={3}
                     fillOpacity={1} 
                     fill="url(#colorProd)" 
                     animationDuration={2500}
                   />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
        </section>

        {/* 2. Tea Types - Editorial Grid */}
        <section className="space-y-12">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
            <div className="space-y-2">
              <span className="text-accent font-bold text-[10px] tracking-[0.3em] uppercase">02 — VARIETIES</span>
              <h2 className="text-4xl font-bold tracking-tight text-foreground">Tea Categories</h2>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEA_TYPES.map((tea, i) => (
              <motion.div
                key={tea.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="premium-card p-10 group hover:translate-y-[-4px] transition-all duration-500"
              >
                <div className="text-4xl mb-6 flex items-center justify-between">
                  <span>{tea.emoji}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-foreground">{tea.name}</h3>
                    <span className="text-[10px] uppercase tracking-widest text-accent font-black tracking-[0.2em]">{tea.importance} Market Share</span>
                  </div>
                  <p className="text-secondary text-sm leading-relaxed font-medium">
                    {tea.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3. Climate Factors - Atmospheric Bubbles */}
        <section className="space-y-12">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
            <div className="space-y-2">
              <span className="text-accent font-bold text-[10px] tracking-[0.3em] uppercase">03 — DRIVERS</span>
              <h2 className="text-4xl font-bold tracking-tight text-foreground">Climatic Inputs</h2>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {CLIMATE_FACTORS.map((factor, i) => (
              <motion.div
                key={factor.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface p-12 rounded-[2.5rem] flex flex-col items-center text-center space-y-8 border border-border group hover:bg-white hover:shadow-xl transition-all duration-700"
              >
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-4xl shadow-sm border border-border group-hover:scale-110 transition-transform">
                  {factor.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-foreground tracking-tight">{factor.name}</h3>
                  <p className="text-sm text-secondary leading-relaxed font-medium max-w-[200px]">{factor.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Monolith CTA - Hidden in Simple Mode for focus */}
        <AnimatePresence>
          {mode === "expert" && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              viewport={{ once: true }}
              className="bg-accent text-white p-16 md:p-24 rounded-[4rem] text-center shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-150 duration-1000" />
              <div className="relative z-10 space-y-10">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight max-w-3xl mx-auto">
                  Bridging Precision <br className="hidden md:block"/> & Agronomy
                </h2>
                <p className="text-lg opacity-80 max-w-2xl mx-auto leading-relaxed font-medium">
                  This multi-ensemble system resolves the volatility of climate patterns into actionable 
                  yield intelligence for strategic industry planning.
                </p>
                <div className="text-5xl animate-bounce">🍃</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}

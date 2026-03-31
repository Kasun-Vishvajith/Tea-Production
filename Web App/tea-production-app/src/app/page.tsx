"use client";

import { motion } from "framer-motion";
import MapSection from "@/components/Map/MapSection";
import { InsightCard } from "@/components/Cards/InsightCard";
import { useMode } from "@/context/ModeContext";
import Image from "next/image";

export default function Home() {
  const { mode } = useMode();

  return (
    <div className="min-h-screen">
      
      {/* ===== Hero Section ===== */}
      <section className="relative pt-40 pb-20 md:pt-64 md:pb-40 overflow-hidden">
        {/* Abstract Background Accent */}
        <div className="absolute top-0 right-0 w-2/3 h-full opacity-10 pointer-events-none">
           <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-accent">
              <path d="M100 0 L100 100 L0 100 Z" />
           </svg>
        </div>

        <div className="apple-container relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-5 py-2 rounded-full bg-accent/5 backdrop-blur-sm border border-accent/10 text-accent text-[11px] font-bold uppercase tracking-[0.3em] mb-12"
          >
            Regional Intelligence Dashboard 2026
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="hero-title mb-8"
          >
            The Art of <br className="md:hidden" />
            <span className="opacity-10 italic">Harvest</span> Precision.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="hero-subhead mb-16"
          >
            Forging a data-driven future for the world's most sophisticated cultivars.
            Our predictive platform bridges artisanal heritage with neural intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-8"
          >
            <a href="/forecast" className="pill-button pill-button-primary shadow-lg shadow-accent/20">
              View Forecasts
            </a>
            <a href="/insights" className="pill-button pill-button-secondary">
              Deep Analytics
            </a>
          </motion.div>
        </div>
      </section>

      {/* ===== Key Metrics & Elevation Tiers ===== */}
      <section className="py-24 border-y border-border bg-white/40">
        <div className="apple-container">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-4 space-y-12">
               <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-accent mb-6">Vertical Stratification</h3>
                  <p className="text-secondary leading-relaxed">
                    Sri Lanka’s unique yield profiles are categorized across three distinct elevation tiers, 
                    each presenting unique predictive complexities.
                  </p>
               </div>
               
               <div className="flex flex-col gap-6">
                 {[
                   { name: "High [Up-Country]", img: "/images/High.png" },
                   { name: "Mid [Mid-Country]", img: "/images/medium.png" },
                   { name: "Low [Low-Country]", img: "/images/LOW.png" }
                 ].map((tier, i) => (
                   <motion.div 
                     key={i}
                     whileHover={{ x: 10 }}
                     className="flex items-center gap-4 group cursor-pointer"
                   >
                     <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-border">
                        <img src={tier.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                     </div>
                     <span className="font-bold text-sm tracking-tight">{tier.name}</span>
                   </motion.div>
                 ))}
               </div>
            </div>

            <div className="lg:col-span-8">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:pl-16">
                {[
                  { val: "3", label: "Zones", desc: "Elevation Tiers" },
                  { val: "17", label: "Categories", desc: "Tea Varieties" },
                  { val: "94.2%", label: "Accuracy", desc: mode === "expert" ? "SARIMAX Model" : "Verified" },
                  { val: "Live", label: "Status", desc: "Real-time Hub" }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-5xl font-bold tracking-tight text-foreground">{stat.val}</span>
                    <span className="text-[11px] font-bold uppercase text-accent tracking-[0.2em] mt-3">{stat.label}</span>
                    <span className="text-[10px] text-secondary mt-2 font-medium opacity-60 leading-tight">{stat.desc}</span>
                  </div>
                ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Map Section ===== */}
      <section className="py-40">
        <div className="apple-container">
          <div className="grid lg:grid-cols-12 gap-24 items-center">
            <div className="lg:col-span-5 space-y-12">
              <div className="space-y-6">
                 <span className="text-accent text-[10px] font-black uppercase tracking-[0.4em]">Geospatial Core</span>
                 <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-foreground leading-[0.95]">Spatial <br />Intelligence</h2>
              </div>
              <p className="text-secondary text-lg leading-relaxed font-medium">
                Our neural model integrates real-time satellite telemetry with historical yield density 
                to provide high-fidelity regional forecasts.
              </p>
              
              <div className="space-y-4">
                 {[
                   "Recursive variance stabilization",
                   "Micro-climatic feature engineering",
                   "Contiguous boundary mapping"
                 ].map((text, i) => (
                   <div key={i} className="flex items-center gap-5 p-6 rounded-[2rem] bg-surface/50 border border-border group hover:bg-white hover:shadow-lg transition-all duration-500">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent scale-100 group-hover:scale-125 transition-transform" />
                      <span className="text-[15px] font-bold tracking-tight">{text}</span>
                   </div>
                 ))}
              </div>
            </div>
            
            <div className="lg:col-span-7">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.98 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 className="premium-card p-1.5 shadow-2xl relative overflow-hidden"
               >
                  <div className="aspect-[4/3] w-full rounded-[22px] overflow-hidden grayscale-[20%] hover:grayscale-0 transition-all duration-700">
                    <MapSection />
                  </div>
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Product Taxonomy Section ===== */}
      <section className="py-40 bg-surface/30">
        <div className="apple-container text-center mb-24">
           <span className="text-accent text-[10px] font-black uppercase tracking-[0.4em] mb-6 block">Product Taxonomy</span>
           <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Neural Category Analysis</h2>
           <p className="text-secondary text-lg max-w-xl mx-auto leading-relaxed">
              Analyzing production dynamics across the island's primary commercial tea classifications.
           </p>
        </div>
        
        <div className="px-6 md:px-0 scrollbar-hide">
          <div className="apple-container">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
               {[
                 { name: "Orthodox", img: "/images/OrthodoxTea.png" },
                 { name: "CTC", img: "/images/CTC.png" },
                 { name: "Green Tea", img: "/images/GreenTea.png" },
                 { name: "Organic", img: "/images/OrganicTea.png" },
                 { name: "Specialty", img: "/images/TotalBlackTea.png" }
               ].map((cat, i) => (
                 <motion.div 
                   key={i}
                   whileHover={{ y: -8 }}
                   className="image-card aspect-[3/4]"
                 >
                   <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                   <div className="absolute bottom-6 left-6 z-10">
                      <p className="text-xs uppercase tracking-widest text-white/60 mb-1 font-bold">Category</p>
                      <h4 className="text-xl font-bold text-white tracking-tight">{cat.name}</h4>
                   </div>
                 </motion.div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Insight Narrative Section ===== */}
      <section className="py-40">
        <div className="apple-container">
          <div className="text-center mb-32 space-y-6">
             <span className="text-accent text-[10px] font-black uppercase tracking-[0.4em]">System Reports</span>
             <h2 className="text-5xl md:text-6xl font-bold tracking-tighter">Strategic Insights</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <InsightCard
              icon="⛰️"
              title="Yield Dominance"
              value="High Grown"
              description="Nuwara Eliya remains the gold standard for premium artisanal output."
              delay={0}
            />
            <InsightCard
              icon="🌡️"
              title="Climatic Drivers"
              value="Temp Sensitivity"
              description="Surface temperature correlation remains the strongest yield predictor."
              delay={0.1}
            />
            <InsightCard
              icon="📉"
              title="Forecasting Chain"
              value={mode === "expert" ? "Hybrid Meta" : "Future Yield"}
              description={mode === "expert" ? "SARIMAX with CatBoost residuals providing stability." : "AI patterns identified in regional production cycles."}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="py-40 border-t border-border bg-white relative overflow-hidden">
        {/* Abstract Background Accent */}
        <div className="absolute bottom-0 left-0 w-1/2 h-full opacity-5 pointer-events-none">
           <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-accent">
              <path d="M0 100 L0 0 L100 0 Z" />
           </svg>
        </div>

        <div className="apple-container relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-24 mb-32">
            <div className="max-w-md space-y-8">
              <h3 className="text-3xl font-bold text-foreground tracking-tighter">Ceylon <span className="text-accent">Tea</span> Intelligence</h3>
              <p className="text-secondary text-lg leading-relaxed font-medium">
                Advancing the strategic modernization of Sri Lanka's tea industry through
                computational foresight and neural network excellence.
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-20 w-full md:w-auto">
              <div className="flex flex-col gap-6">
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-secondary/40">Analytics</span>
                <a href="/forecast" className="text-base font-bold text-foreground hover:text-accent transition-colors">Forecasting</a>
                <a href="/insights" className="text-base font-bold text-foreground hover:text-accent transition-colors">EDA Insights</a>
                <a href="/hypothesis" className="text-base font-bold text-foreground hover:text-accent transition-colors">Inference</a>
              </div>
              <div className="flex flex-col gap-6">
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-secondary/40">Resources</span>
                <a href="#" className="text-base font-bold text-foreground hover:text-accent transition-colors">Documentation</a>
                <a href="#" className="text-base font-bold text-foreground hover:text-accent transition-colors">Methodology</a>
              </div>
              <div className="flex flex-col gap-6">
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-secondary/40">Environment</span>
                <span className="text-base font-bold text-foreground flex items-center gap-2">V 2.6.0 Stable</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-border gap-8">
            <span className="text-[14px] text-secondary/60 font-medium tracking-tight">© 2026 Advanced Analytics Group</span>
            <div className="flex gap-12">
               <span className="text-[12px] text-secondary font-bold hover:text-accent cursor-pointer transition-colors uppercase tracking-[0.4em]">Privacy</span>
               <span className="text-[12px] text-secondary font-bold hover:text-accent cursor-pointer transition-colors uppercase tracking-[0.4em]">Protocol</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

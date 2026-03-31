"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMode } from "@/context/ModeContext";

export default function Forecast() {
  const { mode, filters } = useMode();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showLogic, setShowLogic] = useState(false);

  const [formData, setFormData] = useState({
    temp: 25,
    humidity: 70,
    rainfall: 100,
    elevation: filters.elevation === "all" ? "high" : filters.elevation,
    tea_type: filters.teaType === "all" ? "orthodox" : filters.teaType,
  });

  // Sync with global filters if they change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      elevation: filters.elevation === "all" ? prev.elevation : filters.elevation,
      tea_type: filters.teaType === "all" ? prev.tea_type : filters.teaType,
    }));
  }, [filters]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const runForecast = async () => {
    setLoading(true);
    setResult(null); 
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const params = new URLSearchParams(Object.entries(formData).reduce((acc, [k, v]) => ({ ...acc, [k]: v.toString() }), {}));
      
      const res = await fetch(`${API_BASE}/forecast?${params.toString()}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Forecast Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-40 pb-32 bg-background antialiased overflow-x-hidden">
      <div className="apple-container flex flex-col lg:grid lg:grid-cols-12 gap-16 items-start">
        
        {/* Input Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-12 xl:col-span-5 w-full bg-white rounded-[2.5rem] shadow-xl border border-border p-10 md:p-12"
        >
          <div className="space-y-12">
            <header className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Forecasting Engine</span>
              <h1 className="text-4xl font-bold tracking-tight text-foreground leading-tight">
                Yield <span className="opacity-20 italic">Capacity</span>
              </h1>
              <p className="text-secondary text-base leading-relaxed max-w-sm">
                Recursive ensemble prediction for the tea production cycle.
              </p>
            </header>

            <div className="space-y-10">
              {/* Climate Variables - Hidden in Simple Mode */}
              <AnimatePresence>
                {mode === "expert" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-10 overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Temperature (°C)</span>
                        <input 
                          type="number" name="temp" value={formData.temp} onChange={handleChange}
                          className="w-full bg-surface rounded-xl px-5 py-4 text-base font-bold text-foreground outline-none focus:ring-2 ring-accent/10 transition-all border-none"
                        />
                      </div>
                      <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Humidity (%)</span>
                        <input 
                          type="number" name="humidity" value={formData.humidity} onChange={handleChange}
                          className="w-full bg-surface rounded-xl px-5 py-4 text-base font-bold text-foreground outline-none focus:ring-2 ring-accent/10 transition-all border-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Rainfall Volume</span>
                         <span className="text-lg font-bold text-accent">{formData.rainfall}mm</span>
                      </div>
                      <input 
                        type="range" name="rainfall" min="0" max="500" value={formData.rainfall} onChange={handleChange}
                        className="w-full accent-accent h-1.5 bg-surface rounded-full cursor-pointer appearance-none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-6">
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Ecological Zone</span>
                  <select name="elevation" value={formData.elevation} onChange={handleChange} 
                    className="w-full bg-surface rounded-xl px-5 py-4 text-base font-bold outline-none cursor-pointer appearance-none border-none"
                  >
                    <option value="high">High Grown</option>
                    <option value="medium">Medium Grown</option>
                    <option value="low">Low Grown</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Product Type</span>
                  <select name="tea_type" value={formData.tea_type} onChange={handleChange} 
                    className="w-full bg-surface rounded-xl px-5 py-4 text-base font-bold outline-none cursor-pointer appearance-none border-none"
                  >
                    <option value="orthodox">Standard Orthodox</option>
                    <option value="ctc">Premium CTC</option>
                    <option value="green">Specialty Green</option>
                    <option value="silvertips">Silver Tips</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={runForecast}
                disabled={loading}
                className="w-full py-5 bg-accent text-white font-bold text-lg rounded-2xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : "Run Forecast"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Stream */}
        <div className="lg:col-span-12 xl:col-span-7 w-full flex flex-col min-h-[500px]">
          <AnimatePresence mode="wait">
            {loading ? (
               <motion.div 
                 key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="flex-1 flex flex-col items-center justify-center space-y-6 bg-surface rounded-[2.5rem]"
               >
                  <div className="w-12 h-12 border-3 border-accent/10 border-t-accent rounded-full animate-spin" />
                  <p className="text-[10px] text-accent font-black uppercase tracking-widest">Processing Data</p>
               </motion.div>
            ) : !result ? (
              <motion.div 
                key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2.5rem] border border-dashed border-border space-y-6"
              >
                <div className="text-6xl opacity-30">🍃</div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-secondary uppercase tracking-widest">Ready for Prediction</h3>
                  <p className="text-sm text-secondary/60 max-w-xs mx-auto leading-relaxed">
                    Set the environmental forcing factors to execute the prediction chain.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                {/* Result Card */}
                <div className="premium-card p-12 md:p-16 flex flex-col items-center text-center">
                   <span className="text-[11px] font-black uppercase tracking-widest text-accent mb-8">Yield Projection</span>
                   <div className="flex items-baseline gap-4 mb-8">
                    <span className="text-7xl md:text-8xl font-bold tracking-tighter text-foreground">
                      {Math.round(result.final_prediction).toLocaleString()}
                    </span>
                    <span className="text-xl font-bold text-secondary uppercase tracking-widest">kg</span>
                   </div>
                   <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5 }} className="h-full bg-accent" />
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <div className="bg-white p-8 rounded-[1.5rem] border border-border">
                      <span className="block text-[10px] uppercase tracking-widest text-secondary font-black mb-2">Base Forecast</span>
                      <span className="text-3xl font-bold text-foreground">
                        {Math.round(result.base_prediction).toLocaleString()} <small className="text-xs font-medium text-secondary">kg</small>
                      </span>
                   </div>
                   <div className="bg-white p-8 rounded-[1.5rem] border border-border">
                      <span className="block text-[10px] uppercase tracking-widest text-secondary font-black mb-2">Env Sensitivity</span>
                      <span className="text-3xl font-bold text-accent">
                        {(result.weight * 100).toFixed(1)}%
                      </span>
                   </div>
                </div>

                {/* Logic Breakdown (Expert Mode only) */}
                <AnimatePresence>
                  {mode === "expert" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white p-10 rounded-[2.5rem] shadow-lg border border-border space-y-8"
                    >
                       <div className="flex items-start gap-6">
                          <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center text-2xl shrink-0">🧠</div>
                          <div className="space-y-2">
                             <h4 className="text-xl font-bold text-foreground">Statistical Reasoning</h4>
                             <p className="text-sm text-secondary leading-relaxed">
                               The ensemble model indicates a <span className="text-accent font-bold">{(result.weight > 1 ? "surplus" : "deficit")}</span> relative to seasonal averages. 
                               This is derived from a SARIMAX historical baseline adjusted by a CatBoost climatic regressor.
                             </p>
                          </div>
                       </div>
                       
                       <button 
                         onClick={() => setShowLogic(!showLogic)}
                         className="w-full py-3 bg-surface rounded-xl text-[10px] font-black uppercase tracking-widest text-secondary hover:brightness-95 transition-all"
                       >
                         {showLogic ? "Hide Execution Logic" : "Reveal Neural Path"}
                       </button>

                       <AnimatePresence>
                          {showLogic && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden bg-surface rounded-2xl p-6"
                            >
                               <div className="space-y-4 font-mono text-xs text-secondary/70">
                                  <div className="flex justify-between border-b border-black/5 pb-2">
                                     <span>Sequence Chain</span>
                                     <span className="text-accent">Baseline × Env_Weight</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <span className="block text-[9px] uppercase tracking-widest mb-1">SARIMAX Median</span>
                                        <span className="text-base font-bold text-foreground">{Math.round(result.base_prediction).toLocaleString()}</span>
                                     </div>
                                     <div>
                                        <span className="block text-[9px] uppercase tracking-widest mb-1">Env Scalar</span>
                                        <span className="text-base font-bold text-accent">×{result.weight.toFixed(4)}</span>
                                     </div>
                                  </div>
                               </div>
                            </motion.div>
                          )}
                       </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

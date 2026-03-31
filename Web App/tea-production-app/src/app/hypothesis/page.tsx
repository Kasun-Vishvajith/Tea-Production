"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, CheckCircle2, XCircle, AlertCircle, ArrowUpRight, ArrowDownRight, Wand2, Calculator, Settings2, BarChart3, Binary, ShieldCheck } from "lucide-react";

// Types
interface VariableResult {
  variable: string;
  coefficient: number;
  p_value: number;
  decision: string;
  significance: string;
  explanation: string;
}

interface VIFResult {
  feature: string;
  vif: number;
}

interface ElevationData {
  elevation: string;
  alpha: number;
  stationarity: {
    differencing_order: number;
    p_value: number;
    is_stationary: boolean;
  };
  multicollinearity: VIFResult[];
  residuals: {
    lb_p_value: number;
    decision: string;
  };
  comparison: {
    aic_sarima: number;
    aic_sarimax: number;
    lr_p_value: number;
    is_better: boolean;
    insight: string;
  };
  variables: VariableResult[];
  summary_insight: string;
}

interface HypothesisData {
  [elevation: string]: any; // Including global_insight
}

const ELEVATIONS = [
  { id: "total", label: "Total Elevation", icon: "📊", description: "Aggregate production across Sri Lanka" },
  { id: "low", label: "Low Elevation", icon: "🌴", description: "Grown in elevations up to 2,000 feet" },
  { id: "medium", label: "Medium Elevation", icon: "🌄", description: "Grown between 2,000 and 4,000 feet" },
  { id: "high", label: "High Elevation", icon: "⛰️", description: "Grown in elevations above 4,000 feet" },
];

export default function HypothesisDashboard() {
  const [data, setData] = useState<HypothesisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [alpha, setAlpha] = useState(0.05);
  const [showAlphaFeedback, setShowAlphaFeedback] = useState(false);
  const [alphaFeedbackMessage, setAlphaFeedbackMessage] = useState("");

  const fetchData = async (currentAlpha: number) => {
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${API_BASE}/hypothesis?alpha=${currentAlpha}`);
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Failed to fetch hypothesis data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(alpha);
  }, [alpha]);

  const handleAlphaChange = (newAlpha: number) => {
    if (newAlpha === alpha) return;
    
    let message = "";
    if (newAlpha === 0.01) {
      message = "You selected a strict significance level (1%). Only very strong effects will be considered significant.";
    } else if (newAlpha === 0.05) {
      message = "You are using the standard 5% level, balancing sensitivity and reliability.";
    } else if (newAlpha === 0.10) {
      message = "You selected a relaxed level (10%), allowing more variables to appear significant but increasing false positive risk.";
    }
    setAlphaFeedbackMessage(message);
    setAlpha(newAlpha);
    setShowAlphaFeedback(true);
    setTimeout(() => setShowAlphaFeedback(false), 4000);
  };

  const globalInsight = data?.global_insight || "Loading statistical trends...";

  const getVifColor = (vif: number) => {
    if (vif < 5) return "text-green-500";
    if (vif < 10) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <main className="min-h-screen pt-40 pb-32 bg-background antialiased overflow-x-hidden">
      <div className="apple-container space-y-24">
        
        {/* Header section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Statistical Decision Intelligence</span>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
                Hypothesis <span className="opacity-20 italic underline decoration-accent/10 underline-offset-8">Testing Dashboard</span>
            </h1>
            <p className="text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
                SARIMAX-based inference analysis of environmental impacts on Sri Lankan tea yield with assumption validation.
            </p>
            
            {/* H0/H1 Context Panel */}
            <div className="flex flex-col md:flex-row gap-4 justify-center mt-12 px-4 max-w-4xl mx-auto">
                <div className="flex-1 glass-card p-6 border-l-4 border-l-red-500/50 bg-red-500/[0.02]">
                    <div className="flex items-center gap-3 mb-2">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-red-500">Null Hypothesis (H₀)</span>
                    </div>
                    <p className="text-sm text-secondary leading-relaxed text-left">
                        "The environmental variable has no significant effect on tea production patterns." <span className="font-mono bg-surface/50 px-1.5 rounded ml-1 text-xs opacity-60">(β = 0)</span>
                    </p>
                </div>
                <div className="flex-1 glass-card p-6 border-l-4 border-l-green-500/50 bg-green-500/[0.02]">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-green-500">Alternative Hypothesis (H₁)</span>
                    </div>
                    <p className="text-sm text-secondary leading-relaxed text-left">
                        "The environmental variable has a measurable effect on tea output." <span className="font-mono bg-surface/50 px-1.5 rounded ml-1 text-xs opacity-60">(β ≠ 0)</span>
                    </p>
                </div>
            </div>
        </motion.div>

        {/* Global Insight Panel */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="premium-card p-8 md:p-12 border-accent/20 bg-accent/[0.02] relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-[1.6] group-hover:rotate-6 transition-transform duration-1000">
                <Wand2 className="w-32 h-32 text-accent" />
            </div>
            
            <div className="relative z-10 max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                    <span className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                        <AlertCircle className="w-5 h-5 text-accent" />
                    </span>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-accent">Global Insight Panel</span>
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-4">Cross-Elevation Trends</h3>
                <p className="text-xl text-secondary leading-relaxed italic opacity-80">
                   "{globalInsight}"
                </p>
            </div>
        </motion.div>

        {/* Control Center */}
        <section className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Statistical Controls</h2>
                    <p className="text-secondary text-sm">Set confidence threshold for significance testing</p>
                </div>
                <div className="flex bg-surface p-1 rounded-2xl border border-border shadow-inner">
                    {[0.01, 0.05, 0.10].map((val) => (
                        <button
                            key={val}
                            onClick={() => handleAlphaChange(val)}
                            className={`px-8 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${
                                alpha === val 
                                ? "bg-accent text-white shadow-xl shadow-accent/20" 
                                : "text-secondary hover:text-foreground"
                            }`}
                        >
                            α = {val.toFixed(2)}
                            <span className="block text-[8px] mt-0.5 opacity-60">
                                {val === 0.01 ? "Strict (1%)" : val === 0.05 ? "Default (5%)" : "Relaxed (10%)"}
                            </span>
                        </button>
                    ))}
                </div>
            </header>

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {ELEVATIONS.map((elevation) => {
                    const eData: ElevationData = data ? data[elevation.id] : null;
                    
                    return (
                        <motion.div 
                            key={elevation.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card flex flex-col h-full transition-all duration-500 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-border bg-surface/[0.03]">
                                <div className="flex items-center gap-4 mb-3">
                                    <span className="text-3xl filter drop-shadow-sm">{elevation.icon}</span>
                                    <div>
                                        <h3 className="text-2xl font-bold tracking-tight">{elevation.label}</h3>
                                        <p className="text-[10px] uppercase tracking-widest text-secondary/60">{elevation.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Analysis Content */}
                            <div className="p-8 space-y-10 flex-1">
                                {loading || !eData ? (
                                    <div className="h-[500px] flex flex-col items-center justify-center gap-4">
                                        <div className="w-10 h-10 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                                        <p className="text-xs uppercase tracking-widest text-secondary animate-pulse">Running Inferences...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                        
                                        {/* Assumption Checks Section (Step 3) */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <ShieldCheck className="w-4 h-4 text-accent" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Assumption Validation</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="p-4 rounded-xl bg-surface/50 border border-border/40">
                                                    <span className="block text-[8px] font-black uppercase text-secondary/60 mb-1">Stationarity (ADF)</span>
                                                    <span className={`text-xs font-bold ${eData.stationarity.is_stationary ? 'text-green-500' : 'text-orange-500'}`}>
                                                        {eData.stationarity.is_stationary ? 'Stationary ✅' : 'Fixed via Diff ❌'}
                                                    </span>
                                                    <span className="block text-[8px] mt-1 opacity-50">p: {eData.stationarity.p_value.toFixed(4)}</span>
                                                </div>
                                                <div className="p-4 rounded-xl bg-surface/50 border border-border/40">
                                                    <span className="block text-[8px] font-black uppercase text-secondary/60 mb-1">Multicollinearity</span>
                                                    <span className="text-xs font-bold text-green-500">
                                                        {Math.max(...eData.multicollinearity.map(m => m.vif)) < 5 ? 'Good ✅' : 'Moderate ⚠️'}
                                                    </span>
                                                    <span className="block text-[8px] mt-1 opacity-50">Max VIF: {Math.max(...eData.multicollinearity.map(m => m.vif)).toFixed(2)}</span>
                                                </div>
                                                <div className="p-4 rounded-xl bg-surface/50 border border-border/40">
                                                    <span className="block text-[8px] font-black uppercase text-secondary/60 mb-1">Residuals (LB)</span>
                                                    <span className={`text-xs font-bold ${eData.residuals.decision === 'Good' ? 'text-green-500' : 'text-red-500'}`}>
                                                        {eData.residuals.decision === 'Good' ? 'Independent ✅' : 'Autocorr ❌'}
                                                    </span>
                                                    <span className="block text-[8px] mt-1 opacity-50">p: {eData.residuals.lb_p_value.toFixed(4)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Main Results Table (Step 7) */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <BarChart3 className="w-4 h-4 text-accent" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-secondary">SARIMAX Coefficients</span>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="border-b border-border/50">
                                                            <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-secondary/60">Variable</th>
                                                            <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-secondary/60">Coef</th>
                                                            <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-secondary/60 text-right">P-Value</th>
                                                            <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-secondary/60 text-right">Decision</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border/20">
                                                        {eData.variables.map((v) => {
                                                            const isSig = v.significance === "Yes";
                                                            return (
                                                                <tr key={v.variable} className="group hover:bg-surface/50 transition-colors">
                                                                    <td className="py-5">
                                                                        <div className="flex items-center gap-2">
                                                                            {v.coefficient > 0 ? <ArrowUpRight className="w-3 h-3 text-green-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />}
                                                                            <span className="font-bold text-sm">{v.variable}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-5 font-mono text-xs">{v.coefficient.toFixed(3)}</td>
                                                                    <td className="py-5 text-right font-mono text-xs text-accent transition-all group-hover:font-black">
                                                                        <div className="flex items-center gap-1 justify-end group/tip relative cursor-help">
                                                                            {v.p_value.toFixed(4)}
                                                                            <div className="absolute bottom-full right-0 mb-2 w-48 hidden group-hover/tip:block bg-foreground text-background text-[10px] p-2 rounded shadow-2xl z-50">
                                                                                P-value represents the probability of observing the result if there is no real effect.
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-5 text-right">
                                                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${
                                                                            isSig ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"
                                                                        }`}>
                                                                            {isSig ? "Significant" : "Not Significant"}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Human Friendly Explanations (Step 8 & 9) */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 border-b border-border/10 pb-2">
                                                <Settings2 className="w-4 h-4 text-accent" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Expert Interpretation</span>
                                            </div>
                                            <div className="space-y-4">
                                                {eData.variables.map((v) => (
                                                    <div key={v.variable} className="flex gap-4 items-start">
                                                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${v.significance === "Yes" ? "bg-green-500 shadow-sm shadow-green-500/50" : "bg-red-500/30"}`} />
                                                        <p className="text-xs text-secondary leading-relaxed italic border-l border-border/10 pl-4 py-1">
                                                            {v.explanation}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Model Comparison & Exogeneity Insight (Step 6 & 11) */}
                                        <div className="premium-card p-6 bg-surface/30 border-dashed space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Binary className="w-4 h-4 text-foreground/40" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Model Comparison (LRT)</span>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="text-center">
                                                        <span className="block text-[8px] uppercase text-secondary/60">SARIMA AIC</span>
                                                        <span className="text-[10px] font-mono">{eData.comparison.aic_sarima.toFixed(1)}</span>
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="block text-[8px] uppercase text-secondary/60">SARIMAX AIC</span>
                                                        <span className="text-[10px] font-mono font-bold text-accent">{eData.comparison.aic_sarimax.toFixed(1)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-border/20">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle2 className="w-3 h-3 text-accent" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Exogeneity Insight</span>
                                                </div>
                                                <p className="text-sm text-foreground/80 leading-relaxed font-bold">
                                                    {eData.comparison.insight}
                                                </p>
                                            </div>
                                            <div className="pt-2">
                                                <p className="text-xs text-secondary leading-relaxed">
                                                    <span className="text-accent underline font-semibold mr-1">Elevation Perspective:</span>
                                                    {eData.summary_insight}
                                                </p>
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>

        {/* Alpha Feedback Toast */}
        <AnimatePresence>
            {showAlphaFeedback && (
                <motion.div 
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
                >
                    <div className="glass-card p-6 border-accent/40 shadow-2xl bg-white flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                            <Wand2 className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-accent">Significance Level Adjusted</span>
                            <p className="text-xs font-semibold leading-relaxed text-foreground/80">{alphaFeedbackMessage}</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </main>
  );
}

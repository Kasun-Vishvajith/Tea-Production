"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LineChart as LineChartIcon, 
  Leaf, 
  CloudRain, 
  Droplets, 
  Thermometer, 
  Sparkles,
  ChevronRight,
  Loader2,
  BarChart3,
  AlertTriangle,
  Calendar,
  Layers,
  TrendingUp,
  History,
  ShieldAlert,
  Settings
} from "lucide-react";
import Link from "next/link";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area, Line, ComposedChart, Cell
} from 'recharts';

export default function ForecastPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]); // List of monthly predictions
  const [selectedIndex, setSelectedIndex] = useState(0); // Which month in horizon to show breakdown for
  const [error, setError] = useState<string | null>(null);

  const [inputs, setInputs] = useState({
    elevation: "HIGH",
    tea_type: "ORTHODOX TEA",
    rainfall: 250,
    humidity: 75,
    temperature: 24,
    months: 6
  });

  const elevations = ["HIGH", "MEDIUM", "LOW"];
  const teaTypes = [
    "BIO TEA", "CTC TEA", "GREEN TEA", "INSTANT TEA", 
    "ORTHODOX TEA", "RECLAIMED TEA", "TOTAL BLACK TEA"
  ];

  const CHART_COLORS = ['#154734', '#d4a373', '#588157', '#bc6c25', '#3a5a40', '#dda15e', '#a3b18a'];

  // Training Data Range Validation
  const bounds = {
    rainfall: { min: 11, max: 571 },
    humidity: { min: 60, max: 91 },
    temperature: { min: 19, max: 28 }
  };

  const isOutOfScope = useMemo(() => {
    return (
      inputs.rainfall < bounds.rainfall.min || inputs.rainfall > bounds.rainfall.max ||
      inputs.humidity < bounds.humidity.min || inputs.humidity > bounds.humidity.max ||
      inputs.temperature < bounds.temperature.min || inputs.temperature > bounds.temperature.max
    );
  }, [inputs.rainfall, inputs.humidity, inputs.temperature]);

  const handleForecast = async () => {
    setLoading(true);
    setError(null);
    setSelectedIndex(0);
    try {
      const response = await fetch("http://localhost:8000/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rainfall: inputs.rainfall,
          humidity: inputs.humidity,
          temperature: inputs.temperature,
          months: inputs.months
        })
      });

      if (!response.ok) throw new Error("Failed to fetch forecast from backend.");
      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const selectedMonthData = results[selectedIndex] || null;
  
  const getCategoryProd = (monthData: any) => {
    if (!monthData) return 0;
    const found = monthData.breakdown.find(
      (b: any) => b.elevation === inputs.elevation && b.tea_type === inputs.tea_type
    );
    return found ? found.production : 0;
  };

  const categoryPrediction = useMemo(() => getCategoryProd(selectedMonthData), [selectedMonthData, inputs.elevation, inputs.tea_type]);

  const chartData = useMemo(() => {
    return results.map((r, idx) => ({
      name: new Date(r.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      total: r.total_production,
      category: getCategoryProd(r),
      lower: r.confidence_interval.lower,
      upper: r.confidence_interval.upper,
      index: idx
    }));
  }, [results, inputs.elevation, inputs.tea_type]);

  const radarData = useMemo(() => {
    if (!selectedMonthData) return [];
    const agg: Record<string, number> = {};
    selectedMonthData.breakdown.forEach((b: any) => {
      agg[b.elevation] = (agg[b.elevation] || 0) + b.production;
    });
    return Object.entries(agg).map(([subject, A]) => ({ subject, A }));
  }, [selectedMonthData]);

  const barData = useMemo(() => {
    if (!selectedMonthData) return [];
    return selectedMonthData.breakdown
      .filter((b: any) => b.elevation === inputs.elevation)
      .map((b: any) => ({ name: b.tea_type, val: b.production }));
  }, [selectedMonthData, inputs.elevation]);

  return (
    <div className="forecast-page">
      <header className="page-header">
        <h1>Production Forecast</h1>
        <p>Input climatic parameters to generate multi-month research-grade predictions with 95% CI.</p>
      </header>

      <div className="forecast-grid">
        {/* Input Card */}
        <section className="glass-card input-card">
          <div className="section-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} />
              <h2>Parameters</h2>
            </div>
            <Link href="/about#model-upload" style={{ textDecoration: 'none' }}>
              <button className="change-model-btn">
                <Settings size={14} /> Change Model
              </button>
            </Link>
          </div>

          <div className="form-group">
            <label><Layers size={14} /> Elevation Target</label>
            <div className="select-grid">
              {elevations.map(e => (
                <button 
                  key={e} 
                  className={`select-btn ${inputs.elevation === e ? 'active' : ''}`}
                  onClick={() => setInputs(p => ({...p, elevation: e}))}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label><Leaf size={14} /> Tea Type Target</label>
            <div className="type-chips">
              {teaTypes.map(t => (
                <button 
                  key={t} 
                  className={`chip ${inputs.tea_type === t ? 'active' : ''}`}
                  onClick={() => setInputs(p => ({...p, tea_type: t}))}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="exo-inputs">
            <div className="input-field">
              <label><CloudRain size={16} /> Rainfall (mm)</label>
              <input 
                type="number" 
                value={inputs.rainfall} 
                onChange={e => setInputs(p => ({...p, rainfall: parseFloat(e.target.value)}))} 
              />
            </div>
            <div className="input-field">
              <label><Droplets size={16} /> Humidity (%)</label>
              <input 
                type="number" 
                value={inputs.humidity} 
                onChange={e => setInputs(p => ({...p, humidity: parseFloat(e.target.value)}))} 
              />
            </div>
            <div className="input-field">
              <label><Thermometer size={16} /> Temperature (°C)</label>
              <input 
                type="number" 
                value={inputs.temperature} 
                onChange={e => setInputs(p => ({...p, temperature: parseFloat(e.target.value)}))} 
              />
            </div>
          </div>

          <div className="form-group horizon-control">
            <label><Calendar size={14} /> Forecast Horizon: {inputs.months} Months</label>
            <input 
               type="range" min="1" max="12" step="1"
               value={inputs.months}
               onChange={e => setInputs(p => ({...p, months: parseInt(e.target.value)}))}
               className="range-slider"
            />
          </div>

          {isOutOfScope && (
             <div className="warning-badge animate-pulse-slow">
                <ShieldAlert size={16} />
                <span>Extrapolative Risk: Input outside training range. Results may be unstable.</span>
             </div>
          )}

          <button 
            className="btn-primary forecast-btn" 
            onClick={handleForecast}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Run Forecast Engine"}
            <ChevronRight size={18} />
          </button>

          {error && (
            <div className="error-alert">
              <AlertTriangle size={18} />
              {error}
              <p style={{fontSize: '0.8rem', marginTop: '4px'}}>Ensure the FastAPI backend is running.</p>
            </div>
          )}
        </section>

        {/* Results Card */}
        <section className="results-container">
           <AnimatePresence mode="wait">
             {results.length === 0 ? (
               <motion.div 
                 key="placeholder"
                 className="glass-card placeholder-results"
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               >
                 <BarChart3 size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                 <p>Predictions will appear here after running the engine.</p>
               </motion.div>
             ) : (
               <motion.div 
                 key="results"
                 className="results-content animate-fade-in"
                 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
               >
                 {/* National Total Yield Trend */}
                 <div className="glass-card chart-card full-width">
                    <div className="chart-header">
                       <TrendingUp size={20} className="text-primary" />
                       <div>
                          <h3>National Total Yield Trend (95% CI)</h3>
                          <span className="subtitle">Visualizing total island-wide production estimates in millions.</span>
                       </div>
                    </div>
                    <div style={{ height: 280, marginTop: '1.5rem' }}>
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} onClick={(e) => { if (e && e.activeTooltipIndex !== undefined) setSelectedIndex(e.activeTooltipIndex); }}>
                             <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                                   <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                             <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                             <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1e6).toFixed(1)}M`} />
                             <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)' }}
                                formatter={(v: any, name: string) => [
                                  `${(v/1e6).toFixed(3)}M kg`,
                                  name === 'total' ? 'National Total' : name === 'upper' ? 'Upper Bound' : 'Lower Bound'
                                ]}
                             />
                             <Area name="total" type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={3} fill="url(#colorTotal)" />
                             <Area name="upper" type="monotone" dataKey="upper" stroke="none" fill="var(--primary)" fillOpacity={0.05} />
                             <Area name="lower" type="monotone" dataKey="lower" stroke="none" fill="var(--primary)" fillOpacity={0.05} />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>

                 {/* Specific Category Yield Trend */}
                 <div className="glass-card chart-card full-width">
                    <div className="chart-header">
                       <LineChartIcon size={20} className="text-secondary" />
                       <div>
                          <h3>Category Yield Projection: {inputs.elevation} | {inputs.tea_type}</h3>
                          <span className="subtitle">Focusing on specific segment output in thousands (kg).</span>
                       </div>
                    </div>
                    <div style={{ height: 280, marginTop: '1.5rem' }}>
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} onClick={(e) => { if (e && e.activeTooltipIndex !== undefined) setSelectedIndex(e.activeTooltipIndex); }}>
                             <defs>
                                <linearGradient id="colorCategory" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.15}/>
                                   <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                             <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                             <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1e3).toFixed(0)}k`} />
                             <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)' }}
                                formatter={(v: any) => [`${(v/1e3).toFixed(1)}k kg`, 'Category Yield']}
                             />
                             <Area type="monotone" dataKey="category" stroke="var(--secondary)" strokeWidth={3} fill="url(#colorCategory)" dot={{ r: 4, fill: 'var(--secondary)' }} activeDot={{ r: 6 }} />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="chart-footer">
                       <p>👆 Click data points to update analysis for {new Date(selectedMonthData.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                 </div>

                 <div className="overall-prediction glass-card">
                    <div className="kpi">
                       <span className="label">National Forecasted Total</span>
                       <span className="value">{(selectedMonthData.total_production / 1e6).toFixed(3)}M kg</span>
                       <span className="unit">{new Date(selectedMonthData.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="divider" />
                    <div className="kpi highlight">
                       <span className="label">Selected Category Yield</span>
                       <span className="value">{(categoryPrediction / 1e3).toFixed(2)}k kg</span>
                       <span className="unit">{inputs.elevation} | {inputs.tea_type}</span>
                    </div>
                 </div>

                 <div className="charts-grid">
                    <div className="glass-card chart-card">
                       <h3>Elevation Diversity ({new Date(selectedMonthData.date).toLocaleDateString('en-US', { month: 'short' })})</h3>
                       <div style={{ height: 250 }}>
                          <ResponsiveContainer width="100%" height="100%">
                             <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid strokeOpacity={0.1} />
                                <PolarAngleAxis dataKey="subject" fontSize={10} />
                                <Tooltip 
                                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)', fontSize: '12px' }}
                                   formatter={(v: any) => [`${(v/1e6).toFixed(2)}M kg`, "Production"]}
                                />
                                <Radar name="Production" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                             </RadarChart>
                          </ResponsiveContainer>
                       </div>
                    </div>

                    <div className="glass-card chart-card">
                       <h3>{inputs.elevation} Variety Yields</h3>
                       <div style={{ height: 250 }}>
                          <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis dataKey="name" fontSize={9} />
                                <YAxis fontSize={10} tickFormatter={(v) => `${(v/1e3).toFixed(0)}k`} />
                                <Tooltip 
                                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)' }}
                                   formatter={(v: any) => [`${(v/1e3).toFixed(1)}k kg`, "Yield"]}
                                />
                                <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                                   {barData.map((entry: any, index: number) => (
                                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                   ))}
                                </Bar>
                             </BarChart>
                          </ResponsiveContainer>
                       </div>
                    </div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </section>
      </div>

      <style jsx>{`
        .forecast-page { padding: 1rem 0; }
        .page-header { margin-bottom: 2.5rem; }
        .page-header h1 { color: var(--primary); font-family: var(--font-header); font-size: 2.5rem; letter-spacing: -0.02em; }
        .page-header p { color: #666; font-size: 1.1rem; max-width: 600px; }
        
        .forecast-grid { display: grid; grid-template-columns: 420px 1fr; gap: 2rem; }
        
        .section-title { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; color: var(--primary); }
        .section-title h2 { font-size: 1.25rem; font-family: var(--font-header); }
        
        .change-model-btn { display: flex; align-items: center; gap: 6px; padding: 0.4rem 0.8rem; border-radius: 8px; border: 1px solid #ddd; background: #fff; font-size: 0.7rem; font-weight: 700; color: #666; cursor: pointer; transition: all 0.2s; }
        .change-model-btn:hover { border-color: var(--secondary); color: var(--secondary); background: rgba(212, 163, 115, 0.05); }
        
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 0.85rem; margin-bottom: 12px; color: #555; }
        
        .select-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .select-btn { padding: 0.6rem; border: 1px solid #ddd; border-radius: 12px; background: #fff; font-family: var(--font-body); font-size: 0.75rem; cursor: pointer; transition: all 0.3s ease; font-weight: 600; }
        .select-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); box-shadow: 0 4px 12px rgba(21, 71, 52, 0.2); }
        
        .type-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .chip { padding: 0.4rem 0.8rem; border-radius: 20px; border: 1px solid #ddd; background: #fff; font-size: 0.75rem; cursor: pointer; transition: all 0.3s ease; font-weight: 600; }
        .chip.active { background: var(--secondary); color: #fff; border-color: var(--secondary); }
        
        .exo-inputs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 1.5rem 0; }
        .input-field label { display: flex; align-items: center; gap: 6px; font-size: 0.7rem; font-weight: 600; color: #777; margin-bottom: 6px; }
        .input-field input { width: 100%; padding: 0.65rem; border-radius: 10px; border: 1px solid #ddd; font-family: var(--font-body); font-size: 0.95rem; }
        .input-field input:focus { border-color: var(--secondary); outline: none; box-shadow: 0 0 0 3px rgba(212, 163, 115, 0.1); }
        
        .horizon-control { margin-top: 1rem; }
        .range-slider { width: 100%; height: 6px; border-radius: 5px; background: #ddd; accent-color: var(--primary); outline: none; }

        .warning-badge { display: flex; align-items: center; gap: 10px; background: #fffbeb; border: 1px solid #fef3c7; color: #92400e; padding: 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; margin: 1rem 0; }
        @keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }

        .forecast-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 12px; height: 3.5rem; font-size: 1rem; margin-top: 1rem; }
        
        .error-alert { margin-top: 1.5rem; background: #fff1f2; color: #e11d48; padding: 0.75rem; border-radius: 10px; border: 1px solid #fecdd3; display: flex; flex-direction: column; gap: 4px; }
        
        .results-container { min-height: 600px; }
        .placeholder-results { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #aaa; text-align: center; border: 2px dashed var(--glass-border); background: transparent; }
        
        .overall-prediction { display: flex; align-items: center; justify-content: space-around; padding: 1.5rem; margin-bottom: 2rem; background: var(--primary); color: #fff; border-radius: 20px; }
        .overall-prediction .kpi { text-align: center; flex: 1; }
        .overall-prediction .kpi.highlight .value { color: var(--secondary); }
        .overall-prediction .label { display: block; font-size: 0.8rem; opacity: 0.8; margin-bottom: 4px; }
        .overall-prediction .value { display: block; font-size: 2rem; font-weight: 800; font-family: var(--font-header); line-height: 1; }
        .overall-prediction .unit { font-size: 0.75rem; font-weight: 600; color: #fff; opacity: 0.6; margin-top: 4px; display: block; }
        .overall-prediction .divider { width: 1px; height: 50px; background: rgba(255,255,255,0.2); }
        
        .full-width { grid-column: 1 / -1; }
        .chart-header { display: flex; align-items: flex-start; gap: 12px; color: var(--primary); }
        .chart-header h3 { font-size: 1rem; font-family: var(--font-header); }
        .chart-header .subtitle { font-size: 0.8rem; opacity: 0.7; color: #666; }
        .chart-footer { margin-top: 1rem; font-size: 0.75rem; color: #999; text-align: center; font-style: italic; }

        .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem; }
        .chart-card h3 { font-size: 0.9rem; margin-bottom: 1rem; color: #555; }
        
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        
        @media (max-width: 1100px) {
          .forecast-grid { grid-template-columns: 1fr; }
          .charts-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

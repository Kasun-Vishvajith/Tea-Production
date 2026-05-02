"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical,
  TrendingUp,
  Droplets,
  Thermometer,
  ShieldCheck,
  Activity,
  Target,
  Zap,
  Compass,
  CheckCircle2,
  XCircle,
  Layers,
  Scale,
  BarChart2,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import cachedData from "../../data/cached_results.json";

interface CoeffResult {
  factor: string;
  effect: number;
  p_value: number;
  decision: string;
  significance: string;
}

interface ElevationData {
  stationarity: { original: string; final: string; diff: number };
  ljung_box: { p_value: number; status: string };
  coefficients: CoeffResult[];
  lr_test_p: number;
  confidence: string;
  analysis: string;
}

type StatsResponse = Record<string, ElevationData>;

const ELEVATION_META: Record<string, { title: string; img: string; range: string; desc: string }> = {
  high: {
    title: "High Grown",
    img: "/images/High.webp",
    range: "1,200m +",
    desc: "Nuwara Eliya & Dimbula regions. Floral, delicate yield characteristics."
  },
  medium: {
    title: "Medium Grown",
    img: "/images/medium.webp",
    range: "600m - 1,200m",
    desc: "Kandy & Matale. Balanced body and strength outcomes."
  },
  low: {
    title: "Low Grown",
    img: "/images/LOW.webp",
    range: "Sea Level - 600m",
    desc: "Ruhuna & Sabaragamuwa. Deep, malty production density."
  }
};

const FACTOR_META: Record<string, { label: string; icon: any; unit: string }> = {
  rainfall: { label: "Rainfall", icon: TrendingUp, unit: "mm" },
  humidity: { label: "Humidity", icon: Droplets, unit: "%" },
  temperature: { label: "Air Temperature", icon: Thermometer, unit: "°C" }
};

export default function HypothesisPage() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [selectedElevation, setSelectedElevation] = useState("high");
  const [selectedFactor, setSelectedFactor] = useState("rainfall");
  const [alpha, setAlpha] = useState(0.05);

  useEffect(() => {
    setData(cachedData as StatsResponse);
  }, []);

  if (!data) {
    return (
      <div className="loading-state">
        <FlaskConical size={48} className="text-gold" />
        <p>Initializing Hypothesis Engine...</p>
      </div>
    );
  }

  const elevations = ["high", "medium", "low"].filter(e => data[e]);
  const factors = ["rainfall", "humidity", "temperature"];
  const elevData = data[selectedElevation];
  const allCoeffs = elevData?.coefficients || [];
  const coeffData = allCoeffs.find(c => c.factor === selectedFactor);
  const isSignificant = coeffData ? coeffData.p_value <= alpha : false;

  return (
    <div className="hypothesis-page">
      {/* --- Page Header (matching Forecast / Home) --- */}
      <header className="page-header">
        <h1>Hypothesis Laboratory</h1>
        <p>
          Statistical inference modeling of climatic variables on Sri Lankan tea
          yield using SARIMAX causal analysis.
        </p>
      </header>

      <div className="hypothesis-grid">
        {/* ============ LEFT: Controls Panel ============ */}
        <section className="glass-card input-card">
          <div className="section-title">
            <div className="title-group">
              <FlaskConical size={20} />
              <h2>Parameters</h2>
            </div>
          </div>

          {/* Elevation Selector */}
          <div className="form-group">
            <label><Layers size={14} /> Elevation Zone</label>
            <div className="select-grid">
              {elevations.map(e => (
                <button
                  key={e}
                  className={`select-btn ${selectedElevation === e ? "active" : ""}`}
                  onClick={() => setSelectedElevation(e)}
                >
                  {e.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Factor Selector */}
          <div className="form-group">
            <label><Activity size={14} /> Climate Regressor</label>
            <div className="factor-chips">
              {factors.map(f => {
                const Icon = FACTOR_META[f].icon;
                return (
                  <button
                    key={f}
                    className={`chip ${selectedFactor === f ? "active" : ""}`}
                    onClick={() => setSelectedFactor(f)}
                  >
                    <Icon size={14} />
                    {FACTOR_META[f].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alpha Selector */}
          <div className="form-group">
            <label><Scale size={14} /> Significance Level (α)</label>
            <div className="select-grid alpha-grid">
              {[0.01, 0.05, 0.1].map(val => (
                <button
                  key={val}
                  className={`select-btn alpha-btn ${alpha === val ? "active" : ""}`}
                  onClick={() => setAlpha(val)}
                >
                  {val}
                </button>
              ))}
            </div>
            <span className="helper-text">
              Lower α = more stringent rejection threshold.
            </span>
          </div>

          {/* Context Mini-Card */}
          <div className="context-card">
            <div className="context-img-wrap">
              <Image
                src={ELEVATION_META[selectedElevation].img}
                alt={selectedElevation}
                fill
                style={{ objectFit: "cover" }}
              />
              <div className="range-badge">{ELEVATION_META[selectedElevation].range}</div>
            </div>
            <div className="context-body">
              <h4>{ELEVATION_META[selectedElevation].title}</h4>
              <p>{ELEVATION_META[selectedElevation].desc}</p>
            </div>
          </div>
        </section>

        {/* ============ RIGHT: Results ============ */}
        <section className="results-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedElevation}-${selectedFactor}-${alpha}`}
              className="results-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {/* KPI Row */}
              <div className="kpi-grid">
                <div className="glass-card kpi-card">
                  <div className="kpi-icon">
                    {isSignificant ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">Decision</span>
                    <div className="kpi-value-container">
                      <span className={`kpi-value ${isSignificant ? "" : "fail"}`}>
                        {isSignificant ? "Reject H₀" : "Fail to Reject H₀"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="glass-card kpi-card">
                  <div className="kpi-icon"><Target size={20} /></div>
                  <div className="kpi-content">
                    <span className="kpi-label">p-value</span>
                    <div className="kpi-value-container">
                      <span className="kpi-value">{coeffData?.p_value.toFixed(4)}</span>
                      <span className="kpi-unit">vs α={alpha}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card kpi-card">
                  <div className="kpi-icon"><BarChart2 size={20} /></div>
                  <div className="kpi-content">
                    <span className="kpi-label">Effect Size</span>
                    <div className="kpi-value-container">
                      <span className="kpi-value">
                        {coeffData?.effect !== undefined && coeffData.effect > 0 ? "+" : ""}
                        {coeffData?.effect.toFixed(2)}
                      </span>
                      <span className="kpi-unit">kg/unit</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hypothesis Definition */}
              <div className="glass-card hypothesis-def">
                <div className="hyp-row">
                  <div className="hyp-item">
                    <span className="hyp-tag null">H₀ — Null Hypothesis</span>
                    <p>{FACTOR_META[selectedFactor].label} has <strong>no significant effect</strong> on tea production at the {ELEVATION_META[selectedElevation].title} zone.</p>
                  </div>
                  <div className="hyp-divider" />
                  <div className="hyp-item">
                    <span className="hyp-tag alt">H₁ — Alternative Hypothesis</span>
                    <p>{FACTOR_META[selectedFactor].label} has a <strong>significant effect</strong> on tea production at the {ELEVATION_META[selectedElevation].title} zone.</p>
                  </div>
                </div>
              </div>

              {/* Primary Result Card */}
              <div className="glass-card primary-result">
                <div className="result-header">
                  <div>
                    <div className="badge-gold">
                      <FlaskConical size={14} /> {FACTOR_META[selectedFactor].label} → {ELEVATION_META[selectedElevation].title}
                    </div>
                    <h3>Statistical Inference Result</h3>
                    <p>Testing: Does {selectedFactor} significantly affect tea production at the {selectedElevation} elevation zone?</p>
                  </div>
                  <div className={`status-pill ${isSignificant ? "sig" : "nsig"}`}>
                    {isSignificant ? "SIGNIFICANT" : "NOT SIGNIFICANT"}
                  </div>
                </div>

                <div className="result-body">
                  {/* Gauge */}
                  <div className="gauge-area">
                    <div className="gauge-ring">
                      <svg viewBox="0 0 160 160">
                        <circle
                          cx="80" cy="80" r="60"
                          fill="none"
                          stroke="rgba(0,0,0,0.04)"
                          strokeWidth="10"
                        />
                        <motion.circle
                          cx="80" cy="80" r="60"
                          fill="none"
                          stroke={isSignificant ? "var(--primary)" : "#e11d48"}
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 60}
                          initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                          animate={{
                            strokeDashoffset:
                              2 * Math.PI * 60 -
                              Math.min(1, 1 - (coeffData?.p_value || 0)) *
                                2 * Math.PI * 60
                          }}
                          transition={{ duration: 1.2, ease: "circOut" }}
                          transform="rotate(-90 80 80)"
                        />
                      </svg>
                      <div className="gauge-center">
                        <span className="gauge-label">p-value</span>
                        <span className={`gauge-value ${isSignificant ? "" : "fail"}`}>
                          {coeffData?.p_value.toFixed(3)}
                        </span>
                        <span className="gauge-alpha">α = {alpha}</span>
                      </div>
                    </div>
                  </div>

                  {/* Narrative */}
                  <div className="narrative-area">
                    <div className="statement">
                      <span className="statement-label">Causal Assessment</span>
                      <h2 className="statement-headline">
                        {isSignificant
                          ? "Evidence supports a significant climatic influence on yield."
                          : "Insufficient evidence to confirm climatic influence at this threshold."}
                      </h2>
                    </div>

                    <div className="metrics-row">
                      <div className="metric">
                        <span className="metric-label">Effect Coefficient</span>
                        <span className={`metric-value ${coeffData?.effect !== undefined && coeffData.effect >= 0 ? "" : "negative"}`}>
                          {coeffData?.effect !== undefined && coeffData.effect > 0 ? "+" : ""}
                          {coeffData?.effect.toFixed(3)}
                        </span>
                      </div>
                      <div className="metric-divider" />
                      <div className="metric">
                        <span className="metric-label">Formal Decision</span>
                        <span className={`metric-value decision ${isSignificant ? "" : "fail"}`}>
                          {isSignificant ? "Reject H₀" : "Fail to Reject H₀"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engine Badge */}
              <div className="engine-badge">
                <Zap size={16} className="text-gold" />
                <span>Engine: SARIMAX Causal Inference · Significance Level α = {alpha} · Dataset: 2013—2023 Sri Lankan Tea Board</span>
              </div>

            </motion.div>
          </AnimatePresence>
        </section>
      </div>

      <style jsx>{`
        .hypothesis-page { padding: 1rem 0; }
        .loading-state { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; color: #999; }

        /* Header — matches Forecast page exactly */
        .page-header { margin-bottom: 2.5rem; }
        .page-header h1 { color: var(--primary); font-family: var(--font-header); font-size: 2.5rem; letter-spacing: -0.02em; }
        .page-header p { color: #666; font-size: 1.1rem; max-width: 600px; }

        /* Grid — matches Forecast: sidebar + main */
        .hypothesis-grid { display: grid; grid-template-columns: 420px 1fr; gap: 2rem; }

        /* Input Card (sidebar) — matches Forecast input-card */
        .section-title { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; color: var(--primary); }
        .section-title h2 { font-size: 1.25rem; font-family: var(--font-header); }
        .title-group { display: flex; align-items: center; gap: 8px; }

        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 0.85rem; margin-bottom: 12px; color: #555; }

        .select-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .select-btn { padding: 0.6rem; border: 1px solid #ddd; border-radius: 12px; background: #fff; font-family: var(--font-body); font-size: 0.75rem; cursor: pointer; transition: all 0.3s ease; font-weight: 600; }
        .select-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); box-shadow: 0 4px 12px rgba(21, 71, 52, 0.2); }
        .alpha-btn.active { background: var(--secondary); border-color: var(--secondary); }

        .factor-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .chip { padding: 0.5rem 0.9rem; border-radius: 20px; border: 1px solid #ddd; background: #fff; font-size: 0.75rem; cursor: pointer; transition: all 0.3s ease; font-weight: 600; display: flex; align-items: center; gap: 6px; }
        .chip.active { background: var(--secondary); color: #fff; border-color: var(--secondary); }

        .helper-text { display: block; font-size: 0.7rem; color: #999; margin-top: 8px; font-style: italic; }

        /* Context card — matches Elevation card style from Home */
        .context-card { border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.5); margin-top: 0.5rem; }
        .context-img-wrap { height: 180px; position: relative; overflow: hidden; margin: 8px 8px 0; border-radius: 14px; }
        .context-img-wrap img { object-fit: cover; }
        .range-badge { position: absolute; bottom: 12px; left: 12px; background: rgba(0,0,0,0.6); color: #fff; padding: 0.35rem 0.75rem; border-radius: 8px; font-size: 0.7rem; font-weight: 700; backdrop-filter: blur(12px); }
        .context-body { padding: 1.25rem 1rem 1.5rem; }
        .context-body h4 { font-size: 1.15rem; color: var(--primary); margin-bottom: 0.5rem; font-family: var(--font-header); }
        .context-body p { font-size: 0.85rem; color: #666; line-height: 1.6; margin: 0; }

        /* Results */
        .results-container { min-height: 600px; }

        /* KPI Grid — 3 equal columns for statistical results */
        .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 2rem; }
        .kpi-card { padding: 1.5rem; display: flex; align-items: center; gap: 1.25rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.4); background: rgba(255,255,255,0.7) !important; flex: 1; }
        .kpi-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(212, 163, 115, 0.1); color: var(--secondary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .kpi-label { display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 0.2rem; }
        .kpi-value { font-size: 1.1rem; font-weight: 800; color: var(--primary); letter-spacing: -0.02em; }
        .kpi-value.fail { color: #e11d48; }
        .kpi-unit { font-size: 0.7rem; font-weight: 600; color: var(--secondary); margin-left: 0.3rem; opacity: 0.7; }

        /* Primary Result Card */
        .primary-result { padding: 2.5rem; margin-bottom: 2rem; }
        .result-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; gap: 1.5rem; flex-wrap: wrap; }
        .result-header h3 { font-size: 1.5rem; color: var(--primary); margin: 0.75rem 0 0.5rem; font-family: var(--font-header); }
        .result-header p { font-size: 0.9rem; color: #666; max-width: 500px; margin: 0; }
        .badge-gold { display: inline-flex; align-items: center; gap: 8px; background: rgba(212, 163, 115, 0.1); color: var(--secondary); padding: 0.4rem 0.9rem; border-radius: 20px; font-weight: 700; font-size: 0.75rem; }
        .text-gold { color: var(--secondary); }

        .status-pill { padding: 0.5rem 1.25rem; border-radius: 12px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; white-space: nowrap; }
        .status-pill.sig { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .status-pill.nsig { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

        .result-body { display: grid; grid-template-columns: 240px 1fr; gap: 3rem; align-items: center; }

        /* Gauge */
        .gauge-area { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
        .gauge-ring { position: relative; width: 180px; height: 180px; }
        .gauge-ring svg { width: 100%; height: 100%; }
        .gauge-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .gauge-label { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #999; }
        .gauge-value { font-size: 2rem; font-weight: 800; color: var(--primary); font-family: var(--font-header); }
        .gauge-value.fail { color: #e11d48; }
        .gauge-alpha { font-size: 0.65rem; font-weight: 600; color: #aaa; margin-top: 2px; background: rgba(0,0,0,0.03); padding: 2px 8px; border-radius: 6px; }
        .gauge-caption { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #999; }

        /* Narrative */
        .narrative-area { display: flex; flex-direction: column; gap: 2rem; }
        .statement-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--secondary); display: block; margin-bottom: 0.5rem; }
        .statement-headline { font-size: 1.6rem; font-family: var(--font-header); color: var(--primary); line-height: 1.3; letter-spacing: -0.02em; margin: 0; font-weight: 700; }

        .metrics-row { display: flex; align-items: stretch; gap: 0; border-top: 1px solid rgba(0,0,0,0.06); padding-top: 1.5rem; }
        .metric { flex: 1; display: flex; flex-direction: column; gap: 0.3rem; padding: 0 1.25rem; }
        .metric:first-child { padding-left: 0; }
        .metric-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; }
        .metric-value { font-size: 1.3rem; font-weight: 800; color: var(--primary); font-family: var(--font-header); }
        .metric-value.negative { color: #e11d48; }
        .metric-value.decision { font-size: 1.05rem; }
        .metric-value.decision.fail { color: #e11d48; }
        .metric-divider { width: 1px; background: rgba(0,0,0,0.08); flex-shrink: 0; }

        /* Hypothesis Definition */
        .hypothesis-def { padding: 1.5rem 2rem; margin-bottom: 2rem; }
        .hyp-row { display: flex; gap: 2rem; align-items: stretch; }
        .hyp-item { flex: 1; }
        .hyp-tag { display: inline-block; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 0.25rem 0.7rem; border-radius: 6px; margin-bottom: 0.6rem; }
        .hyp-tag.null { background: #fee2e2; color: #991b1b; }
        .hyp-tag.alt { background: #dcfce7; color: #166534; }
        .hyp-item p { font-size: 0.9rem; color: #555; line-height: 1.5; margin: 0; }
        .hyp-item p strong { color: var(--primary); }
        .hyp-divider { width: 1px; background: rgba(0,0,0,0.06); flex-shrink: 0; }

        /* Card Header */
        .card-header { margin-bottom: 1.5rem; }
        .header-icon-group { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .icon-box { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .icon-box.amber { background: #fffbeb; color: #92400e; }
        .card-header h3 { font-size: 1.15rem; font-weight: 700; color: var(--primary); font-family: var(--font-header); }
        .text-sub { font-size: 0.8rem; color: #888; margin: 0; }

        /* Integrity Card — Landscape */
        .integrity-card { padding: 2rem; margin-bottom: 2rem; }
        .integrity-rows { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
        .integrity-item { padding: 1.25rem; background: rgba(255,255,255,0.5); border-radius: 14px; border: 1px solid rgba(0,0,0,0.03); }
        .integ-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 0.5rem; }
        .integ-row { display: flex; align-items: center; justify-content: space-between; }
        .integ-value { font-size: 1.1rem; font-weight: 800; color: var(--primary); font-family: var(--font-header); }
        .integ-badge { padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.65rem; font-weight: 700; }
        .integ-badge.pass { background: #dcfce7; color: #166534; }
        .integ-badge.warn { background: #fef3c7; color: #92400e; }
        .integ-note { display: block; font-size: 0.7rem; color: #999; margin-top: 0.4rem; }

        .analysis-summary { margin-top: 1.5rem; padding: 1rem; background: rgba(212, 163, 115, 0.06); border-radius: 12px; display: flex; align-items: flex-start; gap: 10px; }
        .analysis-summary p { font-size: 0.85rem; color: #555; line-height: 1.5; margin: 0; }

        /* Engine Badge */
        .engine-badge { display: flex; align-items: center; gap: 10px; padding: 1rem 1.5rem; background: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.3); border-radius: 16px; font-size: 0.7rem; font-weight: 600; color: #888; letter-spacing: 0.02em; }

        @media (max-width: 1100px) {
          .hypothesis-grid { grid-template-columns: 1fr; }
          .kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .result-body { grid-template-columns: 1fr; }
          .integrity-rows { grid-template-columns: 1fr; }
          .hyp-row { flex-direction: column; }
          .hyp-divider { width: 100%; height: 1px; }
          .metrics-row { flex-direction: column; gap: 1rem; }
          .metric { padding: 0; }
          .metric-divider { width: 100%; height: 1px; }
        }
      `}</style>
    </div>
  );
}

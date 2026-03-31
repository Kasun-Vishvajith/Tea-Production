"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Info, Target, BarChart, FlaskConical, Globe, BookOpen, 
  Upload, CheckCircle2, AlertCircle, Trash2, Cpu, Database, Save, RefreshCw
} from "lucide-react";

export default function AboutPage() {
  const [modelStatus, setModelStatus] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<any>(null);
  const [files, setFiles] = useState<Record<string, File | null>>({
    total_sarimax: null,
    share_catboost: null,
    high_sarimax: null,
    medium_sarimax: null,
    low_sarimax: null
  });

  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const objectives = [
    { icon: <Target />, title: "Precision Forecasting", desc: "Utilizing SARIMAX and CatBoost to achieve high-accuracy monthly yield predictions." },
    { icon: <Globe />, title: "Macro-Climatic Insights", desc: "Quantifying the specific impact of tropical Rainfall, Humidity, and Temperature gradients." },
    { icon: <BarChart />, title: "Granular Analysis", desc: "Evaluating 21 unique combinations of 3 elevations and 7 diverse tea types." },
    { icon: <FlaskConical />, title: "Research-Driven", desc: "A rigorous statistical approach to Sri Lanka's tea production history and future trends." }
  ];

  const fetchStatus = async () => {
    try {
      const res = await fetch("http://localhost:8000/model-status");
      const data = await res.json();
      setModelStatus(data);
    } catch (e) {
      console.error("Failed to fetch model status", e);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFiles(prev => ({ ...prev, [key]: file }));
  };

  const handleUpload = async () => {
    setUploading(true);
    setMessage(null);
    const formData = new FormData();
    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });

    try {
      const res = await fetch("http://localhost:8000/upload-models", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      // Update engine
      await fetch("http://localhost:8000/update-engine", { method: "POST" });
      
      setMessage({ type: 'success', text: data.message });
      fetchStatus();
      // Clear files
      setFiles({
        total_sarimax: null,
        share_catboost: null,
        high_sarimax: null,
        medium_sarimax: null,
        low_sarimax: null
      });
    } catch (e) {
      setMessage({ type: 'error', text: "Upload failed. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete custom models and revert to defaults?")) return;
    try {
      await fetch("http://localhost:8000/delete-models", { method: "DELETE" });
      setMessage({ type: 'success', text: "Custom models removed. Reverted to system defaults." });
      fetchStatus();
    } catch (e) {
      setMessage({ type: 'error', text: "Deletions failed." });
    }
  };

  const modelConfigs = [
    { id: "share_catboost", label: "Shared CatBoost Model", icon: <Database size={18} /> },
    { id: "total_sarimax", label: "Total SARIMAX Model", icon: <Cpu size={18} /> },
    { id: "high_sarimax", label: "High Elevation SARIMAX", icon: <Globe size={18} /> },
    { id: "medium_sarimax", label: "Medium Elevation SARIMAX", icon: <BarChart size={18} /> },
    { id: "low_sarimax", label: "Low Elevation SARIMAX", icon: <FlaskConical size={18} /> },
  ];

  return (
    <div className="about-page">
      <header className="page-header">
        <div className="badge"><BookOpen size={14} /> Abstract & Scope</div>
        <h1>About the Research</h1>
        <p>A comprehensive analytical study on predicting monthly tea production in Sri Lanka using advanced machine learning models.</p>
      </header>

      <section className="research-summary glass-card">
         <div className="summary-content">
            <Info size={32} className="text-gold" />
            <p>
               This application serves as the primary interface for our research into the <strong>Sri Lankan Tea Production Dynamics</strong>. 
               By integrating historical harvest data with fluctuating climatic parameters, we provide a robust framework for understanding 
               and forecasting the output of one of the world's most vital tea-producing nations.
            </p>
         </div>
      </section>

      <div className="objectives-grid">
         {objectives.map((o, idx) => (
            <motion.div 
               key={o.title}
               className="glass-card objective-card"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
            >
               <div className="obj-icon">{o.icon}</div>
               <h3>{o.title}</h3>
               <p>{o.desc}</p>
            </motion.div>
         ))}
      </div>

      {/* Model Laboratory / Upload Section */}
      <section id="model-upload" className="model-lab-section">
         <header className="section-title">
            <FlaskConical size={24} className="text-gold" />
            <h2>Model Laboratory</h2>
            <p>Upload and manage custom trained models to override system defaults.</p>
         </header>

         <div className="glass-card model-lab-container">
            <div className="model-list">
               {modelConfigs.map((cfg) => {
                 const isCustom = modelStatus?.[cfg.id];
                 const selectedFile = files[cfg.id];
                 
                 return (
                   <div key={cfg.id} className="model-upload-row">
                     <div className="model-info">
                       <div className="model-icon-box">{cfg.icon}</div>
                       <div className="model-labels">
                         <strong>{cfg.label}</strong>
                         <div className={`status-badge ${isCustom ? 'custom' : 'default'}`}>
                           {isCustom ? <CheckCircle2 size={12} /> : null}
                           {isCustom ? 'Active Custom' : 'System Default'}
                         </div>
                       </div>
                     </div>

                     <div className="model-controls">
                        <label className={`file-input-label ${selectedFile ? 'selected' : ''}`}>
                          {selectedFile ? selectedFile.name : 'Choose File'}
                          <input 
                            type="file" 
                            accept=".joblib"
                            onChange={(e) => handleFileChange(cfg.id, e)} 
                            hidden 
                          />
                        </label>
                        {selectedFile && (
                          <button className="clear-file" onClick={() => setFiles(p => ({...p, [cfg.id]: null}))}>&times;</button>
                        )}
                     </div>
                   </div>
                 );
               })}
            </div>

            <div className="lab-actions">
               <div className="lab-info">
                  <AlertCircle size={16} />
                  <span>Updates will re-initialize the real-time forecasting engine.</span>
               </div>
               
               <div className="action-buttons">
                  <button 
                    className="btn-lab danger" 
                    onClick={handleDelete}
                    disabled={!Object.values(modelStatus || {}).some(v => v)}
                  >
                    <Trash2 size={18} /> Delete Custom Models
                  </button>
                  
                  <button 
                    className="btn-lab primary" 
                    onClick={handleUpload}
                    disabled={uploading || !Object.values(files).some(v => v !== null)}
                  >
                    {uploading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                    {uploading ? 'Updating Environment...' : 'Apply & Update Models'}
                  </button>
               </div>
            </div>

            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`lab-message ${message.type}`}
                >
                  {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>
         </div>
      </section>

      <style jsx>{`
        .about-page { padding: 1rem 0 6rem; max-width: 1000px; margin: 0 auto; }
        .page-header { margin-bottom: 3rem; text-align: center; display: flex; flex-direction: column; align-items: center; }
        .page-header h1 { font-size: 3rem; color: var(--primary); margin-bottom: 1rem; }
        .page-header p { font-size: 1.15rem; color: #666; max-width: 700px; }
        
        .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(212, 163, 115, 0.1); color: var(--secondary); padding: 0.4rem 1rem; border-radius: 20px; font-weight: 700; font-size: 0.8rem; margin-bottom: 1.5rem; }

        .research-summary { padding: 3rem; margin-bottom: 4rem; }
        .summary-content { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1.5rem; }
        .summary-content p { font-size: 1.25rem; color: #444; line-height: 1.7; max-width: 800px; }
        .text-gold { color: var(--secondary); }

        .objectives-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; margin-bottom: 6rem; }
        .objective-card { display: flex; flex-direction: column; gap: 1rem; padding: 2.5rem; }
        .obj-icon { color: var(--primary); background: rgba(21, 71, 52, 0.05); width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 12px; margin-bottom: 0.5rem; }
        .objective-card h3 { font-size: 1.25rem; color: var(--primary); }
        .objective-card p { font-size: 0.95rem; color: #666; line-height: 1.6; }

        /* --- Model Lab Section --- */
        .model-lab-section { border-top: 1px solid rgba(0,0,0,0.05); padding-top: 5rem; }
        .section-title { text-align: center; margin-bottom: 3rem; }
        .section-title h2 { font-size: 2.25rem; color: var(--primary); margin: 0.5rem 0; }
        .section-title p { color: #666; font-size: 1.1rem; }

        .model-lab-container { padding: 2.5rem; }
        .model-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2.5rem; }
        
        .model-upload-row { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem; background: rgba(255,255,255,0.4); border-radius: 16px; border: 1px solid rgba(0,0,0,0.03); }
        
        .model-info { display: flex; align-items: center; gap: 1.25rem; }
        .model-icon-box { width: 44px; height: 44px; background: #fff; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
        
        .model-labels { display: flex; flex-direction: column; gap: 4px; }
        .model-labels strong { font-size: 0.95rem; color: var(--primary); }
        
        .status-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
        .status-badge.default { background: #f0f0f0; color: #888; }
        .status-badge.custom { background: #dcfce7; color: #166534; }

        .model-controls { display: flex; align-items: center; gap: 12px; }
        .file-input-label { cursor: pointer; padding: 0.6rem 1.2rem; border-radius: 10px; background: #fff; border: 1px dashed #ccc; font-size: 0.85rem; color: #666; transition: all 0.2s; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .file-input-label:hover { border-color: var(--secondary); color: var(--secondary); background: rgba(212, 163, 115, 0.05); }
        .file-input-label.selected { border-style: solid; border-color: var(--primary); color: var(--primary); font-weight: 600; }
        
        .clear-file { padding: 0 8px; font-size: 1.5rem; border: none; background: transparent; color: #999; cursor: pointer; line-height: 1; }
        .clear-file:hover { color: #e11d48; }

        .lab-actions { border-top: 1px solid rgba(0,0,0,0.06); padding-top: 2rem; display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
        .lab-info { display: flex; align-items: center; gap: 10px; color: #666; font-size: 0.85rem; }
        
        .action-buttons { display: flex; gap: 12px; }
        .btn-lab { display: inline-flex; align-items: center; gap: 8px; padding: 0.8rem 1.5rem; border-radius: 12px; font-family: var(--font-header); font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none; }
        .btn-lab:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .btn-lab.primary { background: var(--primary); color: #fff; }
        .btn-lab.primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(21, 71, 52, 0.2); }
        
        .btn-lab.danger { background: #fff; color: #e11d48; border: 1px solid #fecdd3; }
        .btn-lab.danger:hover:not(:disabled) { background: #fff1f2; border-color: #e11d48; }

        .lab-message { margin-top: 1.5rem; padding: 1rem 1.25rem; border-radius: 12px; display: flex; align-items: center; gap: 12px; font-size: 0.9rem; font-weight: 600; }
        .lab-message.success { background: #dcfce7; color: #166534; }
        .lab-message.error { background: #fee2e2; color: #991b1b; }

        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 800px) {
          .objectives-grid { grid-template-columns: 1fr; }
          .model-upload-row { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .lab-actions { flex-direction: column; align-items: stretch; }
          .action-buttons { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}

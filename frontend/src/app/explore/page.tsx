"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import { 
  Upload, Filter, BarChart3, Table as TableIcon, 
  ChevronDown, ChevronUp, Leaf, Sprout, RefreshCw, Sparkles, Download
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis, AreaChart, Area
} from 'recharts';

// --- Types ---
interface TeaData { [key: string]: any; }
interface ColumnStats { min: number; max: number; }

const REQUIRED_COLS = [
  "Year", "Month", "Elevation", "Rain fall", "Humidity", 
  "Air Tempurature", "Tea Type", "Tea Production", "month_num", "date"
];

const MONTH_ORDER: Record<string, number> = {
  'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
  'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
};
const ELEVATION_ORDER: Record<string, number> = { 'Low Grown': 1, 'Medium Grown': 2, 'High Grown': 3 };

// Theme-matched but visually distinct palette for grouped charts
const CHART_PALETTE = [
  '#154734',  // Forest Green (primary)
  '#d4a373',  // Gold/Oak (secondary)
  '#2d6a4f',  // Emerald
  '#b07d4f',  // Warm Bronze
  '#40916c',  // Sage Teal
  '#8b5e3c',  // Cinnamon
  '#52b788',  // Mint
  '#c97b3d',  // Amber
  '#1b4332',  // Deep Forest
  '#a68a64',  // Khaki Gold
];

const getSeriesColor = (index: number) => CHART_PALETTE[index % CHART_PALETTE.length];

export default function ExplorePage() {
  const [data, setData] = useState<TeaData[]>([]);
  const [loading, setLoading] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [tempData, setTempData] = useState<any[]>([]);
  const [stats, setStats] = useState({ types: 0, elevations: 0, maxProd: { val: 0, year: '', month: '', type: '', elev: '' } });
  const [activeTab, setActiveTab] = useState<'table' | 'graphical'>('table');
  const [visibleCols, setVisibleCols] = useState<string[]>(REQUIRED_COLS);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [columnStats, setColumnStats] = useState<Record<string, ColumnStats>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [xVar, setXVar] = useState('');
  const [yVar, setYVar] = useState('');
  const [groupVar, setGroupVar] = useState('');
  const [aggMode, setAggMode] = useState<'Sum' | 'Avg' | 'Min' | 'Max'>('Sum');

  // --- Persistence ---
  useEffect(() => {
    const savedData = localStorage.getItem("tea_analytics_csv_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setData(parsed);
          calculateStats(parsed);
          calculateColumnStats(parsed);
        }
      } catch (e) {
        console.error("Failed to load saved CSV data", e);
      }
    }
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      localStorage.setItem("tea_analytics_csv_data", JSON.stringify(data));
    } else {
      localStorage.removeItem("tea_analytics_csv_data");
    }
  }, [data]);

  // --- Helpers ---
  const isNumeric = (col: string) => ["Tea Production", "Rain fall", "Humidity", "Air Tempurature", "Year", "month_num"].includes(col);
  const isCategorical = (col: string) => ["Month", "Elevation", "Tea Type", "Year"].includes(col);
  const isDate = (col: string) => col === "date";
  const isTime = (col: string) => col === "date";

  // --- Data Processing ---
  const processData = (raw: any[], mapping: Record<string, string>) => {
    let removedCount = 0;
    const formatted = raw.map(row => {
      const obj: any = {};
      REQUIRED_COLS.forEach(col => {
        const sourceKey = mapping[col] || col;
        let val = row[sourceKey];
        if (isNumeric(col)) val = parseFloat(val);
        obj[col] = val;
      });
      return obj;
    }).filter(row => {
      if (isNaN(row["Tea Production"]) || row["Tea Production"] === null || row["Tea Production"] === undefined) { removedCount++; return false; }
      return true;
    });
    if (removedCount > 0) alert(`Removed ${removedCount} rows with empty Tea Production values.`);
    setData(formatted);
    calculateStats(formatted);
    calculateColumnStats(formatted);
    setImportModal(false);
  };

  const calculateColumnStats = (dataset: TeaData[]) => {
    const s: Record<string, ColumnStats> = {};
    REQUIRED_COLS.forEach(col => {
      if (isNumeric(col)) {
        const vals = dataset.map(d => d[col]).filter(v => !isNaN(v));
        if (vals.length) s[col] = { min: Math.min(...vals), max: Math.max(...vals) };
      }
    });
    setColumnStats(s);
  };

  const calculateStats = (dataset: TeaData[]) => {
    const types = new Set(dataset.map(d => d["Tea Type"])).size;
    const elevations = new Set(dataset.map(d => d.Elevation)).size;
    let max = { val: 0, year: '', month: '', type: '', elev: '' };
    dataset.forEach(d => {
      if (d["Tea Production"] > max.val) {
        max = { val: d["Tea Production"], year: d.Year.toString(), month: d.Month, type: d["Tea Type"], elev: d.Elevation };
      }
    });
    setStats({ types, elevations, maxProd: max });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        setLoading(false);
        const headers = results.meta.fields || [];
        const missing = REQUIRED_COLS.filter(col => !headers.includes(col));
        if (missing.length > 0) {
          setTempData(results.data);
          const initialMap: Record<string, string> = {};
          REQUIRED_COLS.forEach(col => { if (headers.includes(col)) initialMap[col] = col; });
          setMappings(initialMap);
          setImportModal(true);
        } else {
          processData(results.data, {});
        }
      }
    });
  };

  // --- Unique values for categorical filters ---
  const uniqueValues = useMemo(() => {
    const map: Record<string, string[]> = {};
    REQUIRED_COLS.forEach(col => {
      if (isCategorical(col)) {
        map[col] = Array.from(new Set(data.map(d => String(d[col])))).sort((a, b) => {
          if (col === 'Month') return (MONTH_ORDER[a] || 0) - (MONTH_ORDER[b] || 0);
          if (col === 'Elevation') return (ELEVATION_ORDER[a] || 0) - (ELEVATION_ORDER[b] || 0);
          return a.localeCompare(b);
        });
      }
    });
    return map;
  }, [data]);

  // --- Filtered + Sorted Data ---
  const filteredData = useMemo(() => {
    let result = data.filter(row => {
      return Object.entries(filters).every(([col, val]) => {
        if (!val) return true;
        if (Array.isArray(val)) return val.length === 0 || val.includes(String(row[col]));
        if (typeof val === 'object' && ('from' in val || 'to' in val)) {
          // Date range filter
          const rowDate = new Date(row[col]).getTime();
          const fromOk = !val.from || rowDate >= new Date(val.from).getTime();
          const toOk = !val.to || rowDate <= new Date(val.to).getTime();
          return fromOk && toOk;
        }
        if (typeof val === 'object' && ('min' in val || 'max' in val)) {
          const num = row[col];
          const minOk = val.min === undefined || val.min === "" || num >= parseFloat(val.min);
          const maxOk = val.max === undefined || val.max === "" || num <= parseFloat(val.max);
          return minOk && maxOk;
        }
        return true;
      });
    });
    if (sortConfig) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key], bVal = b[sortConfig.key];
        if (sortConfig.key === 'Month') { aVal = MONTH_ORDER[aVal] || 0; bVal = MONTH_ORDER[bVal] || 0; }
        if (sortConfig.key === 'Elevation') { aVal = ELEVATION_ORDER[aVal] || 0; bVal = ELEVATION_ORDER[bVal] || 0; }
        if (sortConfig.key === 'date') { aVal = new Date(aVal).getTime(); bVal = new Date(bVal).getTime(); }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, filters, sortConfig]);

  // --- Chart Data ---
  useEffect(() => {
    if (yVar === "date") { setYVar(xVar); setXVar("date"); }
    if (groupVar === "date") { setGroupVar(""); setXVar("date"); }
  }, [xVar, yVar, groupVar]);

  const chartData = useMemo(() => {
    if (!xVar) return [];
    if (xVar && yVar && isNumeric(xVar) && xVar !== 'Year' && xVar !== 'month_num' && isNumeric(yVar) && !groupVar) return filteredData;
    const groups: Record<string, any> = {};
    filteredData.forEach(d => {
      const key = `${d[xVar]}_${groupVar ? d[groupVar] : 'all'}`;
      if (!groups[key]) groups[key] = { x: d[xVar], group: groupVar ? d[groupVar] : 'all', count: 0, sum: 0, min: Infinity, max: -Infinity };
      const val = yVar ? d[yVar] : 1;
      groups[key].count++; groups[key].sum += val;
      groups[key].min = Math.min(groups[key].min, val);
      groups[key].max = Math.max(groups[key].max, val);
    });
    const result: any[] = [];
    Array.from(new Set(Object.values(groups).map(g => g.x))).forEach(xv => {
      const entry: any = { name: xv };
      Object.values(groups).filter(g => g.x === xv).forEach(g => {
        let v = g.sum;
        if (aggMode === 'Avg') v = g.sum / g.count;
        if (aggMode === 'Min') v = g.min;
        if (aggMode === 'Max') v = g.max;
        entry[g.group] = v;
      });
      result.push(entry);
    });
    return result.sort((a, b) => {
      if (xVar === 'Month') return (MONTH_ORDER[a.name] || 0) - (MONTH_ORDER[b.name] || 0);
      if (xVar === 'Elevation') return (ELEVATION_ORDER[a.name] || 0) - (ELEVATION_ORDER[b.name] || 0);
      return String(a.name).localeCompare(String(b.name));
    });
  }, [filteredData, xVar, yVar, groupVar, aggMode]);

  // --- Chart Renderer ---
  const renderGraph = () => {
    if (!xVar) return (
      <div className="placeholder-results">
        <BarChart3 size={64} style={{ opacity: 0.15, marginBottom: '1rem' }} />
        <p>Select an X variable to begin charting.</p>
      </div>
    );
    const common = { width: "100%", height: 420, data: chartData, margin: { top: 20, right: 30, left: 20, bottom: 20 } };
    if (!yVar && !groupVar) {
      return (
        <ResponsiveContainer {...common}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eee', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
            <Bar dataKey="all" fill="var(--primary)" name={xVar === "Tea Production" ? "Distribution" : "Count"} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    if (isTime(xVar)) {
      const seriesKeys = Object.keys(chartData[0] || {}).filter(k => k !== 'name');
      return (
        <ResponsiveContainer {...common}>
          <AreaChart data={chartData}>
            <defs>
              {seriesKeys.map((k, i) => (
                <linearGradient key={k} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getSeriesColor(i)} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={getSeriesColor(i)} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eee' }} /> <Legend />
            {seriesKeys.map((k, i) => (
              <Area key={k} type="monotone" dataKey={k} stroke={getSeriesColor(i)} fillOpacity={1} fill={`url(#grad-${i})`} strokeWidth={2.5} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );
    }
    if (isNumeric(xVar) && isNumeric(yVar) && xVar !== 'Year' && xVar !== 'month_num') {
      const groupKey = groupVar || 'Elevation';
      const groupNames = Array.from(new Set(filteredData.map(d => String(d[groupKey]))));
      const scatterData = filteredData.slice(0, 1000);

      return (
        <ResponsiveContainer {...common}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis type="number" dataKey={xVar} name={xVar} tick={{ fill: '#666', fontSize: 12 }} />
            <YAxis type="number" dataKey={yVar} name={yVar} tick={{ fill: '#666', fontSize: 12 }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: 12, border: '1px solid #eee' }} />
            <Legend iconType="circle" />
            {groupNames.map((gName, i) => (
              <Scatter
                key={gName}
                name={gName}
                data={scatterData.filter(d => String(d[groupKey]) === gName)}
                fill={getSeriesColor(i)}
                opacity={0.75}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      );
    }
    return (
      <ResponsiveContainer {...common}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eee' }} /> <Legend iconType="circle" />
          {Object.keys(chartData[0] || {}).filter(k => k !== 'name').map((k, i) => (
            <Bar key={k} dataKey={k} fill={getSeriesColor(i)} radius={[8, 8, 0, 0]} barSize={groupVar ? 20 : 40} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
      return { key, direction: 'asc' };
    });
  };

  const handleResetClick = () => { setResetModal(true); };
  const resetFiltersOnly = () => { setFilters({}); setSortConfig(null); setResetModal(false); };
  const resetAll = () => { 
    setData([]); 
    setFilters({}); 
    setSortConfig(null); 
    setColumnStats({}); 
    setStats({ types: 0, elevations: 0, maxProd: { val: 0, year: '', month: '', type: '', elev: '' } }); 
    setXVar(''); setYVar(''); setGroupVar(''); 
    localStorage.removeItem("tea_analytics_csv_data");
    setResetModal(false); 
  };

  const handleDownloadCSV = () => {
    if (filteredData.length === 0) return;
    
    // Only include visible columns in download
    const exportData = filteredData.map(row => {
      const filteredRow: any = {};
      visibleCols.forEach(col => {
        filteredRow[col] = row[col];
      });
      return filteredRow;
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tea_production_filtered_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==================== RENDER ====================
  return (
    <div className="explore-page">
      <header className="page-header">
        <div>
          <h1>Data Discovery</h1>
          <p className="page-subtitle">Explore, filter, and visualize Sri Lankan tea production datasets.</p>
        </div>
        <div className="header-actions">
          {data.length > 0 && (
            <button className="header-btn btn-outline" onClick={handleDownloadCSV}>
              <Download size={16} /> Download CSV
            </button>
          )}
          <button className="header-btn btn-outline" onClick={handleResetClick}><RefreshCw size={16} /> Reset</button>
          <label className="header-btn btn-primary" style={{ cursor: 'pointer' }}>
            <Upload size={16} /> Import CSV
            <input type="file" accept=".csv" hidden onChange={handleFileUpload} />
          </label>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="kpi-grid">
        <div className="glass-card kpi-card">
          <div className="kpi-icon"><Leaf size={28} /></div>
          <div><span className="kpi-label">Tea Types</span><span className="kpi-value">{stats.types || '–'}</span></div>
        </div>
        <div className="glass-card kpi-card">
          <div className="kpi-icon"><Sprout size={28} /></div>
          <div><span className="kpi-label">Elevations</span><span className="kpi-value">{stats.elevations || '–'}</span></div>
        </div>
        <div className="glass-card kpi-card">
          <div className="kpi-icon"><BarChart3 size={28} /></div>
          <div>
            <span className="kpi-label">Peak Production</span>
            <span className="kpi-value">{stats.maxProd.val > 0 ? `${(stats.maxProd.val / 1e6).toFixed(2)}M kg` : '–'}</span>
            {stats.maxProd.val > 0 && <span className="kpi-sub">{stats.maxProd.type} · {stats.maxProd.elev}</span>}
          </div>
        </div>
      </section>

      {/* Main Content Panel */}
      <div className="glass-card content-panel">
        {/* Tab Bar */}
        <div className="tab-bar">
          <button className={`tab ${activeTab === 'table' ? 'active' : ''}`} onClick={() => setActiveTab('table')}>
            <TableIcon size={16} /> Data Table
          </button>
          <button className={`tab ${activeTab === 'graphical' ? 'active' : ''}`} onClick={() => setActiveTab('graphical')}>
            <BarChart3 size={16} /> Visual Explorer
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ============ TABLE VIEW ============ */}
          {activeTab === 'table' ? (
            <motion.div key="table" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="tab-body">
              {/* Column Visibility */}
              <div className="toolbar">
                <div className="section-label"><Sparkles size={16} /> Data Table</div>
                <div className="col-picker">
                  <button className="btn-outline btn-sm"><Filter size={14} /> Columns <ChevronDown size={12} /></button>
                  <div className="col-picker-dropdown glass-card">
                    {REQUIRED_COLS.map(col => (
                      <label key={col} className="col-check">
                        <input type="checkbox" checked={visibleCols.includes(col)} onChange={() => setVisibleCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])} />
                        <span>{col}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      {visibleCols.map(col => (
                        <th key={col}>
                          <div className="th-top" onClick={() => handleSort(col)}>
                            <span className="th-label">{col}</span>
                            <span className="th-sort">
                              <ChevronUp size={10} className={sortConfig?.key === col && sortConfig.direction === 'asc' ? 'sort-active' : 'sort-idle'} />
                              <ChevronDown size={10} className={sortConfig?.key === col && sortConfig.direction === 'desc' ? 'sort-active' : 'sort-idle'} />
                            </span>
                          </div>
                          <div className="th-filter" onClick={(e) => e.stopPropagation()}>
                            {isCategorical(col) ? (
                              <div className="filter-trigger">
                                <button className={`filter-chip ${(filters[col]?.length > 0) ? 'has-filter' : ''}`}><Filter size={10} /> Filter</button>
                                <div className="filter-flyout glass-card">
                                  {uniqueValues[col]?.map(val => (
                                    <label key={val} className="flyout-check">
                                      <input type="checkbox" checked={(filters[col] || []).includes(val)} onChange={(e) => {
                                        const curr = filters[col] || [];
                                        const next = e.target.checked ? [...curr, val] : curr.filter((v: string) => v !== val);
                                        setFilters(p => ({ ...p, [col]: next }));
                                      }} />
                                      <span>{val}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ) : isDate(col) ? (
                              <div className="date-inputs">
                                <input type="date" value={filters[col]?.from ?? ''} onChange={(e) => setFilters(p => ({ ...p, [col]: { ...(p[col] || {}), from: e.target.value } }))} />
                                <input type="date" value={filters[col]?.to ?? ''} onChange={(e) => setFilters(p => ({ ...p, [col]: { ...(p[col] || {}), to: e.target.value } }))} />
                              </div>
                            ) : (
                              <div className="range-inputs">
                                <input type="number" placeholder={`≥ ${columnStats[col]?.min ?? ''}`} value={filters[col]?.min ?? ''} onChange={(e) => setFilters(p => ({ ...p, [col]: { ...(p[col] || {}), min: e.target.value } }))} />
                                <input type="number" placeholder={`≤ ${columnStats[col]?.max ?? ''}`} value={filters[col]?.max ?? ''} onChange={(e) => setFilters(p => ({ ...p, [col]: { ...(p[col] || {}), max: e.target.value } }))} />
                              </div>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.slice(0, 100).map((row, i) => (
                      <tr key={i}>
                        {visibleCols.map(col => (
                          <td key={col}>
                            {typeof row[col] === 'number' && !['Year', 'month_num'].includes(col) ? row[col].toLocaleString() : row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.length > 0 && <div className="record-count">{filteredData.length.toLocaleString()} of {data.length.toLocaleString()} records</div>}
            </motion.div>

          ) : (
            /* ============ GRAPHICAL VIEW ============ */
            <motion.div key="graph" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="tab-body">
              <div className="toolbar">
                <div className="section-label"><Sparkles size={16} /> Visual Explorer</div>
              </div>
              <div className="graph-layout">
                {/* Sidebar */}
                <div className="graph-controls">
                  <div className="control-group">
                    <label className="control-label">X Axis</label>
                    <select value={xVar} onChange={(e) => setXVar(e.target.value)}>
                      <option value="">Select variable…</option>
                      {REQUIRED_COLS.filter(c => c !== yVar && c !== groupVar).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="control-group">
                    <label className="control-label">Y Value</label>
                    <select value={yVar} onChange={(e) => setYVar(e.target.value)}>
                      <option value="">Frequency / Count</option>
                      {REQUIRED_COLS.filter(c => isNumeric(c) && c !== xVar && c !== groupVar).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="control-group">
                    <label className="control-label">Group By</label>
                    <select value={groupVar} onChange={(e) => setGroupVar(e.target.value)}>
                      <option value="">No Grouping</option>
                      {["Elevation", "Tea Type", "Year"].filter(c => c !== xVar && c !== yVar).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="control-group">
                    <label className="control-label">Measure</label>
                    <div className="agg-chips">
                      {(['Sum', 'Avg', 'Min', 'Max'] as const).map(mode => (
                        <button key={mode} className={`chip ${aggMode === mode ? 'active' : ''}`} onClick={() => setAggMode(mode)} disabled={isNumeric(xVar) && isNumeric(yVar) && !['Year', 'month_num'].includes(xVar)}>
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="chart-stage glass-card">
                  {renderGraph()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reset Confirmation Modal */}
      {resetModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-body animate-fade-in reset-dialog">
            <h2>Reset Options</h2>
            <p>Choose what you would like to reset.</p>
            <div className="reset-actions">
              <button className="reset-option" onClick={resetFiltersOnly}>
                <Filter size={20} />
                <div>
                  <strong>Reset Filters &amp; Sorts</strong>
                  <span>Clear all active filters and sort orders. Keep imported data.</span>
                </div>
              </button>
              <button className="reset-option reset-danger" onClick={resetAll}>
                <RefreshCw size={20} />
                <div>
                  <strong>Reset Everything</strong>
                  <span>Remove imported CSV and clear all filters, sorts, and charts.</span>
                </div>
              </button>
            </div>
            <button className="btn-cancel" onClick={() => setResetModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Mapping Modal */}
      {importModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-body animate-fade-in">
            <h2>Column Mapping Required</h2>
            <p>Map your CSV columns to the expected schema.</p>
            <div className="mapping-list">
              {REQUIRED_COLS.map(col => (
                <div key={col} className="mapping-item">
                  <span>{col}</span>
                  <select value={mappings[col] || ''} onChange={(e) => setMappings(p => ({ ...p, [col]: e.target.value }))}>
                    <option value="">Select…</option>
                    {Object.keys(tempData[0] || {}).map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn-primary" onClick={() => processData(tempData, mappings)}>Confirm Mapping</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== STYLES ==================== */}
      <style jsx>{`
        /* --- Page Layout --- */
        .explore-page { padding: 1.5rem 2.5rem; max-width: 1400px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; gap: 1.5rem; margin-top: 1rem; }
        .page-subtitle { color: #666; font-size: 1rem; margin-top: 0.35rem; }
        .header-actions { display: flex; gap: 12px; align-items: center; flex-shrink: 0; }

        /* --- Header Buttons (matched sizing) --- */
        .header-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 0.7rem 1.4rem; border-radius: 12px; font-family: var(--font-header); font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.25s ease; min-width: 140px; height: 44px; text-decoration: none; }
        .header-btn.btn-outline { border: 1px solid #ddd; background: #fff; color: var(--primary); }
        .header-btn.btn-outline:hover { border-color: var(--primary); background: var(--accent); }
        .header-btn.btn-primary { border: none; }
        .btn-sm { padding: 0.45rem 0.9rem; font-size: 0.8rem; }

        /* --- KPI --- */
        .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 1.5rem; }
        .kpi-card { display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem 1.5rem; }
        .kpi-icon { width: 52px; height: 52px; background: var(--accent); color: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .kpi-label { display: block; font-size: 0.8rem; color: #888; font-weight: 500; }
        .kpi-value { display: block; font-size: 1.4rem; font-weight: 800; color: var(--primary); font-family: var(--font-header); line-height: 1.3; }
        .kpi-sub { font-size: 0.72rem; color: var(--secondary); font-weight: 600; }

        /* --- Content Panel --- */
        .content-panel { padding: 0; overflow: hidden; }

        /* --- Tabs --- */
        .tab-bar { display: flex; border-bottom: 1px solid rgba(0,0,0,0.06); }
        .tab { flex: 1; padding: 1rem; border: none; background: transparent; font-family: var(--font-header); font-weight: 700; font-size: 0.9rem; color: #999; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.3s ease; border-bottom: 3px solid transparent; }
        .tab.active { color: var(--primary); background: rgba(255,255,255,0.5); border-bottom-color: var(--primary); }
        .tab:hover:not(.active) { color: #666; background: rgba(0,0,0,0.02); }
        .tab-body { padding: 2rem 2.5rem; }

        /* --- Toolbar --- */
        .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .section-label { display: flex; align-items: center; gap: 10px; font-family: var(--font-header); font-weight: 700; font-size: 1rem; color: var(--primary); }

        /* --- Column Picker --- */
        .col-picker { position: relative; }
        .col-picker-dropdown { position: absolute; top: calc(100% + 8px); right: 0; width: 230px; z-index: 100; display: none; padding: 1rem; flex-direction: column; gap: 8px; }
        .col-picker:hover .col-picker-dropdown { display: flex; }
        .col-check { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; cursor: pointer; color: #444; }
        .col-check input { accent-color: var(--primary); }

        /* --- Table --- */
        .table-container { overflow: auto; max-height: 560px; border-radius: 16px; border: 1px solid rgba(0,0,0,0.06); }
        table { width: 100%; border-collapse: separate; border-spacing: 0; background: #fff; min-width: 900px; }
        th { position: sticky; top: 0; z-index: 10; background: #fafaf8; padding: 0.6rem 0.75rem; text-align: left; border-bottom: 2px solid #eee; vertical-align: top; }
        .th-top { display: flex; align-items: center; justify-content: space-between; cursor: pointer; margin-bottom: 6px; }
        .th-label { font-family: var(--font-header); font-weight: 700; font-size: 0.75rem; color: var(--primary); letter-spacing: 0.02em; text-transform: uppercase; }
        .th-sort { display: flex; flex-direction: column; line-height: 0; }
        .sort-idle { color: #ccc; }
        .sort-active { color: var(--secondary); }
        .th-filter { margin-top: 2px; }

        /* Filter Trigger */
        .filter-trigger { position: relative; }
        .filter-chip { display: inline-flex; align-items: center; gap: 5px; padding: 2px 8px; border-radius: 20px; border: 1px solid #e0e0e0; background: #fff; font-size: 0.68rem; font-weight: 600; color: #999; cursor: pointer; transition: all 0.2s; }
        .filter-chip:hover { border-color: var(--primary); color: var(--primary); }
        .filter-chip.has-filter { background: var(--accent); border-color: var(--primary); color: var(--primary); }
        .filter-flyout { position: absolute; top: calc(100% + 6px); left: 0; width: 200px; z-index: 120; display: none; padding: 1rem; flex-direction: column; gap: 8px; max-height: 260px; overflow-y: auto; }
        .filter-trigger:hover .filter-flyout { display: flex; }
        .flyout-check { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #333; cursor: pointer; padding: 2px 0; }
        .flyout-check input { accent-color: var(--primary); }
        .flyout-check:hover span { color: var(--primary); }

        /* Range Inputs */
        .range-inputs { display: flex; gap: 4px; }
        .range-inputs input { width: 100%; padding: 4px 6px; border-radius: 6px; border: 1px solid #ddd; font-size: 0.7rem; font-family: var(--font-body); }
        .range-inputs input:focus { outline: none; border-color: var(--primary); }

        /* Date Inputs */
        .date-inputs { display: flex; flex-direction: column; gap: 4px; }
        .date-inputs input { width: 100%; padding: 4px 6px; border-radius: 6px; border: 1px solid #ddd; font-size: 0.7rem; font-family: var(--font-body); color: #555; }
        .date-inputs input:focus { outline: none; border-color: var(--primary); }

        /* Table body */
        td { padding: 0.7rem 0.75rem; font-size: 0.85rem; color: #444; border-bottom: 1px solid #f0f0f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        tr:nth-child(even) td { background: var(--accent); }
        tr:hover td { background: rgba(21, 71, 52, 0.04); }

        .record-count { text-align: right; padding: 0.75rem 0 0; font-size: 0.78rem; color: #999; font-weight: 500; }

        /* --- Graph View --- */
        .graph-layout { display: grid; grid-template-columns: 260px 1fr; gap: 1.5rem; }
        .graph-controls { display: flex; flex-direction: column; }
        .control-group { margin-bottom: 1.25rem; }
        .control-label { display: block; font-family: var(--font-header); font-weight: 700; font-size: 0.8rem; color: var(--primary); margin-bottom: 6px; letter-spacing: 0.02em; }
        .control-group select { width: 100%; padding: 0.65rem 0.9rem; border-radius: 12px; border: 1px solid #ddd; font-family: var(--font-body); font-size: 0.85rem; background: #fff; cursor: pointer; transition: border 0.2s; appearance: none; }
        .control-group select:focus { outline: none; border-color: var(--primary); }

        /* Aggregation Chips */
        .agg-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .chip { padding: 0.4rem 0.9rem; border-radius: 20px; border: 1px solid #ddd; background: #fff; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; font-family: var(--font-header); }
        .chip.active { background: var(--secondary); color: #fff; border-color: var(--secondary); box-shadow: 0 3px 10px rgba(212, 163, 115, 0.25); }
        .chip:disabled { opacity: 0.25; cursor: not-allowed; }
        .chip:hover:not(.active):not(:disabled) { border-color: var(--secondary); color: var(--secondary); }

        /* Chart Stage */
        .chart-stage { padding: 1.5rem; display: flex; align-items: center; justify-content: center; min-height: 460px; }
        .placeholder-results { display: flex; flex-direction: column; align-items: center; justify-content: center; color: #bbb; text-align: center; padding: 3rem 2rem; width: 100%; border: 2px dashed rgba(0,0,0,0.08); border-radius: 16px; }

        /* --- Modal Common --- */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
        .modal-body { width: 100%; max-width: 560px; padding: 2rem 2.5rem; }
        .modal-body h2 { margin-bottom: 0.5rem; font-size: 1.3rem; }
        .modal-body p { color: #666; margin-bottom: 1.25rem; font-size: 0.95rem; }

        /* Reset Dialog */
        .reset-dialog { text-align: center; }
        .reset-dialog h2, .reset-dialog p { text-align: left; }
        .reset-actions { display: flex; flex-direction: column; gap: 10px; margin-bottom: 1.25rem; }
        .reset-option { display: flex; align-items: flex-start; gap: 14px; padding: 1rem 1.25rem; border-radius: 14px; border: 1px solid #e8e8e8; background: #fff; cursor: pointer; text-align: left; transition: all 0.2s ease; color: var(--primary); }
        .reset-option:hover { border-color: var(--primary); background: var(--accent); }
        .reset-option strong { display: block; font-family: var(--font-header); font-size: 0.9rem; margin-bottom: 2px; }
        .reset-option span { display: block; font-size: 0.78rem; color: #888; font-weight: 400; line-height: 1.4; }
        .reset-danger { border-color: #fecdd3; }
        .reset-danger:hover { border-color: #e11d48; background: #fff1f2; }
        .reset-danger strong { color: #e11d48; }
        .btn-cancel { width: 100%; padding: 0.7rem; border-radius: 12px; border: 1px solid #ddd; background: transparent; font-family: var(--font-header); font-weight: 600; font-size: 0.85rem; cursor: pointer; color: #888; transition: all 0.2s; }
        .btn-cancel:hover { background: #f5f5f5; color: #555; }

        /* Mapping Modal */
        .mapping-list { display: flex; flex-direction: column; gap: 10px; max-height: 350px; overflow-y: auto; }
        .mapping-item { display: grid; grid-template-columns: 1fr 1.5fr; align-items: center; gap: 1rem; padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0; }
        .mapping-item span { font-weight: 600; color: var(--primary); font-size: 0.85rem; }
        .mapping-item select { padding: 0.55rem; border-radius: 8px; border: 1px solid #ddd; font-family: var(--font-body); font-size: 0.85rem; }

        /* --- Responsive --- */
        @media (max-width: 1100px) {
          .graph-layout { grid-template-columns: 1fr; }
          .kpi-grid { grid-template-columns: 1fr; }
          .page-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}

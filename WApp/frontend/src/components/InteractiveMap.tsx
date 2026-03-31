"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, MapPin, CheckSquare, Square, Info, Map as MapIcon } from "lucide-react";
import mapData from "./mapData.json";

interface District {
  id: string;
  name: string;
  elevation: string[];
  d: string;
}

const ELEVATION_COLORS: Record<string, string> = {
  High: "#D4A373", // Amber/Gold
  Medium: "#4A6741", // Fresh Green
  Low: "#154734", // Dark Emerald
  None: "rgba(0,0,0,0.05)"
};

// For multi-elevation districts, pick the primary (highest-priority) color
const getPrimaryColor = (elevations: string[]): string => {
  const teaElevs = elevations.filter(e => e !== "None");
  if (teaElevs.length === 0) return ELEVATION_COLORS.None;
  // Priority: High > Medium > Low
  if (teaElevs.includes("High")) return ELEVATION_COLORS.High;
  if (teaElevs.includes("Medium")) return ELEVATION_COLORS.Medium;
  return ELEVATION_COLORS.Low;
};

export default function InteractiveMap() {
  const [selectedElevations, setSelectedElevations] = useState<string[]>(["High", "Medium", "Low"]);
  const [hoveredDistrict, setHoveredDistrict] = useState<District | null>(null);

  const toggleElevation = (elev: string) => {
    if (selectedElevations.includes(elev)) {
      setSelectedElevations(selectedElevations.filter(e => e !== elev));
    } else {
      setSelectedElevations([...selectedElevations, elev]);
    }
  };

  const selectAll = () => {
    if (selectedElevations.length === 3) setSelectedElevations([]);
    else setSelectedElevations(["High", "Medium", "Low"]);
  };

  // Group districts for rendering
  const districts = useMemo(() => mapData as District[], []);

  // Generate SVG gradient defs for multi-elevation districts
  const multiElevGradients = useMemo(() => {
    return districts
      .filter(d => {
        const teaElevs = d.elevation.filter(e => e !== "None");
        return teaElevs.length > 1;
      })
      .map(d => {
        const teaElevs = d.elevation.filter(e => e !== "None");
        return { id: d.id, elevations: teaElevs };
      });
  }, [districts]);

  return (
    <div className="interactive-map-wrapper">
      <div className="map-filters glass-card">
        <div className="filter-header">
          <Layers size={18} className="icon-glow" />
          <h3>Regional Distribution</h3>
        </div>
        
        <p className="filter-desc">Filter production zones by geographic elevation.</p>

        <div className="filter-options">
          <button 
            className={`filter-btn all ${selectedElevations.length === 3 ? 'active' : ''}`}
            onClick={selectAll}
          >
            {selectedElevations.length === 3 ? <CheckSquare size={16} /> : <Square size={16} />}
            All Regions
          </button>
          
          {["High", "Medium", "Low"].map(elev => (
            <button 
              key={elev}
              className={`filter-btn ${selectedElevations.includes(elev) ? 'active' : ''}`}
              onClick={() => toggleElevation(elev)}
            >
              <span className="dot" style={{ background: ELEVATION_COLORS[elev], boxShadow: `0 0 10px ${ELEVATION_COLORS[elev]}` }}></span>
              {selectedElevations.includes(elev) ? <CheckSquare size={16} /> : <Square size={16} />}
              {elev} Grown
            </button>
          ))}
        </div>

        <div className="map-stats mt-4">
          <div className="stat-row">
            <span>Tea Districts</span>
            <span className="value">12 Districts</span>
          </div>
          <div className="stat-row">
            <span>Multi-Elevation</span>
            <span className="value">{districts.filter(d => d.elevation.filter(e => e !== "None").length > 1).length} Districts</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {hoveredDistrict && (
            <motion.div 
              key={hoveredDistrict.id}
              className="district-info"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="district-badge" style={{ backgroundColor: getPrimaryColor(hoveredDistrict.elevation) }}>
                {hoveredDistrict.elevation.includes("None") ? <MapIcon size={14} /> : <MapPin size={14} />}
              </div>
              <div className="info-content">
                <strong>{hoveredDistrict.name}</strong>
                <p>
                  {hoveredDistrict.elevation.includes("None")
                    ? "Non-Tea Region"
                    : hoveredDistrict.elevation.filter(e => e !== "None").map(e => `${e} Grown`).join(" · ")}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="svg-container">
        <svg 
          viewBox="0 0 1000 1000" 
          className="lk-map"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="coastal-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            <radialGradient id="ocean-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(34, 197, 94, 0.05)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            <pattern id="topo-lines" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40 Q 10 30, 20 40 T 40 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <path d="M0 20 Q 10 10, 20 20 T 40 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>

            {/* Checkered patterns for multi-elevation districts */}
            {multiElevGradients.map(({ id, elevations }) => (
              <pattern 
                key={`pattern-${id}`} 
                id={`elev-grad-${id}`} 
                x="0" y="0" width="40" height="40" 
                patternUnits="userSpaceOnUse"
              >
                {/* 2x2 Grid of colors */}
                <rect x="0" y="0" width="20" height="20" fill={ELEVATION_COLORS[elevations[0]]} />
                <rect x="20" y="0" width="20" height="20" fill={ELEVATION_COLORS[elevations[1] || elevations[0]]} />
                <rect x="0" y="20" width="20" height="20" fill={ELEVATION_COLORS[elevations[2] || elevations[0]] || ELEVATION_COLORS[elevations[1] || elevations[0]]} />
                <rect x="20" y="20" width="20" height="20" fill={ELEVATION_COLORS[elevations[0]]} />
                
                {/* Subtle divider lines for the "chess" look */}
                <path d="M20 0 V40 M0 20 H40" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
              </pattern>
            ))}
          </defs>

          {/* Background Topography */}
          <rect width="1000" height="1000" fill="url(#topo-lines)" opacity="0.3" />
          <circle cx="500" cy="550" r="450" fill="url(#ocean-gradient)" />
          
          {/* Main Map Group */}
          <g>
            {/* Base silhouette for depth */}
            {districts.map(district => (
               <path
                 key={`base-${district.id}`}
                 d={district.d}
                 fill="rgba(0,0,0,0.3)"
               />
            ))}

            {districts.map(district => {
              const teaElevs = district.elevation.filter(e => e !== "None");
              const isTeaRegion = teaElevs.length > 0;
              const isSelected = isTeaRegion && teaElevs.some(e => selectedElevations.includes(e));
              
              let color: string;
              if (isSelected) {
                if (teaElevs.length > 1) {
                  color = `url(#elev-grad-${district.id})`;
                } else {
                  color = ELEVATION_COLORS[teaElevs[0]];
                }
              } else {
                color = isTeaRegion ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)";
              }
              
              const isHovered = hoveredDistrict?.id === district.id;

              return (
                <motion.path
                  key={district.id}
                  d={district.d}
                  fill={color}
                  stroke={isHovered ? "rgba(21, 71, 52, 1)" : "rgba(21, 71, 52, 0.4)"}
                  strokeWidth={isHovered ? "2" : "1.5"}
                  animate={{ 
                    fill: color,
                    scale: isHovered ? 1.01 : 1,
                    zIndex: hoveredDistrict?.id === district.id ? 50 : 1
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  onMouseEnter={() => setHoveredDistrict(district)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                  className={`district-path ${isTeaRegion ? 'tea-zone' : 'coastal-zone'}`}
                  style={{ 
                    cursor: isTeaRegion ? 'pointer' : 'default',
                    filter: isSelected ? `drop-shadow(0 0 8px ${getPrimaryColor(district.elevation)}44)` : 'none'
                  }}
                />
              );
            })}
          </g>

          {/* Precision Pulse Points Removed as requested */}
        </svg>
      </div>

      <style jsx>{`
        .interactive-map-wrapper {
          display: flex;
          align-items: center;
          gap: 2rem;
          width: 100%;
        }

        .svg-container {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        .lk-map {
          width: 100%;
          max-width: 800px;
          height: auto;
          overflow: visible;
        }

        .district-path {
          outline: none;
        }

        .map-filters {
          width: 300px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.6) !important;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0,0,0,0.05);
          border-radius: 24px;
        }

        .filter-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .filter-header h3 {
          font-size: 1rem;
          margin: 0;
          color: var(--primary);
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .filter-desc {
          font-size: 0.85rem;
          color: #888;
          line-height: 1.5;
          margin: -0.5rem 0 0 0;
        }

        .filter-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-btn {
          background: rgba(0,0,0,0.02);
          border: 1px solid rgba(0,0,0,0.04);
          color: #555;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .filter-btn:hover {
          background: rgba(255,255,255,0.08);
          color: #ccc;
        }

        .filter-btn.active {
          background: rgba(21, 71, 52, 0.05);
          color: var(--primary);
          border-color: rgba(21, 71, 52, 0.1);
        }

        .filter-btn.active .dot {
          transform: scale(1.2);
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          transition: transform 0.3s ease;
        }

        .map-stats {
          border-top: 1px solid rgba(0,0,0,0.05);
          padding-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #666;
        }

        .stat-row .value {
          color: #aaa;
          font-weight: 600;
        }

        .district-info {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          padding: 1rem;
          border-radius: 14px;
          display: flex;
          gap: 12px;
          align-items: center;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          margin-top: 0.5rem;
        }

        .district-badge {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(0,0,0,0.7);
          box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
        }

        .info-content strong {
          display: block;
          font-size: 0.95rem;
          color: var(--primary);
          margin-bottom: 0px;
        }

        .info-content p {
          font-size: 0.8rem;
          margin: 0;
          color: #888;
        }

        .pulse-point {
          filter: drop-shadow(0 0 5px var(--primary));
        }

        .pulse-ring {
          transform-origin: center;
          animation: mapRing 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }

        @keyframes mapRing {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        .icon-glow {
          filter: drop-shadow(0 0 5px var(--secondary));
        }

        @media (max-width: 1024px) {
          .interactive-map-wrapper {
            flex-direction: column-reverse;
            gap: 2rem;
          }
          .map-filters {
            width: 100%;
            position: static;
          }
        }
      `}</style>
    </div>
  );
}

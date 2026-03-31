"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import type { ElevationType } from "./ElevationFilter";

interface SriLankaMapProps {
  selectedElevations: ElevationType[];
}

// Pure Infusion Color Mapping (Light Theme)
const teaDistrictColors: Record<string, string> = {
  HIGH: "#2d5a27",      // Deep Forest
  MEDIUM: "#4caf50",    // Vibrant Leaf
  LOW: "#8bc34a",       // Light Sage
  MIXED: "#689f38",     // Olive Green
  NONE: "#f2f2f7",      // Neutral Gray
};

export default function SriLankaMap({ selectedElevations }: SriLankaMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const geoLayerRef = useRef<L.GeoJSON | null>(null);
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    fetch("/sri_lanka_districts.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Map Data Error:", err));
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [6.8, 80.75],
      zoom: 8,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      fadeAnimation: true,
      preferCanvas: true,
    });

    // Light Neutral Tile Layer
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
      { subdomains: "abcd", maxZoom: 19 }
    ).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const getStyle = useCallback(
    (feature: GeoJSON.Feature | undefined): L.PathOptions => {
      if (!feature?.properties) {
        return { fillColor: teaDistrictColors.NONE, fillOpacity: 0.1, weight: 1, color: "#eee" };
      }

      const districtElevations = (feature.properties.elevation as string[]) || [];
      const hasTea = districtElevations.length > 0;
      
      const isVisible = selectedElevations.length === 0 || 
                         selectedElevations.some((sel) => districtElevations.includes(sel));

      let fillColor = teaDistrictColors.NONE;
      if (hasTea) {
        fillColor = districtElevations.length > 1 ? teaDistrictColors.MIXED : teaDistrictColors[districtElevations[0]];
      }

      return {
        fillColor,
        fillOpacity: isVisible ? (hasTea ? 0.6 : 0.05) : 0.02,
        weight: 1.5,
        color: isVisible ? "white" : "#ddd",
        className: "map-district-path",
      };
    },
    [selectedElevations]
  );

  useEffect(() => {
    if (!mapRef.current || !geoData) return;

    if (geoLayerRef.current) {
      mapRef.current.removeLayer(geoLayerRef.current);
    }

    const geoLayer = L.geoJSON(geoData, {
      style: getStyle,
      onEachFeature: (feature, layer) => {
        if (!feature.properties) return;

        const { name, elevation: elevations, production_note: note } = feature.properties;
        const hasTea = elevations?.length > 0;

        const popupContent = `
          <div class="p-5 min-w-[240px] font-sans">
            <h4 class="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1">Tea District</h4>
            <h3 class="text-xl font-bold text-foreground mb-3">${name}</h3>
            ${hasTea ? `
              <div class="flex flex-wrap gap-2 mb-4">
                ${elevations.map((e: string) => `
                  <span class="px-2.5 py-1 bg-accent/5 rounded-full text-[10px] font-bold text-accent border border-accent/10">${e} GROWN</span>
                `).join("")}
              </div>
            ` : `<p class="text-[10px] text-secondary/40 font-bold mb-4 uppercase">Non-Producing Region</p>`}
            <p class="text-[12px] text-secondary leading-relaxed border-t border-gray-50 pt-3">${note || "Detailed analysis available in insights."}</p>
          </div>
        `;

        layer.bindPopup(popupContent, { closeButton: false, className: "apple-popup", offset: [0, -5] });

        layer.on({
          mouseover: (e) => {
            const target = e.target as L.Path;
            target.setStyle({ fillOpacity: 0.8, weight: 2.5, color: "white" });
            target.bringToFront();
          },
          mouseout: (e) => {
            const target = e.target as L.Path;
            geoLayer.resetStyle(target);
          }
        });
      },
    });

    geoLayer.addTo(mapRef.current);
    geoLayerRef.current = geoLayer;
  }, [geoData, getStyle]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full bg-[#f8faf9]"
      />
      
      {/* Perspective Info */}
      <div className="absolute top-6 left-6 z-[500] pointer-events-none">
         <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-black/5">
            <span className="text-[11px] font-bold text-accent uppercase tracking-widest">Regional Yield Distribution</span>
         </div>
      </div>
    </div>
  );
}

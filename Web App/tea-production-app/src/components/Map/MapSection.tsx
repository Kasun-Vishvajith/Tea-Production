"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import ElevationFilter from "./ElevationFilter";
import type { ElevationType } from "./ElevationFilter";

// Dynamic import to avoid SSR issues with Leaflet
const SriLankaMap = dynamic(() => import("./SriLankaMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-background rounded-2xl">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-accent-green/30 border-t-accent-green rounded-full animate-spin" />
        <span className="text-sm text-foreground/40">Loading map...</span>
      </div>
    </div>
  ),
});

export default function MapSection() {
  const [selectedElevations, setSelectedElevations] = useState<ElevationType[]>([]);

  return (
    <div className="relative w-full" style={{ height: "70vh", minHeight: "500px" }}>
      <ElevationFilter selected={selectedElevations} onChange={setSelectedElevations} />
      <SriLankaMap selectedElevations={selectedElevations} />
    </div>
  );
}

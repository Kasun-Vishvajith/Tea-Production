"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type Mode = "simple" | "expert";

interface Filters {
  elevation: string;
  teaType: string;
}

interface ModeContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("expert"); // Default to expert per previous requests for "Intelligent" features
  const [filters, setFilters] = useState<Filters>({
    elevation: "all",
    teaType: "all",
  });

  return (
    <ModeContext.Provider value={{ mode, setMode, filters, setFilters }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}

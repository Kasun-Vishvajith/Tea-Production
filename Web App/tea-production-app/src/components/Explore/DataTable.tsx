"use client";

import { useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { fetchData } from "@/lib/api";
import { FilterState } from "./SidebarFilters";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface DataTableProps {
  filters: FilterState;
}

export default function DataTable({ filters }: DataTableProps) {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);

  const colDefs = useMemo(
    () => [
      { field: "id", headerName: "Record ID", maxWidth: 120 },
      { field: "date", headerName: "Date", maxWidth: 120, sortable: true },
      { field: "district", headerName: "District", filter: true },
      { field: "elevation_type", headerName: "Elevation" },
      { field: "tea_type", headerName: "Tea Type" },
      {
        field: "production_volume",
        headerName: "Volume (kg)",
        sortable: true,
        valueFormatter: (params: any) =>
          params.value ? Math.floor(params.value).toLocaleString() + " kg" : "-",
      },
    ] as any[],
    []
  );

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { limit: 1000 };
        if (filters.year) params.year = filters.year;
        if (filters.month) params.month = filters.month;
        if (filters.district) params.district = filters.district;
        if (filters.elevation) params.elevation = filters.elevation;
        if (filters.tea_type) params.tea_type = filters.tea_type;

        const res = await fetchData(params);
        if (active) {
          setRowData(Array.isArray(res) ? res : res.data || []);
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [filters]);

  return (
    <div className="glass-card flex-1 h-full overflow-hidden border border-white/5 rounded-2xl flex flex-col relative w-full p-1 bg-background/40">
      {loading && (
        <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center backdrop-blur-sm rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-sm font-medium text-foreground/70">Loading dataset...</span>
          </div>
        </div>
      )}

      <div className="ag-theme-alpine-dark w-full h-full flex-1 p-2" style={{ width: "100%", height: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={colDefs}
          pagination={true}
          paginationPageSize={20}
          paginationPageSizeSelector={[20, 50, 100, 500]}
          domLayout="normal"
          animateRows={true}
          rowSelection="single"
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
            flex: 1,
            minWidth: 100,
          }}
        />
      </div>
      
      <style jsx global>{`
        .ag-theme-alpine-dark {
          --ag-background-color: transparent !important;
          --ag-header-background-color: rgba(255, 255, 255, 0.03) !important;
          --ag-odd-row-background-color: transparent !important;
          --ag-row-border-color: rgba(255, 255, 255, 0.05) !important;
          --ag-border-color: transparent !important;
          --ag-control-panel-background-color: transparent !important;
          --ag-header-column-separator-display: none !important;
          --ag-font-family: inherit !important;
          --ag-font-size: 14px !important;
          --ag-foreground-color: rgba(255, 255, 255, 0.8) !important;
          --ag-header-foreground-color: rgba(255, 255, 255, 0.9) !important;
        }
        .ag-theme-alpine-dark .ag-root-wrapper {
          border: none !important;
          border-radius: 0.5rem;
        }
        .ag-theme-alpine-dark .ag-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .ag-theme-alpine-dark .ag-row {
          transition: background-color 0.2s;
        }
        .ag-theme-alpine-dark .ag-row:hover {
          background-color: rgba(255, 255, 255, 0.05) !important;
        }
        .ag-paging-panel {
          border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
          padding-top: 0.5rem !important;
        }
      `}</style>
    </div>
  );
}

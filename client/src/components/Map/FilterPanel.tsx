// client/src/components/Map/FilterPanel.tsx

import React from "react";
import type { MapFilters } from "@shared/schema";
import { listingPropertyTypes } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FilterPanelProps {
  open:            boolean;
  filters:         MapFilters;
  onFiltersChange: (f: MapFilters) => void;
  onClose:         () => void;
}

export function FilterPanel({ open, filters, onFiltersChange, onClose }: FilterPanelProps) {
  const set = (patch: Partial<MapFilters>) =>
    onFiltersChange({ ...filters, ...patch });

  const clear = () => onFiltersChange({});

  const hasFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-20 bg-black/30 md:hidden" onClick={onClose} />
      )}
      <div className={`absolute top-0 left-0 h-full z-20 w-72 bg-white dark:bg-zinc-900 shadow-xl flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold text-sm">Filter properties</h2>
          <div className="flex gap-2">
            {hasFilters && (
              <button onClick={clear} className="text-xs text-muted-foreground underline hover:text-foreground">
                Clear all
              </button>
            )}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Listing type</Label>
            <div className="flex gap-2">
              {(["sale", "rent"] as const).map((t) => (
                <button key={t}
                  onClick={() => set({ listing_type: filters.listing_type === t ? undefined : t })}
                  className={`flex-1 py-1.5 rounded-md text-sm border capitalize transition-colors ${filters.listing_type === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}>
                  {t === "sale" ? "For Sale" : "For Rent"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Property type</Label>
            <div className="flex flex-wrap gap-1.5">
              {listingPropertyTypes.map((pt) => (
                <button key={pt}
                  onClick={() => set({ property_type: filters.property_type === pt ? undefined : pt })}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${filters.property_type === pt ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}>
                  {pt}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Price range</Label>
            <div className="flex gap-2 items-center">
              <Input type="number" placeholder="Min" value={filters.min_price ?? ""}
                onChange={(e) => set({ min_price: e.target.value ? Number(e.target.value) : undefined })}
                className="text-sm" />
              <span className="text-muted-foreground text-sm">–</span>
              <Input type="number" placeholder="Max" value={filters.max_price ?? ""}
                onChange={(e) => set({ max_price: e.target.value ? Number(e.target.value) : undefined })}
                className="text-sm" />
            </div>
          </div>
        </div>
        <div className="px-4 py-3 border-t">
          <Button className="w-full" onClick={onClose}>Show results</Button>
        </div>
      </div>
    </>
  );
}
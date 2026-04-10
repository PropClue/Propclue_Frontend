// client/src/components/Map/MapView.tsx

import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "@/context/AuthContext";
import { useCountry, COUNTRY_MAP_CENTERS } from "@/context/CountryContext";
import { fetchMapPins, fetchListingDetail } from "@/Api/listings";
import { addToBucket, removeFromBucket } from "@/Api/bucket";
import { FilterPanel } from "@/components/Map/FilterPanel";
import { PropertyDrawer } from "@/components/Map/PropertyDrawer";
import type { MapPin, Listing, MapFilters } from "@shared/schema";
import { VITE_BASE_URL } from "@/Utils/urls";
import { useToast } from "@/hooks/use-toast";

// Fix Leaflet marker icons broken in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const PIN_COLORS: Record<string, string> = {
  Residential:       "#4f46e5",
  Commercial:        "#0891b2",
  Land:              "#16a34a",
  Villa:             "#7c3aed",
  "Office Space":    "#0369a1",
  Showroom:          "#b45309",
  "Coworking Space": "#0f766e",
  Warehouse:         "#9f1239",
  Other:             "#6b7280",
};

function makeIcon(color: string, listingType: string) {
  const label = listingType === "rent" ? "R" : "S";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z"
          fill="${color}" stroke="white" stroke-width="1.5"/>
    <text x="16" y="20" text-anchor="middle" font-size="11"
          font-family="sans-serif" font-weight="bold" fill="white">${label}</text>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  });
}

interface MapViewProps {
  onLoginRequired: () => void;
}

export function MapView({ onLoginRequired }: MapViewProps) {
  const mapRef          = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef      = useRef<L.Marker[]>([]);

  const { token, isLoggedIn }             = useAuth();
  const { selectedCountry, selectedCity } = useCountry();
  const { toast }                         = useToast();

  const [pins,        setPins]        = useState<MapPin[]>([]);
  const [filters,     setFilters]     = useState<MapFilters>({});
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [selectedId,  setSelectedId]  = useState<number | null>(null);
  const [listing,     setListing]     = useState<Listing | null>(null);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [bucketIds,   setBucketIds]   = useState<Set<number>>(new Set());
  const [loadingPins, setLoadingPins] = useState(false);

  const defaultCenter: [number, number] =
    selectedCountry === "UAE" ? [25.2048, 55.2708] : [12.9716, 77.5946];

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 12,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    map.on("moveend", () => loadPins(map));
    mapRef.current = map;
    loadPins(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-center on country change ───────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    const center = COUNTRY_MAP_CENTERS[selectedCountry];
    if (center) {
      mapRef.current.setView([center.lat, center.lng], center.zoom, { animate: true });
    }
  }, [selectedCountry]);

  // ── Re-center on city change ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    const cityCoords: Record<string, [number, number]> = {
      Dubai:       [25.2048, 55.2708],
      "Abu Dhabi": [24.4539, 54.3773],
      Sharjah:     [25.3463, 55.4209],
      Mumbai:      [19.0760, 72.8777],
      Delhi:       [28.6139, 77.2090],
      Bangalore:   [12.9716, 77.5946],
      Bengaluru:   [12.9716, 77.5946],
      Hyderabad:   [17.3850, 78.4867],
      Pune:        [18.5204, 73.8567],
      Chennai:     [13.0827, 80.2707],
      Ahmedabad:   [23.0225, 72.5714],
      Kolkata:     [22.5726, 88.3639],
    };
    const coords = cityCoords[selectedCity];
    if (coords) {
      mapRef.current.setView(coords, 12, { animate: true });
    }
  }, [selectedCity]);

  // ── Reload pins when filters change ──────────────────────────────────────
  useEffect(() => {
    if (mapRef.current) loadPins(mapRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // ── Refresh drawer when login state changes ───────────────────────────────
  useEffect(() => {
    if (selectedId && drawerOpen) {
      fetchListingDetail(selectedId, token).then(setListing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // ── Load pins for current viewport ───────────────────────────────────────
  const loadPins = useCallback(async (map: L.Map) => {
    setLoadingPins(true);
    const b = map.getBounds();
    const newPins = await fetchMapPins(
      {
        min_lat: b.getSouth(),
        max_lat: b.getNorth(),
        min_lng: b.getWest(),
        max_lng: b.getEast(),
      },
      filters,
    );
    setPins(newPins);
    renderMarkers(map, newPins);
    setLoadingPins(false);
  }, [filters]);

  // ── Render markers ────────────────────────────────────────────────────────
  const renderMarkers = (map: L.Map, pins: MapPin[]) => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    pins.forEach((pin) => {
      const icon = makeIcon(PIN_COLORS[pin.property_type] ?? "#6b7280", pin.listing_type);
      const marker = L.marker([pin.latitude, pin.longitude], { icon })
        .addTo(map)
        .bindTooltip(
          `<div style="font-weight:600">${pin.title}</div>
           <div style="color:#6b7280;font-size:11px">
             ${formatPrice(pin.price, pin.price_unit)}
           </div>`,
          { direction: "top", offset: [0, -36] },
        )
        .on("click", () => openDrawer(pin.id));
      markersRef.current.push(marker);
    });
  };

  // ── Open detail drawer ────────────────────────────────────────────────────
  const openDrawer = async (id: number) => {
    setSelectedId(id);
    setDrawerOpen(true);
    setListing(null);
    const detail = await fetchListingDetail(id, token);
    setListing(detail);
  };

  // ── Bucket toggle ─────────────────────────────────────────────────────────
  const toggleBucket = async (id: number) => {
    if (!isLoggedIn) { onLoginRequired(); return; }
    try {
      if (bucketIds.has(id)) {
        await removeFromBucket(id, token!);
        setBucketIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
        toast({ title: "Removed from shortlist" });
      } else {
        await addToBucket(id, token!);
        setBucketIds((prev) => new Set(prev).add(id));
        toast({ title: "Added to shortlist" });
      }
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    }
  };

  // ── GPS locate me ─────────────────────────────────────────────────────────
  const locateMe = () => {
    if (!mapRef.current) return;
    mapRef.current.locate({ setView: true, maxZoom: 15 });
  };

  return (
    <div className="relative w-full h-full" style={{ minHeight: "calc(100vh - 64px)" }}>

      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* Top-left controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">

        {/* Filter toggle */}
        <button
          onClick={() => setFilterOpen((v) => !v)}
          className="bg-white dark:bg-zinc-900 shadow-md rounded-lg px-3 py-2 text-sm
            font-medium flex items-center gap-2 hover:bg-gray-50
            dark:hover:bg-zinc-800 transition-colors"
        >
          {filterOpen ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Hide
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M3 4h18M7 8h10M11 12h2M9 16h6" />
              </svg>
              Filters
              {Object.values(filters).some(Boolean) && (
                <span className="bg-primary text-primary-foreground text-xs
                  rounded-full w-5 h-5 flex items-center justify-center">
                  {Object.values(filters).filter(Boolean).length}
                </span>
              )}
            </>
          )}
        </button>

        {/* Locate me */}
        <button
          onClick={locateMe}
          title="Use my location"
          className="bg-white dark:bg-zinc-900 shadow-md rounded-lg p-2
            hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" strokeWidth={2} />
            <path strokeLinecap="round" strokeWidth={2}
              d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        </button>
      </div>

      {/* Loading indicator */}
      {loadingPins && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white
          dark:bg-zinc-900 shadow-md rounded-full px-4 py-1.5 text-sm text-muted-foreground">
          Loading properties…
        </div>
      )}

      {/* Pin count badge */}
      {!loadingPins && pins.length > 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-white
          dark:bg-zinc-900 shadow-md rounded-full px-4 py-1.5 text-sm text-muted-foreground">
          {pins.length} propert{pins.length === 1 ? "y" : "ies"} in view
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-24 right-4 z-10 bg-white dark:bg-zinc-900
        shadow-md rounded-lg p-3 text-xs space-y-1">
        <div className="font-medium text-xs mb-1">Listing type</div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-indigo-600 flex items-center
            justify-center text-white text-[9px] font-bold">S</span>
          For Sale
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-indigo-600 flex items-center
            justify-center text-white text-[9px] font-bold">R</span>
          For Rent
        </div>
      </div>

      {/* Filter panel */}
      <FilterPanel
        open={filterOpen}
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => setFilterOpen(false)}
      />

      {/* Property drawer */}
      <PropertyDrawer
        open={drawerOpen}
        listing={listing}
        isInBucket={selectedId ? bucketIds.has(selectedId) : false}
        onClose={() => setDrawerOpen(false)}
        onBucketToggle={() => selectedId && toggleBucket(selectedId)}
        onLoginRequired={onLoginRequired}
      />
    </div>
  );
}

function formatPrice(price: number, unit: string): string {
  const fmt = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
  const labels: Record<string, string> = {
    total: "", per_sqft: "/sqft", per_month: "/mo", per_year: "/yr",
  };
  return `${fmt}${labels[unit] ?? ""}`;
}
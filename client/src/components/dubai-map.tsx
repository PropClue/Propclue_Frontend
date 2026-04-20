import React, { useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchLocationDetails } from "@/Api/ProjectionAPI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaStats } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DubaiMapProps {
  propertyType: string;
  subPropertyType: string;
  stats?: AreaStats[];
  homepageData?: any;
  activeLocalities?: string[];
  selectedLocality?: string;
  city?: string;
  country?: string;
  currency?: string;
  selectedYear?: string;
  onYearChange?: (year: string) => void;
}

const DubaiMap: React.FC<DubaiMapProps> = ({
  propertyType,
  subPropertyType,
  stats = [],
  homepageData,
  activeLocalities = [],
  selectedLocality = "",
  city = "Dubai",
  country = "UAE",
  currency = "AED",
  selectedYear = "2026",
  onYearChange,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [selectedDetails, setSelectedDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark"),
  );
  
  const [localYear, setLocalYear] = useState<string>(selectedYear);
  const currentYear = onYearChange ? selectedYear : localYear;
  
  const handleYearChange = (val: string) => {
    if (onYearChange) onYearChange(val);
    else setLocalYear(val);
  };

  const selectedYearRef = useRef(currentYear);
  useEffect(() => {
    selectedYearRef.current = currentYear;
  }, [currentYear]);

  // Normalization for fuzzy matching
  const normalizeName = (name: string) => {
    if (!name) return "";
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .replace(/nasir/g, "nasser")
      .replace(/eyal/g, "eyal")
      .replace(/1$/g, "first")
      .replace(/2$/g, "second")
      .replace(/3$/g, "third")
      .replace(/4$/g, "fourth")
      .replace(/5$/g, "fifth")
      .replace(/first/g, "first") // idempotent
      .replace(/second/g, "second")
      .replace(/third/g, "third")
      .replace(/fourth/g, "fourth")
      .replace(/fifth/g, "fifth")
      .trim();
  };
  const normalizeRisk = (risk?: string) => {
    if (!risk) return null;

    const r = risk.trim().toLowerCase();

    if (r === "low" || r === "very low") return "low";
    if (r === "moderate" || r === "medium") return "moderate";
    if (r === "high") return "high";

    return null;
  };

  const findStat = (name: string) => {
    const normalized = normalizeName(name);

    return stats.find((s) => normalizeName(s.area) === normalized);
  };

  // // Load GeoJSON data dynamically based on the city
  // useEffect(() => {
  //   let mapFile = "/Dubai_map.json"; // default

  //   const cityLower = city?.toLowerCase() || "";
  //   if (cityLower === "mumbai") mapFile = "/Mumbai.json";
  //   else if (cityLower === "bangalore" || cityLower === "Bangalore")
  //     mapFile = "/Bangalore.json";
  //   else if (cityLower === "pune") mapFile = "/Pune.json";
  //   else if (cityLower === "ahmedabad") mapFile = "/Ahmedabad.json";
  //   else if (cityLower === "hyderabad") mapFile = "/Hyderabad.json";
  //   else if (
  //     cityLower === "delhi" ||
  //     cityLower === "gurugram" ||
  //     cityLower === "gurgaon" ||
  //     cityLower === "new delhi" ||
  //     cityLower === "noida"
  //   )
  //     mapFile = "/Delhi.json";

  //   setGeoData(null); // Reset while loading

  //   fetch(mapFile)
  //     .then((res) => res.json())
  //     .then((data) => setGeoData(data))
  //     .catch((err) =>
  //       console.error(`Map data fetch error for ${mapFile}:`, err),
  //     );
  // }, [city]);

  // Load GeoJSON data dynamically based on the city
  useEffect(() => {
    let mapFile = "/Dubai_map.json"; // default
    const cityLower = city?.toLowerCase() || "";
 
    if (cityLower === "mumbai") mapFile = "/Mumbai.json";
    else if (cityLower === "bangalore") mapFile = "/Bangalore.json";
    else if (cityLower === "pune") mapFile = "/Pune.json";
    else if (cityLower === "ahmedabad") mapFile = "/Ahmedabad.json";
    else if (cityLower === "hyderabad") mapFile = "/Hyderabad.json";
    else if (cityLower === "gurgaon" || cityLower === "gurugram") mapFile = "/gurgaon.json";
    else if (cityLower === "noida") mapFile = "/noida.json";
    else if (cityLower === "delhi" || cityLower === "new delhi") mapFile = "/Delhi.json";
 
    setGeoData(null);
 
    fetch(mapFile)
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error(`Map data fetch error for ${mapFile}:`, err));
  }, [city]);

  useEffect(() => {
    if (!mapRef.current) return;

    setTimeout(() => {
      mapRef.current?.invalidateSize(true);
    }, 200);
  }, [geoData]);
  // Initialize Map
  useEffect(() => {
    let interval: number;

    const tryInit = () => {
      if (mapRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      // Provide default view per city fallback
      let center: L.LatLngExpression = [25.2048, 55.2708]; // Dubai
      let zoom = 11;
      const cityLower = city?.toLowerCase() || "";

      if (cityLower === "mumbai") {
        center = [19.076, 72.8777];
        zoom = 10;
      } else if (cityLower === "bangalore") {
        center = [12.9716, 77.5946];
        zoom = 10;
      } else if (cityLower === "pune") {
        center = [18.5204, 73.8567];
        zoom = 11;
      } else if (cityLower === "ahmedabad") {
        center = [23.0225, 72.5714];
        zoom = 11;
      } else if (cityLower === "hyderabad") {
        center = [17.385, 78.4867];
        zoom = 11;
      } else if (cityLower === "gurgaon" || cityLower === "gurugram") {
        center = [28.4595, 77.0266];
        zoom = 11;
      } else if (cityLower === "noida") {
        center = [28.5355, 77.391];
        zoom = 11;
      } else if (cityLower === "delhi" || cityLower === "new delhi") {
        center = [28.6139, 77.209];
        zoom = 10;
      }

      const map = L.map(containerRef.current, {
        zoomControl: false,
      }).setView(center, zoom);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      const isDarkMode = isDark;
      const tileUrl = isDarkMode
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

      const attribution = isDarkMode
        ? "&copy; CARTO"
        : "&copy; OpenStreetMap contributors";

      tileLayerRef.current = L.tileLayer(tileUrl, {
        attribution,
      }).addTo(map);
      mapRef.current = map;
      setMapReady(true);

      clearInterval(interval);
    };

    interval = window.setInterval(tryInit, 100);

    return () => {
      clearInterval(interval);
      // Wait to destroy map properly
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    let center: L.LatLngExpression = [25.2048, 55.2708]; // Dubai
    let zoom = 11;
    const cityLower = city?.toLowerCase() || "";

    if (cityLower === "mumbai") {
      center = [19.076, 72.8777];
      zoom = 10;
    } else if (cityLower === "bangalore" || cityLower === "blr") {
      center = [12.9716, 77.5946];
      zoom = 10;
    } else if (cityLower === "pune") {
      center = [18.5204, 73.8567];
      zoom = 11;
    } else if (cityLower === "ahmedabad") {
      center = [23.0225, 72.5714];
      zoom = 11;
    } else if (cityLower === "hyderabad") {
      center = [17.385, 78.4867];
      zoom = 11;
    } else if (cityLower === "gurgaon" || cityLower === "gurugram") {
        center = [28.4595, 77.0266];
        zoom = 11;
      } else if (cityLower === "noida") {
        center = [28.5355, 77.391];
        zoom = 11;
      } else if (cityLower === "delhi" || cityLower === "new delhi") {
        center = [28.6139, 77.209];
        zoom = 10;
      }

    mapRef.current.setView(center, zoom);
  }, [city]);

  // Sync GeoJSON and Colors
  useEffect(() => {
    if (!mapRef.current || !geoData) return;
    const map = mapRef.current;

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }

    const getColor = (name: string) => {
      const normalizedName = normalizeName(name);

      const areaStat = stats.find(
        (s) => normalizeName(s.area) === normalizedName,
      );

      const risk = normalizeRisk(areaStat?.risk);

      switch (risk) {
        case "low":
          return "#10b981"; // green
        case "moderate":
          return "#f97316"; // orange
        case "high":
          return "#ef4444"; // red
        default:
          return "#334155"; // grey fallback
      }
    };

    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    const handleFeatureAction = async (feature: any) => {
      const locality = feature.properties.name;
      const normalizedLocality = normalizeName(locality);
      const isActive =
        activeLocalities.length === 0 ||
        activeLocalities.some((al) => normalizeName(al) === normalizedLocality);

      if (!isActive) {
        setSelectedDetails(null);
        return;
      }

      setLoadingDetails(true);
      setSelectedDetails({ Locality: locality, loading: true });

      const activePropertyType = propertyType || "Residential";
      const activeSubType = subPropertyType || "Land";

      try {
        const details = await fetchLocationDetails(
          locality,
          activePropertyType,
          activeSubType,
          city,
          country,
          selectedYearRef.current,
        );

        const dataArray = Array.isArray(details) ? details : [];
        const yearData = dataArray.find((d) => String(d.year) === String(selectedYearRef.current)) || dataArray[0] || null;

        if (yearData) {
          setSelectedDetails({ ...yearData, Locality: locality });
        } else {
          setSelectedDetails(null);
        }
      } catch (err) {
        console.error("Hover/Click fetch error:", err);
        setSelectedDetails(null);
      } finally {
        setLoadingDetails(false);
      }
    };

    const geoJsonLayer = L.geoJSON(geoData, {
      style: (feature: any) => ({
        fillColor: getColor(feature.properties.name),
        weight: 1,
        opacity: 0.8,
        color: "#ffffff",
        fillOpacity: 0.5,
      }),
      onEachFeature: (feature: any, layer : any) => {
        layer.on({
          mouseover: async (e: any) => {
            const l = e.target;
            if (!l || !l._map) return;

            l.setStyle({
              weight: 2,
              color: "#d328a7",
              fillOpacity: 0.8,
            });

            try {
              if (l.bringToFront) l.bringToFront();
            } catch (err) {
              console.warn("bringToFront failed:", err);
            }

            // Only auto-trigger on desktop
            if (!isTouchDevice) {
              handleFeatureAction(feature);
            }
          },
          mouseout: (e : any) => {
            const l = e.target;
            if (l && l._map && geoJsonLayer) {
              geoJsonLayer.resetStyle(l);
            }
            // Only auto-close on desktop mouseout
            if (!isTouchDevice) {
              setSelectedDetails(null);
            }
          },
          click: (e: any) => {
            // Explicit trigger for mobile and desktop click
            handleFeatureAction(feature);
            // Highlight on click/tap too
            const l = e.target;
            if (l && l.setStyle) {
              l.setStyle({
                weight: 2,
                color: "#d328a7",
                fillOpacity: 0.8,
              });
            }
          },
        });
      },
    }).addTo(map);

    geoJsonLayerRef.current = geoJsonLayer;
  }, [geoData, stats, subPropertyType, activeLocalities, mapReady, isDark]);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const tileUrl = isDark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const attribution = isDark
      ? "&copy; CARTO"
      : "&copy; OpenStreetMap contributors";

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution,
    }).addTo(mapRef.current);
  }, [isDark]);
  // Handle programmatic selection from parent component
  useEffect(() => {
    if (!selectedLocality || !geoJsonLayerRef.current || !mapRef.current)
      return;

    const normalizedSelected = normalizeName(selectedLocality);
    let targetLayer: any = null;

    // Find the matching layer
    geoJsonLayerRef.current.eachLayer((layer: any) => {
      const featureName = layer.feature?.properties?.name;
      if (!featureName) return;

      const normalizedFeature = normalizeName(featureName);
      if (
        normalizedFeature === normalizedSelected ||
        (normalizedFeature.length > 5 &&
          normalizedSelected.startsWith(normalizedFeature)) ||
        (normalizedSelected.length > 5 &&
          normalizedFeature.startsWith(normalizedSelected))
      ) {
        targetLayer = layer;
      }
    });

    if (!targetLayer) {
      console.warn(`No matching layer found for: ${selectedLocality}`);
      return;
    }

    // Highlight the layer
    targetLayer.setStyle({
      weight: 2,
      color: "#d328a7",
      fillOpacity: 0.8,
    });

    // Bring to front
    try {
      if (targetLayer.bringToFront) targetLayer.bringToFront();
    } catch (err) {
      console.warn("bringToFront failed:", err);
    }

    // Zoom to the selected area
    const bounds = targetLayer.getBounds();
    if (bounds && mapRef.current) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }

    // Fetch and display data
    const fetchData = async () => {
      setLoadingDetails(true);
      setSelectedDetails({ Locality: selectedLocality, loading: true });

      const activePropertyType = propertyType || "Residential";
      const activeSubType = subPropertyType || "Land";

      try {
        const details = await fetchLocationDetails(
          selectedLocality,
          activePropertyType,
          activeSubType,
          city,
          country,
          selectedYearRef.current,
        );

        const dataArray = Array.isArray(details) ? details : [];
        const yearData = dataArray.find((d) => String(d.year) === String(selectedYearRef.current)) || dataArray[0] || null;

        if (yearData) {
          setSelectedDetails({ ...yearData, Locality: selectedLocality });
        } else {
          setSelectedDetails(null);
        }
      } catch (err) {
        console.error("Selection fetch error:", err);
        setSelectedDetails(null);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchData();

    // Cleanup: reset style when selectedLocality changes or unmounts
    return () => {
      if (targetLayer && geoJsonLayerRef.current) {
        geoJsonLayerRef.current.resetStyle(targetLayer);
      }
    };
  }, [selectedLocality, subPropertyType, mapReady]);

  // Refetch data when currentYear changes
  useEffect(() => {
    if (!selectedDetails || !selectedDetails.Locality || selectedDetails.loading) return;

    const fetchData = async () => {
      setLoadingDetails(true);
      const activePropertyType = propertyType || "Residential";
      const activeSubType = subPropertyType || "Land";

      try {
        const details = await fetchLocationDetails(
          selectedDetails.Locality,
          activePropertyType,
          activeSubType,
          city,
          country,
          currentYear
        );

        const dataArray = Array.isArray(details) ? details : [];
        const yearData = dataArray.find((d) => String(d.year) === String(currentYear)) || dataArray[0] || null;

        if (yearData) {
          setSelectedDetails({ ...yearData, Locality: selectedDetails.Locality });
        } else {
          setSelectedDetails(null);
        }
      } catch (err) {
        console.error("Year change fetch error:", err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear]);

  return (
    <div
      className="
    relative
    max-w-6xl
    mx-auto
    h-[500px]
    mb-10
    border
    rounded-3xl
    overflow-hidden
    bg-card
    shadow-3xl
    group
    ring-1
    ring-primary/5
  "
    >
      <div
        ref={containerRef}
        className="w-full h-full z-0 grayscale-[0.2] hover:grayscale-0 transition-opacity duration-700"
      />

      {!geoData && (
        <div className="absolute inset-0 z-10 w-full h-full">
          <Skeleton className="w-full h-full rounded-3xl" />
        </div>
      )}

      {geoData && (
        <>
          {/* Dynamic Glass Legend */}
          <div className="absolute bottom-8 left-8 z-[20] p-5 bg-background/60 backdrop-blur-xl rounded-2xl border border-primary/10 shadow-2xl pointer-events-none transition-all duration-500 group-hover:bg-background/80">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-primary opacity-80">
              Risk Assessment
            </h4>
            <div className="space-y-3">
              {[
                { label: "Low", color: "bg-emerald-500" },
                { label: "Moderate", color: "bg-orange-500" },
                { label: "High", color: "bg-red-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ring-2 ring-background/50 ${item.color}`}
                  />
                  <span className="text-[10px] font-bold text-foreground/70 tracking-tight">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {selectedDetails && (
            <div className="absolute top-8 right-8 z-[20] w-85 pointer-events-none animate-in fade-in slide-in-from-right-8 duration-500">
              <Card className="bg-background/90 backdrop-blur-2xl border-primary/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden">
                <div className="h-1.5 w-full bg-primary/20">
                  <div
                    className={`h-full bg-primary transition-all duration-1000 ${
                      loadingDetails ? "w-1/2 animate-pulse" : "w-full"
                    }`}
                  />
                </div>
                <CardHeader className="pb-5 pt-7">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">
                        Selected Locality
                      </span>
                      <CardTitle className="text-2xl font-black text-foreground leading-tight tracking-tighter">
                        {selectedDetails.Locality}
                      </CardTitle>
                    </div>
                    <button
                      onClick={() => setSelectedDetails(null)}
                      className="p-2 hover:bg-muted rounded-full transition-all active:scale-90 pointer-events-auto"
                    >
                      <svg
                        className="w-4 h-4 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pb-8 space-y-6">
                  {loadingDetails ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-14 w-full rounded-xl" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-20 w-full rounded-xl" />
                        <Skeleton className="h-20 w-full rounded-xl" />
                      </div>
                    </div>
                  ) : selectedDetails.Avg_Projected ? (
                    <>
                      <div className="p-5 bg-primary/5 rounded-3xl border border-primary/10 group/item transition-all hover:bg-primary/10">
                        <span className="text-[10px] font-black uppercase text-primary/60 block mb-2 tracking-[0.15em]">
                          Market Value Projection
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-primary tracking-tighter italic">
                            {currency}{" "}
                            {Number(
                              selectedDetails.Avg_Projected,
                            ).toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-primary/40">
                            SQFT
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/30 rounded-2xl border border-transparent hover:border-primary/5 transition-all">
                          <span className="text-[9px] font-black text-muted-foreground/60 uppercase block mb-2 tracking-widest">
                            Annual Yield
                          </span>
                          <div
                            className={`text-xl font-black flex items-center gap-1 ${
                              Number(selectedDetails.YOY_Growth_Percent) >= 0
                                ? "text-emerald-500"
                                : "text-rose-500"
                            }`}
                          >
                            {Number(selectedDetails.YOY_Growth_Percent) >= 0
                              ? "↑"
                              : "↓"}{" "}
                            {selectedDetails.YOY_Growth_Percent}%
                          </div>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-2xl border border-transparent hover:border-primary/5 transition-all">
                          <span className="text-[9px] font-black text-muted-foreground/60 uppercase block mb-2 tracking-widest">
                            Risk Index
                          </span>
                          <div
                            className={cn(
                              "text-xl font-black",
                              selectedDetails.Risk === "Very Low" ||
                                selectedDetails.Risk === "Low"
                                ? "text-emerald-500"
                                : selectedDetails.Risk === "Moderate" ||
                                    selectedDetails.Risk === "Medium"
                                  ? "text-orange-500"
                                  : "text-red-500",
                            )}
                          >
                            {selectedDetails.Risk}
                          </div>
                        </div>
                      </div>
                      <p className="text-[9px] text-center font-bold text-muted-foreground/40 uppercase tracking-[0.2em] pt-4 border-t border-dashed">
                        Verified Projection • {selectedDetails.quarter}{" "}
                        {selectedDetails.year}
                      </p>
                    </>
                  ) : (
                    <div className="py-10 text-center space-y-4 px-4 bg-rose-500/5 rounded-3xl border border-rose-500/10">
                      <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-500 mb-2">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                      <p className="text-xs font-black text-foreground uppercase tracking-wider">
                        {selectedDetails.error}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DubaiMap;

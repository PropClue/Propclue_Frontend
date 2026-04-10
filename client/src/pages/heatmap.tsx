import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AreaHeatmapCard } from "@/components/area-heatmap-card";
import { AreaComparisonChart } from "@/components/area-comparison-chart";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Map as MapIcon,
  TrendingUp,
  Building2,
  DollarSign,
  BarChart3,
  Layers,
  LineChart as LineChartIcon,
} from "lucide-react";
import { AreaStats } from "@shared/schema";
import { Link, useLocation } from "wouter";
import DubaiMap from "@/components/dubai-map";
import { ProjectionCharts } from "@/components/projection-charts";
import { useState, useEffect, useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VITE_BASE_URL } from "@/Utils/urls";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useCountry } from "@/context/CountryContext";

export default function Heatmap() {
  const { selectedCountry, selectedCity, cities, currency, setSelectedCity } =
    useCountry();

  const [propertyType, setPropertyType] = useState("Residential");
  const [subAssetType, setSubAssetType] = useState("Land");
  const [selectedLocality, setSelectedLocality] = useState<string>("");
  const [localitiesMap, setLocalitiesMap] = useState<Record<string, string[]>>(
    {},
  );
  const [localities, setLocalities] = useState<string[]>([]);

  // Dynamically derive the available dropdown options from the fetched map
  const subPropertyTypes = useMemo(
    () => Object.keys(localitiesMap),
    [localitiesMap],
  );

  const getQueryParam = (param: string) => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    return params.get(param);
  };

  const [activeTab, setActiveTab] = useState(getQueryParam("tab") || "map");
  // const [selectedYear, setSelectedYear] = useState<string>("2026"); //Before
  // Dynamic year selection: (Ganesh Dhakali)
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");

  const { data: areaStats, isLoading } = useQuery<AreaStats[]>({
    queryKey: [
      "area-stats",
      selectedCountry,
      selectedCity,
      subAssetType,
      propertyType,
      selectedYear,
    ],
    queryFn: async () => {
      return api.fetchAreaStats(
        subAssetType,
        selectedCity,
        selectedCountry,
        propertyType,
        selectedYear
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!subAssetType && !!propertyType,
  });
  const loadingMarket = isLoading;

  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = window.innerWidth < 640;

  const pageSize = isMobile ? 7 : 12;

  const sortedByDemand = [...(areaStats || [])].sort(
    (a, b) => (b.heatmapIntensity || 0) - (a.heatmapIntensity || 0),
  );

  const totalPages = Math.ceil(sortedByDemand.length / pageSize);

  const paginatedData = useMemo(
    () =>
      sortedByDemand.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
      ),
    [sortedByDemand, currentPage, pageSize],
  );

  const { data: homepageData } = useQuery<{
    charts: {
      growth_by_area: Record<string, number>;
      price_by_area: Record<string, number>;
      price_trends: Record<string, number>;
      risk_distribution: Record<string, number>;
    };
    city: string;
    current_period: string;
    overview: {
      average_price: number;
      qoq_growth_avg: number;
      total_locations: number;
      yoy_growth_avg: number;
    };
  }>({
    queryKey: [
      "homepage-metadata",
      selectedCountry,
      selectedCity,
      propertyType,
    ],
    queryFn: () =>
      api.fetchHomepageMetadata(selectedCity, selectedCountry, propertyType),
  });

  // Fetch localities whenever country, city, or propertyType changes
  //Before:
  // useEffect(() => {
  //   const fetchAndStore = async () => {
  //     try {
  //       const response = await fetch(`${VITE_BASE_URL}/get_localities`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           city: selectedCity,
  //           country: selectedCountry,
  //           property_type: propertyType,
  //         }),
  //       });
  //       const data = await response.json();
  //       if (data?.Localities) {
  //         setLocalitiesMap(data.Localities);
  //         // Don't set localities here directly based on subAssetType, instead rely on the useEffect below
  //         // to react to subAssetType or localitiesMap changes.
  //       } else {
  //         setLocalitiesMap({});
  //         setLocalities([]);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching localities:", error);
  //     }
  //   };
  //   fetchAndStore();
  // }, [propertyType, selectedCity, selectedCountry]);
  //After: Updated the existing fetchAndStore useEffect to also derive years
  useEffect(() => {
    const fetchAndStore = async () => {
      try {
        const response = await fetch(`${VITE_BASE_URL}/get_localities`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            city: selectedCity,
            country: selectedCountry,
            property_type: propertyType,
          }),
        });
        const data = await response.json();
        if (data?.Localities) {
          setLocalitiesMap(data.Localities);
        } else {
          setLocalitiesMap({});
          setLocalities([]);
        }
      } catch (error) {
        console.error("Error fetching localities:", error);
      }

      // ✅ NEW: fetch available years for this city/country/propertyType
      try {
        const firstSubType = Object.keys(localitiesMap)[0];
        const firstLocality = firstSubType ? localitiesMap[firstSubType]?.[0] : null;
        if (!firstLocality || !firstSubType) return;

        const res = await fetch(`${VITE_BASE_URL}/get_location_details`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locality: firstLocality.toLowerCase(),
            city: selectedCity,
            country: selectedCountry,
            property_type: propertyType,
            sub_property_type: firstSubType,
          }),
        });
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const years = [...new Set<number>(rows.map((r: any) => r.year))].sort((a, b) => a - b);
          const yearStrings = years.map(String);
          setAvailableYears(yearStrings);
          setSelectedYear(getDefaultYear(years));
        }
      } catch (err) {
        console.error("Error fetching available years:", err);
      }
    };

    fetchAndStore();
  }, [propertyType, selectedCity, selectedCountry]);

  // Runs once localitiesMap is populated
  useEffect(() => {
    const fetchAvailableYears = async () => {
      const subTypes = Object.keys(localitiesMap);
      if (subTypes.length === 0) return;

      const firstSubType = subTypes[0];
      const firstLocality = localitiesMap[firstSubType]?.[0];
      if (!firstLocality) return;

      try {
        const res = await fetch(`${VITE_BASE_URL}/get_location_details`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locality: firstLocality.toLowerCase(),
            city: selectedCity,
            country: selectedCountry,
            property_type: propertyType,
            sub_property_type: firstSubType,
          }),
        });
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const years = [...new Set<number>(rows.map((r: any) => r.year))].sort((a, b) => a - b);
          setAvailableYears(years.map(String));
          setSelectedYear(getDefaultYear(years));
        }
      } catch (err) {
        console.error("Error fetching available years:", err);
      }
    };

    fetchAvailableYears();
  }, [localitiesMap]); // ✅ fires whenever localities change

  // Reset localities when map or sub-type changes, and fix subAssetType if invalid
  useEffect(() => {
    const keys = Object.keys(localitiesMap);
    if (keys.length > 0) {
      if (!keys.includes(subAssetType)) {
        setSubAssetType(keys[0]);
      } else {
        setLocalities(localitiesMap[subAssetType]);
      }
    } else {
      setLocalities([]);
    }
    setSelectedLocality("");
  }, [subAssetType, localitiesMap]);

  // Only reset property types to country defaults when country switches natively, not on city changes
  useEffect(() => {
    if (selectedCountry === "India") {
      setPropertyType("Residential");
      setSubAssetType("Land");
    } else {
      setPropertyType("Residential");
      setSubAssetType("Land");
    }
  }, [selectedCountry]);

  // Reset page separately when anything changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCountry, selectedCity, propertyType, subAssetType]);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${currency} ${(price / 1000000).toFixed(1)}M`;
    }
    return `${currency} ${(price / 1000).toFixed(0)}K`;
  };

  const allowedPropertyTypes = useMemo(() => {
    return ["Residential", "Commercial"];
  }, []);
  useEffect(() => {
    if (!allowedPropertyTypes.includes(propertyType)) {
      setPropertyType(allowedPropertyTypes[0]);
    }
  }, [allowedPropertyTypes]);

  // Added a helper function  for fetching year.
  const getDefaultYear = (years: number[]): string => {
  const currentYear = new Date().getFullYear();
    if (years.includes(currentYear)) return String(currentYear);
    const upcoming = years.filter(y => y > currentYear).sort((a, b) => a - b);
    if (upcoming.length > 0) return String(upcoming[0]);
    const past = years.filter(y => y < currentYear).sort((a, b) => b - a);
    if (past.length > 0) return String(past[0]);
    return "";
  }; 

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            {homepageData?.overview ? (
              <>
                <StatCard
                  title="Total Locations"
                  value={
                    homepageData.overview.total_locations.toLocaleString() + "+"
                  }
                  icon={Building2}
                />
                <StatCard
                  title="Average Price"
                  value={formatPrice(homepageData.overview.average_price)}
                  icon={DollarSign}
                />
                <StatCard
                  title="Avg YoY Growth"
                  value={`${
                    homepageData.overview.yoy_growth_avg > 0 ? "+" : ""
                  }${homepageData.overview.yoy_growth_avg}%`}
                  icon={TrendingUp}
                />
                <StatCard
                  title="Avg QoQ Growth"
                  value={`${
                    homepageData.overview.qoq_growth_avg > 0 ? "+" : ""
                  }${homepageData.overview.qoq_growth_avg}%`}
                  icon={BarChart3}
                />
              </>
            ) : null}
          </>
        )}
      </div>
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <MapIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {selectedCity} Area Heatmap
                </h1>
              </div>
            </div>

            {activeTab === "map" && (
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* City Filter (within selected country) */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    City
                  </span>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="w-[160px] bg-background/50 backdrop-blur-sm border-primary/20">
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year Filter */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Year
                  </span>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[120px] bg-background/50 backdrop-blur-sm border-primary/20">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Before: {[
                        "2024", "2025", "2026", "2027", "2028",
                        "2029", "2030", "2031", "2032", "2033", "2034"
                      ].map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))} */}
                      {/* After; dynamic year selection */}
                      
                      {availableYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Property Type */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Property Type
                  </span>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm border-primary/20">
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedPropertyTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sub Asset Type */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Sub Asset Type
                  </span>
                  <Select
                    value={subAssetType}
                    onValueChange={setSubAssetType}
                    disabled={!propertyType || subPropertyTypes.length === 0}
                  >
                    <SelectTrigger className="w-[200px] bg-background/50 backdrop-blur-sm border-primary/20 disabled:opacity-50">
                      <SelectValue
                        placeholder={
                          subPropertyTypes.length === 0
                            ? "Loading..."
                            : "Sub Asset Type"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {subPropertyTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Locality */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Locality
                  </span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        disabled={!subAssetType || localities.length === 0}
                        className="w-[240px] justify-between bg-background/50 backdrop-blur-sm border-primary/20 disabled:opacity-50"
                      >
                        {selectedLocality || "Select Locality"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-[240px] p-0">
                      <Command>
                        <CommandInput placeholder="Search locality..." />
                        <CommandEmpty>No locality found.</CommandEmpty>

                        <CommandGroup className="max-h-[240px] overflow-y-auto">
                          {localities.map((locality) => (
                            <CommandItem
                              key={locality}
                              value={locality}
                              onSelect={(value) => {
                                setSelectedLocality(value);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedLocality === locality
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {locality}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* ================= FULL WIDTH TAB BAR ================= */}
        <div className=" bg-background">
          <div className="w-full px-4">
            <Tabs
              defaultValue="map"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value="map"
                      className="flex items-center gap-1 md:gap-2 text-[10px] md:text-sm px-2 py-2"
                    >
                      <Layers className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden md:inline">Interactive Map</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top">Interactive Map</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value="projections"
                      className="flex items-center gap-1 md:gap-2 text-[10px] md:text-sm px-2 py-2"
                    >
                      <LineChartIcon className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden md:inline">Area Comparison</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top">Area Comparison</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value="heatmap"
                      className="flex items-center gap-1 md:gap-2 text-[10px] md:text-sm px-2 py-2"
                    >
                      <MapIcon className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden md:inline">
                        Price Projections
                      </span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top">Price Projections</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value="charts"
                      className="flex items-center gap-1 md:gap-2 text-[10px] md:text-sm px-2 py-2"
                    >
                      <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden md:inline">Market Charts</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top">Market Charts</TooltipContent>
                </Tooltip>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* ================= TAB CONTENT ================= */}
        <div className="w-full">
          <Tabs value={activeTab}>
            {/* MAP — FULL BLEED */}
            <TabsContent value="map" className="m-0 p-0">
              <DubaiMap
                propertyType={propertyType}
                subPropertyType={subAssetType}
                stats={areaStats || []}
                homepageData={homepageData}
                activeLocalities={localities}
                selectedLocality={selectedLocality}
                city={selectedCity}
                country={selectedCountry}
                currency={currency}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
              />
            </TabsContent>

            {/* PROJECTIONS — CENTERED */}
            <TabsContent value="projections" className="p-4 max-w-7xl mx-auto">
              <ProjectionCharts
                propertyType={propertyType}
                subPropertyType={subAssetType}
                localities={localities}
                city={selectedCity}
                country={selectedCountry}
                currency={currency}
              />
            </TabsContent>

            {/* HEATMAP — CENTERED */}
            <TabsContent value="heatmap" className="p-4 max-w-7xl mx-auto">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <div className="grid grid-cols-2 gap-2">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold tracking-tight">
                    Neighborhood Analysis
                  </h3>
                  {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedData.map((stats) => (
                      <Link
                        key={stats.area}
                        href={`/properties?area=${encodeURIComponent(
                          stats.area,
                        )}`}
                      >
                        <AreaHeatmapCard stats={stats} />
                      </Link>
                    ))}
                  </div> */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedData.map((stats) => (
                      <AreaHeatmapCard
                        key={stats.area}
                        stats={stats}
                        currency={currency}
                      />
                    ))}
                  </div>
                  <div className="flex justify-center items-center gap-3 mt-6">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="px-3 py-2 rounded-lg border disabled:opacity-50"
                    >
                      Previous
                    </button>

                    <span className="text-sm font-semibold">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="px-3 py-2 rounded-lg border disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </TabsContent>

            {/* CHARTS — CENTERED */}
            <TabsContent value="charts" className="p-4 max-w-7xl mx-auto">
              {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-6 w-40 mb-4" />
                        <Skeleton className="h-72 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                areaStats && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AreaComparisonChart
                      data={areaStats}
                      metric="yoyGrowth"
                      currency={currency}
                    />
                    <AreaComparisonChart
                      data={areaStats}
                      metric="avgPrice"
                      currency={currency}
                    />
                    <AreaComparisonChart
                      data={areaStats}
                      metric="avgPricePerSqft"
                      currency={currency}
                    />
                  </div>
                )
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

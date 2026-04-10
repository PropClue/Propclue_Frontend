import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PropertyCard } from "@/components/property-card";
import { SearchFiltersComponent } from "@/components/search-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Grid3X3, List, X, SlidersHorizontal } from "lucide-react";
import { Property, SearchFilters } from "@shared/schema";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCountry } from "@/context/CountryContext";

export default function Properties() {
  const { currency, selectedCity } = useCountry();
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState("price-desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties", filters],
  });

  const filteredProperties = properties?.filter((property) => {
    if (filters.area && property.area !== filters.area) return false;
    if (filters.propertyType && property.type !== filters.propertyType)
      return false;
    if (filters.minPrice && property.price < filters.minPrice) return false;
    if (filters.maxPrice && property.price > filters.maxPrice) return false;
    if (filters.minBedrooms && property.bedrooms < filters.minBedrooms)
      return false;
    if (filters.maxBedrooms && property.bedrooms > filters.maxBedrooms)
      return false;
    return true;
  });

  const sortedProperties = [...(filteredProperties || [])].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "growth-desc":
        return b.yoyGrowth - a.yoyGrowth;
      case "size-desc":
        return b.sqft - a.sqft;
      default:
        return 0;
    }
  });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const clearFilters = () => {
    setFilters({});
  };

  const FiltersSidebar = () => (
    <SearchFiltersComponent
      filters={filters}
      onFiltersChange={setFilters}
      onClear={clearFilters}
      currency={currency}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{selectedCity} Properties</h1>
              <p className="text-muted-foreground">
                Browse {sortedProperties?.length || 0} properties with
                AI-powered valuations
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <FiltersSidebar />
            </div>
          </aside>

          <main className="flex-1 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Sheet
                  open={mobileFiltersOpen}
                  onOpenChange={setMobileFiltersOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="lg:hidden gap-2"
                      data-testid="button-mobile-filters"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <div className="p-4">
                      <FiltersSidebar />
                    </div>
                  </SheetContent>
                </Sheet>

                {activeFilterCount > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {filters.area && (
                      <Badge variant="secondary" className="gap-1">
                        {filters.area}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() =>
                            setFilters({ ...filters, area: undefined })
                          }
                        />
                      </Badge>
                    )}
                    {filters.propertyType && (
                      <Badge variant="secondary" className="gap-1">
                        {filters.propertyType}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() =>
                            setFilters({ ...filters, propertyType: undefined })
                          }
                        />
                      </Badge>
                    )}
                    {filters.minBedrooms && (
                      <Badge variant="secondary" className="gap-1">
                        {filters.minBedrooms}+ beds
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() =>
                            setFilters({
                              ...filters,
                              minBedrooms: undefined,
                              maxBedrooms: undefined,
                            })
                          }
                        />
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-44" data-testid="select-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-desc">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="price-asc">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="growth-desc">Highest Growth</SelectItem>
                    <SelectItem value="size-desc">Largest Size</SelectItem>
                  </SelectContent>
                </Select>

                <div className="hidden sm:flex items-center border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    data-testid="button-view-grid"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    data-testid="button-view-list"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-video w-full" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-6 w-1/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedProperties?.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No properties found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters to see more results
                  </p>
                  <Button
                    onClick={clearFilters}
                    data-testid="button-clear-all-filters"
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {sortedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    currency={currency}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

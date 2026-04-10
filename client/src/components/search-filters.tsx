import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import { dubaiAreas, propertyTypes, SearchFilters } from "@shared/schema";
import { useState } from "react";

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClear: () => void;
  currency?: string;
}

export function SearchFiltersComponent({
  filters,
  onFiltersChange,
  onClear,
  currency = "AED",
}: SearchFiltersProps) {
  const [priceRange, setPriceRange] = useState([
    filters.minPrice || 500000,
    filters.maxPrice || 10000000,
  ]);

  const hasActiveFilters =
    filters.area ||
    filters.propertyType ||
    filters.minBedrooms ||
    filters.maxBedrooms ||
    (filters.minPrice && filters.minPrice > 500000) ||
    (filters.maxPrice && filters.maxPrice < 10000000);

  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `${currency} ${(value / 1000000).toFixed(1)}M`;
    }
    return `${currency} ${(value / 1000).toFixed(0)}K`;
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    onFiltersChange({
      ...filters,
      minPrice: values[0],
      maxPrice: values[1],
    });
  };

  return (
    <Card data-testid="card-search-filters">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              data-testid="button-clear-filters"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Select
            value={filters.area || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                area: value === "all" ? undefined : (value as any),
              })
            }
          >
            <SelectTrigger data-testid="select-area">
              <SelectValue placeholder="All Areas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              {dubaiAreas.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Property Type</label>
          <Select
            value={filters.propertyType || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                propertyType: value === "all" ? undefined : (value as any),
              })
            }
          >
            <SelectTrigger data-testid="select-property-type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {propertyTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Price Range</label>
          <Slider
            value={priceRange}
            min={500000}
            max={50000000}
            step={500000}
            onValueChange={handlePriceChange}
            className="w-full"
            data-testid="slider-price-range"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Bedrooms</label>
          <div className="flex flex-wrap gap-2">
            {["any", "1", "2", "3", "4", "5+"].map((bed) => {
              const bedNum =
                bed === "any" ? undefined : bed === "5+" ? 5 : parseInt(bed);
              const isActive = filters.minBedrooms === bedNum;
              return (
                <Badge
                  key={bed}
                  variant={isActive ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      minBedrooms: bedNum,
                      maxBedrooms: bed === "5+" ? undefined : bedNum,
                    })
                  }
                  data-testid={`badge-bedroom-${bed}`}
                >
                  {bed === "any" ? "Any" : bed}
                </Badge>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

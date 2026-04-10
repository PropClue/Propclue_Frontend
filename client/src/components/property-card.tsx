import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GrowthIndicator } from "@/components/growth-indicator";
import { MapPin, Bed, Bath, Maximize } from "lucide-react";
import { Property } from "@shared/schema";
import { Link } from "wouter";

interface PropertyCardProps {
  property: Property;
  currency?: string;
}

export function PropertyCard({
  property,
  currency = "AED",
}: PropertyCardProps) {
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${currency} ${(price / 1000000).toFixed(2)}M`;
    }
    return `${currency} ${price.toLocaleString()}`;
  };

  return (
    <Link href={`/property/${property.id}`}>
      <Card
        className="group cursor-pointer hover-elevate"
        data-testid={`card-property-${property.id}`}
      >
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <img
            src={property.imageUrl}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="bg-background/90 backdrop-blur-sm"
            >
              {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
            </Badge>
            {property.yoyGrowth > 5 && (
              <Badge className="bg-emerald-600 text-white">High Growth</Badge>
            )}
          </div>
        </div>
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{property.area}</span>
            </div>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <div>
              <p className="text-xl font-bold text-primary">
                {formatPrice(property.price)}
              </p>
              <p className="text-xs text-muted-foreground">
                {currency} {property.pricePerSqft.toLocaleString()} / sqft
              </p>
            </div>
            <div className="text-right">
              <GrowthIndicator value={property.yoyGrowth} size="sm" />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Maximize className="h-4 w-4" />
              <span>{property.sqft.toLocaleString()} sqft</span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1">
              Future Value (12 months)
            </p>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {formatPrice(property.futureValue12m)}
              </span>
              <GrowthIndicator
                value={
                  ((property.futureValue12m - property.price) /
                    property.price) *
                  100
                }
                size="sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

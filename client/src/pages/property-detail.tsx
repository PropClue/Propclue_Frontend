import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GrowthIndicator } from "@/components/growth-indicator";
import { FutureValueChart } from "@/components/future-value-chart";
import { PriceTrendChart } from "@/components/price-trend-chart";
import { PropertyCard } from "@/components/property-card";
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  TrendingUp,
  Building2,
  Sparkles,
} from "lucide-react";
import { Property } from "@shared/schema";
import { useCountry } from "@/context/CountryContext";

export default function PropertyDetail() {
  const { currency } = useCountry();
  const { id } = useParams<{ id: string }>();

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
    enabled: !!id,
  });

  const { data: similarProperties } = useQuery<Property[]>({
    queryKey: [`/api/properties/similar/${id}`],
    enabled: !!id,
  });

  const { data: priceHistory } = useQuery<
    Array<{ date: string; value: number }>
  >({
    queryKey: [`/api/properties/${id}/history`],
    enabled: !!id,
  });

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${currency} ${(price / 1000000).toFixed(2)}M`;
    }
    return `${currency} ${price.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The property you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/properties">
              <Button>Browse Properties</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <Link href="/properties">
          <Button
            variant="ghost"
            className="gap-2"
            data-testid="button-back-properties"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Properties
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <img
                src={property.imageUrl}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <Badge className="bg-primary text-primary-foreground">
                  {property.type.charAt(0).toUpperCase() +
                    property.type.slice(1)}
                </Badge>
                {property.yoyGrowth > 5 && (
                  <Badge className="bg-emerald-600 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    High Growth
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{property.area}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 py-4 border-y">
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">
                  {property.bedrooms} Bedrooms
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">
                  {property.bathrooms} Bathrooms
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Maximize className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">
                  {property.sqft.toLocaleString()} sqft
                </span>
              </div>
            </div>

            {priceHistory && priceHistory.length > 0 && (
              <PriceTrendChart
                data={priceHistory}
                title="Price History"
                currency={currency}
              />
            )}

            <FutureValueChart
              currentValue={property.price}
              futureValue12m={property.futureValue12m}
              futureValue24m={property.futureValue24m}
              futureValue36m={property.futureValue36m}
              currency={currency}
            />
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Current Market Value
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(property.price)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currency} {property.pricePerSqft.toLocaleString()} per sqft
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Y-o-Y Growth
                    </p>
                    <GrowthIndicator value={property.yoyGrowth} size="lg" />
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Q-o-Q Growth
                    </p>
                    <GrowthIndicator value={property.qoqGrowth} size="lg" />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Future Value Forecast
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        12 Months
                      </span>
                      <div className="text-right">
                        <span className="font-semibold">
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        24 Months
                      </span>
                      <div className="text-right">
                        <span className="font-semibold">
                          {formatPrice(property.futureValue24m)}
                        </span>
                        <GrowthIndicator
                          value={
                            ((property.futureValue24m - property.price) /
                              property.price) *
                            100
                          }
                          size="sm"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        36 Months
                      </span>
                      <div className="text-right">
                        <span className="font-semibold">
                          {formatPrice(property.futureValue36m)}
                        </span>
                        <GrowthIndicator
                          value={
                            ((property.futureValue36m - property.price) /
                              property.price) *
                            100
                          }
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  data-testid="button-contact-agent"
                >
                  Contact Agent
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {similarProperties && similarProperties.length > 0 && (
          <section className="space-y-6 pt-8 border-t">
            <h2 className="text-2xl font-bold">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.slice(0, 3).map((p) => (
                <PropertyCard key={p.id} property={p} currency={currency} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

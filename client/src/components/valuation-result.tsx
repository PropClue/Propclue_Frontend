import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GrowthIndicator } from "@/components/growth-indicator";
import { FutureValueChart } from "@/components/future-value-chart";
import { PropertyCard } from "@/components/property-card";
import { Sparkles, Target, TrendingUp, Calendar } from "lucide-react";
import { ValuationResult } from "@shared/schema";

interface ValuationResultProps {
  result: ValuationResult;
  currency?: string;
}

export function ValuationResultComponent({
  result,
  currency = "AED",
}: ValuationResultProps) {
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${currency} ${(price / 1000000).toFixed(2)}M`;
    }
    return `${currency} ${price.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <Card
        className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
        data-testid="card-valuation-result"
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl">Valuation Result</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">
                  <Target className="h-3 w-3 mr-1" />
                  {result.confidenceScore}% Confidence
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Estimated Market Value
            </p>
            <p className="text-4xl font-bold text-primary">
              {formatPrice(result.estimatedValue)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {currency} {result.pricePerSqft.toLocaleString()} per sqft
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Y-o-Y Growth</p>
              <GrowthIndicator value={result.yoyGrowth} size="lg" />
            </div>
            <div className="bg-background rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Q-o-Q Growth</p>
              <GrowthIndicator value={result.qoqGrowth} size="lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      <FutureValueChart
        currentValue={result.estimatedValue}
        futureValue12m={result.futureValue12m}
        futureValue24m={result.futureValue24m}
        futureValue36m={result.futureValue36m}
        currency={currency}
      />

      {result.comparableProperties.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Comparable Properties
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.comparableProperties.slice(0, 3).map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                currency={currency}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { GrowthIndicator } from "@/components/growth-indicator";
import { AreaStats } from "@shared/schema";
import { cn } from "@/lib/utils";

interface AreaHeatmapCardProps {
  stats: AreaStats;
  onClick?: () => void;
  currency?: string;
}

export function AreaHeatmapCard({
  stats,
  onClick,
  currency = "AED",
}: AreaHeatmapCardProps) {
  const getHeatmapColor = (stats: AreaStats) => {
    const risk = stats.risk?.toLowerCase();
    if (risk === "low" || risk === "very low") return "border-emerald-500/50";
    if (risk === "moderate" || risk === "medium") return "border-orange-500/50";
    if (risk === "high") return "border-red-500/50";

    // Fallback to intensity
    const intensity = stats.heatmapIntensity;
    if (intensity >= 0.7) {
      return "border-emerald-500/50"; // High Demand = Green
    }
    if (intensity >= 0.5) {
      return "border-orange-500/50"; // Moderate Demand = Orange
    }
    return "border-red-500/50"; // Low Demand = Red
  };

  const getHeatmapLabel = (stats: AreaStats) => {
    if (stats.risk) return `${stats.risk} Risk`;

    // Fallback to intensity labels
    const intensity = stats.heatmapIntensity;
    if (intensity >= 0.7) return "High Demand";
    if (intensity >= 0.5) return "Moderate Demand";
    return "Low Demand";
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${currency} ${(price / 1000000).toFixed(1)}M`;
    }
    return `${currency} ${(price / 1000).toFixed(0)}K`;
  };

  return (
    <Card
      className={cn(
        "cursor-pointer hover-elevate border-2 transition-colors overflow-hidden sm:p-3 p-2 sm:text-base text-xs",
        getHeatmapColor(stats),
      )}
      onClick={onClick}
      data-testid={`card-area-${stats.area.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{stats.area}</h3>
            <p className="text-xs text-muted-foreground">
              {getHeatmapLabel(stats)}
            </p>
          </div>
          <div
            className="w-3 h-3 rounded-full shadow-sm"
            style={{
              backgroundColor:
                stats.risk?.toLowerCase() === "low" ||
                stats.risk?.toLowerCase() === "very low"
                  ? "#10b981"
                  : stats.risk?.toLowerCase() === "moderate" ||
                      stats.risk?.toLowerCase() === "medium"
                    ? "#f97316"
                    : "#ef4444",
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Avg. Price</p>
            <p className="font-semibold">{formatPrice(stats.avgPrice)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Per Sqft</p>
            <p className="font-semibold">
              {currency} {stats.avgPricePerSqft.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
          <GrowthIndicator value={stats.yoyGrowth} label="Y-o-Y" size="sm" />
          <GrowthIndicator value={stats.qoqGrowth} label="Q-o-Q" size="sm" />
        </div>

        <div className="text-xs text-muted-foreground">
          {stats.totalListings.toLocaleString()} listings
        </div>
      </CardContent>
    </Card>
  );
}

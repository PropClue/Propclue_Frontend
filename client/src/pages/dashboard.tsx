import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { api } from "@/lib/api";
import { HeroSection } from "@/components/hero-section";
import { StatCard } from "@/components/stat-card";
import { PriceTrendChart } from "@/components/price-trend-chart";
import { AreaComparisonChart } from "@/components/area-comparison-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  TrendingUp,
  DollarSign,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { MarketOverview, AreaStats, Property } from "@shared/schema";
import { RiskDistributionChart } from "@/components/risk-distribution-chart";
import { AreaHeatmapCard } from "@/components/area-heatmap-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useCountry } from "@/context/CountryContext";

export default function Dashboard() {
  const { selectedCountry, selectedCity, currency } = useCountry();

  const defaultPropertyType = "Residential";
  const defaultSubPropertyType = "Land";

  // Fetch area stats first as it is the source of truth for overview
  const { data: areaStats, isLoading: loadingAreas } = useQuery<AreaStats[]>({
    queryKey: [
      "area-stats",
      selectedCountry,
      selectedCity,
      defaultPropertyType,
      defaultSubPropertyType,
    ],
    queryFn: () =>
      api.fetchAreaStats(
        defaultSubPropertyType,
        selectedCity,
        selectedCountry,
        defaultPropertyType,
      ),
  });

  // Calculate market overview from area stats
  const marketOverview = useMemo(() => {
    if (!areaStats) return null;
    return api.calculateMarketOverview(areaStats);
  }, [areaStats]);

  const { data: homepageData, isLoading: loadingHomepage } = useQuery<{
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
      defaultPropertyType,
    ],
    queryFn: () =>
      api.fetchHomepageMetadata(
        selectedCity,
        selectedCountry,
        defaultPropertyType,
      ),
  });

  const loadingMarket = loadingAreas;

  // Transform price_trends for the chart
  const priceTrendsData = homepageData?.charts.price_trends
    ? Object.entries(homepageData.charts.price_trends).map(([date, value]) => ({
        date,
        value,
      }))
    : [];

  const growthByAreaData = homepageData?.charts.growth_by_area
    ? Object.entries(homepageData.charts.growth_by_area).map(
        ([area, value]) => ({
          area,
          yoyGrowth: value,
        }),
      )
    : [];

  const priceByAreaData = homepageData?.charts.price_by_area
    ? Object.entries(homepageData.charts.price_by_area).map(
        ([area, value]) => ({
          area,
          avgPrice: value,
        }),
      )
    : [];

  const sortedStats = useMemo(() => {
    if (!areaStats) return [];
    return [...areaStats].sort(
      (a, b) => (b.heatmapIntensity || 0) - (a.heatmapIntensity || 0),
    );
  }, [areaStats]);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${currency} ${(price / 1000000).toFixed(1)}M`;
    }
    return `${currency} ${(price / 1000).toFixed(0)}K`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `${currency} ${(volume / 1000000000).toFixed(1)}B`;
    }
    return `${currency} ${(volume / 1000000).toFixed(0)}M`;
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Market Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loadingMarket ? (
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
            ) : homepageData?.overview ? (
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
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loadingHomepage ? (
            <>
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-40 mb-4" />
                  <Skeleton className="h-72 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-40 mb-4" />
                  <Skeleton className="h-72 w-full" />
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <PriceTrendChart
                data={priceTrendsData}
                title={`${selectedCity} Market Price Trends`}
                showProjected={true}
                currency={currency}
              />
              {growthByAreaData.length > 0 && (
                <AreaComparisonChart
                  data={growthByAreaData as any}
                  metric="yoyGrowth"
                  currency={currency}
                />
              )}
            </>
          )}
        </section>

        {/* <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Price Projections</h2>
            <Link href="/heatmap?tab=heatmap">
              <Button variant="outline" className="gap-2">
                View More
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loadingAreas ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={i > 2 ? "hidden lg:block" : ""}>
                    <Card>
                      <CardContent className="p-4">
                        <Skeleton className="h-24 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </>
            ) : (
              sortedStats?.slice(0, 4).map((stats, i) => (
                <div
                  key={stats.area}
                  className={i >= 2 ? "hidden lg:block" : ""}
                >
                  <Link
                    href={`/properties?area=${encodeURIComponent(stats.area)}`}
                  >
                    <AreaHeatmapCard stats={stats} />
                  </Link>
                </div>
              ))
            )}
          </div>
        </section> */}

        {!loadingHomepage && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AreaComparisonChart
              data={priceByAreaData as any}
              metric="avgPrice"
              currency={currency}
            />

            <Card className="h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <h3 className="text-lg font-bold mb-4">Risk Distribution</h3>
                <div className="flex-1 min-h-[300px]">
                  {homepageData?.charts.risk_distribution && (
                    <RiskDistributionChart
                      data={homepageData.charts.risk_distribution}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}

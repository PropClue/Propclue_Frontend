import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AreaStats } from "@shared/schema";

interface AreaComparisonChartProps {
  data: AreaStats[];
  metric: "avgPrice" | "avgPricePerSqft" | "yoyGrowth";
  currency?: string;
}

export function AreaComparisonChart({
  data,
  metric,
  currency = "AED",
}: AreaComparisonChartProps) {
  const chartData = data
    .map((item) => ({
      name: item.area.replace("Dubai ", "").replace(" Dubai", ""),
      value: item[metric],
      fullName: item.area,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const formatValue = (value: number) => {
    if (metric === "yoyGrowth") {
      return `${value.toFixed(1)}%`;
    }
    if (metric === "avgPrice" && value >= 1000000) {
      return `${currency} ${(value / 1000000).toFixed(1)}M`;
    }
    if (metric === "avgPricePerSqft") {
      return `${currency} ${value.toLocaleString()}`;
    }
    return `${currency} ${(value / 1000).toFixed(0)}K`;
  };

  const title = {
    avgPrice: "Average Price by Area",
    avgPricePerSqft: "Price per Sqft by Area",
    yoyGrowth: "Y-o-Y Growth by Area",
  }[metric];

  return (
    <Card data-testid={`chart-area-comparison-${metric}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                horizontal={false}
              />
              <XAxis
                type="number"
                tickFormatter={formatValue}
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [
                  metric === "yoyGrowth"
                    ? `${value.toFixed(1)}%`
                    : metric === "avgPrice"
                      ? `${currency} ${value.toLocaleString()}`
                      : `${currency} ${value.toLocaleString()}`,
                  title.replace(" by Area", ""),
                ]}
                labelFormatter={(label, payload) =>
                  payload?.[0]?.payload?.fullName || label
                }
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar
                dataKey="value"
                fill="hsl(174, 79%, 29%)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PriceTrendChartProps {
  data: Array<{
    date: string;
    value: number;
    projected?: number;
  }>;
  title?: string;
  showProjected?: boolean;
  currency?: string;
}

export function PriceTrendChart({
  data,
  title = "Price Trends",
  showProjected = false,
  currency = "AED",
}: PriceTrendChartProps) {
  const formatValue = (value: number) => {
    if (value >= 1_000_000)
      return `${currency} ${(value / 1_000_000).toFixed(1)}M`;
    return `${currency} ${(value / 1_000).toFixed(0)}K`;
  };

  // ------------------------
  // 1️⃣ Filter 2016+
  // ------------------------
  const filtered = data.filter((item) => {
    const year = Number(item.date.split(" ")[0]);
    return year >= 2016;
  });

  // ------------------------
  // 2️⃣ Aggregate per year
  // ------------------------

  type YearAccumulator = Record<
    string,
    {
      year: string;
      total: number;
      projectedTotal: number;
      count: number;
    }
  >;

  const yearlyData = Object.values(
    filtered.reduce<YearAccumulator>((acc, item) => {
      const year = item.date.split(" ")[0];

      if (!acc[year]) {
        acc[year] = { year, total: 0, projectedTotal: 0, count: 0 };
      }

      acc[year].total += item.value;
      acc[year].projectedTotal += item.projected ?? 0;
      acc[year].count += 1;

      return acc;
    }, {}),
  ).map((item) => ({
    date: item.year,
    value: item.total / item.count,
    projected: item.projectedTotal / item.count,
  }));

  return (
    <Card data-testid="chart-price-trend">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={yearlyData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />

              <YAxis
                tickFormatter={formatValue}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [
                  `${currency} ${value.toLocaleString()}`,
                  "",
                ]}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="value"
                name="Analized Price"
                stroke="hsl(174, 79%, 29%)"
                strokeWidth={2}
                dot={{ fill: "hsl(174, 79%, 29%)", r: 4 }}
                activeDot={{ r: 6 }}
              />
              {/* 
              {showProjected && (
                <Line
                  type="monotone"
                  dataKey="projected"
                  name="Projected Price"
                  stroke="hsl(145, 63%, 42%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "hsl(145, 63%, 42%)", r: 4 }}
                />
              )} */}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

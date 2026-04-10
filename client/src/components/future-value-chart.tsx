import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface FutureValueChartProps {
  currentValue: number;
  futureValue12m: number;
  futureValue24m: number;
  futureValue36m: number;
  currency?: string;
}

export function FutureValueChart({
  currentValue,
  futureValue12m,
  futureValue24m,
  futureValue36m,
  currency = "AED",
}: FutureValueChartProps) {
  const data = [
    { period: "Current", value: currentValue, growth: 0 },
    {
      period: "12 Months",
      value: futureValue12m,
      growth: ((futureValue12m - currentValue) / currentValue) * 100,
    },
    {
      period: "24 Months",
      value: futureValue24m,
      growth: ((futureValue24m - currentValue) / currentValue) * 100,
    },
    {
      period: "36 Months",
      value: futureValue36m,
      growth: ((futureValue36m - currentValue) / currentValue) * 100,
    },
  ];

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${currency} ${(value / 1000000).toFixed(1)}M`;
    }
    return `${currency} ${(value / 1000).toFixed(0)}K`;
  };

  const colors = [
    "hsl(174, 79%, 29%)",
    "hsl(174, 65%, 35%)",
    "hsl(145, 63%, 42%)",
    "hsl(145, 63%, 50%)",
  ];

  return (
    <Card data-testid="chart-future-value">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          Future Value Prediction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="period"
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
                formatter={(value: number, name: string, entry: any) => [
                  `${currency} ${value.toLocaleString()}`,
                  entry.payload.growth > 0
                    ? `+${entry.payload.growth.toFixed(1)}%`
                    : "",
                ]}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {data.map((item, index) => (
            <div key={item.period} className="text-center">
              <p className="text-xs text-muted-foreground">{item.period}</p>
              <p className="font-semibold text-sm">{formatValue(item.value)}</p>
              {item.growth > 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  +{item.growth.toFixed(1)}%
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

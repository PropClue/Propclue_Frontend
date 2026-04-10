import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface RiskDistributionChartProps {
  data: Record<string, number>;
}

export function RiskDistributionChart({ data }: RiskDistributionChartProps) {
  // Transform data for recharts
  // We want High, Moderate, Low.
  // Colors: High=Red, Moderate=Yellow, Low=Green
  // Order: usually we want strict order for rings.

  const chartData = [
    {
      name: "Low",
      value: data["Low"],
      fill: "hsl(142, 71%, 45%)", // Green-600
    },
    {
      name: "Moderate",
      value: data["Moderate"],
      fill: "hsl(24, 95%, 53%)", // Orange-500 (approx)
    },
    {
      name: "High",
      value: data["High"],
      fill: "hsl(0, 84%, 60%)", // Red-500
    },
  ];
  const totalCities =
    (data["Low"] || 0) + (data["Moderate"] || 0) + (data["High"] || 0);

  const isMobile = window.innerWidth < 640;

  return (
    <Card className="h-full border-none shadow-none bg-transparent">
      <div className="h-[300px] w-full flex flex-col">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? "25%" : "30%"}
              outerRadius={isMobile ? "95%" : "100%"}
              barSize={isMobile ? 28 : 20}
              data={chartData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                label={{ position: "insideStart", fill: "#fff", fontSize: 12 }}
                background
                dataKey="value"
                cornerRadius={10}
              />

              <Legend
                iconSize={10}
                layout={isMobile ? "horizontal" : "vertical"}
                verticalAlign={isMobile ? "bottom" : "middle"}
                align={isMobile ? "center" : "right"}
                wrapperStyle={
                  isMobile
                    ? { paddingTop: "10px" }
                    : {
                        right: 0,
                        top: "50%",
                        transform: "translate(0, -50%)",
                        lineHeight: "24px",
                      }
                }
              />

              <Tooltip
                contentStyle={{
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelFormatter={() => ""}
                formatter={(_, __, { payload }) => [
                  `${payload?.value}`,
                  payload?.name || "Properties",
                ]}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer text */}
        <div className="flex flex-col items-center justify-center pt-2">
          <p className="text-sm text-muted-foreground">Risk Distribution</p>
          <p className="text-lg font-semibold">{totalCities} Cities</p>

          <p className="text-xs text-muted-foreground mt-1 text-center max-w-[240px]">
            Insights calculated using data from {totalCities} cities.
          </p>
        </div>
      </div>
    </Card>
  );
}

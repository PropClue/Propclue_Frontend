import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { fetchLocationDetails } from "@/Api/ProjectionAPI";
import { Skeleton } from "@/components/ui/skeleton";
import { LuInfo } from "react-icons/lu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { InfoTooltip } from "./InfoTooltip";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface ProjectionChartsProps {
  propertyType: string;
  subPropertyType: string;
  localities: string[];
  city?: string;
  country?: string;
  currency?: string;
}

export const ProjectionCharts: React.FC<ProjectionChartsProps> = ({
  propertyType,
  subPropertyType,
  localities = [],
  city = "Dubai",
  country = "UAE",
  currency = "AED",
}) => {
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data for all selected localities
  useEffect(() => {
    if (selectedLocalities.length === 0) {
      setChartData([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.all(
          selectedLocalities.map((loc) =>
            fetchLocationDetails(
              loc,
              propertyType,
              subPropertyType,
              city,
              country,
            ),
          ),
        );

        // Process results into a format suitable for Recharts
        // The API returns an array of { year, quarter, Avg_Projected, ... }
        const timeMap: Record<string, any> = {};

        results.forEach((localityData, index) => {
          if (!localityData || !Array.isArray(localityData)) return;

          const localityName = selectedLocalities[index];

          localityData.forEach((item: any) => {
            const timeKey = `${item.quarter}/${item.year}`;
            if (!timeMap[timeKey]) {
              timeMap[timeKey] = {
                time: timeKey,
                timestamp:
                  item.year * 10 +
                  (item.quarter === "Jan-Mar"
                    ? 1
                    : item.quarter === "Apr-Jun"
                      ? 2
                      : item.quarter === "Jul-Sep"
                        ? 3
                        : 4),
              };
            }
            timeMap[timeKey][localityName] = Number(item.Avg_Projected);
          });
        });

        // Convert to array and sort by time
        const sortedData = Object.values(timeMap).sort(
          (a: any, b: any) => a.timestamp - b.timestamp,
        );
        setChartData(sortedData);
      } catch (err) {
        console.error("Error fetching projection data:", err);
        setError("Failed to fetch comparative data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedLocalities, propertyType, subPropertyType]);

  const handleSelect = (val: string) => {
    if (selectedLocalities.includes(val)) return;
    if (selectedLocalities.length >= 3) {
      alert("You can select a maximum of 3 localities for comparison.");
      return;
    }
    setSelectedLocalities([...selectedLocalities, val]);
  };

  const removeLocality = (loc: string) => {
    setSelectedLocalities(selectedLocalities.filter((l) => l !== loc));
  };

  const colors = ["#d328a7", "#10b981", "#fbbf24"];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/30 backdrop-blur-sm p-6 rounded-3xl border border-primary/10">
        <div className="space-y-1">
          <h3 className="text-sm md:text-xl font-bold flex items-center gap-2">
            Micro-Market Comparative Projections
            <InfoTooltip />
          </h3>
          <p className="text-sm text-muted-foreground italic">
            Powered by PropClue AI/ML Prediction Engine
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full sm:w-[280px] justify-between bg-background/50 backdrop-blur-md border-primary/20 rounded-xl h-11"
              >
                Add Locality to Compare...
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-full sm:w-[280px] p-0">
              <Command>
                <CommandInput placeholder="Search locality..." />
                <CommandEmpty>No locality found.</CommandEmpty>

                <CommandGroup className="max-h-[300px] overflow-y-auto">
                  {localities
                    .filter((l) => !selectedLocalities.includes(l))
                    .map((loc) => (
                      <CommandItem
                        key={loc}
                        value={loc}
                        onSelect={(value) => handleSelect(value)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedLocalities.includes(loc)
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {loc}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="flex flex-wrap gap-2">
            {selectedLocalities.map((loc, i) => (
              <Badge
                key={loc}
                variant="secondary"
                className="pl-3 pr-1 py-1 h-8 rounded-full flex items-center gap-2 border-primary/10 bg-background/40 hover:bg-background/60 transition-all"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: colors[i] }}
                />
                <span className="text-[10px] font-bold">{loc}</span>
                <button
                  onClick={() => removeLocality(loc)}
                  className="p-0.5 hover:bg-muted rounded-full ml-1"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Card className="border-primary/5 shadow-2xl bg-card/20 backdrop-blur-xl overflow-hidden rounded-3xl">
        <CardHeader className="pb-0 pt-8 px-8">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-primary/60">
              Historical & Projected Value ({currency}/SQFT)
            </CardTitle>
            {loading && (
              <div className="h-2 w-24 bg-primary/20 animate-pulse rounded-full" />
            )}
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-6 lg:p-8">
          {selectedLocalities.length === 0 ? (
            <div className="h-[450px] flex flex-col items-center justify-center border-2 border-dashed border-primary/10 rounded-3xl bg-muted/5">
              <p className="text-muted-foreground font-medium">
                Select up to 3 localities to visualize comparative trends
              </p>
            </div>
          ) : loading && chartData.length === 0 ? (
            <div className="h-[450px] space-y-4">
              <Skeleton className="h-full w-full rounded-3xl" />
            </div>
          ) : (
            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={
                    window.innerWidth < 640
                      ? { top: 10, right: 5, left: 5, bottom: 10 }
                      : { top: 20, right: 30, left: 20, bottom: 20 }
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--muted-foreground))"
                    opacity={0.1}
                  />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                      fontWeight: 700,
                    }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                      fontWeight: 700,
                    }}
                    tickFormatter={(val) =>
                      `${currency} ${val.toLocaleString()}`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(var(--background), 0.8)",
                      backdropFilter: "blur(16px)",
                      border: "1px solid hsl(var(--primary) / 0.1)",
                      borderRadius: "16px",
                      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                      padding: "16px",
                    }}
                    labelStyle={{
                      fontWeight: 800,
                      color: "hsl(var(--primary))",
                      marginBottom: "8px",
                      fontSize: "12px",
                    }}
                    itemStyle={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "2px 0",
                    }}
                    formatter={(val: any) => [
                      `${currency} ${val.toLocaleString()}`,
                      "Projected Value",
                    ]}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={36}
                    iconType="circle"
                    formatter={(val) => (
                      <span className="text-[10px] font-black uppercase text-foreground/60 ml-1">
                        {val}
                      </span>
                    )}
                  />
                  {selectedLocalities.map((loc, i) => (
                    <Line
                      key={loc}
                      type="monotone"
                      dataKey={loc}
                      stroke={colors[i]}
                      strokeWidth={4}
                      dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                      activeDot={{ r: 8, strokeWidth: 0, fill: colors[i] }}
                      animationDuration={1500}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-4">
        <LuInfo className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
        <div className="space-y-1">
          <p className="text-sm font-black text-amber-500 uppercase tracking-widest">
            Note
          </p>
          <p className="text-xs text-amber-500/80 leading-relaxed font-bold">
            The depicted trends are computed using historical transaction
            patterns and current supply velocity metrics. Real-world
            realizations may vary based on future regulatory shifts and
            developer delivery milestones.
          </p>
        </div>
      </div>
    </div>
  );
};

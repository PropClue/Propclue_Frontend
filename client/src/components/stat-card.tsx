import { Card, CardContent } from "@/components/ui/card";
import { GrowthIndicator } from "@/components/growth-indicator";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  yoyGrowth?: number;
  qoqGrowth?: number;
  subtitle?: string;
}

export function StatCard({ title, value, icon: Icon, yoyGrowth, qoqGrowth, subtitle }: StatCardProps) {
  return (
    <Card data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {(yoyGrowth !== undefined || qoqGrowth !== undefined) && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {yoyGrowth !== undefined && (
                  <GrowthIndicator value={yoyGrowth} label="Y-o-Y" size="sm" />
                )}
                {qoqGrowth !== undefined && (
                  <GrowthIndicator value={qoqGrowth} label="Q-o-Q" size="sm" />
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

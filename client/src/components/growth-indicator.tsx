import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface GrowthIndicatorProps {
  value: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function GrowthIndicator({ value, label, size = "md", showIcon = true }: GrowthIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base font-semibold"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <div className={cn(
      "flex items-center gap-1",
      sizeClasses[size],
      isPositive ? "text-emerald-600 dark:text-emerald-400" : 
      isNeutral ? "text-muted-foreground" : 
      "text-red-600 dark:text-red-400"
    )}>
      {showIcon && (
        isPositive ? <TrendingUp className={iconSizes[size]} /> :
        isNeutral ? <Minus className={iconSizes[size]} /> :
        <TrendingDown className={iconSizes[size]} />
      )}
      <span>
        {isPositive ? "+" : ""}{value.toFixed(1)}%
        {label && <span className="text-muted-foreground ml-1">{label}</span>}
      </span>
    </div>
  );
}

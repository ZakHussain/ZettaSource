"use client";
import { Zap } from "lucide-react";

interface PowerBudgetBadgeProps {
  totalMa: number;
  level: "OK" | "Caution" | "High";
  percentage: number;
}

export default function PowerBudgetBadge({ totalMa, level, percentage }: PowerBudgetBadgeProps) {
  const getColors = () => {
    switch (level) {
      case "OK":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "Caution":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "High":
        return "bg-red-500/20 text-red-300 border-red-500/30";
    }
  };

  return (
    <div 
      data-testid="power-badge"
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getColors()}`}
      title={`Estimated power draw: ${totalMa}mA (${percentage.toFixed(1)}% of typical USB limit)`}
    >
      <Zap className="w-4 h-4" />
      <div className="text-sm">
        <span className="font-medium">{level}</span>
        <span className="text-xs ml-1">({totalMa}mA)</span>
      </div>
    </div>
  );
}
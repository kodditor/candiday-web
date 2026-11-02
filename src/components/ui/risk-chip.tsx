import { cn } from "@/lib/cn";
import type { RiskTier } from "@/lib/types/vendor.type";

const tierStyles: Record<RiskTier, string> = {
  Low: "border-risk-low bg-risk-low-bg text-risk-low",
  Medium: "border-risk-medium bg-risk-medium-bg text-risk-medium",
  High: "border-risk-high bg-risk-high-bg text-risk-high",
};

export interface RiskChipProps {
  tier: RiskTier;
  children?: React.ReactNode;
  className?: string;
}

export function RiskChip({ tier, children, className }: RiskChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono text-xs font-medium uppercase tracking-[0.06em]",
        "border rounded-sm px-2 py-[3px]",
        tierStyles[tier],
        className,
      )}
    >
      {children ?? tier}
    </span>
  );
}

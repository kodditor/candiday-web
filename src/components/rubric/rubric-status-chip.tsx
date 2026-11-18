import { cn } from "@/lib/cn";

type RubricStatusChipProps = {
  className?: string;
};

export function RubricStatusChip({ className }: RubricStatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-normal bg-emerald-50 text-emerald-800",
        className,
      )}
    >
      Approved
    </span>
  );
}
import { cn } from "@/lib/cn"

export interface ReviewedStampProps {
  line1?: string
  line2?: string
  className?: string
}

export function ReviewedStamp({
  line1 = "Reviewed",
  line2 = "2026",
  className,
}: ReviewedStampProps) {
  return (
    <div
      className={cn(
        "inline-flex h-16 w-16 flex-col items-center justify-center",
        "rounded-full border-2 border-statute -rotate-[8deg]",
        "font-mono text-[9px] font-medium uppercase leading-tight text-statute",
        className
      )}
      aria-label={`${line1} ${line2}`}
    >
      <span>{line1}</span>
      <span>{line2}</span>
    </div>
  )
}

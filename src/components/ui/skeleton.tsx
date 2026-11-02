import { cn } from "@/lib/cn"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("pv-redaction-bar animate-pulse", className)}
      {...props}
    />
  )
}

export { Skeleton }

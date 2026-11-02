import { cn } from "@/lib/cn"

export interface RedactionBarProps {
  className?: string
}

export function RedactionBar({ className }: RedactionBarProps) {
  return <div className={cn("pv-redaction-bar w-full", className)} aria-hidden="true" />
}

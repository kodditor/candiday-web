import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const pillVariants = cva(
  "inline-flex w-fit items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        success:
          "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-800/20 dark:text-emerald-400",
        failed:
          "border-transparent bg-destructive/10 text-destructive dark:text-destructive",
        pending:
          "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400",
        warning:
          "border-transparent bg-orange-100 text-orange-800 dark:bg-orange-800/20 dark:text-orange-400",
        default:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface PillProps
  extends React.HTMLAttributes<HTMLDivElement>,
  Omit<VariantProps<typeof pillVariants>, "variant"> {
  value?: React.ReactNode;
  variant?: "success" | "failed" | "pending" | "warning" | "default" | null;
  variantDef?: Record<string, string>;
}

function Pill({ className, variant, variantDef, value, children, ...props }: PillProps) {
  // Determine if we should use the variantDef class
  // We use lowercase or exact match if value is string. To be safe we look up as is, but could lowercase for convenience.
  const stringValue = typeof value === "string" ? value : undefined;

  const customClass =
    stringValue && variantDef && variantDef[stringValue]
      ? variantDef[stringValue]
      : undefined;

  // If customClass exists, we only apply base classes + customClass
  const finalClassName = customClass
    ? cn(
      "inline-flex w-fit items-center justify-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      customClass,
      className
    )
    : cn(pillVariants({ variant }), className);

  return (
    <div className={finalClassName} {...props}>
      {value || children}
    </div>
  )
}

export { Pill, pillVariants }

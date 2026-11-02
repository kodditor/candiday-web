import { cn } from "@/lib/cn";
import { StorefrontIcon } from "@phosphor-icons/react";

type VendorLogoProps = {
  name: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 28,
};

export function VendorLogo({
  name,
  logoUrl,
  size = "md",
  className,
}: VendorLogoProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-hairline bg-paper-raised",
        sizeClasses[size],
        className,
      )}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="h-full w-full object-cover"
        />
      ) : (
        <StorefrontIcon size={iconSizes[size]} className="text-text-secondary" />
      )}
    </div>
  );
}

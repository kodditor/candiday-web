import type { VendorFlags } from "@/lib/types/vendor.type";
import { cn } from "@/lib/cn";

type VendorFlagBannersProps = {
  flags: VendorFlags;
};

const FLAG_CONFIG = [
  {
    key: "dpaMissing" as const,
    label: "DPA missing",
    description: "No DPA document uploaded.",
    className: "border-amber-300/80 bg-amber-50/70 text-amber-900",
  },
  {
    key: "noSccOnFile" as const,
    label: "No SCC on file",
    description: "SCCs required but not signed.",
    className: "border-orange-300/80 bg-orange-50/70 text-orange-900",
  },
  {
    key: "noOwnerAssigned" as const,
    label: "No owner assigned",
    description: "No internal data owner linked.",
    className: "border-blue-300/80 bg-blue-50/70 text-blue-900",
  },
];

export function VendorFlagBanners({ flags }: VendorFlagBannersProps) {
  const activeFlags = FLAG_CONFIG.filter((flag) => flags[flag.key]);

  if (activeFlags.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-2">
      {activeFlags.map((flag) => (
        <li
          key={flag.key}
          className={cn(
            "flex items-baseline gap-2 rounded-md border-2 px-3 py-3 text-xs leading-snug",
            flag.className,
          )}
        >
          <span className="shrink-0 font-medium">{flag.label}</span>
          <span className="text-current/70">{flag.description}</span>
        </li>
      ))}
    </ul>
  );
}

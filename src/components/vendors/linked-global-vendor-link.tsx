import { VendorLogo } from "@/components/vendors/vendor-logo";
import type { IGlobalVendor } from "@/lib/types/global-vendor.type";
import { formatCategoryLabel } from "@/lib/utils/vendor";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

type LinkedGlobalVendorLinkProps = {
  globalVendor: Pick<IGlobalVendor, "_id" | "name" | "logoUrl" | "category">;
};

export function LinkedGlobalVendorLink({ globalVendor }: LinkedGlobalVendorLinkProps) {
  return (
    <Link
      to="/dashboard/global-vendors/$id"
      params={{ id: globalVendor._id }}
      className="flex items-center gap-4 rounded-lg border border-hairline px-4 py-3 transition-colors hover:bg-gray-50"
    >
      <VendorLogo
        name={globalVendor.name}
        logoUrl={globalVendor.logoUrl}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{globalVendor.name}</p>
        <p className="text-xs text-text-secondary">
          {formatCategoryLabel(globalVendor.category)}
        </p>
      </div>
      <ArrowSquareOutIcon size={16} className="shrink-0 text-text-secondary" />
    </Link>
  );
}

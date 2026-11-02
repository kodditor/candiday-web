import { VendorContainer } from "@/components/containers/vendor.container";
import { VendorFlagBanners } from "@/components/vendors/vendor-flag-banners";
import { fetchVendor } from "@/lib/api/vendors";
import { fetchCurrentUser } from "@/lib/api/user";
import type { VendorFlags } from "@/lib/types/vendor.type";
import { computeVendorFlags } from "@/lib/utils/vendor";
import { wrapError } from "@/lib/utils/request";
import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { Link, createRoute, useRouterState } from "@tanstack/react-router";
import { ArrowLeftIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { DashboardVendorsRoute } from "./index";

type VendorDetailLocationState = {
  flags?: VendorFlags;
};

export const DashboardVendorDetailRoute = createRoute({
  getParentRoute: () => DashboardVendorsRoute,
  path: "/$id",
  component: VendorDetailPage,
});

export function VendorDetailPage() {
  const { id } = DashboardVendorDetailRoute.useParams();
  const { getToken } = useAuth();
  const routerState = useRouterState({
    select: (state) => state.location.state as VendorDetailLocationState | undefined,
  });

  const vendorQuery = useQuery({
    queryKey: ["vendor", id],
    queryFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      return fetchVendor(token, id);
    }),
  });

  const sessionQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      return fetchCurrentUser(token);
    }),
  });

  if (vendorQuery.isPending) {
    return (
      <div className="grid min-h-64 place-items-center">
        <CircleNotchIcon size={28} className="animate-spin text-statute" />
      </div>
    );
  }

  if (vendorQuery.isError || !vendorQuery.data) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">Unable to load vendor.</p>
        <Link to="/dashboard/vendors" className="text-sm text-statute hover:underline">
          Back to vendors
        </Link>
      </div>
    );
  }

  const { vendor, dataOwnerDetails = [], subprocessors = [] } = vendorQuery.data;
  const trustPageEnabled = sessionQuery.data?.organization?.trustPageEnabled ?? false;
  const trustPageLayout = sessionQuery.data?.organization?.trustPageLayout ?? "Simplified";
  const flags = routerState?.flags ?? computeVendorFlags({
    dpaFileKey: vendor.dpa.fileKey,
    dpaSccStatus: vendor.dpa.sccStatus,
    hostingLocations: vendor.hostingLocations,
    dataOwnerIds: vendor.dataOwners,
  });

  return (
    <div className="space-y-10">
      <Link
        to="/dashboard/vendors"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-ink"
      >
        <ArrowLeftIcon size={16} />
        Back to vendors
      </Link>

      <VendorFlagBanners flags={flags} />
      <VendorContainer
        vendor={vendor}
        dataOwners={dataOwnerDetails}
        subprocessors={subprocessors}
        trustPageEnabled={trustPageEnabled}
        trustPageLayout={trustPageLayout}
        onUpdated={() => {
          void vendorQuery.refetch();
        }}
      />
    </div>
  );
}

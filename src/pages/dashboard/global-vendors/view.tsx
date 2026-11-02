import { GlobalVendorContainer } from "@/components/containers/global-vendor.container";
import { fetchGlobalVendor } from "@/lib/api/global-vendors";
import { wrapError } from "@/lib/utils/request";
import { useAuth } from "@clerk/react";
import { ArrowLeftIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link, createRoute } from "@tanstack/react-router";
import { DashboardGlobalVendorsRoute } from "./index";

export const DashboardGlobalVendorDetailRoute = createRoute({
  getParentRoute: () => DashboardGlobalVendorsRoute,
  path: "/$id",
  component: GlobalVendorDetailPage,
});

export function GlobalVendorDetailPage() {
  const { id } = DashboardGlobalVendorDetailRoute.useParams();
  const { getToken } = useAuth();

  const globalVendorQuery = useQuery({
    queryKey: ["global-vendor", id],
    queryFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      return fetchGlobalVendor(token, id);
    }),
  });

  if (globalVendorQuery.isPending) {
    return (
      <div className="grid min-h-64 place-items-center">
        <CircleNotchIcon size={28} className="animate-spin text-statute" />
      </div>
    );
  }

  if (globalVendorQuery.isError || !globalVendorQuery.data) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">Unable to load global vendor.</p>
        <Link to="/dashboard/global-vendors" className="text-sm text-statute hover:underline">
          Back to global vendors
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <Link
        to="/dashboard/global-vendors"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-ink"
      >
        <ArrowLeftIcon size={16} />
        Back to global vendors
      </Link>

      <GlobalVendorContainer globalVendor={globalVendorQuery.data} />
    </div>
  );
}

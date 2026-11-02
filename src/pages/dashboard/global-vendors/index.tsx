import { VendorLogo } from "@/components/vendors/vendor-logo";
import { fetchGlobalVendors } from "@/lib/api/global-vendors";
import { useUser } from "@/lib/context/user-context";
import type { IGlobalVendor } from "@/lib/types/global-vendor.type";
import { formatCategoryLabel } from "@/lib/utils/vendor";
import { wrapError } from "@/lib/utils/request";
import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { createRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { parseAsInteger, useQueryState } from "nuqs";
import { DataTable } from "@/components/ui/custom-table";
import { DashboardRootRoute } from "../root";

export const DashboardGlobalVendorsRoute = createRoute({
  getParentRoute: () => DashboardRootRoute,
  path: "/global-vendors",
  component: () => <Outlet />,
});

export const DashboardGlobalVendorsIndexRoute = createRoute({
  getParentRoute: () => DashboardGlobalVendorsRoute,
  path: "/",
  component: GlobalVendorsPage,
});

export function GlobalVendorsPage() {
  const user = useUser((state) => state.user);
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit] = useQueryState("limit", parseAsInteger.withDefault(10));
  const [query] = useQueryState("query");

  const globalVendorsQuery = useQuery({
    enabled: Boolean(user),
    queryKey: ["global-vendors", query, page, limit],
    gcTime: 0,
    queryFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      return fetchGlobalVendors(token, { query, page, limit });
    }),
  });

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            Global Vendors
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Browse ProcVault&apos;s curated vendor catalog with subprocessor monitoring.
          </p>
        </div>
      </div>

      <div className="mt-8 flex min-h-0 flex-1 flex-col">
        <DataTable<IGlobalVendor>
          name="Global Vendors"
          {...globalVendorsQuery.data}
          loading={globalVendorsQuery.isPending}
          renderHeader={() => (
            <tr>
              <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase" />
              <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase">Name</th>
              <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase">Category</th>
              <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase">Jurisdiction</th>
              <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase">Regions</th>
              <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase">Subprocessors</th>
            </tr>
          )}
          renderItem={(globalVendor) => (
            <tr
              key={globalVendor._id}
              className="cursor-pointer border-b border-gray-200 duration-150 hover:bg-gray-50"
              onClick={() => navigate({
                to: "/dashboard/global-vendors/$id",
                params: { id: globalVendor._id },
              })}
            >
              <td className="pl-4">
                <VendorLogo
                  name={globalVendor.name}
                  logoUrl={globalVendor.logoUrl}
                  size="sm"
                />
              </td>
              <td className="p-4">
                <p className="text-sm font-medium">{globalVendor.name}</p>
              </td>
              <td className="p-4">
                <p className="text-sm">{formatCategoryLabel(globalVendor.category)}</p>
              </td>
              <td className="p-4">
                <p className="text-sm">{globalVendor.primaryJurisdiction}</p>
              </td>
              <td className="p-4">
                <p className="text-sm">
                  {globalVendor.availableRegions.length > 0
                    ? globalVendor.availableRegions.join(", ")
                    : "—"}
                </p>
              </td>
              <td className="p-4">
                <p className="text-sm">{globalVendor.knownSubprocessors.length}</p>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}

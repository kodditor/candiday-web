import { Button } from "@/components/ui/button";
import { RiskChip } from "@/components/ui/risk-chip";
import { Pill } from "@/components/ui/pill";
import { VendorLogo } from "@/components/vendors/vendor-logo";
import { fetchVendors } from "@/lib/api/vendors";
import { useActiveVendorCount } from "@/lib/hooks/use-active-vendor-count";
import { useUser } from "@/lib/context/user-context";
import type { IVendor } from "@/lib/types/vendor.type";
import { getVendorLimitMessage } from "@/lib/utils/plan-limits";
import { formatCategoryLabel } from "@/lib/utils/vendor";
import { wrapError } from "@/lib/utils/request";
import { useAuth } from "@clerk/react";
import { PlusIcon } from "@phosphor-icons/react";
import lodash from "lodash";
import { useQuery } from "@tanstack/react-query";
import { createRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { parseAsInteger, useQueryState } from "nuqs";
import { DataTable } from "@/components/ui/custom-table";
import { DashboardRootRoute } from "../root";

export const DashboardVendorsRoute = createRoute({
  getParentRoute: () => DashboardRootRoute,
  path: "/vendors",
  component: () => <Outlet />,
});

export const DashboardVendorsIndexRoute = createRoute({
  getParentRoute: () => DashboardVendorsRoute,
  path: "/",
  component: VendorsPage,
});

export function VendorsPage() {
  const user = useUser((state) => state.user);
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { atLimit, plan } = useActiveVendorCount();
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit] = useQueryState("limit", parseAsInteger.withDefault(10));
  const [query] = useQueryState("query");

  const vendorsQuery = useQuery({
    enabled: Boolean(user),
    queryKey: ["vendors", query, page, limit],
    gcTime: 0,
    queryFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      return fetchVendors(token, { query, page, limit });
    }),
  });

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            Vendors
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Track third-party vendors, DPAs, and compliance posture.
          </p>
          {atLimit && (
            <p className="mt-2 text-sm text-amber-800">
              {getVendorLimitMessage(plan)}{" "}
              <Link
                to="/dashboard/settings"
                className="font-medium text-statute hover:underline"
              >
                Upgrade plan
              </Link>
            </p>
          )}
        </div>
        <Button
          className="gap-2"
          disabled={atLimit}
          onClick={() => navigate({ to: "/dashboard/vendors/create" })}
        >
          <PlusIcon strokeWidth={1.5} size={20} />
          Add vendor
        </Button>
      </div>

      <div className="mt-8 flex min-h-0 flex-1 flex-col">
        <DataTable<IVendor>
          name="Vendors"
          {...vendorsQuery.data}
          loading={vendorsQuery.isPending}
          renderHeader={() => (
            <tr>
              <th className="whitespace-pre p-4 bg-gray-200/30 text-left text-xs font-medium uppercase border-b border-gray-300" />
              <th className="whitespace-pre p-4 bg-gray-200/30 text-left text-xs font-medium uppercase border-b border-gray-300">Name</th>
              <th className="whitespace-pre p-4 bg-gray-200/30 text-left text-xs font-medium uppercase border-b border-gray-300">Category</th>
              <th className="whitespace-pre p-4 bg-gray-200/30 text-left text-xs font-medium uppercase border-b border-gray-300">Risk</th>
              <th className="whitespace-pre p-4 bg-gray-200/30 text-left text-xs font-medium uppercase border-b border-gray-300">Status</th>
              <th className="whitespace-pre p-4 bg-gray-200/30 text-left text-xs font-medium uppercase border-b border-gray-300">DPA</th>
              <th className="whitespace-pre p-4 bg-gray-200/30 text-left text-xs font-medium uppercase border-b border-gray-300">Creator</th>
              <th className="whitespace-pre p-4 bg-gray-200/30 text-left text-xs font-medium uppercase border-b border-gray-300">Created</th>
            </tr>
          )}
          renderItem={(vendor) => (
            <tr
              key={vendor._id}
              className="cursor-pointer border-b border-gray-200 duration-150 hover:bg-gray-50"
              onClick={() => navigate({ to: "/dashboard/vendors/$id", params: { id: vendor._id } })}
            >
              <td className="pl-4">
                <VendorLogo
                  name={vendor.name}
                  logoUrl={vendor.logoUrl}
                  size="sm"
                />
              </td>
              <td className="p-4">
                <p className="text-sm font-medium">{vendor.name}</p>
              </td>
              <td className="p-4">
                <p className="text-sm">
                  {formatCategoryLabel(vendor.category, vendor.customCategoryLabel)}
                </p>
              </td>
              <td className="p-4">
                <RiskChip tier={vendor.riskTier} />
              </td>
              <td className="p-4">
                <Pill
                  value={lodash.startCase(vendor.status ?? "Active")}
                  variantDef={{
                    Active: "bg-emerald-100 text-emerald-800",
                    Archived: "bg-gray-100 text-gray-800",
                  }}
                />
              </td>
              <td className="p-4">
                <Pill
                  value={vendor.dpa.fileKey ? "On file" : "Missing"}
                  variantDef={{
                    "On file": "bg-emerald-100 text-emerald-800",
                    Missing: "bg-amber-100 text-amber-800",
                  }}
                />
              </td>
              <td className="p-4">
                <p className="text-sm">
                  {vendor.createdBy
                    ? [vendor.createdBy.firstName, vendor.createdBy.lastName]
                      .filter(Boolean)
                      .join(" ")
                    : "—"}
                </p>
              </td>
              <td className="p-4">
                <p className="text-sm">{dayjs(vendor.createdAt).format("DD/MM/YYYY")}</p>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}

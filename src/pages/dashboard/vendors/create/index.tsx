import { GlobalVendorCatalogModal } from "@/components/vendors/global-vendor-catalog-modal";
import { Button } from "@/components/ui/button";
import { useActiveVendorCount } from "@/lib/hooks/use-active-vendor-count";
import { getVendorLimitMessage } from "@/lib/utils/plan-limits";
import { Link, createRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, BooksIcon, PencilSimpleLineIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { DashboardVendorsRoute } from "../index";

export const DashboardVendorsCreateRoute = createRoute({
  getParentRoute: () => DashboardVendorsRoute,
  path: "/create",
  component: () => <Outlet />,
});

export const DashboardVendorsCreateIndexRoute = createRoute({
  getParentRoute: () => DashboardVendorsCreateRoute,
  path: "/",
  component: VendorCreateChooserPage,
});

export function VendorCreateChooserPage() {
  const navigate = useNavigate();
  const [catalogOpen, setCatalogOpen] = useState(false);
  const { atLimit, plan, isLoading } = useActiveVendorCount();

  if (isLoading) {
    return null;
  }

  if (atLimit) {
    return (
      <div className="mx-auto max-w-4xl space-y-8 py-4">
        <Link
          to="/dashboard/vendors"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-ink"
        >
          <ArrowLeftIcon size={16} />
          Back to vendors
        </Link>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-10 shadow-sm">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Vendor limit reached
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            {getVendorLimitMessage(plan)}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate({ to: "/dashboard/vendors" })}>
              Back to vendors
            </Button>
            <Button onClick={() => navigate({ to: "/dashboard/settings" })}>
              Upgrade plan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-12 py-4">
        <div className="space-y-4">
          <Link
            to="/dashboard/vendors"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-ink"
          >
            <ArrowLeftIcon size={16} />
            Back to vendors
          </Link>
          <div className="space-y-3">
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
              Add vendor
            </h1>
            <p className="text-sm text-text-secondary">
              Choose how you want to add a vendor to your registry.
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-statute/20 bg-statute p-10 shadow-sm">
            <div className="space-y-6">
              <BooksIcon size={32} className="text-white" />
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-white">Add from catalog</h2>
                <p className="text-sm leading-relaxed text-white">
                  Pick from ProcVault&apos;s curated global vendor catalog with pre-filled
                  subprocessor data and monitoring.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setCatalogOpen(true)}
              >
                Browse catalog
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-hairline bg-paper p-10 shadow-sm">
            <div className="space-y-6">
              <PencilSimpleLineIcon size={32} className="text-text-secondary" />
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-ink">Add custom vendor</h2>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Manually enter vendor details, hosting locations, DPA information,
                  and data owners.
                </p>
              </div>
              <Button
                className="w-full"
                onClick={() => navigate({ to: "/dashboard/vendors/create/custom" })}
              >
                Start custom wizard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <GlobalVendorCatalogModal
        open={catalogOpen}
        closeModal={() => setCatalogOpen(false)}
      />
    </>
  );
}

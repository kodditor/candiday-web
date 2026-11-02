import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RiskChip } from "@/components/ui/risk-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { VendorLogo } from "@/components/vendors/vendor-logo";
import { fetchDashboardSummary } from "@/lib/api/dashboard";
import { useUser } from "@/lib/context/user-context";
import type { IVendor } from "@/lib/types/vendor.type";
import { wrapError } from "@/lib/utils/request";
import { formatCategoryLabel } from "@/lib/utils/vendor";
import { useAuth, useUser as useClerkUser } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { Link, createRoute, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  Building2,
  FileText,
  Globe,
  Radar,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { DashboardRootRoute } from "./root";

export const DashboardIndexRoute = createRoute({
  getParentRoute: () => DashboardRootRoute,
  path: "/",
  component: DashboardHome,
});

const gettingStartedSteps = [
  {
    title: "Add your first vendors",
    description: "Start building your vendor inventory with owners and review cadence.",
    icon: Building2,
  },
  {
    title: "Upload DPAs",
    description: "Attach data processing agreements and track renewal deadlines.",
    icon: FileText,
  },
  {
    title: "Assign data owners",
    description: "Give each vendor an internal owner so nothing slips through the cracks.",
    icon: UserCheck,
  },
  {
    title: "Publish your trust page",
    description: "Share a public page with your subprocessors and compliance posture.",
    icon: Globe,
  },
];

const upcomingFeatures = [
  {
    title: "Subprocessor monitoring",
    description: "Get alerted when vendors change their subprocessors.",
    icon: Radar,
  },
  {
    title: "AI extraction",
    description: "Pull key fields from DPAs automatically.",
    icon: Sparkles,
  },
];

const statLabels = ["Vendors", "DPAs tracked", "Reviews due"] as const;

function getTimeOfDay() {
  const hour = new Date().getHours();

  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 22) return "evening";
  return "night";
}

const latestVendorSkeletonCount = 5;

function LatestVendorsSectionSkeleton() {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>

      <Card className="overflow-hidden bg-white py-0">
        <div className="divide-y divide-hairline/60">
          {Array.from({ length: latestVendorSkeletonCount }).map((_, index) => (
            <div
              key={index}
              className="flex w-full items-center gap-4 px-4 py-3"
            >
              <Skeleton className="size-8 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-36 max-w-full" />
                <Skeleton className="h-3 w-24 max-w-[60%]" />
              </div>
              <Skeleton className="h-6 w-14 shrink-0 rounded-sm" />
              <Skeleton className="hidden h-3 w-20 shrink-0 sm:block" />
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

function LatestVendorsSection({ vendors }: { vendors: IVendor[] }) {
  const navigate = useNavigate();

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            Latest Added Vendors
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Recently added to your vendor inventory.
          </p>
        </div>
        <Link
          to="/dashboard/vendors"
          className="text-sm font-medium text-statute hover:underline"
        >
          View all
        </Link>
      </div>

      <Card className="overflow-hidden bg-white py-0">
        <div className="divide-y divide-hairline/60">
          {vendors.map((vendor) => (
            <button
              key={vendor._id}
              type="button"
              className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-gray-50 hover:cursor-pointer"
              onClick={() =>
                navigate({
                  to: "/dashboard/vendors/$id",
                  params: { id: vendor._id },
                })
              }
            >
              <VendorLogo
                name={vendor.name}
                logoUrl={vendor.logoUrl}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {vendor.name}
                </p>
                <p className="truncate text-xs text-text-secondary">
                  {formatCategoryLabel(vendor.category, vendor.customCategoryLabel)}
                </p>
              </div>
              <RiskChip tier={vendor.riskTier} />
              <p className="hidden shrink-0 text-xs text-text-muted sm:block">
                {dayjs(vendor.createdAt).format("DD MMM YYYY")}
              </p>
            </button>
          ))}
        </div>
      </Card>
    </section>
  );
}

export function DashboardHome() {
  const appUser = useUser((state) => state.user);
  const { user: clerkUser } = useClerkUser();
  const { getToken } = useAuth();

  const summaryQuery = useQuery({
    enabled: Boolean(appUser),
    queryKey: ["dashboard-summary"],
    queryFn: async () =>
      wrapError(async () => {
        const token = await getToken({ skipCache: true });
        if (!token) throw new Error("Missing session token");
        return fetchDashboardSummary(token);
      }),
  });

  const firstName =
    appUser?.firstName ?? clerkUser?.firstName ?? "there";

  const summary = summaryQuery.data;
  const statValues = summary
    ? [summary.vendorCount, summary.dpasTracked, summary.reviewsDue]
    : null;
  const showLatestVendors = (summary?.vendorCount ?? 0) > 1;

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl mt-3">
          Good {getTimeOfDay()}, {firstName}
        </h1>
        <p className="max-w-2xl text-pretty text-base text-text-secondary">
          Your workspace is ready. Start organizing vendor compliance, tracking
          DPAs, and building your trust page from here.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {statLabels.map((label, index) => (
          <Card key={label} className="bg-white">
            <CardHeader>
              <CardDescription>{label}</CardDescription>
              <CardTitle className="font-display text-3xl font-semibold tabular-nums">
                {statValues ? (
                  statValues[index]
                ) : (
                  <Skeleton className="h-9 w-10 rounded-md text-gray-200" /> 
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      {summaryQuery.isLoading ? (
        <LatestVendorsSectionSkeleton />
      ) :
      showLatestVendors && summary ? (
        <LatestVendorsSection vendors={summary.latestVendors} />
      ) : (
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">
              Getting started
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Complete these steps to get the most out of ProcVault.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {gettingStartedSteps.map((step) => (
              <Card key={step.title} className="bg-white">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-statute/10 text-statute">
                    <step.icon className="size-5" />
                  </div>
                  <CardTitle>{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    Coming soon
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            Included in your plan
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            These capabilities unlock as vendor management ships.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {upcomingFeatures.map((feature) => (
            <Card key={feature.title} className="border-dashed bg-white">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg border border-hairline bg-paper-raised text-statute">
                  <feature.icon className="size-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

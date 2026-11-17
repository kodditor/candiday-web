import { RoleList } from "@/components/roles/role-list";
import { RoleListSkeleton } from "@/components/roles/role-list-skeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchRoles,
  fetchRolesSummary,
  mapListItemToRole,
  rolesQueryKeys,
} from "@/lib/api/roles";
import { useOrganizationId } from "@/lib/hooks/use-organization-id";
import { BriefcaseIcon, PlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { DashboardRootRoute } from "./root";

export const DashboardIndexRoute = createRoute({
  getParentRoute: () => DashboardRootRoute,
  path: "/",
  component: DashboardHome,
});

function DashboardStats({
  roleCount,
  applicantCount,
  loading,
}: {
  roleCount: number;
  applicantCount: number;
  loading?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {(["Roles", "Applicants"] as const).map((label, index) => {
        const value = index === 0 ? roleCount : applicantCount;
        return (
          <div key={label} className="rounded-lg bg-white outline-[0.5px] outline-gray-300 px-6 py-5">
            <p className="text-sm text-text-muted">{label}</p>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-12" />
            ) : (
              <p className="mt-2 text-[28px] font-normal tabular-nums leading-tight tracking-tight text-ink">
                {value}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DashboardEmptyState() {
  return (
    <div className="mt-12 rounded-lg border border-dashed border-hairline bg-white px-8 py-12 text-center">
      <BriefcaseIcon
        className="mx-auto size-6 text-text-muted"
        weight="regular"
        aria-hidden
      />
      <h2 className="mt-4 text-base font-medium text-ink">No jobs yet</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm text-text-muted">
        Paste a job description to start reviewing CVs.
      </p>
      <Button asChild className="mt-6 h-10 px-4">
        <Link to="/dashboard/roles/new">Create your first job</Link>
      </Button>
    </div>
  );
}

export function DashboardHome() {
  const organizationId = useOrganizationId();
  const enabled = Boolean(organizationId);

  const summaryQuery = useQuery({
    queryKey: rolesQueryKeys.summary(organizationId),
    queryFn: () => fetchRolesSummary(),
    enabled,
  });

  const recentQuery = useQuery({
    queryKey: rolesQueryKeys.recent(organizationId),
    queryFn: () => fetchRoles({ limit: 5, archived: "false" }),
    enabled,
  });

  useEffect(() => {
    if (summaryQuery.isError) {
      toast.error(
        summaryQuery.error instanceof Error
          ? summaryQuery.error.message
          : "Unable to load role stats.",
      );
    }
  }, [summaryQuery.isError, summaryQuery.error]);

  useEffect(() => {
    if (recentQuery.isError) {
      toast.error(
        recentQuery.error instanceof Error
          ? recentQuery.error.message
          : "Unable to load recent roles.",
      );
    }
  }, [recentQuery.isError, recentQuery.error]);

  const summaryLoading = !enabled || summaryQuery.isLoading;
  const recentLoading = !enabled || recentQuery.isLoading;

  const activeRoleCount = summaryQuery.data?.activeRoleCount ?? 0;
  const applicantCount = summaryQuery.data?.applicantsCount ?? 0;
  const recentRoles =
    recentQuery.data?.items.map(mapListItemToRole) ?? [];

  const hasRoles = enabled && !summaryLoading && activeRoleCount > 0;
  const showViewAll =
    activeRoleCount > 5 || (recentQuery.data?.hasMore ?? false);

  return (
    <div className="space-y-12">
      {hasRoles ? (
        <>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-medium tracking-tight text-ink">
              Dashboard
            </h1>
            <Button asChild className="h-10 gap-2">
              <Link to="/dashboard/roles/new">
                <PlusIcon className="size-4" weight="bold" />
                New role
              </Link>
            </Button>
          </div>

          <DashboardStats
            roleCount={activeRoleCount}
            applicantCount={applicantCount}
            loading={summaryLoading}
          />

          <section className="space-y-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-base font-medium text-ink">Recent roles</h2>
              {showViewAll ? (
                <Link
                  to="/dashboard/roles"
                  className="text-sm text-statute hover:underline"
                >
                  View all roles
                </Link>
              ) : null}
            </div>

            {recentLoading ? (
              <RoleListSkeleton rows={5} />
            ) : (
              <RoleList roles={recentRoles} />
            )}
          </section>
        </>
      ) : summaryLoading ? (
        <>
          <DashboardStats roleCount={0} applicantCount={0} loading />
          <RoleListSkeleton rows={5} />
        </>
      ) : (
        <>
          <DashboardStats
            roleCount={0}
            applicantCount={0}
            loading={false}
          />
          <DashboardEmptyState />
        </>
      )}
    </div>
  );
}
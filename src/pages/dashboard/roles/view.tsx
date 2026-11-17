import { RubricPanel } from "@/components/rubric/rubric-panel";
import { RoleStatusChip } from "@/components/roles/role-status-chip";
import { Button } from "@/components/ui/button";
import { fetchRoleDetail, rolesQueryKeys } from "@/lib/api/roles";
import { useOrganizationId } from "@/lib/hooks/use-organization-id";
import { useQuery } from "@tanstack/react-query";
import { createRoute, Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { DashboardRootRoute } from "../root";

export const DashboardRoleDetailRoute = createRoute({
  getParentRoute: () => DashboardRootRoute,
  path: "/roles/$roleId",
  component: RoleDetailPage,
});

function RoleDetailPage() {
  const { roleId } = DashboardRoleDetailRoute.useParams();
  const organizationId = useOrganizationId();

  const roleQuery = useQuery({
    queryKey: rolesQueryKeys.detail(roleId),
    queryFn: () => fetchRoleDetail(roleId),
    enabled: Boolean(organizationId),
  });

  const role = roleQuery.data;

  if (roleQuery.isLoading || !role) {
    return (
      <div className="px-6 py-10 text-sm text-text-muted" role="status">
        Loading role…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-3">
          <Link to="/dashboard/roles">
            <ArrowLeftIcon className="mr-1 size-4" aria-hidden />
            Roles
          </Link>
        </Button>

        <h1 className="text-xl font-semibold text-ink">{role.title}</h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {role.companyName ? (
            <p className="text-sm text-text-muted">{role.companyName}</p>
          ) : null}
          <RoleStatusChip status={role.status} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4 rounded-lg border border-hairline bg-white p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-ink">Role details</h2>
            <Button variant="link" size="sm" asChild className="h-auto p-0">
              <Link to="/dashboard/roles">Edit role</Link>
            </Button>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Job description
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{role.jobDescription}</p>
          </div>
          {role.requirementsNotes ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Recruiter notes
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink">
                {role.requirementsNotes}
              </p>
            </div>
          ) : null}
        </section>

        <RubricPanel role={role} />
      </div>
    </div>
  );
}
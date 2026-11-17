import { RoleStatusChip } from "@/components/roles/role-status-chip";
import type { Role } from "@/lib/types/role.type";
import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

function formatUpdatedAt(role: Role) {
  const at = role.lastActivityAt || role.updatedAt;
  return `Updated ${dayjs(at).fromNow()}`;
}

type RoleListProps = {
  roles: Role[];
};

export function RoleList({ roles }: RoleListProps) {
  if (roles.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-white">
      <ul className="divide-y divide-hairline">
        {roles.map((role) => (
          <li key={role.id}>
            <Link
              to="/dashboard/roles/$roleId"
              params={{ roleId: role.id }}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-6 px-5 py-4 transition-colors hover:bg-black/[0.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-statute"
              aria-label={`View role: ${role.title}`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{role.title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm text-text-muted">
                  {role.companyName ? <span>{role.companyName}</span> : null}
                  {role.companyName ? (
                    <span className="text-black/20" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  <span>{formatUpdatedAt(role)}</span>
                </p>
              </div>
              <span className="shrink-0 text-sm text-text-muted">
                {role.applicantsCount}{" "}
                {role.applicantsCount === 1 ? "applicant" : "applicants"}
              </span>
              <RoleStatusChip status={role.status} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
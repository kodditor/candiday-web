import { DataTable } from "@/components/ui/custom-table";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { TeamMemberAvatar } from "@/components/team/team-member-avatar";
import { authClient } from "@/lib/auth/client";
import { useSession } from "@/lib/auth/session";
import { fetchTeamMemberships } from "@/lib/api/team";
import { isOrgAdminRole } from "@/lib/team/is-org-admin";
import {
  encodeTeamRowId,
  formatOrgRole,
  normalizeTeamRows,
  type ITeamRow,
} from "@/lib/types/team-member.type";
import { wrapError } from "@/lib/utils/request";
import { PlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import lodash from "lodash";
import { parseAsInteger, useQueryState } from "nuqs";
import { useMemo } from "react";
import { DashboardRootRoute } from "../root";
import { InviteTeamMemberModal } from "./invite";
import { ViewTeamMemberModal } from "./view";

type OrganizationMember = {
  id: string;
  role: string;
  createdAt: Date | string;
  userId: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
};

type OrganizationInvitation = {
  id: string;
  email: string;
  role?: string | null;
  status?: string | null;
  createdAt: Date | string;
};

export const DashboardTeamRoute = createRoute({
  getParentRoute: () => DashboardRootRoute,
  path: "/team",
  component: TeamPage,
});

export function TeamPage() {
  const { data: session } = useSession();
  const [modal, setModal] = useQueryState("modal");
  const [query] = useQueryState("query");
  const [id, setId] = useQueryState("id");
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit] = useQueryState("limit", parseAsInteger.withDefault(10));

  const organizationQuery = useQuery({
    queryKey: ["organization-full"],
    queryFn: async () => {
      const { data, error } = await authClient.organization.getFullOrganization();
      if (error) {
        throw new Error(error.message ?? "Unable to load organization.");
      }
      return data;
    },
  });

  const teamMembershipsQuery = useQuery({
    enabled: Boolean(organizationQuery.data),
    queryKey: ["team-memberships"],
    queryFn: async () => wrapError(async () => fetchTeamMemberships()),
  });

  const isAdmin = useMemo(() => {
    const org = organizationQuery.data;
    const userId = session?.user.id;
    if (!org || !userId) {
      return false;
    }

    const members = (org.members ?? []) as OrganizationMember[];
    const self = members.find((member) => member.userId === userId);
    return self ? isOrgAdminRole(self.role) : false;
  }, [organizationQuery.data, session?.user.id]);

  const allRows = useMemo(() => {
    const org = organizationQuery.data;
    const memberships = ((org?.members ?? []) as OrganizationMember[]).map((member) => ({
      id: member.id,
      role: member.role,
      createdAt: new Date(member.createdAt),
      publicUserData: {
        userId: member.userId,
        firstName: member.user?.name?.split(" ")[0] ?? null,
        lastName: member.user?.name?.split(" ").slice(1).join(" ") ?? null,
        identifier: member.user?.email ?? null,
        imageUrl: member.user?.image ?? null,
      },
    }));

    const invitations = ((org?.invitations ?? []) as OrganizationInvitation[]).map((invitation) => ({
      id: invitation.id,
      emailAddress: invitation.email,
      role: invitation.role ?? "member",
      status: invitation.status ?? "pending",
      createdAt: new Date(invitation.createdAt),
    }));

    return normalizeTeamRows(
      memberships,
      invitations,
      teamMembershipsQuery.data ?? [],
    );
  }, [organizationQuery.data, teamMembershipsQuery.data]);

  const filteredRows = useMemo(() => {
    if (!query?.trim()) {
      return allRows;
    }

    const normalizedQuery = query.trim().toLowerCase();

    return allRows.filter((row) =>
      row.name.toLowerCase().includes(normalizedQuery)
      || row.email.toLowerCase().includes(normalizedQuery),
    );
  }, [allRows, query]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredRows.slice(start, start + limit);
  }, [filteredRows, page, limit]);

  const isLoading =
    organizationQuery.isLoading || teamMembershipsQuery.isLoading;

  return (
    <>
      <div className="flex min-h-[calc(100vh-8rem)] flex-col">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
              My Team
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Manage members and invitations for your organization.
            </p>
          </div>
          {isAdmin ? (
            <Button onClick={() => setModal("invite")} className="gap-2">
              <PlusIcon strokeWidth={1.5} size={20} />
              Add member
            </Button>
          ) : null}
        </div>

        <div className="mt-6 flex min-h-0 flex-1 flex-col">
          <DataTable<ITeamRow>
            name="Team members"
            docs={paginatedRows}
            totalDocs={filteredRows.length}
            hasPrevPage={page > 1}
            hasNextPage={page * limit < filteredRows.length}
            loading={isLoading}
            renderHeader={() => (
              <tr>
                <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase">
                  Member
                </th>
                <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase">
                  Role
                </th>
                <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase">
                  Status
                </th>
                <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase">
                  Added
                </th>
              </tr>
            )}
            renderItem={(row) => (
              <tr
                key={`${row.type}:${row.id}`}
                className="cursor-pointer border-b border-gray-200 duration-150 hover:bg-gray-50"
                onClick={() => setId(encodeTeamRowId(row))}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <TeamMemberAvatar name={row.name} imageUrl={row.imageUrl} />
                    <div>
                      <p className="text-sm font-medium">{row.name}</p>
                      <p className="text-sm text-text-secondary">{row.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm">{formatOrgRole(row.role)}</p>
                </td>
                <td className="p-4">
                  <Pill
                    value={lodash.startCase(row.status)}
                    variant={
                      row.status === "active"
                        ? "success"
                        : row.status === "pending"
                          ? "pending"
                          : "default"
                    }
                  />
                </td>
                <td className="p-4">
                  <p className="text-sm">{dayjs(row.createdAt).format("D MMM YYYY")}</p>
                </td>
              </tr>
            )}
          />
        </div>
      </div>

      <InviteTeamMemberModal
        open={modal === "invite"}
        closeModal={() => setModal(null)}
        onInvited={async () => {
          await Promise.all([
            organizationQuery.refetch(),
            teamMembershipsQuery.refetch(),
          ]);
        }}
      />

      <ViewTeamMemberModal
        open={Boolean(id)}
        closeModal={() => setId(null)}
        rows={allRows}
        loading={isLoading}
        isAdmin={isAdmin}
        currentUserId={session?.user.id ?? null}
        onUpdated={async () => {
          await Promise.all([
            organizationQuery.refetch(),
            teamMembershipsQuery.refetch(),
          ]);
        }}
      />
    </>
  );
}

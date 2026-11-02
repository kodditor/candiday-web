import { DataTable } from "@/components/ui/custom-table";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { TeamMemberAvatar } from "@/components/team/team-member-avatar";
import { fetchSettings } from "@/lib/api/settings";
import { fetchTeamMemberships } from "@/lib/api/team";
import {
  encodeTeamRowId,
  formatOrgRole,
  normalizeTeamRows,
  type ITeamRow,
} from "@/lib/types/team-member.type";
import { wrapError } from "@/lib/utils/request";
import { useAuth, useOrganization } from "@clerk/react";
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

export const DashboardTeamRoute = createRoute({
  getParentRoute: () => DashboardRootRoute,
  path: "/team",
  component: TeamPage,
});

export function TeamPage() {
  const { getToken, userId } = useAuth();
  const {
    isLoaded,
    organization,
    memberships,
    invitations,
  } = useOrganization({
    memberships: {
      infinite: true,
      pageSize: 50,
    },
    invitations: {
      infinite: true,
      pageSize: 50,
    },
  });

  const [modal, setModal] = useQueryState("modal");
  const [query] = useQueryState("query");
  const [, setId] = useQueryState("id");
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit] = useQueryState("limit", parseAsInteger.withDefault(10));

  const settingsQuery = useQuery({
    enabled: isLoaded && Boolean(organization),
    queryKey: ["settings"],
    queryFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });

      if (!token) {
        throw new Error("Missing session token");
      }

      return fetchSettings(token);
    }),
  });

  const teamMembershipsQuery = useQuery({
    enabled: isLoaded && Boolean(organization),
    queryKey: ["team-memberships"],
    queryFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });

      if (!token) {
        throw new Error("Missing session token");
      }

      return fetchTeamMemberships(token);
    }),
  });

  const isAdmin = settingsQuery.data?.isOrgAdmin ?? false;
  const isLoading = !isLoaded
    || Boolean(memberships?.isLoading)
    || Boolean(invitations?.isLoading)
    || teamMembershipsQuery.isLoading;

  const allRows = useMemo(
    () => normalizeTeamRows(
      memberships?.data ?? [],
      invitations?.data ?? [],
      teamMembershipsQuery.data ?? [],
    ),
    [memberships?.data, invitations?.data, teamMembershipsQuery.data],
  );

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

  const tableData = useMemo(() => {
    const start = (page - 1) * limit;
    const docs = filteredRows.slice(start, start + limit);

    return {
      docs,
      totalDocs: filteredRows.length,
      hasPrevPage: page > 1,
      hasNextPage: start + limit < filteredRows.length,
    };
  }, [filteredRows, page, limit]);

  const dispatchModal = (action: string, row?: ITeamRow) => {
    if (row) {
      setId(encodeTeamRowId(row));
    }

    setModal(action);
  };

  const refreshTeamData = async () => {
    await Promise.all([
      memberships?.revalidate?.(),
      invitations?.revalidate?.(),
      teamMembershipsQuery.refetch(),
    ]);
  };

  if (isLoaded && !organization) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
          My Team
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Select an organization to manage your team members.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-[calc(100vh-8rem)] flex-col">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
              My Team
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Manage organization members and pending invitations.
            </p>
          </div>
          {isAdmin ? (
            <Button
              onClick={() => setModal("invite")}
              className="gap-2"
            >
              <PlusIcon strokeWidth={1.5} size={20} />
              Add member
            </Button>
          ) : null}
        </div>

        <div className="mt-6 flex min-h-0 flex-1 flex-col">
          <DataTable<ITeamRow>
            name="Team members"
            {...tableData}
            loading={isLoading}
            renderHeader={() => (
              <tr>
                <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase" />
                <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase">Name</th>
                <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase">Email</th>
                <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase">Role</th>
                <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase">Status</th>
                <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase">Date</th>
              </tr>
            )}
            renderItem={(datum) => (
              <tr
                key={encodeTeamRowId(datum)}
                className="cursor-pointer border-b border-gray-200 duration-150 hover:bg-gray-50"
                onClick={() => dispatchModal("view", datum)}
              >
                <td className="pl-4">
                  <TeamMemberAvatar
                    name={datum.name}
                    imageUrl={datum.imageUrl}
                  />
                </td>
                <td className="p-4">
                  <p className="text-sm">{datum.name}</p>
                </td>
                <td className="p-4">
                  <p className="text-sm">{datum.email}</p>
                </td>
                <td className="p-4">
                  <p className="text-sm">{formatOrgRole(datum.role)}</p>
                </td>
                <td className="p-4">
                  <Pill
                    value={lodash.startCase(datum.status)}
                    variantDef={{
                      Active: "bg-emerald-100 text-emerald-800",
                      Pending: "bg-amber-100 text-amber-800",
                      Archived: "bg-gray-100 text-gray-800",
                    }}
                  />
                </td>
                <td className="p-4">
                  <p className="text-sm">{dayjs(datum.createdAt).format("DD/MM/YYYY")}</p>
                </td>
              </tr>
            )}
          />
        </div>
      </div>

      {isAdmin ? (
        <InviteTeamMemberModal
          open={modal === "invite"}
          closeModal={() => setModal(null)}
          onInvited={refreshTeamData}
        />
      ) : null}

      <ViewTeamMemberModal
        open={modal === "view"}
        rows={allRows}
        loading={isLoading}
        isAdmin={isAdmin}
        currentUserId={userId}
        onUpdated={refreshTeamData}
        closeModal={() => {
          setModal(null);
          setId(null);
        }}
      />
    </>
  );
}

import lodash from "lodash";

export type TeamMemberStatus = "active" | "pending" | "archived";
export type TeamRowType = "member" | "invitation";

export type TeamMembershipSummary = {
  userId: string;
  status: "active" | "archived";
  role: string;
};

export interface ITeamRow {
  id: string;
  type: TeamRowType;
  name: string;
  email: string;
  role: string;
  status: TeamMemberStatus;
  clerkUserId?: string;
  createdAt: Date;
  imageUrl?: string | null;
}

type ClerkMembershipLike = {
  id: string;
  role: string;
  createdAt: Date | number;
  publicUserData?: {
    userId?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    identifier?: string | null;
    imageUrl?: string | null;
  };
};

type ClerkInvitationLike = {
  id: string;
  emailAddress: string;
  role: string;
  status: string;
  createdAt: Date | number;
};

export function formatOrgRole(role: string): string {
  return lodash.startCase(role.replace(/^org:/, ""));
}

export function encodeTeamRowId(row: Pick<ITeamRow, "type" | "id">): string {
  return `${row.type}:${row.id}`;
}

export function parseTeamRowId(encoded: string | null): { type: TeamRowType; id: string } | null {
  if (!encoded) {
    return null;
  }

  const separatorIndex = encoded.indexOf(":");

  if (separatorIndex === -1) {
    return null;
  }

  const type = encoded.slice(0, separatorIndex);
  const id = encoded.slice(separatorIndex + 1);

  if (type !== "member" && type !== "invitation") {
    return null;
  }

  if (!id) {
    return null;
  }

  return { type, id };
}

export function normalizeTeamRows(
  memberships: ClerkMembershipLike[] = [],
  invitations: ClerkInvitationLike[] = [],
  localMemberships: TeamMembershipSummary[] = [],
): ITeamRow[] {
  const statusByUserId = new Map(
    localMemberships.map((membership) => [membership.userId, membership.status]),
  );

  const members: ITeamRow[] = memberships.map((membership) => {
    const publicUserData = membership.publicUserData;
    const firstName = publicUserData?.firstName?.trim() ?? "";
    const lastName = publicUserData?.lastName?.trim() ?? "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    const clerkUserId = publicUserData?.userId ?? undefined;
    const localStatus = clerkUserId ? statusByUserId.get(clerkUserId) : undefined;

    return {
      id: membership.id,
      type: "member",
      name: fullName || publicUserData?.identifier || "—",
      email: publicUserData?.identifier ?? "",
      role: membership.role,
      status: localStatus === "archived" ? "archived" : "active",
      clerkUserId,
      createdAt: new Date(membership.createdAt),
      imageUrl: publicUserData?.imageUrl ?? null,
    };
  });

  const pendingInvites: ITeamRow[] = invitations
    .filter((invitation) => invitation.status === "pending")
    .map((invitation) => ({
      id: invitation.id,
      type: "invitation",
      name: invitation.emailAddress,
      email: invitation.emailAddress,
      role: invitation.role,
      status: "pending",
      createdAt: new Date(invitation.createdAt),
      imageUrl: null,
    }));

  return [...members, ...pendingInvites].sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
  );
}

export function findTeamRow(rows: ITeamRow[], encodedId: string | null): ITeamRow | undefined {
  const parsed = parseTeamRowId(encodedId);

  if (!parsed) {
    return undefined;
  }

  return rows.find((row) => row.type === parsed.type && row.id === parsed.id);
}

import { api } from "@/lib/request";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { AppRequest } from "@/lib/types/request.type";
import type { TeamMembershipSummary } from "@/lib/types/team-member.type";

export async function fetchTeamMemberships(): Promise<TeamMembershipSummary[]> {
  try {
    const response = await api.get<AppRequest<TeamMembershipSummary[]>>(
      "/team/memberships",
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to load team memberships.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load team memberships."));
  }
}

export async function archiveTeamMember(
  userId: string,
): Promise<TeamMembershipSummary> {
  try {
    const response = await api.post<AppRequest<TeamMembershipSummary>>(
      `/team/members/${encodeURIComponent(userId)}/archive`,
      {},
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to archive team member.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to archive team member."));
  }
}

export async function restoreTeamMember(
  userId: string,
): Promise<TeamMembershipSummary> {
  try {
    const response = await api.post<AppRequest<TeamMembershipSummary>>(
      `/team/members/${encodeURIComponent(userId)}/restore`,
      {},
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to restore team member.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to restore team member."));
  }
}

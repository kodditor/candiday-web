import axios from "axios";
import config from "@/config";
import type { AppRequest } from "@/lib/types/request.type";
import type { TeamMembershipSummary } from "@/lib/types/team-member.type";

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as AppRequest<unknown> | undefined;
    if (data && !data.success && data.error) return data.error;
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function fetchTeamMemberships(
  token: string,
): Promise<TeamMembershipSummary[]> {
  try {
    const response = await axios.get<AppRequest<TeamMembershipSummary[]>>(
      `${config.api.url}/api/v1/team/memberships`,
      {
        headers: authHeaders(token),
        timeout: 30000,
      },
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
  token: string,
  clerkUserId: string,
): Promise<TeamMembershipSummary> {
  try {
    const response = await axios.post<AppRequest<TeamMembershipSummary>>(
      `${config.api.url}/api/v1/team/members/${encodeURIComponent(clerkUserId)}/archive`,
      {},
      {
        headers: authHeaders(token),
        timeout: 30000,
      },
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
  token: string,
  clerkUserId: string,
): Promise<TeamMembershipSummary> {
  try {
    const response = await axios.post<AppRequest<TeamMembershipSummary>>(
      `${config.api.url}/api/v1/team/members/${encodeURIComponent(clerkUserId)}/restore`,
      {},
      {
        headers: authHeaders(token),
        timeout: 30000,
      },
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

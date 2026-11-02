import axios from "axios";
import config from "@/config";
import type { ICurrentUser, ICurrentOrganization, MembershipStatus } from "@/lib/types/current-user.type";
import type { AppRequest } from "@/lib/types/request.type";

type CurrentUserResponse = {
  user: ICurrentUser | null;
  isOnboarded: boolean;
  membershipStatus: MembershipStatus | null;
  organization: ICurrentOrganization | null;
};

export class CurrentUserRequestError extends Error {
  readonly status?: number;
  readonly isNetworkError: boolean;

  constructor(
    message: string,
    options?: { status?: number; isNetworkError?: boolean },
  ) {
    super(message);
    this.name = "CurrentUserRequestError";
    this.status = options?.status;
    this.isNetworkError = options?.isNetworkError ?? false;
  }
}

export function isAuthFailure(error: unknown): boolean {
  if (error instanceof Error && error.message === "Missing session token") {
    return true;
  }

  return (
    error instanceof CurrentUserRequestError &&
    (error.status === 401 || error.status === 403)
  );
}

export async function fetchCurrentUser(
  token: string,
): Promise<CurrentUserResponse> {
  try {
    const response = await axios.get<AppRequest<CurrentUserResponse>>(
      `${config.api.url}/api/v1/users/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000,
      },
    );

    if (!response.data.success || !response.data.data) {
      throw new CurrentUserRequestError("Invalid API response.", {
        status: response.status,
      });
    }

    return response.data.data;
  } catch (error) {
    if (error instanceof CurrentUserRequestError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (!error.response) {
        throw new CurrentUserRequestError(
          `Unable to reach the ProcVault API at ${config.api.url}. Check that the backend is running and VITE_API_URL is correct.`,
          { isNetworkError: true },
        );
      }

      throw new CurrentUserRequestError(
        typeof error.response.data?.error === "string"
          ? error.response.data.error
          : error.message,
        { status },
      );
    }

    throw error;
  }
}

export type { CurrentUserResponse };

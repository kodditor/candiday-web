import axios from "axios";
import config from "@/config";
import type {
  OnboardingRequest,
  OnboardingResponse,
  OnboardingUser,
} from "@/lib/types/onboarding.type";
import type { AppRequest } from "@/lib/types/request.type";

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as AppRequest<unknown> | undefined;
    if (data && !data.success && "error" in data) return data.error;
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export async function submitOrganizationOnboarding(
  payload: OnboardingRequest,
  token: string,
): Promise<OnboardingResponse> {
  try {
    const response = await axios.post<AppRequest<OnboardingResponse>>(
      `${config.api.url}/api/v1/onboarding/organization`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    if (!response.data.success || !response.data.data?.checkoutUrl) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to start onboarding checkout.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Unable to create your organization."),
    );
  }
}

export async function fetchCurrentOnboardingUser(
  token: string,
): Promise<OnboardingUser | null> {
  try {
    const response = await axios.get<
      AppRequest<{
        user: OnboardingUser | null;
        isOnboarded: boolean;
        organization: string | null;
      }>
    >(`${config.api.url}/api/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 30000,
    });

    if (!response.data.success || !response.data.data) {
      return null;
    }

    const { user, isOnboarded, organization } = response.data.data;

    if (!user) {
      return {
        _id: "",
        clerkId: "",
        isOnboarded,
        organization: undefined,
      };
    }

    return {
      _id: user._id,
      clerkId: user.clerkId ?? "",
      isOnboarded,
      organization: organization ? String((organization as { _id?: string })._id ?? organization) : undefined,
    };
  } catch {
    return null;
  }
}

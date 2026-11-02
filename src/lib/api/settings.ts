import axios from "axios";
import config from "@/config";
import type {
  BillingPortalResponse,
  SettingsResponse,
  UpdateOrganizationSettingsPayload,
  UpdateProfileSettingsPayload,
} from "@/lib/types/settings.type";
import type { AppRequest } from "@/lib/types/request.type";

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

export async function fetchSettings(token: string): Promise<SettingsResponse> {
  try {
    const response = await axios.get<AppRequest<SettingsResponse>>(
      `${config.api.url}/api/v1/settings`,
      {
        headers: authHeaders(token),
        timeout: 30000,
      },
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to load settings.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load settings."));
  }
}

export async function updateOrganizationSettings(
  token: string,
  payload: UpdateOrganizationSettingsPayload,
): Promise<SettingsResponse> {
  try {
    const response = await axios.patch<AppRequest<SettingsResponse>>(
      `${config.api.url}/api/v1/settings/organization`,
      payload,
      {
        headers: authHeaders(token),
        timeout: 30000,
      },
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to update organization settings.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update organization settings."));
  }
}

export async function updateProfileSettings(
  token: string,
  payload: UpdateProfileSettingsPayload,
): Promise<SettingsResponse> {
  try {
    const response = await axios.patch<AppRequest<SettingsResponse>>(
      `${config.api.url}/api/v1/settings/profile`,
      payload,
      {
        headers: authHeaders(token),
        timeout: 30000,
      },
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to update profile.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update profile."));
  }
}

export async function createBillingPortalSession(
  token: string,
): Promise<BillingPortalResponse> {
  try {
    const response = await axios.post<AppRequest<BillingPortalResponse>>(
      `${config.api.url}/api/v1/settings/billing/portal`,
      {},
      {
        headers: authHeaders(token),
        timeout: 30000,
      },
    );

    if (!response.data.success || !response.data.data?.portalUrl) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to open the billing portal.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to open the billing portal."));
  }
}

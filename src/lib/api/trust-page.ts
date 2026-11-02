import axios from "axios";
import config from "@/config";
import type {
  PublicTrustPageResponse,
  TrustPageSettingsResponse,
  UpdateTrustPageSectionsPayload,
  UpdateTrustPageSettingsPayload,
} from "@/lib/types/trust-page.type";
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

export async function fetchTrustPageSettings(
  token: string,
): Promise<TrustPageSettingsResponse> {
  try {
    const response = await axios.get<AppRequest<TrustPageSettingsResponse>>(
      `${config.api.url}/api/v1/trust-page`,
      {
        headers: authHeaders(token),
        timeout: 30000,
      },
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to load trust page settings.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load trust page settings."));
  }
}

export async function updateTrustPageSettings(
  token: string,
  payload: UpdateTrustPageSettingsPayload,
): Promise<TrustPageSettingsResponse> {
  try {
    const response = await axios.patch<AppRequest<TrustPageSettingsResponse>>(
      `${config.api.url}/api/v1/trust-page`,
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
          : "Unable to update trust page settings.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update trust page settings."));
  }
}

export async function updateTrustPageSections(
  token: string,
  payload: UpdateTrustPageSectionsPayload,
): Promise<TrustPageSettingsResponse> {
  try {
    const response = await axios.put<AppRequest<TrustPageSettingsResponse>>(
      `${config.api.url}/api/v1/trust-page/sections`,
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
          : "Unable to update trust page sections.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update trust page sections."));
  }
}

export async function publishTrustPage(
  token: string,
): Promise<TrustPageSettingsResponse> {
  try {
    const response = await axios.post<AppRequest<TrustPageSettingsResponse>>(
      `${config.api.url}/api/v1/trust-page/publish`,
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
          : "Unable to publish trust page.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to publish trust page."));
  }
}

export async function fetchPublicTrustPage(
  slug: string,
): Promise<PublicTrustPageResponse> {
  try {
    const response = await axios.get<AppRequest<PublicTrustPageResponse>>(
      `${config.api.url}/api/v1/trust/${encodeURIComponent(slug)}`,
      {
        timeout: 30000,
      },
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Trust page not found.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Trust page not found."));
  }
}

import axios from "axios";
import config from "@/config";
import { api } from "@/lib/request";
import { getApiErrorMessage } from "@/lib/api/errors";
import type {
  PublicTrustPageResponse,
  TrustPageSettingsResponse,
  UpdateTrustPageSectionsPayload,
  UpdateTrustPageSettingsPayload,
} from "@/lib/types/trust-page.type";
import type { AppRequest } from "@/lib/types/request.type";

export async function fetchTrustPageSettings(): Promise<TrustPageSettingsResponse> {
  try {
    const response = await api.get<AppRequest<TrustPageSettingsResponse>>(
      "/trust-page",
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
  payload: UpdateTrustPageSettingsPayload,
): Promise<TrustPageSettingsResponse> {
  try {
    const response = await api.patch<AppRequest<TrustPageSettingsResponse>>(
      "/trust-page",
      payload,
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
  payload: UpdateTrustPageSectionsPayload,
): Promise<TrustPageSettingsResponse> {
  try {
    const response = await api.put<AppRequest<TrustPageSettingsResponse>>(
      "/trust-page/sections",
      payload,
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

export async function publishTrustPage(): Promise<TrustPageSettingsResponse> {
  try {
    const response = await api.post<AppRequest<TrustPageSettingsResponse>>(
      "/trust-page/publish",
      {},
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

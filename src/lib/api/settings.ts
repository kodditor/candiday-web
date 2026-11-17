import { api } from "@/lib/request";
import { getApiErrorMessage } from "@/lib/api/errors";
import type {
  SettingsResponse,
  UpdateOrganizationSettingsPayload,
} from "@/lib/types/settings.type";
import type { AppRequest } from "@/lib/types/request.type";

export async function fetchSettings(): Promise<SettingsResponse> {
  try {
    const response = await api.get<AppRequest<SettingsResponse>>("/settings");

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
  payload: UpdateOrganizationSettingsPayload,
): Promise<SettingsResponse> {
  try {
    const response = await api.patch<AppRequest<SettingsResponse>>(
      "/settings/organization",
      payload,
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
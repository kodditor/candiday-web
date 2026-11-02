import axios from "axios";
import config from "@/config";
import type { DashboardSummary } from "@/lib/types/dashboard.type";
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

export async function fetchDashboardSummary(
  token: string,
): Promise<DashboardSummary> {
  try {
    const response = await axios.get<AppRequest<DashboardSummary>>(
      `${config.api.url}/api/v1/dashboard`,
      {
        headers: authHeaders(token),
        timeout: 30000,
      },
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to load dashboard summary.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load dashboard summary."));
  }
}

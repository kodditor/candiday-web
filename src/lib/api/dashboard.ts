import { api } from "@/lib/request";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { DashboardSummary } from "@/lib/types/dashboard.type";
import type { AppRequest } from "@/lib/types/request.type";

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  try {
    const response = await api.get<AppRequest<DashboardSummary>>("/dashboard");

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

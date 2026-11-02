import axios from "axios";
import config from "@/config";
import type {
  IGlobalVendor,
  ListGlobalVendorsParams,
} from "@/lib/types/global-vendor.type";
import type { AppRequest, PaginatedResponse } from "@/lib/types/request.type";
import qs from "qs";

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

export async function fetchGlobalVendors(
  token: string,
  params: ListGlobalVendorsParams = {},
): Promise<PaginatedResponse<IGlobalVendor>> {
  try {
    const queryString = qs.stringify({
      query: params.query || undefined,
      page: params.page,
      limit: params.limit,
    });

    const response = await axios.get<AppRequest<PaginatedResponse<IGlobalVendor>>>(
      `${config.api.url}/api/v1/global-vendors?${queryString}`,
      {
        headers: authHeaders(token),
        timeout: 30000,
      },
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to load global vendors.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load global vendors."));
  }
}

export async function fetchGlobalVendor(
  token: string,
  id: string,
): Promise<IGlobalVendor> {
  try {
    const response = await axios.get<AppRequest<IGlobalVendor>>(
      `${config.api.url}/api/v1/global-vendors/${id}`,
      {
        headers: authHeaders(token),
        timeout: 30000,
      },
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to load global vendor.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load global vendor."));
  }
}

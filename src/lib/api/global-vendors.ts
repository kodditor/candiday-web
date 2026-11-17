import { api } from "@/lib/request";
import { getApiErrorMessage } from "@/lib/api/errors";
import type {
  IGlobalVendor,
  ListGlobalVendorsParams,
} from "@/lib/types/global-vendor.type";
import type { AppRequest, PaginatedResponse } from "@/lib/types/request.type";
import qs from "qs";

export async function fetchGlobalVendors(
  params: ListGlobalVendorsParams = {},
): Promise<PaginatedResponse<IGlobalVendor>> {
  try {
    const queryString = qs.stringify({
      query: params.query || undefined,
      page: params.page,
      limit: params.limit,
    });

    const response = await api.get<AppRequest<PaginatedResponse<IGlobalVendor>>>(
      `/global-vendors?${queryString}`,
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

export async function fetchGlobalVendor(id: string): Promise<IGlobalVendor> {
  try {
    const response = await api.get<AppRequest<IGlobalVendor>>(
      `/global-vendors/${id}`,
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

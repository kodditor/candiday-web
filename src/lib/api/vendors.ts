import { api } from "@/lib/request";
import { getApiErrorMessage } from "@/lib/api/errors";
import type {
  CreateVendorPayload,
  CreateVendorResponse,
  IVendor,
  ListVendorsParams,
  SubmitDpaReviewPayload,
  UpdateVendorPayload,
  VendorDetailResponse,
} from "@/lib/types/vendor.type";
import type { AppRequest, PaginatedResponse } from "@/lib/types/request.type";
import qs from "qs";

export async function fetchVendors(
  params: ListVendorsParams = {},
): Promise<PaginatedResponse<IVendor>> {
  try {
    const queryString = qs.stringify({
      query: params.query || undefined,
      page: params.page,
      limit: params.limit,
    });

    const response = await api.get<AppRequest<PaginatedResponse<IVendor>>>(
      `/vendors?${queryString}`,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to load vendors.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load vendors."));
  }
}

export async function fetchVendor(id: string): Promise<VendorDetailResponse> {
  try {
    const response = await api.get<AppRequest<VendorDetailResponse>>(
      `/vendors/${id}`,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to load vendor.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load vendor."));
  }
}

export async function updateVendor(
  id: string,
  payload: UpdateVendorPayload,
): Promise<VendorDetailResponse> {
  try {
    const response = await api.patch<AppRequest<VendorDetailResponse>>(
      `/vendors/${id}`,
      payload,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to update vendor.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update vendor."));
  }
}

export async function submitDpaReview(
  id: string,
  payload: SubmitDpaReviewPayload,
): Promise<VendorDetailResponse> {
  try {
    const response = await api.post<AppRequest<VendorDetailResponse>>(
      `/vendors/${id}/dpa-review`,
      payload,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to submit DPA review.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to submit DPA review."));
  }
}

export async function createVendor(
  payload: CreateVendorPayload,
): Promise<CreateVendorResponse> {
  try {
    const response = await api.post<AppRequest<CreateVendorResponse>>(
      "/vendors",
      payload,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to create vendor.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to create vendor."));
  }
}

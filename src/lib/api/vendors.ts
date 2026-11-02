import axios from "axios";
import config from "@/config";
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

export async function fetchVendors(
  token: string,
  params: ListVendorsParams = {},
): Promise<PaginatedResponse<IVendor>> {
  try {
    const queryString = qs.stringify({
      query: params.query || undefined,
      page: params.page,
      limit: params.limit,
    });

    const response = await axios.get<AppRequest<PaginatedResponse<IVendor>>>(
      `${config.api.url}/api/v1/vendors?${queryString}`,
      {
        headers: authHeaders(token),
        timeout: 30000,
      },
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

export async function fetchVendor(
  token: string,
  id: string,
): Promise<VendorDetailResponse> {
  try {
    const response = await axios.get<AppRequest<VendorDetailResponse>>(
      `${config.api.url}/api/v1/vendors/${id}`,
      {
        headers: authHeaders(token),
        timeout: 30000,
      },
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
  token: string,
  id: string,
  payload: UpdateVendorPayload,
): Promise<VendorDetailResponse> {
  try {
    const response = await axios.patch<AppRequest<VendorDetailResponse>>(
      `${config.api.url}/api/v1/vendors/${id}`,
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
          : "Unable to update vendor.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update vendor."));
  }
}

export async function submitDpaReview(
  token: string,
  id: string,
  payload: SubmitDpaReviewPayload,
): Promise<VendorDetailResponse> {
  try {
    const response = await axios.post<AppRequest<VendorDetailResponse>>(
      `${config.api.url}/api/v1/vendors/${id}/dpa-review`,
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
          : "Unable to submit DPA review.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to submit DPA review."));
  }
}

export async function createVendor(
  token: string,
  payload: CreateVendorPayload,
): Promise<CreateVendorResponse> {
  try {
    const response = await axios.post<AppRequest<CreateVendorResponse>>(
      `${config.api.url}/api/v1/vendors`,
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
          : "Unable to create vendor.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to create vendor."));
  }
}

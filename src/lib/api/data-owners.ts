import axios from "axios";
import config from "@/config";
import type {
  CreateDataOwnerPayload,
  IDataOwner,
  ListDataOwnersParams,
  UpdateDataOwnerPayload,
} from "@/lib/types/data-owner.type";
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

export async function fetchDataOwners(
  token: string,
  params: ListDataOwnersParams = {},
): Promise<PaginatedResponse<IDataOwner>> {
  try {
    const queryString = qs.stringify({
      query: params.query || undefined,
      page: params.page,
      limit: params.limit,
      status: params.status || undefined,
    });

    const response = await axios.get<AppRequest<PaginatedResponse<IDataOwner>>>(
      `${config.api.url}/api/v1/data-owners?${queryString}`,
      {
        headers: authHeaders(token),
        timeout: 30000,
      },
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to load data owners.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load data owners."));
  }
}

export async function fetchDataOwner(
  token: string,
  id: string,
): Promise<IDataOwner> {
  try {
    const response = await axios.get<AppRequest<IDataOwner>>(
      `${config.api.url}/api/v1/data-owners/${id}`,
      {
        headers: authHeaders(token),
        timeout: 30000,
      },
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to load data owner.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load data owner."));
  }
}

export async function createDataOwner(
  token: string,
  payload: CreateDataOwnerPayload,
): Promise<IDataOwner> {
  try {
    const response = await axios.post<AppRequest<IDataOwner>>(
      `${config.api.url}/api/v1/data-owners`,
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
          : "Unable to create data owner.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to create data owner."));
  }
}

export async function updateDataOwner(
  token: string,
  id: string,
  payload: UpdateDataOwnerPayload,
): Promise<IDataOwner> {
  try {
    const response = await axios.patch<AppRequest<IDataOwner>>(
      `${config.api.url}/api/v1/data-owners/${id}`,
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
          : "Unable to update data owner.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update data owner."));
  }
}

export async function archiveDataOwner(
  token: string,
  id: string,
): Promise<IDataOwner> {
  try {
    const response = await axios.delete<AppRequest<IDataOwner>>(
      `${config.api.url}/api/v1/data-owners/${id}`,
      {
        headers: authHeaders(token),
        timeout: 30000,
      },
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to archive data owner.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to archive data owner."));
  }
}

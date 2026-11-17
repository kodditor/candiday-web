import { api } from "@/lib/request";
import { getApiErrorMessage } from "@/lib/api/errors";
import type {
  CreateDataOwnerPayload,
  IDataOwner,
  ListDataOwnersParams,
  UpdateDataOwnerPayload,
} from "@/lib/types/data-owner.type";
import type { AppRequest, PaginatedResponse } from "@/lib/types/request.type";
import qs from "qs";

export async function fetchDataOwners(
  params: ListDataOwnersParams = {},
): Promise<PaginatedResponse<IDataOwner>> {
  try {
    const queryString = qs.stringify({
      query: params.query || undefined,
      page: params.page,
      limit: params.limit,
      status: params.status || undefined,
    });

    const response = await api.get<AppRequest<PaginatedResponse<IDataOwner>>>(
      `/data-owners?${queryString}`,
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

export async function fetchDataOwner(id: string): Promise<IDataOwner> {
  try {
    const response = await api.get<AppRequest<IDataOwner>>(
      `/data-owners/${id}`,
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
  payload: CreateDataOwnerPayload,
): Promise<IDataOwner> {
  try {
    const response = await api.post<AppRequest<IDataOwner>>(
      "/data-owners",
      payload,
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
  id: string,
  payload: UpdateDataOwnerPayload,
): Promise<IDataOwner> {
  try {
    const response = await api.patch<AppRequest<IDataOwner>>(
      `/data-owners/${id}`,
      payload,
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

export async function archiveDataOwner(id: string): Promise<IDataOwner> {
  try {
    const response = await api.delete<AppRequest<IDataOwner>>(
      `/data-owners/${id}`,
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

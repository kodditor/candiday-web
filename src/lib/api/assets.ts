import axios from "axios";
import config from "@/config";
import type { AppRequest } from "@/lib/types/request.type";

export type DpaAssetUrlResponse = {
  url: string;
  expiresAt: string;
  filename: string;
};

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

export async function fetchDpaAssetUrl(
  token: string,
  fileKey: string,
): Promise<DpaAssetUrlResponse> {
  try {
    const filename = fileKey.split("/").pop() || fileKey;
    const response = await axios.get<AppRequest<DpaAssetUrlResponse>>(
      `${config.api.url}/api/v1/assets/dpas/${encodeURIComponent(filename)}`,
      {
        headers: authHeaders(token),
        timeout: 30000,
      },
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to load DPA.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load DPA."));
  }
}

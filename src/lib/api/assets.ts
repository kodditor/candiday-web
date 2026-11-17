import { api } from "@/lib/request";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { AppRequest } from "@/lib/types/request.type";

export type DpaAssetUrlResponse = {
  url: string;
  expiresAt: string;
  filename: string;
};

export async function fetchDpaAssetUrl(
  fileKey: string,
): Promise<DpaAssetUrlResponse> {
  try {
    const filename = fileKey.split("/").pop() || fileKey;
    const response = await api.get<AppRequest<DpaAssetUrlResponse>>(
      `/assets/dpas/${encodeURIComponent(filename)}`,
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

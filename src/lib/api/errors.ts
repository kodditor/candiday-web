import axios from "axios";
import type { AppRequest } from "@/lib/types/request.type";

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as AppRequest<unknown> | undefined;
    if (data && !data.success && "error" in data && data.error) return data.error;
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

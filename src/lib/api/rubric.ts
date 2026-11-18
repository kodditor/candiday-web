import { api } from "@/lib/request";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { AppRequest } from "@/lib/types/request.type";
import type { RubricSaveItemInput } from "@/lib/rubric/schema";
import type { RubricView } from "@/lib/types/rubric.type";

export const rubricQueryKeys = {
  view: (roleId: string) => ["rubric", "view", roleId] as const,
};

export async function fetchRubricView(roleId: string): Promise<RubricView | null> {
  try {
    const response = await api.get<AppRequest<RubricView | null>>(
      `/roles/${roleId}/rubric`,
    );
    if (!response.data.success) {
      throw new Error(response.data.error);
    }
    return response.data.data ?? null;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load rubric."));
  }
}

export async function startRubricGeneration(
  roleId: string,
  idempotencyKey: string,
  replace = false,
): Promise<RubricView> {
  const response = await api.post<AppRequest<RubricView>>(
    `/roles/${roleId}/rubric`,
    { replace },
    { headers: { "Idempotency-Key": idempotencyKey } },
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error ?? "Unable to start generation.");
  }
  return response.data.data;
}

export async function saveRubricItems(
  rubricId: string,
  baseRevision: number,
  items: RubricSaveItemInput[],
): Promise<RubricView> {
  const response = await api.put<AppRequest<RubricView>>(`/rubrics/${rubricId}/items`, {
    baseRevision,
    items,
  });
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error ?? "Unable to save rubric.");
  }
  return response.data.data;
}

export async function approveRubric(
  rubricId: string,
  baseRevision: number,
  roleVersion: number,
): Promise<RubricView> {
  const response = await api.post<AppRequest<{ view: RubricView }>>(
    `/rubrics/${rubricId}/approve`,
    { baseRevision, roleVersion },
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error ?? "Unable to approve rubric.");
  }
  return response.data.data.view;
}
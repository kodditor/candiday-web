import { api } from "@/lib/request";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { AppRequest } from "@/lib/types/request.type";
import type {
  CreateRolePayload,
  Role,
  RoleDetailDto,
  RoleListItemDto,
  RolesListResponse,
  RolesSummaryResponse,
} from "@/lib/types/role.type";
import { isRoleStatus } from "@/lib/roles/status";

export const rolesQueryKeys = {
  all: ["roles"] as const,
  summary: (organizationId: string) =>
    ["roles", "summary", organizationId] as const,
  recent: (organizationId: string) =>
    ["roles", "recent", organizationId] as const,
  list: (params: { q: string; archived: string }) =>
    ["roles", "list", params] as const,
  detail: (roleId: string) => ["roles", "detail", roleId] as const,
};

export function mapListItemToRole(dto: RoleListItemDto): Role {
  return {
    id: dto.id,
    title: dto.title,
    companyName: dto.companyName?.trim() ?? "",
    status: isRoleStatus(dto.status) ? dto.status : "Draft",
    applicantsCount: dto.applicantsCount,
    lastActivityAt: dto.lastActivityAt,
    updatedAt: dto.updatedAt,
  };
}

export type FetchRolesParams = {
  q?: string;
  cursor?: string;
  limit?: number;
  archived?: "false" | "true" | "all";
  status?: string;
};

export async function fetchRoleDetail(roleId: string): Promise<RoleDetailDto> {
  try {
    const response = await api.get<AppRequest<RoleDetailDto>>(`/roles/${roleId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error ?? "Unable to load role.");
    }
    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load role."));
  }
}

export async function fetchRoles(
  params: FetchRolesParams = {},
): Promise<RolesListResponse> {
  try {
    const response = await api.get<AppRequest<RolesListResponse>>("/roles", {
      params: {
        limit: params.limit ?? 20,
        archived: params.archived ?? "false",
        ...(params.q?.trim() ? { q: params.q.trim() } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to load roles.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load roles."));
  }
}

export async function fetchRolesSummary(): Promise<RolesSummaryResponse> {
  try {
    const response = await api.get<AppRequest<RolesSummaryResponse>>(
      "/roles/summary",
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to load roles summary.",
      );
    }

    return response.data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Unable to load roles summary."),
    );
  }
}

export async function createRole(payload: CreateRolePayload): Promise<Role> {
  try {
    const response = await api.post<AppRequest<RoleListItemDto>>("/roles", {
      title: payload.title.trim(),
      companyName: payload.companyName?.trim() || null,
      jobDescription: payload.jobDescription.trim(),
      seniority: payload.seniority?.trim() || null,
      location: payload.location?.trim() || null,
      requirementsNotes: payload.requirementsNotes?.trim() || null,
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.success === false
          ? response.data.error
          : "Unable to create role.",
      );
    }

    return mapListItemToRole(response.data.data as RoleListItemDto);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to create role."));
  }
}
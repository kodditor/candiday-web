import type { RoleStatus } from "@/lib/roles/status";

export type RoleListItemDto = {
  id: string;
  organizationId: string;
  createdByUserId: string;
  title: string;
  companyName: string | null;
  seniority: string | null;
  location: string | null;
  requirementsNotes: string | null;
  status: RoleStatus;
  currentRubricId: string | null;
  rubricJdHash: string | null;
  rubricApprovedAt: string | null;
  rubricApprovedBy: string | null;
  rubricIsStale: boolean;
  rubricGenerationError: string | null;
  applicantsCount: number;
  failedFilesCount: number;
  archivedAt: string | null;
  version: number;
  lastActivityAt: string;
  retentionExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
};

export type RolesListResponse = {
  items: RoleListItemDto[];
  nextCursor: string | null;
  hasMore: boolean;
  searchMode: "browse" | "trigram" | "fulltext";
};

export type RolesSummaryResponse = {
  activeRoleCount: number;
  applicantsCount: number;
};

export type CreateRolePayload = {
  title: string;
  companyName?: string | null;
  jobDescription: string;
  seniority?: string | null;
  location?: string | null;
  requirementsNotes?: string | null;
};

export type Role = {
  id: string;
  title: string;
  companyName: string;
  status: RoleStatus;
  applicantsCount: number;
  lastActivityAt: string;
  updatedAt: string;
};

export type RoleDetailDto = RoleListItemDto & {
  jobDescription: string;
};
export const ROLE_STATUSES = [
  "Draft",
  "GeneratingRubric",
  "AwaitingRubricApproval",
  "AwaitingApplicantsUpload",
  "ReadyForReview",
] as const;

export type RoleStatus = (typeof ROLE_STATUSES)[number];

/** @deprecated Use RoleStatus */
export type RoleWorkflowStatus = RoleStatus;

const statusLabels: Record<RoleStatus, string> = {
  Draft: "Draft",
  GeneratingRubric: "Generating rubric",
  AwaitingRubricApproval: "Awaiting rubric approval",
  AwaitingApplicantsUpload: "Awaiting applicant uploads",
  ReadyForReview: "Ready for review",
};

const statusChipClasses: Record<RoleStatus, string> = {
  Draft: "bg-neutral-100 text-neutral-700",
  GeneratingRubric: "bg-blue-50 text-blue-800",
  AwaitingRubricApproval: "bg-amber-50 text-amber-800",
  AwaitingApplicantsUpload: "bg-amber-50 text-amber-800",
  ReadyForReview: "bg-emerald-50 text-emerald-800",
};

export function formatRoleStatusLabel(status: RoleStatus): string {
  return statusLabels[status];
}

export function roleStatusChipClassName(status: RoleStatus): string {
  return statusChipClasses[status];
}

export function isRoleStatus(value: string): value is RoleStatus {
  return (ROLE_STATUSES as readonly string[]).includes(value);
}

/** @deprecated Use isRoleStatus */
export function isRoleWorkflowStatus(value: string): value is RoleWorkflowStatus {
  return isRoleStatus(value);
}
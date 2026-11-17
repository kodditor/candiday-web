const ADMIN_ROLES = new Set(["admin", "owner"]);

export function isOrgAdminRole(role: string): boolean {
  const normalized = role.replace(/^org:/, "").toLowerCase();
  return ADMIN_ROLES.has(normalized);
}
import type { RoleStatus } from "@/lib/roles/status";
import {
  formatRoleStatusLabel,
  roleStatusChipClassName,
} from "@/lib/roles/status";
import { cn } from "@/lib/utils";

type RoleStatusChipProps = {
  status: RoleStatus;
  className?: string;
};

export function RoleStatusChip({ status, className }: RoleStatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-normal",
        roleStatusChipClassName(status),
        className,
      )}
    >
      {formatRoleStatusLabel(status)}
    </span>
  );
}
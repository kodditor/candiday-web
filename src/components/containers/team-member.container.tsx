import { Label } from "@/components/ui/label";
import { TeamMemberAvatar } from "@/components/team/team-member-avatar";
import {
  formatOrgRole,
  type ITeamRow,
} from "@/lib/types/team-member.type";
import dayjs from "dayjs";
import lodash from "lodash";

type Props = {
  datum: ITeamRow;
};

export function TeamMemberContainer({ datum }: Props) {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <TeamMemberAvatar
          name={datum.name}
          imageUrl={datum.imageUrl}
          className="size-12"
        />
        <div>
          <p className="text-base font-medium text-ink">{datum.name}</p>
          <p className="text-sm text-text-secondary">{datum.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Label className="text-xs uppercase text-gray-700">Role</Label>
          <div className="text-sm">{formatOrgRole(datum.role)}</div>
        </div>
        <div>
          <Label className="text-xs uppercase text-gray-700">Status</Label>
          <div className="text-sm">{lodash.startCase(datum.status)}</div>
        </div>
        <div>
          <Label className="text-xs uppercase text-gray-700">
            {datum.type === "invitation" ? "Date invited" : "Date joined"}
          </Label>
          <div className="text-sm">{dayjs(datum.createdAt).format("DD/MM/YYYY")}</div>
        </div>
        <div>
          <Label className="text-xs uppercase text-gray-700">Type</Label>
          <div className="text-sm">
            {datum.type === "invitation" ? "Pending invitation" : "Team member"}
          </div>
        </div>
      </div>
    </div>
  );
}

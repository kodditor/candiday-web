import { type IDataOwner } from "@/lib/types/data-owner.type";
import { Label } from "@/components/ui/label";
import lodash from "lodash";
import dayjs from "dayjs";

type Props = {
  datum: IDataOwner,
}

export function DataOwnerContainer({ datum }: Props) {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Label className="text-gray-700 uppercase text-xs">Name</Label>
          <div className="text-sm">{datum.name}</div>
        </div>
        <div>
          <Label className="text-gray-700 uppercase text-xs">Email</Label>
          <div className="text-sm">{datum.email}</div>
        </div>
        <div>
          <Label className="text-gray-700 uppercase text-xs">Role</Label>
          <div className="text-sm">{datum.role || "—"}</div>
        </div>
        <div>
          <Label className="text-gray-700 uppercase text-xs">Digest frequency</Label>
          <div className="text-sm">{lodash.startCase(datum.digestFrequency)}</div>
        </div>
        <div>
          <Label className="text-gray-700 uppercase text-xs">Notifications</Label>
          <div className="text-sm">{datum.notificationsEnabled ? "Enabled" : "Disabled"}</div>
        </div>
        <div>
          <Label className="text-gray-700 uppercase text-xs">Status</Label>
          <div className="text-sm">{lodash.startCase(datum.status)}</div>
        </div>
      </div>

      <hr className="text-gray-300" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-gray-700 uppercase text-xs">Date created</Label>
          <div className="text-sm">{dayjs(datum.createdAt).format("DD/MM/YYYY")}</div>
        </div>
        <div>
          <Label className="text-gray-700 uppercase text-xs">Last updated</Label>
          <div className="text-sm">{dayjs(datum.updatedAt).format("DD/MM/YYYY")}</div>
        </div>
      </div>
    </div>
  );
}

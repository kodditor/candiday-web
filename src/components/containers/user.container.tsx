import { type IUser } from "@/lib/types/user.type"
import { Label } from "../ui/label";
import lodash from "lodash";
import dayjs from "dayjs";

type Props = {
  datum: IUser,
}

export function UserContainer({
  datum
}: Props){

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-700 uppercase text-xs">First Name</Label>
          <div className="text-sm">{datum.firstName}</div>
        </div>
        <div>
           <Label className="text-gray-700 uppercase text-xs">Last Name</Label>
          <div className="text-sm">{datum.lastName}</div>
        </div>
        <div>
          <Label className="text-gray-700 uppercase text-xs">Phone Number</Label>
          <div className="text-sm">{datum.phone}</div>
        </div>
        <div>
          <Label className="text-gray-700 uppercase text-xs">Email Address</Label>
          <div className="text-sm">{datum.email}</div>
        </div>
        <div>
          <Label className="text-gray-700 uppercase text-xs">Status</Label>
          <div className="text-sm">{lodash.startCase(datum.status)}</div>
        </div>
        <div>
          <Label className="text-gray-700 uppercase text-xs">Role</Label>
          <div className="text-sm">{lodash.startCase(datum.role)}</div>
        </div>
        <div>
          <Label className="text-gray-700 uppercase text-xs">Is Driver?</Label>
          <div className="text-sm">{Boolean(datum.isDriver) ? "Yes" : "No"}</div>
        </div>
      </div>
      <hr className="text-gray-300"/>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-700 uppercase text-xs">Date Created</Label>
          <div className="text-sm">{dayjs(datum.createdAt).format("DD/MM/YYYY")}</div>
        </div>
        {
          datum.status === 'Suspended' &&
          datum.suspendedAt && (
            <div>
              <Label className="text-gray-700 uppercase text-xs">Date Suspended</Label>
              <div className="text-sm">{dayjs(datum.suspendedAt).format("DD/MM/YYYY [at] hh:mm A")}</div>
            </div>
          )
        }  
      </div>
    </div>
  )
}
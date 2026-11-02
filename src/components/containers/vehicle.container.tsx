import { type IVehicle, type VehicleHistoryAction } from "@/lib/types/vehicle.type"
import { Label } from "../ui/label";
import lodash from "lodash";
import dayjs from "dayjs";
import type { IUser } from "@/lib/types/user.type";
import { PlusIcon, UserIcon, TrashIcon, PencilIcon } from "@phosphor-icons/react";

type Props = {
  datum: Omit<IVehicle, "drivers"> & { drivers?: IUser[] },
}

export function VehicleContainer({
  datum
}: Props){

  const HistoryIcon = (action: VehicleHistoryAction) => {
    const IconComponent = {
      Created: PlusIcon,
      Assigned: UserIcon,
      Deleted: TrashIcon,
      Edited: PencilIcon,
    }[action] || PlusIcon;
    return <IconComponent size={16} />;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-700 uppercase text-xs">Number Plate</Label>
          <div className="text-sm">{datum.numberPlate}</div>
        </div>
        <div>
           <Label className="text-gray-700 uppercase text-xs">Vehicle Type</Label>
          <div className="text-sm">{lodash.startCase(datum.vehicleType)}</div>
        </div>
        
        <div>
          <Label className="text-gray-700 uppercase text-xs">Status</Label>
          <div className="text-sm">{lodash.startCase(datum.status)}</div>
        </div>
      </div>
      <hr className="text-gray-300"/>
      <div>
        <Label className="text-gray-700 uppercase text-xs">Drivers</Label>
        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto mt-2">
          {!Boolean(datum.drivers?.length) ? (
            <div>
              <div className="text-sm text-gray-500">No Drivers assigned</div>
            </div>
          ) : datum.drivers?.map((driver) => (
            <div
              key={driver._id}
              className={"p-3 border relative rounded-lg cursor-pointer"} 
            >
              <div className="flex flex-row items-center gap-2">
                <div className="w-10 h-10 shrink-0 bg-gray-300 rounded-full flex items-center justify-center">
                  {driver.firstName?.[0]}{driver.lastName?.[0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-center">{driver.firstName} {driver.lastName}</div>
                  <div className="text-xs text-gray-500">{driver.phone}</div>
                </div>
              </div> 
            </div>
          ))}
        </div>
        
      </div>
      <hr className="text-gray-300"/>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-700 uppercase text-xs">Date Created</Label>
          <div className="text-sm">{dayjs(datum.createdAt).format("DD/MM/YYYY")}</div>
        </div>
        <div>
          <Label className="text-gray-700 uppercase text-xs">Date Updated</Label>
          <div className="text-sm">{dayjs(datum.updatedAt).format("DD/MM/YYYY")}</div>
        </div>
      </div>
      {datum.history && datum.history.length > 0 && (
        <>
          <hr className="text-gray-300"/>
          <div>
            <Label className="text-gray-700 uppercase text-xs">History</Label>
            <div className="space-y-3 mt-4 max-h-48 overflow-y-auto">
              {datum.history.map((h, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs text-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 rounded-full text-gray-600 grid place-items-center p-1.5">
                      {HistoryIcon(h.action)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">{h.action}</span>
                      <span>{h.message}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div>{dayjs(h.timestamp).format("DD/MM/YYYY")}</div>
                    <div>{dayjs(h.timestamp).format("hh:mm A")}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
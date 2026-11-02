import TextInput from "@/components/form/input";
import SelectInput from "@/components/form/select";
import { VehicleTypes } from "@/lib/types/vehicle.type";
import { type FormikProps } from "formik"
import lodash from 'lodash';
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/request";
import { wrapError } from "@/lib/utils/request";
import { type IUser } from "@/lib/types/user.type";
import { type PaginatedRequest } from "@/lib/types/request.type";
import { CheckCircleIcon, CircleNotchIcon, StickerIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export * from "./schema";

type Props = {
  form: FormikProps<any>;
  showDrivers?: boolean;
}

export function VehicleForm({
  form,
  showDrivers = false
}: Props){
  
  const [search, setSearch] = useState("");

  const driversQuery = useQuery({
    enabled: showDrivers,
    queryKey: ['drivers', search],
    queryFn: async () => await wrapError(async () => {
      const req = await api.get<PaginatedRequest<IUser>>(`/users?status=Active&isDriver=true&q=${search}`);
      if (req.data.success) {
        return req.data.data
      } else {
        throw new Error(req.data.error)
      }
    })
  });

  return (
    <>
      <form className="flex flex-col gap-6 p-6">
        <div>
          <TextInput
            id="numberPlate"
            label="Number Plate"
            placeholder="ABC-123-XY"
            type="text"
            {...form}
          />
        </div>

        <div>
          <SelectInput
            id="vehicleType"
            label="Vehicle Type"
            placeholder="--- Select a Vehicle Type ---"
            options={VehicleTypes.map((type) => ({
              label: lodash.startCase(type),
              value: type
            }))}
            {...form}
          />
        </div>

        {showDrivers && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Drivers</label>
              <div>
                <div className="mb-4">
                  <TextInput
                    id="search"
                    label="Search Drivers"
                    placeholder="Search by name..."
                    type="text"
                    values={{ search }}
                    handleChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {driversQuery.isLoading ? (
                    <div className="col-span-3 w-full bg-white text-gray-700 p-4 min-h-48 grid place-items-center">
                      <div className="flex flex-col items-center gap-4">
                        <CircleNotchIcon className="animate-spin" size={25} strokeWidth={1.5} />
                        <p>Loading Drivers...</p>
                      </div>
                    </div>

                  ) : !Boolean(driversQuery.data?.totalDocs) ? (
                    <div className="col-span-3 w-full py-16 grid place-items-center bg-white text-gray-700">
                      <div className="flex flex-col items-center gap-4">
                        <StickerIcon size={25} strokeWidth={1.5} />
                        <p>No Drivers</p>
                      </div>
                    </div>
                  ) : driversQuery.data?.docs?.map((driver) => {
                    
                    const isChecked = form.values.drivers?.includes(driver._id);

                    return (
                      
                      <div
                        key={driver._id}
                        className={cn(
                          "p-4 border relative rounded cursor-pointer ",
                          isChecked ? 'border-primary bg-primary/10 hover:bg-primary/5' : 'border-gray-200 hover:bg-gray-50'
                        )} 
                        onClick={() => {
                          if (!isChecked) {
                            form.setFieldValue('drivers', [...form.values.drivers, driver._id])
                          } else {
                            form.setFieldValue('drivers', form.values.drivers.filter((id: any) => id !== driver._id))
                          }
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                            {driver.firstName[0]}{driver.lastName[0]}
                          </div>
                          <div className="text-sm font-medium text-center">{driver.firstName} {driver.lastName}</div>
                          <div className="text-xs text-gray-500">{driver.phone}</div>
                        </div>
                        <span className="absolute top-2 right-2 text-primary">
                          {
                            isChecked && (
                              <CheckCircleIcon size={20} weight="fill"  />
                            )
                          }
                        </span> 
                      </div>
                    )
                  }
                  )}
                </div>
            </div>
          </div>
        )}
      </form>
    </>
  )
}
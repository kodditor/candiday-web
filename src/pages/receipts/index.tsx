import { DataTable } from "@/components/ui/custom-table";
import { useUser } from "@/lib/context/user-context";
import { api } from "@/lib/request";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import lodash from "lodash";
import { type IReceipt, ReceiptStatuses } from "@/lib/types/receipt.type";
import { type PaginatedRequest } from "@/lib/types/request.type";
import { parseAsInteger, useQueryState } from "nuqs";
import qs from 'qs';
import { ReceiptIcon } from "@phosphor-icons/react";
import { wrapError } from "@/lib/utils/request";
import SelectInput from "@/components/form/select";
import { Pill } from "@/components/ui/pill";
import { DashboardRootRoute } from "../dashboard/root";
import { createRoute, useNavigate } from "@tanstack/react-router";
import type { IVehicle } from "@/lib/types/vehicle.type";
import type { IUser } from "@/lib/types/user.type";
import { CustomDateFilter, getDateRange, useDateFilter } from "@/components/ui/custom-date-filter";

export const ReceiptsRoute = createRoute({
  getParentRoute: () => DashboardRootRoute,
  path: '/receipts',
  component: ReceiptsPage,
})

export function ReceiptsPage() {

  const user = useUser((state) => state.user)

  const [query] = useQueryState('query');
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [status, setStatus] = useQueryState("status");
  const dateFilter = useDateFilter();
  const navigate = useNavigate();

  const receiptsQuery = useQuery({
    enabled: Boolean(user),
    queryKey: ['receipts', query, page, limit, status, dateFilter],
    gcTime: 0,
    queryFn: async () => await wrapError(async () => {
      const queryString = qs.stringify({
        query,
        page,
        limit,
        status,
        populate: "vehicle driver",
        ...(getDateRange(dateFilter)),
      })
      const req = await api.get<PaginatedRequest<Omit<IReceipt, "vehicle" | "driver"> & { vehicle?: IVehicle, driver?: IUser }>>(`/receipts?${queryString}`);
      if (req.data.success) {
        return req.data.data
      } else {
        throw new Error(req.data.error)
      }
    })
  })

  return (
    <div className="flex flex-col py-8 px-4 sm:p-16 max-w-screen overflow-x-hidden min-h-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="font-semibold text-2xl font-heading">Receipts</h1>
      </div>
      <div className="mt-6 flex flex-col flex-1">
        <DataTable
          name="Receipts"
          {...receiptsQuery.data}
          loading={receiptsQuery.isPending}
          renderExtra={() => (
            <>
              <div className="flex gap-2 w-full justify-end">
                <div className="hidden sm:block">
                  <CustomDateFilter />
                </div>
                <div className="hidden sm:block">
                  <SelectInput
                    id={"status"}
                    handleChange={(e) => {
                      setStatus(e.target.value || null)
                    }}
                    values={{ status }}
                    options={[
                      { label: 'Filter By Status', value: "" },
                      ...ReceiptStatuses.map((s) => ({
                        label: lodash.startCase(s),
                        value: s,
                      }))
                    ]}
                  />
                </div>
              </div>
            </>
          )}
          renderHeader={() => (
            <tr>
              <th className="whitespace-pre text-left flex-1 p-4 bg-gray-200/50 font-medium uppercase text-xs border-b border-gray-300"></th>
              <th className="whitespace-pre text-left flex-1 p-4 bg-gray-200/50 font-medium uppercase text-xs border-b border-gray-300">Code</th>
              <th className="whitespace-pre text-left flex-1 p-4 bg-gray-200/50 font-medium uppercase text-xs border-b border-gray-300">Status</th>
              <th className="whitespace-pre text-left flex-1 p-4 bg-gray-200/50 font-medium uppercase text-xs border-b border-gray-300">Station</th>
              <th className="whitespace-pre text-left flex-1 p-4 bg-gray-200/50 font-medium uppercase text-xs border-b border-gray-300">Amount</th>
              <th className="whitespace-pre text-left flex-1 p-4 bg-gray-200/50 font-medium uppercase text-xs border-b border-gray-300">Driver</th>
              <th className="whitespace-pre text-left flex-1 p-4 bg-gray-200/50 font-medium uppercase text-xs border-b border-gray-300">Vehicle</th>
              <th className="whitespace-pre text-left flex-1 p-4 bg-gray-200/50 font-medium uppercase text-xs border-b border-gray-300">Timestamp</th>
            </tr>
          )}
          renderItem={(datum, idx) => (
            <tr
              key={idx} className="border border-b border-gray-200 hover:bg-gray-50 duration-150 cursor-pointer"
              onClick={() => navigate({
                to: "/dashboard/receipts/$id",
                params: {
                  id: datum?._id
                }
              })}
            >
              <td className="pl-4">
                <div>
                  <ReceiptIcon size={18} strokeWidth={1.5} />
                </div>
              </td>
              <td className="p-4">
                <div>
                  <p className="text-sm">{datum?.code || "N/A"}</p>
                </div>
              </td>
              <td className="p-4 whitespace-pre">
                <Pill
                  value={lodash.startCase(datum?.status) || "N/A"}
                  variantDef={{
                    "Pending": "bg-yellow-100 text-yellow-800",
                    "Approved": "bg-emerald-100 text-emerald-800",
                    "Flagged": "bg-orange-100 text-orange-800",
                    "Rejected": "bg-red-100 text-red-800",
                  }}
                />
              </td>
              <td className="p-4">
                <div>
                  <p className="text-sm">{datum?.station || "N/A"}</p>
                </div>
              </td>
              <td className="p-4">
                <div>
                  <p className="text-sm">{`${datum.amount.currency} ${datum.amount.value}`}</p>
                </div>
              </td>
              <td className="p-4">
                {datum.driver ? (
                  <div className="flex gap-4 items-center">
                    <div className="p-3 grid place-items-center rounded-full w-12 aspect-square bg-gray-500/10 shrink-0">
                      <span>{datum?.driver?.firstName?.[0] || "N/A"}</span>
                    </div>
                    <div>
                      <p className="text-sm whitespace-pre">{[datum?.driver?.firstName, datum?.driver?.lastName].join(" ") || "N/A"}</p>
                      <p className="text-xs">{datum?.driver?.phone || "N/A"}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm">N/A</p>
                  </div>
                )}
              </td>
              <td className="p-4">
                <div className="border border-gray-300 rounded-sm px-2 bg-white w-fit">
                  <p className="text-sm">{datum.vehicle ? datum.vehicle.numberPlate : "N/A"}</p>
                </div>
              </td>
              <td className="p-4">
                <p className="text-sm">{dayjs(datum.timestamp).format("DD/MM/YYYY")}</p>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  )
}
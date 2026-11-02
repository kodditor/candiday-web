import { DataTable } from "@/components/ui/custom-table";
import { useUser } from "@/lib/context/user-context";
import { api } from "@/lib/request";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import lodash from "lodash";
import { type IUser, UserStatuses } from "@/lib/types/user.type";
import { type PaginatedRequest } from "@/lib/types/request.type";
import { parseAsInteger, useQueryState } from "nuqs";
import qs from 'qs';
import { CreateUserModal } from "./create";
import { PlusIcon, UserIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { wrapError } from "@/lib/utils/request";
import SelectInput from "@/components/form/select";
import { Pill } from "@/components/ui/pill";
import { DashboardRootRoute } from "../dashboard/root";
import { createRoute } from "@tanstack/react-router";
import { ViewUserModal } from "./view";
import { EditUserModal } from "./edit";

export const UsersRoute = createRoute({
  getParentRoute: () => DashboardRootRoute,
  path: '/users',
  component: UsersPage,
})

export function UsersPage() {

  const user = useUser((state) => state.user)

  const [modal, setModal] = useQueryState("modal");

  const [query] = useQueryState('query');
  const [, setId] = useQueryState('id');
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [status, setStatus] = useQueryState("status");

  const dispatchModal = (action: string, id?: string) => {
    id ? setId(id) : null;
    setModal(action)
  }

  const usersQuery = useQuery({
    enabled: Boolean(user),
    queryKey: ['users', query, page, limit, status],
    gcTime: 0,
    queryFn: async () => await wrapError(async () => {
      let queryString = qs.stringify({
        query,
        page,
        limit,
        status,
      })
      const req = await api.get<PaginatedRequest<IUser>>(`/users?${queryString}`);
      if (req.data.success) {
        return req.data.data
      } else {
        throw new Error(req.data.error)
      }
    })
  })

  return (
    <>
      <div className="flex flex-col py-8 px-4 sm:p-16 max-w-screen overflow-x-hidden min-h-full overflow-y-auto">
        <div className="flex justify-between items-center">
          <h1 className="font-semibold text-2xl font-heading">Users</h1>
          <Button
            onClick={() => setModal("create")}
            className={"hidden sm:flex gap-2"}
          >
            <PlusIcon strokeWidth={1.5} size={23} />
            Create User
          </Button>
        </div>
        <div className="mt-6 flex flex-col flex-1">
          <DataTable
            name="Users"
            {...usersQuery.data}
            loading={usersQuery.isPending} 
            renderExtra={() => (
              <>
                <div className="flex gap-2 w-full  justify-end">
                  <div className="hidden sm:block">
                    <SelectInput
                      id={"status"}
                      handleChange={(e) => {
                        setStatus(e.target.value || null)
                      }}
                      values={{ status }}
                      options={[
                        { label: 'Filter By Status', value: "" },
                        ...UserStatuses.filter((s) => s !== "Deleted").map((s) => ({
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
                <th className="whitespace-pre text-left flex-1 p-4 bg-gray-200/50 font-medium uppercase text-xs border-b border-gray-300">Name</th>
                <th className="whitespace-pre text-left flex-1 p-4 bg-gray-200/50 font-medium uppercase text-xs border-b border-gray-300">Phone</th>
                <th className="whitespace-pre text-left flex-1 p-4 bg-gray-200/50 font-medium uppercase text-xs border-b border-gray-300">Email</th>
                <th className="whitespace-pre text-left flex-1 p-4 bg-gray-200/50 font-medium uppercase text-xs border-b border-gray-300">Role</th>
                <th className="whitespace-pre text-left flex-1 p-4 bg-gray-200/50 font-medium uppercase text-xs border-b border-gray-300">Is Driver?</th>
                <th className="whitespace-pre text-left flex-1 p-4 bg-gray-200/50 font-medium uppercase text-xs border-b border-gray-300">Status</th>
                <th className="whitespace-pre text-left flex-1 p-4 bg-gray-200/50 font-medium uppercase text-xs border-b border-gray-300">Date Created</th>
              </tr>
            )}
            renderItem={(datum, idx) => (
              <tr 
                key={idx} className="border border-b border-gray-200 hover:bg-gray-50 duration-150 cursor-pointer" 
                onClick={() => dispatchModal("view", datum._id)}
              >
                <td className="pl-4">
                  <div>
                    <UserIcon size={18} strokeWidth={1.5} />
                  </div>
                </td>
                <td className="p-4 h-fit">
                  <div className="flex gap-4 items-center">
                    <div className="p-3 grid place-items-center rounded-full w-12 aspect-square bg-gray-500/10 shrink-0">
                      <span>{datum?.firstName?.[0] || "N/A"}</span>
                    </div>
                    <div>
                      <p className="text-sm whitespace-pre">{[datum?.firstName, datum?.lastName].join(" ") || "N/A"}</p>
                      {/* <p className="text-xs">{datum?.email || "N/A"}</p> */}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <p className="text-sm">{datum?.phone || "N/A"}</p>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <p className="text-sm">{datum?.email || "N/A"}</p>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <p className="text-sm whitespace-pre">{lodash.startCase(datum?.role) || "N/A"}</p>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <p className="text-sm whitespace-pre">{Boolean(datum?.isDriver) ? "Yes" : "No"}</p>
                  </div>
                </td>
                <td className="p-4 whitespace-pre">
                  <Pill
                    value={lodash.startCase(datum?.status) || "N/A"}
                    variantDef={{
                      "Pending": "bg-yellow-100 text-yellow-800",
                      "Active": "bg-emerald-100 text-emerald-800",
                      "Suspended": "bg-orange-100 text-orange-800",
                      "Deleted": "bg-red-100 text-red-800",
                    }}
                  />
                </td>
                <td className="p-4">
                  <p className="text-sm">{dayjs(datum.createdAt).format("DD/MM/YYYY")}</p>
                </td>
              </tr>
            )}
          />
        </div>
      </div>
      <CreateUserModal
        open={modal === 'create'}
        refetch={usersQuery.refetch}
        closeModal={() => setModal(null)}
      />
      <ViewUserModal
        open={modal === 'view'}
        refetch={usersQuery.refetch}
        closeModal={() => setModal(null)}
      />
      <EditUserModal
        open={modal === 'edit'}
        refetch={usersQuery.refetch}
        closeModal={() => setModal(null)}
      />
    </>
  )
}
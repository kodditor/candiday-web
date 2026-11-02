import { DataTable } from "@/components/ui/custom-table";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { fetchDataOwners } from "@/lib/api/data-owners";
import { useUser } from "@/lib/context/user-context";
import { type IDataOwner } from "@/lib/types/data-owner.type";
import { wrapError } from "@/lib/utils/request";
import { useAuth } from "@clerk/react";
import { PlusIcon, UserCheckIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import lodash from "lodash";
import { parseAsInteger, useQueryState } from "nuqs";
import { DashboardRootRoute } from "../root";
import { CreateDataOwnerModal } from "./create";
import { EditDataOwnerModal } from "./edit";
import { ViewDataOwnerModal } from "./view";

export const DashboardDataOwnersRoute = createRoute({
  getParentRoute: () => DashboardRootRoute,
  path: "/data-owners",
  component: DataOwnersPage,
});

export function DataOwnersPage() {
  const user = useUser((state) => state.user);
  const { getToken } = useAuth();

  const [modal, setModal] = useQueryState("modal");
  const [query] = useQueryState("query");
  const [, setId] = useQueryState("id");
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit] = useQueryState("limit", parseAsInteger.withDefault(10));

  const dispatchModal = (action: string, id?: string) => {
    if (id) {
      setId(id);
    }
    setModal(action);
  };

  const dataOwnersQuery = useQuery({
    enabled: Boolean(user),
    queryKey: ["data-owners", query, page, limit],
    gcTime: 0,
    queryFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });

      if (!token) {
        throw new Error("Missing session token");
      }

      return fetchDataOwners(token, { query, page, limit });
    }),
  });

  return (
    <>
      <div className="flex min-h-[calc(100vh-8rem)] flex-col">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
              Data Owners
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Assign internal owners responsible for vendor data compliance.
            </p>
          </div>
          <Button
            onClick={() => setModal("create")}
            className="gap-2"
          >
            <PlusIcon strokeWidth={1.5} size={20} />
            Add data owner
          </Button>
        </div>

        <div className="mt-6 flex min-h-0 flex-1 flex-col">
          <DataTable<IDataOwner>
            name="Data Owners"
            {...dataOwnersQuery.data}
            loading={dataOwnersQuery.isPending}
            renderHeader={() => (
              <tr>
                <th className="whitespace-pre p-4 bg-gray-200/30 text-left text-xs font-medium uppercase border-b border-gray-300" />
                <th className="whitespace-pre p-4 bg-gray-200/30 text-left text-xs font-medium uppercase border-b border-gray-300">Name</th>
                <th className="whitespace-pre p-4 bg-gray-200/30 text-left text-xs font-medium uppercase border-b border-gray-300">Email</th>
                <th className="whitespace-pre p-4 bg-gray-200/30 text-left text-xs font-medium uppercase border-b border-gray-300">Role</th>
                <th className="whitespace-pre p-4 bg-gray-200/30 text-left text-xs font-medium uppercase border-b border-gray-300">Digest</th>
                <th className="whitespace-pre p-4 bg-gray-200/30 text-left text-xs font-medium uppercase border-b border-gray-300">Status</th>
                <th className="whitespace-pre p-4 bg-gray-200/30 text-left text-xs font-medium uppercase border-b border-gray-300">Date created</th>
              </tr>
            )}
            renderItem={(datum) => (
              <tr
                key={datum._id}
                className="cursor-pointer border-b border-gray-200 duration-150 hover:bg-gray-50"
                onClick={() => dispatchModal("view", datum._id)}
              >
                <td className="pl-4">
                  <UserCheckIcon size={18} strokeWidth={1.5} />
                </td>
                <td className="p-4">
                  <p className="text-sm">{datum.name}</p>
                </td>
                <td className="p-4">
                  <p className="text-sm">{datum.email}</p>
                </td>
                <td className="p-4">
                  <p className="text-sm">{datum.role || "—"}</p>
                </td>
                <td className="p-4">
                  <p className="text-sm">{lodash.startCase(datum.digestFrequency)}</p>
                </td>
                <td className="p-4">
                  <Pill
                    value={lodash.startCase(datum.status)}
                    variantDef={{
                      Active: "bg-emerald-100 text-emerald-800",
                      Archived: "bg-gray-100 text-gray-800",
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

      <CreateDataOwnerModal
        open={modal === "create"}
        refetch={dataOwnersQuery.refetch}
        closeModal={() => setModal(null)}
      />
      <EditDataOwnerModal
        open={modal === "edit"}
        refetch={dataOwnersQuery.refetch}
        closeModal={() => setModal("view")}
      />
      <ViewDataOwnerModal
        open={modal === "view"}
        refetch={dataOwnersQuery.refetch}
        closeModal={() => {
          setModal(null);
          setId(null);
        }}
      />
    </>
  );
}

import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/custom-table";
import { VendorLogo } from "@/components/vendors/vendor-logo";
import { fetchGlobalVendors } from "@/lib/api/global-vendors";
import type { IGlobalVendor } from "@/lib/types/global-vendor.type";
import { formatCategoryLabel } from "@/lib/utils/vendor";
import { wrapError } from "@/lib/utils/request";
import { useAuth } from "@clerk/react";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { cn } from "@/lib/cn";

type GlobalVendorCatalogModalProps = {
  open: boolean;
  closeModal: () => void;
};

export function GlobalVendorCatalogModal({
  open,
  closeModal,
}: GlobalVendorCatalogModalProps) {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page] = useQueryState("catalog-page", parseAsInteger.withDefault(1));
  const [limit] = useQueryState("catalog-limit", parseAsInteger.withDefault(10));
  const [query] = useQueryState("catalog-query");

  const globalVendorsQuery = useQuery({
    enabled: open,
    queryKey: ["global-vendors", "catalog", query, page, limit],
    placeholderData: keepPreviousData,
    queryFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      return fetchGlobalVendors(token, { query, page, limit });
    }),
  });

  const handleClose = () => {
    setSelectedId(null);
    closeModal();
  };

  const handleNext = () => {
    if (!selectedId) return;

    navigate({
      to: "/dashboard/vendors/create/custom",
      search: { globalVendor: selectedId },
    });
    handleClose();
  };

  return (
    <Modal
      open={open}
      closeModal={handleClose}
      title="Browse vendor catalog"
      size="5xl"
      renderActions={() => (
        <Button
          type="button"
          disabled={!selectedId}
          onClick={handleNext}
        >
          Next
        </Button>
      )}
    >
      <div className="p-6">
        <p className="mb-6 text-sm text-text-secondary">
          Select a vendor from ProcVault&apos;s curated catalog. Core details will be
          pre-filled in the creation wizard, and subprocessor monitoring will stay linked.
        </p>

        {globalVendorsQuery.isError ? (
          <p className="mb-4 text-sm text-red-600">
            {globalVendorsQuery.error instanceof Error
              ? globalVendorsQuery.error.message
              : "Unable to load catalog vendors."}
          </p>
        ) : null}

        <DataTable<IGlobalVendor>
          name="catalog vendors"
          paramsPrefix="catalog-"
          {...globalVendorsQuery.data}
          loading={globalVendorsQuery.isLoading}
          renderHeader={() => (
            <tr>
              <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase" />
              <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase">Name</th>
              <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase">Category</th>
              <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase">Jurisdiction</th>
              <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase">Regions</th>
              <th className="whitespace-pre border-b border-gray-300 bg-gray-200/30 p-4 text-left text-xs font-medium uppercase">Subprocessors</th>
              <th className="w-10 border-b border-gray-300 bg-gray-200/30 p-4" />
            </tr>
          )}
          renderItem={(globalVendor) => {
            const isSelected = selectedId === globalVendor._id;

            return (
              <tr
                key={globalVendor._id}
                className={cn(
                  "cursor-pointer border-b border-gray-200 duration-150 hover:bg-gray-50",
                  isSelected && "bg-statute/5 hover:bg-statute/10",
                )}
                onClick={() => setSelectedId(globalVendor._id)}
              >
                <td className="pl-4">
                  <VendorLogo
                    name={globalVendor.name}
                    logoUrl={globalVendor.logoUrl}
                    size="sm"
                  />
                </td>
                <td className="p-4">
                  <p className="text-sm font-medium">{globalVendor.name}</p>
                </td>
                <td className="p-4">
                  <p className="text-sm">{formatCategoryLabel(globalVendor.category)}</p>
                </td>
                <td className="p-4">
                  <p className="text-sm">{globalVendor.primaryJurisdiction}</p>
                </td>
                <td className="p-4">
                  <p className="text-sm">
                    {globalVendor.availableRegions.length > 0
                      ? globalVendor.availableRegions.join(", ")
                      : "—"}
                  </p>
                </td>
                <td className="p-4">
                  <p className="text-sm tabular-nums">
                    {globalVendor.knownSubprocessors.length}
                  </p>
                </td>
                <td className="p-4">
                  {isSelected ? (
                    <CheckCircleIcon
                      size={20}
                      weight="fill"
                      className="text-statute"
                      aria-label="Selected"
                    />
                  ) : null}
                </td>
              </tr>
            );
          }}
        />
      </div>
    </Modal>
  );
}

import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { fetchDataOwners } from "@/lib/api/data-owners";
import { updateVendor } from "@/lib/api/vendors";
import type { IDataOwner } from "@/lib/types/data-owner.type";
import { wrapError } from "@/lib/utils/request";
import { useAuth } from "@clerk/react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type EditDataOwnersModalProps = {
  open: boolean;
  closeModal: () => void;
  vendorId: string;
  currentOwners: IDataOwner[];
  onUpdated?: () => void;
};

function OwnerListItem({
  owner,
  actionLabel,
  onAction,
}: {
  owner: IDataOwner;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-hairline px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{owner.name}</p>
        <p className="truncate text-xs text-text-secondary">{owner.email}</p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}

export function EditDataOwnersModal({
  open,
  closeModal,
  vendorId,
  currentOwners,
  onUpdated,
}: EditDataOwnersModalProps) {
  const { getToken } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [ownerLookup, setOwnerLookup] = useState<Record<string, IDataOwner>>({});

  useEffect(() => {
    if (open) {
      const initialLookup = Object.fromEntries(
        currentOwners.map((owner) => [owner._id, owner]),
      );
      setOwnerLookup(initialLookup);
      setSelectedIds(currentOwners.map((owner) => owner._id));
      setSearch("");
    }
  }, [open, currentOwners]);

  const ownersQuery = useQuery({
    enabled: open,
    queryKey: ["data-owners", "transfer-list", search],
    queryFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      return fetchDataOwners(token, { query: search || undefined, limit: 50 });
    }),
  });

  useEffect(() => {
    const docs = ownersQuery.data?.docs ?? [];
    if (docs.length === 0) return;

    setOwnerLookup((current) => {
      const next = { ...current };
      docs.forEach((owner) => {
        next[owner._id] = owner;
      });
      return next;
    });
  }, [ownersQuery.data?.docs]);

  const selectedOwners = useMemo(
    () => selectedIds
      .map((id) => ownerLookup[id])
      .filter(Boolean) as IDataOwner[],
    [ownerLookup, selectedIds],
  );

  const availableOwners = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    return (ownersQuery.data?.docs ?? []).filter((owner) => !selectedSet.has(owner._id));
  }, [ownersQuery.data?.docs, selectedIds]);

  const initialIds = useMemo(
    () => currentOwners.map((owner) => owner._id).sort().join(","),
    [currentOwners],
  );
  const nextIds = useMemo(
    () => [...selectedIds].sort().join(","),
    [selectedIds],
  );
  const isUnchanged = initialIds === nextIds;

  const updateMutation = useMutation({
    mutationFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");

      await updateVendor(token, vendorId, {
        dataOwners: selectedIds,
      });
    }),
    onSuccess: () => {
      toast.success("Data owners updated");
      closeModal();
      onUpdated?.();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to update data owners");
    },
  });

  const addOwner = (owner: IDataOwner) => {
    setOwnerLookup((current) => ({ ...current, [owner._id]: owner }));
    setSelectedIds((current) => [...current, owner._id]);
  };

  const removeOwner = (ownerId: string) => {
    setSelectedIds((current) => current.filter((id) => id !== ownerId));
  };

  return (
    <Modal
      open={open}
      closeModal={closeModal}
      title="Edit data owners"
      size="5xl"
      renderActions={() => (
        <Button
          disabled={isUnchanged || updateMutation.isPending}
          loading={updateMutation.isPending}
          onClick={() => updateMutation.mutate()}
        >
          Save changes
        </Button>
      )}
    >
      <div className="space-y-6 p-6">
        <p className="text-sm text-text-secondary">
          Move owners between the current assignment and your organization list.
          Changes are saved when you submit.
        </p>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-ink">Current data owners</h3>
            {selectedOwners.length === 0 ? (
              <div className="rounded-xl border border-dashed border-hairline px-4 py-8 text-center text-sm text-text-secondary">
                No data owners assigned yet.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedOwners.map((owner) => (
                  <OwnerListItem
                    key={owner._id}
                    owner={owner}
                    actionLabel="Remove"
                    onAction={() => removeOwner(owner._id)}
                  />
                ))}
              </div>
            )}
          </section>

          <div className="hidden flex-col items-center justify-center gap-2 lg:flex">
            <ArrowLeftIcon size={18} className="text-text-secondary" aria-hidden />
            <ArrowRightIcon size={18} className="text-text-secondary" aria-hidden />
          </div>

          <section className="space-y-4">
            <h3 className="text-sm font-medium text-ink">Available organization owners</h3>
            <div className="relative">
              <MagnifyingGlassIcon
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search data owners..."
                aria-label="Search data owners"
                className="w-full rounded-lg border border-hairline bg-white px-10 py-3 text-sm outline-none focus:border-statute"
              />
            </div>
            {ownersQuery.isPending ? (
              <p className="text-sm text-text-secondary">Loading owners...</p>
            ) : availableOwners.length === 0 ? (
              <div className="rounded-xl border border-dashed border-hairline px-4 py-8 text-center text-sm text-text-secondary">
                No available owners found.
              </div>
            ) : (
              <div className="space-y-3">
                {availableOwners.map((owner) => (
                  <OwnerListItem
                    key={owner._id}
                    owner={owner}
                    actionLabel="Add"
                    onAction={() => addOwner(owner)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </Modal>
  );
}

import { Button } from "@/components/ui/button";
import TextInput from "@/components/form/input";
import { fetchDataOwners, createDataOwner } from "@/lib/api/data-owners";
import type { IDataOwner } from "@/lib/types/data-owner.type";
import { wrapError } from "@/lib/utils/request";
import { useAuth } from "@clerk/react";
import { MagnifyingGlassIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type DataOwnerPickerProps = {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export function DataOwnerPicker({ selectedIds, onChange }: DataOwnerPickerProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newOwner, setNewOwner] = useState({ name: "", email: "", role: "" });
  const [ownerCache, setOwnerCache] = useState<Record<string, IDataOwner>>({});

  const ownersQuery = useQuery({
    queryKey: ["data-owners", search],
    queryFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      return fetchDataOwners(token, { query: search || undefined, limit: 20 });
    }),
  });

  const createMutation = useMutation({
    mutationFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      return createDataOwner(token, {
        name: newOwner.name.trim(),
        email: newOwner.email.trim(),
        role: newOwner.role.trim() || undefined,
      });
    }),
    onSuccess: (owner) => {
      setOwnerCache((current) => ({ ...current, [owner._id]: owner }));
      onChange([...selectedIds, owner._id]);
      setNewOwner({ name: "", email: "", role: "" });
      setShowCreate(false);
      queryClient.invalidateQueries({ queryKey: ["data-owners"] });
      toast.success("Data owner created and assigned");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const owners = ownersQuery.data?.docs ?? [];

  const ownerLookup = useMemo(() => {
    const lookup = { ...ownerCache };
    owners.forEach((owner) => {
      lookup[owner._id] = owner;
    });
    return lookup;
  }, [ownerCache, owners]);

  const selectedOwners = selectedIds
    .map((id) => ownerLookup[id])
    .filter(Boolean) as IDataOwner[];

  const toggleOwner = (owner: IDataOwner) => {
    setOwnerCache((current) => ({ ...current, [owner._id]: owner }));

    if (selectedIds.includes(owner._id)) {
      onChange(selectedIds.filter((ownerId) => ownerId !== owner._id));
      return;
    }
    onChange([...selectedIds, owner._id]);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-ink">Data owners</label>
        <p className="text-sm text-text-secondary">
          Assign internal owners responsible for this vendor. Leaving this empty will flag
          the vendor as having no owner assigned.
        </p>
      </div>

      {selectedOwners.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {selectedOwners.map((owner) => (
            <span
              key={owner._id}
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-sm"
            >
              {owner.name}
              <button
                type="button"
                onClick={() => toggleOwner(owner)}
                className="text-text-secondary hover:text-ink"
                aria-label={`Remove ${owner.name}`}
              >
                <XIcon size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <MagnifyingGlassIcon
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search existing data owners..."
          className="w-full rounded-lg border border-hairline bg-white px-10 py-3 text-sm outline-none focus:border-statute"
        />
      </div>

      <div className="space-y-3">
        {owners.map((owner) => {
          const selected = selectedIds.includes(owner._id);
          return (
            <button
              key={owner._id}
              type="button"
              onClick={() => toggleOwner(owner)}
              className={`flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left transition-colors ${
                selected
                  ? "border-statute bg-statute/5"
                  : "border-hairline hover:bg-paper-raised"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-ink">{owner.name}</p>
                <p className="text-sm text-text-secondary">{owner.email}</p>
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {selected ? "Selected" : "Select"}
              </span>
            </button>
          );
        })}
        {!ownersQuery.isPending && owners.length === 0 && (
          <p className="text-sm text-text-secondary">No data owners found.</p>
        )}
      </div>

      {!showCreate ? (
        <Button type="button" variant="outline" onClick={() => setShowCreate(true)}>
          <PlusIcon size={18} />
          Create new data owner
        </Button>
      ) : (
        <div className="space-y-6 rounded-xl border border-hairline bg-white p-6">
          <p className="text-sm font-medium text-ink">New data owner</p>
          <div className="grid gap-6 sm:grid-cols-2">
            <TextInput
              id="owner-name"
              label="Name"
              required
              values={{ "owner-name": newOwner.name }}
              handleChange={(e) => setNewOwner({ ...newOwner, name: e.target.value })}
            />
            <TextInput
              id="owner-email"
              label="Email"
              type="email"
              required
              values={{ "owner-email": newOwner.email }}
              handleChange={(e) => setNewOwner({ ...newOwner, email: e.target.value })}
            />
            <TextInput
              id="owner-role"
              label="Role"
              values={{ "owner-role": newOwner.role }}
              handleChange={(e) => setNewOwner({ ...newOwner, role: e.target.value })}
            />
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              loading={createMutation.isPending}
              disabled={!newOwner.name.trim() || !newOwner.email.trim()}
              onClick={() => createMutation.mutate()}
            >
              Create & assign
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

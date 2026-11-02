import TextInput from "@/components/form/input";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { updateVendor } from "@/lib/api/vendors";
import { SubprocessorSourceTag } from "@/components/vendors/subprocessor-source-tag";
import type { ISubprocessor } from "@/lib/types/vendor.type";
import { wrapError } from "@/lib/utils/request";
import { useAuth } from "@clerk/react";
import { TrashIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type EditSubprocessorsModalProps = {
  open: boolean;
  closeModal: () => void;
  vendorId: string;
  subprocessors: ISubprocessor[];
  onUpdated?: () => void;
};

type EditableSubprocessor = {
  name: string;
  region: string;
};

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function buildEditableList(subprocessors: ISubprocessor[]): EditableSubprocessor[] {
  return subprocessors
    .filter((entry) => entry.source === "Org")
    .map((entry) => ({
      name: entry.name,
      region: entry.region ?? "",
    }));
}

function validateEditableList(entries: EditableSubprocessor[]): string | null {
  const seen = new Set<string>();

  for (const entry of entries) {
    const name = entry.name.trim();
    if (!name) {
      return "Subprocessor name is required.";
    }

    const key = normalizeName(name);
    if (seen.has(key)) {
      return `Duplicate subprocessor name: ${name}`;
    }
    seen.add(key);
  }

  return null;
}

export function EditSubprocessorsModal({
  open,
  closeModal,
  vendorId,
  subprocessors,
  onUpdated,
}: EditSubprocessorsModalProps) {
  const { getToken } = useAuth();
  const [orgSubprocessors, setOrgSubprocessors] = useState<EditableSubprocessor[]>([]);
  const [newName, setNewName] = useState("");
  const [newRegion, setNewRegion] = useState("");

  useEffect(() => {
    if (open) {
      setOrgSubprocessors(buildEditableList(subprocessors));
      setNewName("");
      setNewRegion("");
    }
  }, [open, subprocessors]);

  const detectedSubprocessors = useMemo(
    () => subprocessors.filter((entry) => entry.source === "Global"),
    [subprocessors],
  );

  const initialPayload = useMemo(
    () => buildEditableList(subprocessors)
      .map((entry) => ({
        name: entry.name.trim(),
        region: entry.region.trim() || undefined,
      })),
    [subprocessors],
  );

  const nextPayload = useMemo(
    () => orgSubprocessors
      .map((entry) => ({
        name: entry.name.trim(),
        region: entry.region.trim() || undefined,
      }))
      .filter((entry) => entry.name),
    [orgSubprocessors],
  );

  const validationError = useMemo(
    () => validateEditableList(orgSubprocessors),
    [orgSubprocessors],
  );

  const isUnchanged = useMemo(
    () => JSON.stringify(initialPayload) === JSON.stringify(nextPayload),
    [initialPayload, nextPayload],
  );

  const updateMutation = useMutation({
    mutationFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");

      const error = validateEditableList(orgSubprocessors);
      if (error) throw new Error(error);

      await updateVendor(token, vendorId, {
        customSubprocessors: nextPayload,
      });
    }),
    onSuccess: () => {
      toast.success("Subprocessors updated");
      closeModal();
      onUpdated?.();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to update subprocessors");
    },
  });

  const removeSubprocessor = (index: number) => {
    setOrgSubprocessors((current) => current.filter((_, i) => i !== index));
  };

  const addSubprocessor = () => {
    const name = newName.trim();
    if (!name) {
      toast.error("Enter a subprocessor name before adding.");
      return;
    }

    const duplicate = orgSubprocessors.some(
      (entry) => normalizeName(entry.name) === normalizeName(name),
    );
    if (duplicate) {
      toast.error("That subprocessor is already in your list.");
      return;
    }

    setOrgSubprocessors((current) => [
      ...current,
      { name, region: newRegion.trim() },
    ]);
    setNewName("");
    setNewRegion("");
  };

  return (
    <Modal
      open={open}
      closeModal={closeModal}
      title="Edit subprocessors"
      size="4xl"
      renderActions={() => (
        <Button
          disabled={Boolean(validationError) || isUnchanged || updateMutation.isPending}
          loading={updateMutation.isPending}
          onClick={() => updateMutation.mutate()}
        >
          Save changes
        </Button>
      )}
    >
      <div className="space-y-8 p-6">
        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-ink">Detected subprocessors</h3>
            <p className="text-sm text-text-secondary">
              These entries come from monitoring and cannot be removed here.
            </p>
          </div>
          {detectedSubprocessors.length === 0 ? (
            <div className="rounded-xl border border-dashed border-hairline px-4 py-8 text-center text-sm text-text-secondary">
              No detected subprocessors for this vendor.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-hairline">
              {detectedSubprocessors.map((entry) => (
                <li
                  key={`detected-${entry.name}`}
                  className="flex items-start justify-between gap-4 px-4 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{entry.name}</p>
                    {entry.region && (
                      <p className="mt-1 text-xs text-text-secondary">{entry.region}</p>
                    )}
                  </div>
                  <SubprocessorSourceTag source={entry.source} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4 border-t border-hairline pt-8">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-ink">Added by your organization</h3>
            <p className="text-sm text-text-secondary">
              Remove existing entries or add new ones below.
            </p>
          </div>

          {orgSubprocessors.length === 0 ? (
            <div className="rounded-xl border border-dashed border-hairline px-4 py-8 text-center text-sm text-text-secondary">
              No organization-added subprocessors yet.
            </div>
          ) : (
            <div className="space-y-3">
              {orgSubprocessors.map((entry, index) => (
                <div
                  key={`org-subprocessor-${index}`}
                  className="flex items-start justify-between gap-4 rounded-xl border border-hairline px-4 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{entry.name}</p>
                    {entry.region && (
                      <p className="mt-1 text-xs text-text-secondary">{entry.region}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSubprocessor(index)}
                  >
                    <TrashIcon size={16} />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-hairline bg-white p-6 space-y-6">
            <p className="text-sm font-medium text-ink">Add subprocessor</p>
            <div className="grid gap-6 sm:grid-cols-2">
              <TextInput
                id="new-subprocessor-name"
                label="Name"
                required
                values={{ "new-subprocessor-name": newName }}
                handleChange={(e) => setNewName(e.target.value)}
              />
              <TextInput
                id="new-subprocessor-region"
                label="Region (optional)"
                values={{ "new-subprocessor-region": newRegion }}
                handleChange={(e) => setNewRegion(e.target.value)}
              />
            </div>
            <Button type="button" variant="outline" onClick={addSubprocessor}>
              + Add to list
            </Button>
          </div>
        </section>

        {validationError && (
          <p className="text-sm text-red-600">{validationError}</p>
        )}
      </div>
    </Modal>
  );
}

import TextInput from "@/components/form/input";
import { ImageUploadField } from "@/components/form/image-upload-field";
import SelectInput from "@/components/form/select";
import TextArea from "@/components/form/text-area";
import TagInput from "@/components/ui/tag-input";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { HostingLocationsField } from "@/components/vendors/hosting-locations-field";
import { updateVendor } from "@/lib/api/vendors";
import { RISK_TIER_OPTIONS, VENDOR_CATEGORY_OPTIONS } from "@/lib/constants/vendor";
import type {
  IHostingLocation,
  IVendor,
  RiskTier,
  VendorCategory,
} from "@/lib/types/vendor.type";
import { wrapError } from "@/lib/utils/request";
import { useAuth } from "@clerk/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type UpdateVendorModalProps = {
  open: boolean;
  closeModal: () => void;
  vendor: IVendor;
  onUpdated?: () => void;
};

type FormState = {
  name: string;
  logoUrl: string;
  notes: string;
  category: VendorCategory;
  customCategoryLabel: string;
  hostingLocations: IHostingLocation[];
  dataScopeTags: string[];
  riskTier: RiskTier;
};

function buildInitialState(vendor: IVendor): FormState {
  return {
    name: vendor.name,
    logoUrl: vendor.logoUrl ?? "",
    notes: vendor.notes ?? "",
    category: vendor.category,
    customCategoryLabel: vendor.customCategoryLabel ?? "",
    hostingLocations: vendor.hostingLocations.length > 0
      ? vendor.hostingLocations.map((location) => ({ ...location }))
      : [{ region: "", jurisdiction: "" }],
    dataScopeTags: [...vendor.dataScopeTags],
    riskTier: vendor.riskTier,
  };
}

function getValidHostingLocations(locations: IHostingLocation[]) {
  return locations.filter(
    (location) => location.region.trim() && location.jurisdiction.trim(),
  );
}

function validateForm(state: FormState): string | null {
  if (!state.name.trim()) return "Vendor name is required.";
  if (!state.category) return "Category is required.";
  if (!state.riskTier) return "Risk tier is required.";
  if (state.category === "Other" && !state.customCategoryLabel.trim()) {
    return "Custom category label is required when category is Other.";
  }
  if (getValidHostingLocations(state.hostingLocations).length === 0) {
    return "At least one hosting location is required.";
  }
  if (state.dataScopeTags.length === 0) {
    return "At least one data scope tag is required.";
  }
  return null;
}

export function UpdateVendorModal({
  open,
  closeModal,
  vendor,
  onUpdated,
}: UpdateVendorModalProps) {
  const { getToken } = useAuth();
  const [form, setForm] = useState<FormState>(() => buildInitialState(vendor));

  useEffect(() => {
    if (open) {
      setForm(buildInitialState(vendor));
    }
  }, [open, vendor]);

  const validationError = useMemo(() => validateForm(form), [form]);

  const isUnchanged = useMemo(() => {
    const initial = buildInitialState(vendor);
    return JSON.stringify(form) === JSON.stringify(initial);
  }, [form, vendor]);

  const updateMutation = useMutation({
    mutationFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");

      const error = validateForm(form);
      if (error) throw new Error(error);

      await updateVendor(token, vendor._id, {
        overview: {
          name: form.name.trim(),
          logoUrl: form.logoUrl.trim() || null,
          notes: form.notes.trim() || undefined,
          category: form.category,
          customCategoryLabel: form.category === "Other"
            ? form.customCategoryLabel.trim()
            : undefined,
          hostingLocations: getValidHostingLocations(form.hostingLocations),
          riskTier: form.riskTier,
          dataScopeTags: form.dataScopeTags,
        },
      });
    }),
    onSuccess: () => {
      toast.success("Vendor updated");
      closeModal();
      onUpdated?.();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to update vendor");
    },
  });

  const patchForm = (patch: Partial<FormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  return (
    <Modal
      open={open}
      closeModal={closeModal}
      title="Update vendor"
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
        <TextInput
          id="vendor-name"
          label="Vendor name"
          placeholder="e.g. Acme Analytics"
          required
          values={{ "vendor-name": form.name }}
          handleChange={(e) => patchForm({ name: e.target.value })}
        />

        <ImageUploadField
          id="vendor-logo"
          label="Vendor logo"
          value={form.logoUrl}
          onChange={(logoUrl) => patchForm({ logoUrl })}
          emptyLabel="Upload a logo (optional)"
          helperText="PNG, JPG, WEBP, or SVG up to 2MB."
        />

        <div className="grid gap-8 sm:grid-cols-2">
          <SelectInput
            id="vendor-category"
            label="Category"
            required
            placeholder="Select a category"
            options={VENDOR_CATEGORY_OPTIONS}
            values={{ "vendor-category": form.category }}
            handleChange={(e) => patchForm({
              category: e.target.value as VendorCategory,
            })}
          />

          <SelectInput
            id="vendor-risk-tier"
            label="Risk tier"
            required
            placeholder="Select risk tier"
            options={[...RISK_TIER_OPTIONS]}
            values={{ "vendor-risk-tier": form.riskTier }}
            handleChange={(e) => patchForm({
              riskTier: e.target.value as RiskTier,
            })}
          />
        </div>

        {form.category === "Other" && (
          <TextInput
            id="vendor-custom-category"
            label="Custom category label"
            placeholder="Describe the category"
            required
            values={{ "vendor-custom-category": form.customCategoryLabel }}
            handleChange={(e) => patchForm({ customCategoryLabel: e.target.value })}
          />
        )}

        <HostingLocationsField
          locations={form.hostingLocations}
          onChange={(hostingLocations) => patchForm({ hostingLocations })}
        />

        <TagInput
          id="vendor-data-scope-tags"
          label="Data scope tags"
          placeholder="Add a tag and press Enter"
          required
          values={{ "vendor-data-scope-tags": form.dataScopeTags }}
          setFieldValue={(_, value) => patchForm({ dataScopeTags: value })}
          setFieldTouched={() => {}}
        />

        <TextArea
          id="vendor-notes"
          label="Notes"
          placeholder="Any additional notes for your own reference..."
          rows={4}
          values={{ "vendor-notes": form.notes }}
          handleChange={(e) => patchForm({ notes: e.target.value })}
        />
        <p className="-mt-4 text-sm text-text-secondary">
          Optional. Private to your organization — not shown on your trust page.
        </p>

        {validationError && (
          <p className="text-sm text-red-600">{validationError}</p>
        )}
      </div>
    </Modal>
  );
}

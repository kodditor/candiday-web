import TextInput from "@/components/form/input";
import { ImageUploadField } from "@/components/form/image-upload-field";
import SelectInput from "@/components/form/select";
import TextArea from "@/components/form/text-area";
import TagInput from "@/components/ui/tag-input";
import { HostingLocationsField } from "@/components/vendors/hosting-locations-field";
import { RISK_TIER_OPTIONS, VENDOR_CATEGORY_OPTIONS } from "@/lib/constants/vendor";
import type { CustomVendorWizardState, RiskTier } from "@/lib/types/vendor.type";

type Step2CoreDetailsProps = {
  state: CustomVendorWizardState;
  onChange: (patch: Partial<CustomVendorWizardState>) => void;
};

export function Step2CoreDetails({ state, onChange }: Step2CoreDetailsProps) {
  return (
    <div className="space-y-12">
      <div className="space-y-3">
        <h2 className="font-display text-2xl font-bold text-ink">Core details</h2>
        <p className="text-sm text-text-secondary">
          Tell us about this vendor and where your data is processed.
        </p>
      </div>

      <div className="space-y-8">
        <TextInput
          id="name"
          label="Vendor name"
          placeholder="e.g. Acme Analytics"
          required
          values={{ name: state.name }}
          handleChange={(e) => onChange({ name: e.target.value })}
        />

        <ImageUploadField
          id="logoUrl"
          label="Vendor logo"
          value={state.logoUrl}
          onChange={(logoUrl) => onChange({ logoUrl })}
          emptyLabel="Upload a logo (optional)"
          helperText="PNG, JPG, WEBP, or SVG up to 2MB. Shown in your vendor list and detail view."
        />

        <div className="grid gap-8 sm:grid-cols-2">
          <SelectInput
            id="category"
            label="Category"
            required
            placeholder="Select a category"
            options={VENDOR_CATEGORY_OPTIONS}
            values={{ category: state.category ?? "" }}
            handleChange={(e) => onChange({
              category: e.target.value as CustomVendorWizardState["category"],
            })}
          />

          <SelectInput
            id="riskTier"
            label="Risk tier"
            required
            placeholder="Select risk tier"
            options={[...RISK_TIER_OPTIONS]}
            values={{ riskTier: state.riskTier }}
            handleChange={(e) => onChange({
              riskTier: e.target.value as RiskTier,
            })}
          />
        </div>

        {state.category === "Other" && (
          <TextInput
            id="customCategoryLabel"
            label="Custom category label"
            placeholder="Describe the category"
            required
            values={{ customCategoryLabel: state.customCategoryLabel ?? "" }}
            handleChange={(e) => onChange({ customCategoryLabel: e.target.value })}
          />
        )}

        <HostingLocationsField
          locations={state.hostingLocations}
          onChange={(hostingLocations) => onChange({ hostingLocations })}
        />

        <TagInput
          id="dataScopeTags"
          label="Data scope tags"
          placeholder="Add a tag and press Enter"
          required
          values={{ dataScopeTags: state.dataScopeTags }}
          setFieldValue={(_, value) => onChange({ dataScopeTags: value })}
          setFieldTouched={() => {}}
        />
        <p className="text-sm text-text-secondary -mt-4">
          Suggested: Customer PII, Employee Records, Payment Data, Health Data,
          Marketing/Lead Data, Support Tickets, Analytics/Usage Data
        </p>

        <TextArea
          id="notes"
          label="Notes"
          placeholder="Any additional notes for your own reference..."
          rows={4}
          values={{ notes: state.notes }}
          handleChange={(e) => onChange({ notes: e.target.value })}
        />
        <p className="text-sm text-text-secondary -mt-4">
          Optional. Private to your organization — not shown on your trust page.
        </p>
      </div>
    </div>
  );
}

export function validateStep2(state: CustomVendorWizardState): string | null {
  if (!state.name.trim()) return "Vendor name is required.";
  if (!state.category) return "Category is required.";
  if (!state.riskTier) return "Risk tier is required.";
  if (state.category === "Other" && !state.customCategoryLabel?.trim()) {
    return "Custom category label is required when category is Other.";
  }

  const validLocations = state.hostingLocations.filter(
    (location) => location.region.trim() && location.jurisdiction.trim(),
  );
  if (validLocations.length === 0) {
    return "At least one hosting location is required.";
  }

  if (state.dataScopeTags.length === 0) {
    return "At least one data scope tag is required.";
  }

  return null;
}

export function getValidHostingLocations(state: CustomVendorWizardState) {
  return state.hostingLocations.filter(
    (location) => location.region.trim() && location.jurisdiction.trim(),
  );
}

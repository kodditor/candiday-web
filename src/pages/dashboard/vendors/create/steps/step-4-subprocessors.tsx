import { Button } from "@/components/ui/button";
import TextInput from "@/components/form/input";
import { MonitoringSourceDocumentCard } from "@/components/vendors/monitoring-source-document-card";
import { SubprocessorSourceTag } from "@/components/vendors/subprocessor-source-tag";
import type { IGlobalVendor } from "@/lib/types/global-vendor.type";
import type { CustomVendorWizardState } from "@/lib/types/vendor.type";
import { TrashIcon } from "@phosphor-icons/react";

type Step4SubprocessorsProps = {
  state: CustomVendorWizardState;
  onChange: (patch: Partial<CustomVendorWizardState>) => void;
  globalVendor?: IGlobalVendor | null;
};

function CatalogSubprocessorsSection({
  globalVendor,
}: {
  globalVendor: IGlobalVendor;
}) {
  const isPdfFormat = globalVendor.monitoringSource?.format === "PDF";

  if (isPdfFormat && globalVendor.monitoringSource) {
    return (
      <section className="space-y-4">
        <MonitoringSourceDocumentCard monitoringSource={globalVendor.monitoringSource} />
      </section>
    );
  }

  return (
    <DetectedSubprocessorsSection
      subprocessors={globalVendor.knownSubprocessors}
    />
  );
}
function DetectedSubprocessorsSection({
  subprocessors,
}: {
  subprocessors: IGlobalVendor["knownSubprocessors"];
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-ink">Detected subprocessors</h3>
        <p className="text-sm text-text-secondary">
          These entries come from catalog monitoring and cannot be edited here.
        </p>
      </div>
      {subprocessors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline px-4 py-8 text-center text-sm text-text-secondary">
          No detected subprocessors for this vendor.
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-hairline">
          {subprocessors.map((entry) => (
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
              <SubprocessorSourceTag source="Global" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function OrgSubprocessorsSection({
  state,
  onChange,
  isCatalogFlow,
}: {
  state: CustomVendorWizardState;
  onChange: (patch: Partial<CustomVendorWizardState>) => void;
  isCatalogFlow: boolean;
}) {
  const updateSubprocessor = (
    index: number,
    field: "name" | "region",
    value: string,
  ) => {
    const next = state.customSubprocessors.map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry,
    );
    onChange({ customSubprocessors: next });
  };

  const addSubprocessor = () => {
    onChange({
      customSubprocessors: [...state.customSubprocessors, { name: "", region: "" }],
    });
  };

  const removeSubprocessor = (index: number) => {
    onChange({
      customSubprocessors: state.customSubprocessors.filter((_, i) => i !== index),
    });
  };

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-ink">
          {isCatalogFlow ? "Added by your organization" : "Known subprocessors"}
        </h3>
        <p className="text-sm text-text-secondary">
          {isCatalogFlow
            ? "Optional. Add any additional subprocessors your organization tracks for this vendor."
            : "Optional. Add any subprocessors you already know about for this vendor."}
        </p>
      </div>

      {state.customSubprocessors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline bg-white px-8 py-12 text-center">
          <p className="text-sm text-text-secondary">
            No subprocessors added yet. You can skip this step or add entries below.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {state.customSubprocessors.map((entry, index) => (
            <div
              key={`subprocessor-${index}`}
              className="rounded-xl border border-hairline bg-white p-6 space-y-6"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink">Subprocessor {index + 1}</p>
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
              <div className="grid gap-6 sm:grid-cols-2">
                <TextInput
                  id={`sub-name-${index}`}
                  label="Name"
                  required
                  values={{ [`sub-name-${index}`]: entry.name }}
                  handleChange={(e) => updateSubprocessor(index, "name", e.target.value)}
                />
                <TextInput
                  id={`sub-region-${index}`}
                  label="Region (optional)"
                  values={{ [`sub-region-${index}`]: entry.region ?? "" }}
                  handleChange={(e) => updateSubprocessor(index, "region", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="outline" onClick={addSubprocessor}>
        + Add subprocessor
      </Button>
    </section>
  );
}

export function Step4Subprocessors({
  state,
  onChange,
  globalVendor,
}: Step4SubprocessorsProps) {
  const isCatalogFlow = Boolean(globalVendor);

  return (
    <div className="space-y-12">
      <div className="space-y-3">
        <h2 className="font-display text-2xl font-bold text-ink">Subprocessors</h2>
        <p className="text-sm text-text-secondary">
          {isCatalogFlow
            ? globalVendor?.monitoringSource?.format === "PDF"
              ? "Review the vendor's published subprocessor list and optionally add your own."
              : "Review detected subprocessors from the catalog and optionally add your own."
            : "Optional. Add any subprocessors you already know about for this vendor."}
        </p>
      </div>

      {isCatalogFlow && globalVendor ? (
        <div className="space-y-10">
          <CatalogSubprocessorsSection globalVendor={globalVendor} />
          <OrgSubprocessorsSection
            state={state}
            onChange={onChange}
            isCatalogFlow
          />
        </div>
      ) : (
        <OrgSubprocessorsSection
          state={state}
          onChange={onChange}
          isCatalogFlow={false}
        />
      )}
    </div>
  );
}

export function getValidSubprocessors(state: CustomVendorWizardState) {
  return state.customSubprocessors.filter((entry) => entry.name.trim());
}

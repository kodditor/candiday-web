import { Button } from "@/components/ui/button";
import { RiskChip } from "@/components/ui/risk-chip";
import { LinkedGlobalVendorLink } from "@/components/vendors/linked-global-vendor-link";
import { VendorFlagBanners } from "@/components/vendors/vendor-flag-banners";
import { VendorLogo } from "@/components/vendors/vendor-logo";
import type { IGlobalVendor } from "@/lib/types/global-vendor.type";
import type { CustomVendorWizardState } from "@/lib/types/vendor.type";
import { cn } from "@/lib/cn";
import {
  computeVendorFlags,
  deriveDefaultSccStatus,
  formatCategoryLabel,
} from "@/lib/utils/vendor";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import { getValidHostingLocations } from "./step-2-core-details";
import { getValidSubprocessors } from "./step-4-subprocessors";

type ReviewItem = {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
};

type Step6ReviewProps = {
  state: CustomVendorWizardState;
  globalVendor?: IGlobalVendor | null;
  showTrustPageSection?: boolean;
  onEdit: (step: 2 | 3 | 4 | 5) => void;
  onSubmit: () => void;
  submitting: boolean;
};

function SubprocessorList({
  subprocessors,
}: {
  subprocessors: Array<{ name: string; region?: string }>;
}) {
  if (subprocessors.length === 0) {
    return <>None</>;
  }

  return (
    <ul className="w-full divide-y divide-hairline overflow-hidden rounded-lg border border-hairline">
      {subprocessors.map((entry) => (
        <li
          key={entry.name}
          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3"
        >
          <span className="font-medium">{entry.name}</span>
          {entry.region && (
            <span className="text-text-secondary">{entry.region}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

const FULL_WIDTH_LABELS = new Set([
  "Notes",
  "Custom subprocessors",
  "Detected subprocessors",
  "Added by your organization",
  "Linked catalog vendor",
]);

export function Step6Review({
  state,
  globalVendor,
  showTrustPageSection = true,
  onEdit,
  onSubmit,
  submitting,
}: Step6ReviewProps) {
  const hostingLocations = getValidHostingLocations(state);
  const subprocessors = getValidSubprocessors(state);
  const detectedSubprocessors = globalVendor?.knownSubprocessors ?? [];
  const isCatalogFlow = Boolean(globalVendor);
  const sccStatus = state.dpa.sccStatus ?? deriveDefaultSccStatus(hostingLocations);
  const riskTier = state.riskTier;
  const flags = computeVendorFlags({
    dpaFileKey: state.dpa.fileId,
    dpaSccStatus: sccStatus,
    hostingLocations,
    dataOwnerIds: state.dataOwnerIds,
  });

  const sections: Array<{
    title: string;
    step?: 2 | 3 | 4 | 5;
    items: ReviewItem[];
  }> = [
    ...(isCatalogFlow && globalVendor
      ? [{
        title: "Linked Global Vendor",
        items: [
          {
            label: "",
            fullWidth: true,
            value: <LinkedGlobalVendorLink globalVendor={globalVendor} />,
          },
        ] satisfies ReviewItem[],
      }]
      : []),
    {
      title: "Core Details",
      step: 2 as const,
      items: [
        { label: "Name", value: state.name },
        {
          label: "Logo",
          value: state.logoUrl ? (
            <VendorLogo name={state.name} logoUrl={state.logoUrl} size="md" />
          ) : "None",
        },
        {
          label: "Category",
          value: formatCategoryLabel(state.category ?? "", state.customCategoryLabel),
        },
        {
          label: "Hosting locations",
          value: hostingLocations
            .map((location) => `${location.region} (${location.jurisdiction})`)
            .join(", "),
        },
        { label: "Data scope tags", value: state.dataScopeTags.join(", ") },
        { label: "Risk tier", value: <RiskChip tier={riskTier} /> },
        ...(state.notes.trim() ? [{
          label: "Notes",
          fullWidth: true,
          value: state.notes.trim(),
        }] : []),
      ],
    },
    {
      title: "DPA & Data Owners",
      step: 3 as const,
      items: [
        { label: "DPA uploaded", value: state.dpa.fileId ? "Yes" : "No" },
        { label: "Signed date", value: state.dpa.signedDate ? dayjs(state.dpa.signedDate).format("MMM D, YYYY") : "—" },
        { label: "Review date", value: state.dpa.reviewDate ? dayjs(state.dpa.reviewDate).format("MMM D, YYYY") : "—" },
        { label: "SCC status", value: sccStatus },
        { label: "Data owners", value: state.dataOwnerIds.length || "None assigned" },
      ],
    },
    {
      title: "Subprocessors",
      step: 4 as const,
      items: [
        ...(isCatalogFlow
          ? [{
            label: "Detected subprocessors",
            fullWidth: true,
            value: <SubprocessorList subprocessors={detectedSubprocessors} />,
          }]
          : []),
        {
          label: isCatalogFlow ? "Added by your organization" : "Custom subprocessors",
          fullWidth: true,
          value: <SubprocessorList subprocessors={subprocessors} />,
        },
      ] satisfies ReviewItem[],
    },
    ...(showTrustPageSection ? [{
      title: "Trust Page",
      step: 5 as const,
      items: [
        {
          label: "Included on trust page",
          value: state.trustPageIncluded ? "Yes" : "No",
        },
      ],
    }] : []),
  ];

  return (
    <div className="space-y-12">
      <div className="space-y-3">
        <h2 className="font-display text-2xl font-bold text-ink">Review & submit</h2>
        <p className="text-sm text-text-secondary">
          Confirm everything looks correct before creating this vendor.
        </p>
      </div>

      <VendorFlagBanners flags={flags} />

      <div className="space-y-10">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-xl border border-hairline bg-white p-8 space-y-6"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-ink">{section.title}</h3>
              {section.step ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(section.step!)}>
                  Edit
                </Button>
              ) : null}
            </div>
            <dl className="grid gap-6 sm:grid-cols-2">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    "space-y-2",
                    (item.fullWidth || FULL_WIDTH_LABELS.has(item.label)) && "sm:col-span-2",
                  )}
                >
                  <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                    {item.label}
                  </dt>
                  <dd className="text-sm text-ink">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button loading={submitting} onClick={onSubmit}>
          Create vendor
        </Button>
      </div>
    </div>
  );
}

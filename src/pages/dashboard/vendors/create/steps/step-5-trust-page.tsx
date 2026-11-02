import Switch from "@/components/ui/switch";
import type { CustomVendorWizardState } from "@/lib/types/vendor.type";
import { Link } from "@tanstack/react-router";

type Step5TrustPageProps = {
  state: CustomVendorWizardState;
  trustPageEnabled: boolean;
  onChange: (patch: Partial<CustomVendorWizardState>) => void;
};

export function Step5TrustPage({
  state,
  trustPageEnabled,
  onChange,
}: Step5TrustPageProps) {
  return (
    <div className="space-y-12">
      <div className="space-y-3">
        <h2 className="font-display text-2xl font-bold text-ink">Trust page inclusion</h2>
        <p className="text-sm text-text-secondary">
          Choose whether this vendor should appear on your public trust page when you publish.
        </p>
      </div>

      {!trustPageEnabled ? (
        <div className="rounded-xl border border-hairline bg-white px-8 py-10 space-y-4">
          <p className="text-sm font-medium text-ink">
            Trust page not enabled for your organization
          </p>
          <p className="text-sm text-text-secondary">
            Enable the public trust page in Settings to mark vendors as eligible for publishing.
            This step remains visible so your wizard flow stays consistent.
          </p>
          <Link
            to="/dashboard/trust-page"
            className="inline-flex text-sm font-medium text-statute hover:underline"
          >
            Go to trust page settings
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-hairline bg-white px-8 py-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-2 max-w-lg">
              <p className="text-sm font-medium text-ink">Include on trust page</p>
              <p className="text-sm text-text-secondary">
                This marks the vendor as eligible for your next trust page publish.
                It does not publish immediately.
              </p>
            </div>
            <Switch
              id="trustPageIncluded"
              values={{ trustPageIncluded: state.trustPageIncluded }}
              setFieldValue={(_, value) => onChange({ trustPageIncluded: Boolean(value) })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

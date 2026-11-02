import SelectInput from "@/components/form/select";
import TextInput from "@/components/form/input";
import { DataOwnerPicker } from "@/components/vendors/data-owner-picker";
import { SCC_STATUS_OPTIONS } from "@/lib/constants/vendor";
import type { CustomVendorWizardState, SccStatus } from "@/lib/types/vendor.type";
import {
  isAiExtractionEnabled,
  parseSubscriptionPlan,
} from "@/lib/utils/plan-limits";
import {
  getReviewDateMin,
  getSignedDateMax,
  validateDpaDates,
} from "@/lib/utils/dpa-dates";
import { deriveDefaultSccStatus } from "@/lib/utils/vendor";
import { DPA_PDF_ACCEPT, isValidDpaPdfFile } from "@/lib/utils/dpa-file";
import { uploadFile } from "@/lib/utils/upload";
import { useAuth } from "@clerk/react";
import { CircleNotchIcon, FileArrowUpIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { getValidHostingLocations } from "./step-2-core-details";

type Step3DpaOwnersProps = {
  state: CustomVendorWizardState;
  onChange: (patch: Partial<CustomVendorWizardState>) => void;
  plan?: string;
};

export function Step3DpaOwners({ state, onChange, plan }: Step3DpaOwnersProps) {
  const { getToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const subscriptionPlan = parseSubscriptionPlan(plan);
  const aiExtractionEnabled = isAiExtractionEnabled(subscriptionPlan);

  const defaultScc = deriveDefaultSccStatus(getValidHostingLocations(state));
  const sccStatus = state.dpa.sccStatus ?? defaultScc;
  const signedDateMax = getSignedDateMax();
  const reviewDateMin = getReviewDateMin();

  const handleFileUpload = async (file: File) => {
    if (!isValidDpaPdfFile(file)) {
      toast.error("Upload a PDF file.");
      fileInputRef.current!.value = "";
      return;
    }

    setUploading(true);

    try {
      const token = await getToken({ skipCache: true });
      const fileKey = await uploadFile(file, token, {
        type: "dpas",
        protected: true,
      });

      onChange({
        dpa: {
          ...state.dpa,
          fileId: fileKey,
          sccStatus: sccStatus,
        },
      });

      toast.success("DPA uploaded successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-16">
      <div className="space-y-3">
        <h2 className="font-display text-2xl font-bold text-ink">DPA & data owners</h2>
        <p className="text-sm text-text-secondary">
          Optional, but recommended. You can skip this step and come back later.
        </p>
      </div>

      <section className="space-y-8">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-ink">DPA details</h3>
          <p className="text-sm text-text-secondary">
            If you leave the DPA empty, this vendor will be flagged as DPA missing.
          </p>
          {!aiExtractionEnabled && (
            <p className="text-sm text-text-secondary">
              DPA upload is available on your plan. AI extraction of DPA terms requires a
              Growth or Business plan.
            </p>
          )}
        </div>

        <div className="space-y-6">
          <input
            ref={fileInputRef}
            type="file"
            accept={DPA_PDF_ACCEPT}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFileUpload(file);
            }}
          />

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-40 w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-hairline bg-white px-8 py-10 transition-colors hover:border-statute hover:bg-gray-50"
          >
            {uploading ? (
              <CircleNotchIcon size={28} className="animate-spin text-statute" />
            ) : (
              <FileArrowUpIcon size={28} className="text-text-secondary" />
            )}
            <div className="space-y-2 text-center">
              <p className="text-sm font-medium text-ink">
                {state.dpa.fileId ? "Replace DPA document" : "Upload DPA document"}
              </p>
              <p className="text-sm text-text-secondary">PDF only</p>
            </div>
          </button>

          {state.dpa.fileId && (
            <p className="text-sm text-emerald-700">
              Document uploaded. Key: {state.dpa.fileId.split("/").pop()}
            </p>
          )}

          <div className="grid gap-8 sm:grid-cols-2">
            <TextInput
              id="signedDate"
              label="Signed date"
              type="date"
              values={{ signedDate: state.dpa.signedDate ?? "" }}
              max={signedDateMax}
              handleChange={(e) => onChange({
                dpa: { ...state.dpa, signedDate: e.target.value || null },
              })}
            />
            <TextInput
              id="reviewDate"
              label="Review date"
              type="date"
              min={reviewDateMin}
              values={{ reviewDate: state.dpa.reviewDate ?? "" }}
              handleChange={(e) => onChange({
                dpa: { ...state.dpa, reviewDate: e.target.value || null },
              })}
            />
          </div>

          <SelectInput
            id="sccStatus"
            label="SCC status"
            options={[...SCC_STATUS_OPTIONS]}
            values={{ sccStatus }}
            handleChange={(e) => onChange({
              dpa: {
                ...state.dpa,
                sccStatus: e.target.value as SccStatus,
              },
            })}
          />
        </div>
      </section>

      <section className="space-y-8 border-t border-hairline pt-12">
        <DataOwnerPicker
          selectedIds={state.dataOwnerIds}
          onChange={(dataOwnerIds) => onChange({ dataOwnerIds })}
        />
      </section>
    </div>
  );
}

export function validateStep3(state: CustomVendorWizardState): string | null {
  return validateDpaDates({
    signedDate: state.dpa.signedDate,
    reviewDate: state.dpa.reviewDate,
  });
}

export function clearStep3Data(): Partial<CustomVendorWizardState> {
  return {
    dpa: {
      fileId: null,
      signedDate: null,
      reviewDate: null,
      sccStatus: null,
    },
    dataOwnerIds: [],
  };
}

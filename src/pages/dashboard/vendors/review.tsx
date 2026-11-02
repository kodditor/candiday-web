import TextInput from "@/components/form/input";
import SelectInput from "@/components/form/select";
import TextArea from "@/components/form/text-area";
import { Button } from "@/components/ui/button";
import { VendorLogo } from "@/components/vendors/vendor-logo";
import { fetchDpaAssetUrl } from "@/lib/api/assets";
import { fetchVendor, submitDpaReview } from "@/lib/api/vendors";
import { SCC_STATUS_OPTIONS } from "@/lib/constants/vendor";
import type { SccStatus } from "@/lib/types/vendor.type";
import { cn } from "@/lib/cn";
import { DPA_PDF_ACCEPT, isValidDpaPdfFile } from "@/lib/utils/dpa-file";
import {
  getReviewDateMin,
  getSignedDateMax,
  isDpaReviewDue,
  toDateInputValueFromIso,
  validateDpaDates,
} from "@/lib/utils/dpa-dates";
import { wrapError } from "@/lib/utils/request";
import { uploadFile } from "@/lib/utils/upload";
import { useAuth } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  CircleNotchIcon,
  EyeIcon,
  FileArrowUpIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DashboardVendorsRoute } from "./index";

const CARD_CLASS = "rounded-xl border border-hairline bg-white p-6";

export const DashboardVendorReviewRoute = createRoute({
  getParentRoute: () => DashboardVendorsRoute,
  path: "/$id/review",
  component: VendorReviewPage,
});

type ReviewFormState = {
  fileKey: string | null;
  signedDate: string | null;
  reviewDate: string | null;
  sccStatus: SccStatus;
  notes: string;
};

function buildInitialFormState(vendor: {
  dpa: {
    fileKey: string | null;
    signedDate: string | null;
    reviewDate: string | null;
    sccStatus: SccStatus;
  };
  notes?: string;
}): ReviewFormState {
  return {
    fileKey: vendor.dpa.fileKey,
    signedDate: toDateInputValueFromIso(vendor.dpa.signedDate),
    reviewDate: toDateInputValueFromIso(vendor.dpa.reviewDate),
    sccStatus: vendor.dpa.sccStatus,
    notes: vendor.notes ?? "",
  };
}

export function VendorReviewPage() {
  const { id } = DashboardVendorReviewRoute.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<ReviewFormState | null>(null);

  const vendorQuery = useQuery({
    queryKey: ["vendor", id],
    queryFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      return fetchVendor(token, id);
    }),
  });

  const vendor = vendorQuery.data?.vendor;

  useEffect(() => {
    if (vendor) {
      setForm(buildInitialFormState(vendor));
    }
  }, [vendor?._id]);

  const submitMutation = useMutation({
    mutationFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      if (!form) throw new Error("Form not initialized");

      const payload = {
        dpa: {
          signedDate: form.signedDate,
          reviewDate: form.reviewDate,
          sccStatus: form.sccStatus,
          ...(form.fileKey !== vendor?.dpa.fileKey ? { fileKey: form.fileKey } : {}),
        },
        notes: form.notes,
      };

      return submitDpaReview(token, id, payload);
    }),
    onSuccess: async (data) => {
      queryClient.setQueryData(["vendor", id], data);
      await queryClient.invalidateQueries({ queryKey: ["vendor", id] });
      toast.success("DPA review submitted");
      void navigate({ to: "/dashboard/vendors/$id", params: { id } });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to submit review");
    },
  });

  const viewDpaMutation = useMutation({
    mutationFn: async (fileKey: string) => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      return fetchDpaAssetUrl(token, fileKey);
    }),
    onSuccess: ({ url }) => {
      window.open(url, "_blank", "noopener,noreferrer");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to view DPA");
    },
  });

  const handleFileUpload = async (file: File) => {
    if (!isValidDpaPdfFile(file)) {
      toast.error("Upload a PDF file.");
      return;
    }

    setUploading(true);

    try {
      const token = await getToken({ skipCache: true });
      const fileKey = await uploadFile(file, token, {
        type: "dpas",
        protected: true,
      });

      setForm((current) => current ? { ...current, fileKey } : current);
      toast.success("DPA uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = () => {
    if (!form) return;

    if (!form.reviewDate) {
      toast.error("Next review date is required.");
      return;
    }

    const validationError = validateDpaDates({
      signedDate: form.signedDate,
      reviewDate: form.reviewDate,
    });

    if (validationError) {
      toast.error(validationError);
      return;
    }

    submitMutation.mutate();
  };

  if (vendorQuery.isPending || !form) {
    return (
      <div className="grid min-h-64 place-items-center">
        <CircleNotchIcon size={28} className="animate-spin text-statute" />
      </div>
    );
  }

  if (vendorQuery.isError || !vendor) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">Unable to load vendor.</p>
        <Link to="/dashboard/vendors" className="text-sm text-statute hover:underline">
          Back to vendors
        </Link>
      </div>
    );
  }

  if (!vendor.dpa.fileKey && !form.fileKey) {
    return (
      <div className="space-y-4">
        <Link
          to="/dashboard/vendors/$id"
          params={{ id }}
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-ink"
        >
          <ArrowLeftIcon size={16} />
          Back to vendor
        </Link>
        <p className="text-sm text-text-secondary">
          This vendor has no DPA on file. Upload a DPA from the vendor page before reviewing.
        </p>
      </div>
    );
  }

  const reviewDue = isDpaReviewDue(vendor.dpa.reviewDate);
  const signedDateMax = getSignedDateMax();
  const reviewDateMin = getReviewDateMin();

  return (
    <div className="space-y-10">
      <Link
        to="/dashboard/vendors/$id"
        params={{ id }}
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-ink"
      >
        <ArrowLeftIcon size={16} />
        Back to vendor
      </Link>

      <div className="flex flex-wrap items-center gap-4">
        <VendorLogo name={vendor.name} logoUrl={vendor.logoUrl} size="md" />
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Review DPA
          </h1>
          <p className="text-sm text-text-secondary">{vendor.name}</p>
        </div>
      </div>

      {reviewDue && vendor.dpa.reviewDate && (
        <div className="flex gap-3 rounded-lg border border-amber-300/80 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
          <WarningIcon size={18} className="mt-0.5 shrink-0" weight="fill" />
          <p>
            Review was due on {dayjs(vendor.dpa.reviewDate).format("DD MMM YYYY")}.
            Set a new next review date before submitting.
          </p>
        </div>
      )}

      <div className="mx-auto max-w-2xl space-y-6">
        <section className={CARD_CLASS}>
          <h2 className="mb-6 text-lg font-semibold text-ink">DPA document</h2>

          <div className="space-y-4">
            {form.fileKey && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-hairline bg-paper px-4 py-3">
                <p className="text-sm text-ink">
                  {form.fileKey.split("/").pop()}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-md"
                  disabled={viewDpaMutation.isPending}
                  onClick={() => {
                    if (form.fileKey) {
                      viewDpaMutation.mutate(form.fileKey);
                    }
                  }}
                >
                  {viewDpaMutation.isPending ? (
                    <CircleNotchIcon className="animate-spin" />
                  ) : (
                    <EyeIcon />
                  )}
                  View
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={DPA_PDF_ACCEPT}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void handleFileUpload(file);
              }}
            />

            <Button
              type="button"
              variant="outline"
              className="rounded-md"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <CircleNotchIcon className="animate-spin" />
              ) : (
                <FileArrowUpIcon />
              )}
              Replace DPA
            </Button>
          </div>
        </section>

        <section className={CARD_CLASS}>
          <h2 className="mb-6 text-lg font-semibold text-ink">Review details</h2>

          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <TextInput
                id="signedDate"
                label="Signed date"
                type="date"
                max={signedDateMax}
                values={{ signedDate: form.signedDate ?? "" }}
                handleChange={(event) => setForm({
                  ...form,
                  signedDate: event.target.value || null,
                })}
              />
              <TextInput
                id="reviewDate"
                label="Next review date"
                type="date"
                min={reviewDateMin}
                values={{ reviewDate: form.reviewDate ?? "" }}
                handleChange={(event) => setForm({
                  ...form,
                  reviewDate: event.target.value || null,
                })}
              />
            </div>

            <SelectInput
              id="sccStatus"
              label="SCC status"
              options={[...SCC_STATUS_OPTIONS]}
              values={{ sccStatus: form.sccStatus }}
              handleChange={(event) => setForm({
                ...form,
                sccStatus: event.target.value as SccStatus,
              })}
            />
          </div>
        </section>

        <section className={CARD_CLASS}>
          <h2 className="mb-6 text-lg font-semibold text-ink">Notes</h2>
          <TextArea
            id="notes"
            placeholder="Add notes about this vendor..."
            rows={5}
            values={{ notes: form.notes }}
            handleChange={(event) => setForm({
              ...form,
              notes: event.target.value,
            })}
          />
        </section>

        <div className="flex justify-end border-t border-hairline pt-6">
          <Button
            type="button"
            className={cn("rounded-md")}
            disabled={submitMutation.isPending}
            onClick={handleSubmit}
          >
            {submitMutation.isPending ? (
              <CircleNotchIcon className="animate-spin" />
            ) : null}
            Submit review
          </Button>
        </div>
      </div>
    </div>
  );
}

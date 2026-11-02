import { Button } from "@/components/ui/button";
import { RiskChip } from "@/components/ui/risk-chip";
import { Pill } from "@/components/ui/pill";
import Switch from "@/components/ui/switch";
import { DataOwnerViewModal } from "@/components/vendors/data-owner-view-modal";
import { EditDataOwnersModal } from "@/components/vendors/edit-data-owners-modal";
import { EditSubprocessorsModal } from "@/components/vendors/edit-subprocessors-modal";
import { LinkedGlobalVendorLink } from "@/components/vendors/linked-global-vendor-link";
import { UpdateVendorModal } from "@/components/vendors/update-vendor-modal";
import { VendorLogo } from "@/components/vendors/vendor-logo";
import { fetchGlobalVendor } from "@/lib/api/global-vendors";
import { updateVendor } from "@/lib/api/vendors";
import { fetchDpaAssetUrl } from "@/lib/api/assets";
import { useUser } from "@/lib/context/user-context";
import type { IDataOwner } from "@/lib/types/data-owner.type";
import type { ISubprocessor, IVendor, IDpaAiSourcedField } from "@/lib/types/vendor.type";
import { cn } from "@/lib/cn";
import {
  isAiExtractionEnabled,
  parseSubscriptionPlan,
} from "@/lib/utils/plan-limits";
import { isDpaReviewDue } from "@/lib/utils/dpa-dates";
import { wrapError } from "@/lib/utils/request";
import { DPA_PDF_ACCEPT, isValidDpaPdfFile } from "@/lib/utils/dpa-file";
import { uploadFile } from "@/lib/utils/upload";
import { formatCategoryLabel } from "@/lib/utils/vendor";
import { useAuth } from "@clerk/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  BooksIcon,
  CircleNotchIcon,
  ClipboardTextIcon,
  EyeIcon,
  FileArrowUpIcon,
  FileTextIcon,
  GlobeIcon,
  LockSimpleIcon,
  PencilSimpleIcon,
  ShareNetworkIcon,
  ShieldCheckIcon,
  SparkleIcon,
  UserIcon,
  UsersIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import lodash from "lodash";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type VendorContainerProps = {
  vendor: IVendor;
  dataOwners?: IDataOwner[];
  subprocessors?: ISubprocessor[];
  trustPageEnabled?: boolean;
  trustPageLayout?: "Simplified" | "Sectioned";
  onUpdated?: () => void;
};

const CARD_CLASS = "rounded-xl border border-hairline bg-white p-6";

function VendorDetailCard({
  title,
  icon: IconComponent,
  iconClassName,
  action,
  children,
}: {
  title: string;
  icon?: Icon;
  iconClassName?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={CARD_CLASS}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {IconComponent && (
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg",
                iconClassName,
              )}
            >
              <IconComponent size={18} weight="fill" />
            </span>
          )}
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function OwnerAvatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-statute/10 text-xs font-semibold text-statute">
      {initials || "?"}
    </span>
  );
}

function SubprocessorSourceTag({ source }: { source: ISubprocessor["source"] }) {
  const isDetected = source === "Global";

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium my-3",
        isDetected ? "bg-blue-50 text-blue-800" : "bg-gray-100 text-gray-700",
      )}
    >
      {isDetected ? "Detected" : "Added by you"}
    </span>
  );
}

function SourcePageBadge({ sourcePage }: { sourcePage: number | null }) {
  if (sourcePage === null) {
    return null;
  }

  return (
    <span className="ml-2 rounded bg-paper-raised px-1.5 py-0.5 text-xs text-text-secondary">
      p. {sourcePage}
    </span>
  );
}

function SourcedTextField({
  label,
  field,
}: {
  label: string;
  field?: IDpaAiSourcedField;
}) {
  if (!field?.value) {
    return null;
  }

  return (
    <div className="space-y-2">
      <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
        {label}
      </dt>
      <dd className="text-sm text-ink">
        {field.value}
        <SourcePageBadge sourcePage={field.sourcePage} />
      </dd>
    </div>
  );
}

function SourcedBooleanField({
  label,
  field,
  trueLabel = "Present",
  falseLabel = "Not present",
}: {
  label: string;
  field?: IDpaAiSourcedField<boolean>;
  trueLabel?: string;
  falseLabel?: string;
}) {
  if (field === undefined) {
    return null;
  }

  return (
    <div className="space-y-2">
      <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
        {label}
      </dt>
      <dd className="text-sm text-ink">
        {field.value ? trueLabel : falseLabel}
        <SourcePageBadge sourcePage={field.sourcePage} />
      </dd>
    </div>
  );
}

const VERDICT_RATINGS = ["Adequate with gaps", "Needs legal review", "Adequate"] as const;

function parseVerdict(verdict: string) {
  for (const rating of VERDICT_RATINGS) {
    if (verdict.toLowerCase().startsWith(rating.toLowerCase())) {
      const rationale = verdict.slice(rating.length).replace(/^[\s.:–-]+/, "").trim();
      return { rating, rationale };
    }
  }

  return { rating: verdict, rationale: "" };
}

function VerdictBadge({ rating }: { rating: string }) {
  const lower = rating.toLowerCase();
  let variant = "bg-gray-100 text-gray-800";

  if (lower === "adequate with gaps") {
    variant = "bg-amber-50 text-amber-900";
  } else if (lower === "adequate") {
    variant = "bg-emerald-50 text-emerald-800";
  } else if (lower === "needs legal review") {
    variant = "bg-red-50 text-red-800";
  }

  return (
    <span className={cn("inline-block rounded-full px-3 py-1 text-xs font-medium", variant)}>
      {rating}
    </span>
  );
}

function ControllerBriefing({
  text,
  sourcePage,
}: {
  text: string;
  sourcePage: number | null;
}) {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

  return (
    <div className="space-y-3">
      {lines.map((line) => {
        const match = line.match(/^([A-Za-z /-]+):\s*(.+)$/);

        if (match) {
          return (
            <p key={line} className="text-sm leading-relaxed text-ink">
              <span className="font-medium">{match[1]}:</span> {match[2]}
            </p>
          );
        }

        return (
          <p key={line} className="text-sm leading-relaxed text-ink">
            {line}
          </p>
        );
      })}
      <SourcePageBadge sourcePage={sourcePage} />
    </div>
  );
}

// function AiProcessingStatusBadge({
//   status,
//   error,
// }: {
//   status: IVendor["dpa"]["aiProcessingStatus"];
//   error?: string | null;
// }) {
//   const labels: Record<IVendor["dpa"]["aiProcessingStatus"], string> = {
//     Idle: "Not processed",
//     Queued: "Queued for processing",
//     Processing: "Processing…",
//     Failed: "Processing failed",
//     Completed: "Analysis complete",
//   };

//   const variants: Record<IVendor["dpa"]["aiProcessingStatus"], string> = {
//     Idle: "bg-gray-100 text-gray-700",
//     Queued: "bg-blue-50 text-blue-800",
//     Processing: "bg-amber-50 text-amber-900",
//     Failed: "bg-red-50 text-red-800",
//     Completed: "bg-emerald-50 text-emerald-800",
//   };

//   return (
//     <div className="space-y-2">
//       <span
//         className={cn(
//           "inline-flex rounded-full px-3 py-1 text-xs font-medium",
//           variants[status],
//         )}
//       >
//         {labels[status]}
//       </span>
//       {status === "Failed" && error && (
//         <p className="text-sm text-red-700">{error}</p>
//       )}
//     </div>
//   );
// }

const GATED_AI_PLACEHOLDER_FIELDS = [
  { label: "Retention period", value: "Duration of agreement plus 24 months" },
  { label: "Transfer mechanism", value: "Standard Contractual Clauses (Module 2)" },
  { label: "Breach notification", value: "Within 72 hours of becoming aware" },
  { label: "Jurisdiction", value: "EU / EEA governing law" },
] as const;

function GatedAiInsightsSection() {
  return (
    <div className="space-y-4 border-t border-hairline pt-6">
      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
        AI Insights
      </p>

      <div className="relative min-h-[22rem] overflow-hidden rounded-xl border border-hairline bg-paper/40">
        <div
          aria-hidden
          className="pointer-events-none select-none space-y-4 p-4 sm:p-5"
        >
          <div className="rounded-lg border border-hairline/70 bg-white/80 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-text-secondary/80">
              Verdict
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-xs font-medium text-emerald-800/70">
                Favorable
              </span>
              <p className="text-sm text-ink/45">
                Key clauses align with standard GDPR processor obligations.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-hairline/70 bg-white/80 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-text-secondary/80">
              Document overview
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink/40">
              The agreement defines processing scope, security measures under Article 32,
              subprocessors, international transfers, and data subject assistance obligations.
            </p>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            {GATED_AI_PLACEHOLDER_FIELDS.map((field) => (
              <div key={field.label} className="space-y-1.5">
                <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary/70">
                  {field.label}
                </dt>
                <dd className="text-sm text-ink/35">{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-b from-white/0 via-white/85 to-white" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-6 pt-16 text-center">
          <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-violet-50 text-violet-600">
            <SparkleIcon size={20} weight="fill" />
          </span>
          <p className="text-sm font-semibold text-ink text-balance">
            Unlock AI-powered DPA insights
          </p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-text-secondary text-pretty">
            Upgrade to Growth to automatically extract retention periods, transfer
            mechanisms, breach windows, and more from your uploaded DPA.
          </p>
          <Button asChild className="mt-4 rounded-md">
            <Link to="/dashboard/settings">
              <LockSimpleIcon size={16} />
              Upgrade plan
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function VendorContainer({
  vendor,
  dataOwners = [],
  subprocessors = [],
  trustPageEnabled = false,
  trustPageLayout = "Simplified",
  onUpdated,
}: VendorContainerProps) {
  const { getToken } = useAuth();
  const organization = useUser((state) => state.organization);
  const subscriptionPlan = parseSubscriptionPlan(organization?.plan);
  const aiExtractionEnabled = isAiExtractionEnabled(subscriptionPlan);
  const hasAiInsightsData = Boolean(vendor.dpa.aiExtraction || vendor.dpa.aiProcessedAt);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedOwner, setSelectedOwner] = useState<IDataOwner | null>(null);
  const [trustPageIncluded, setTrustPageIncluded] = useState(vendor.trustPage.included);
  const [overviewModalOpen, setOverviewModalOpen] = useState(false);
  const [dataOwnersModalOpen, setDataOwnersModalOpen] = useState(false);
  const [subprocessorsModalOpen, setSubprocessorsModalOpen] = useState(false);

  useEffect(() => {
    setTrustPageIncluded(vendor.trustPage.included);
  }, [vendor.trustPage.included]);

  const linkedGlobalVendorQuery = useQuery({
    enabled: Boolean(vendor.globalVendor),
    queryKey: ["global-vendor", vendor.globalVendor],
    queryFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      if (!vendor.globalVendor) throw new Error("Missing global vendor id");
      return fetchGlobalVendor(token, vendor.globalVendor);
    }),
  });

  const dpaUploadMutation = useMutation({
    mutationFn: async (file: File) => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");

      const fileKey = await uploadFile(file, token, {
        type: "dpas",
        protected: true,
      });

      await updateVendor(token, vendor._id, {
        dpa: { fileKey },
      });
    }),
    onSuccess: () => {
      toast.success("DPA uploaded");
      onUpdated?.();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to upload DPA");
    },
  });

  const viewDpaMutation = useMutation({
    mutationFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      if (!vendor.dpa.fileKey) throw new Error("No DPA on file");

      return fetchDpaAssetUrl(token, vendor.dpa.fileKey);
    }),
    onSuccess: ({ url }) => {
      window.open(url, "_blank", "noopener,noreferrer");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to view DPA");
    },
  });

  const trustPageMutation = useMutation({
    mutationFn: async (included: boolean) => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");

      await updateVendor(token, vendor._id, {
        trustPage: { included },
      });
    }),
    onSuccess: (_, included) => {
      setTrustPageIncluded(included);
      toast.success(included ? "Vendor marked for trust page" : "Vendor removed from trust page");
      onUpdated?.();
    },
    onError: (error) => {
      setTrustPageIncluded(vendor.trustPage.included);
      toast.error(error instanceof Error ? error.message : "Unable to update trust page setting");
    },
  });

  const handleDpaUpload = async (file: File) => {
    await dpaUploadMutation.mutateAsync(file);
  };

  const aiExtraction = vendor.dpa.aiExtraction;
  // const aiProcessingStatus = vendor.dpa.aiProcessingStatus ?? "Idle";
  const hasDpaFile = Boolean(vendor.dpa.fileKey);
  const reviewDue = hasDpaFile && isDpaReviewDue(vendor.dpa.reviewDate);
  const signedDateMismatch = Boolean(
    aiExtraction?.effectiveOrSignedDate?.value
    && vendor.dpa.signedDate
    && !aiExtraction.effectiveOrSignedDate.value.includes(
      dayjs(vendor.dpa.signedDate).format("YYYY"),
    ),
  );

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <VendorLogo
              name={vendor.name}
              logoUrl={vendor.logoUrl}
              size="lg"
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
                  {vendor.name}
                </h1>
                <RiskChip tier={vendor.riskTier} />
                <Pill
                  value={lodash.startCase(vendor.status ?? "Active")}
                  variantDef={{
                    Active: "bg-emerald-100 text-emerald-800",
                    Archived: "bg-gray-100 text-gray-800",
                  }}
                />
              </div>
              <p className="text-sm text-text-secondary">
                {formatCategoryLabel(vendor.category, vendor.customCategoryLabel)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasDpaFile && (
              <Button
                asChild
                variant={reviewDue ? "default" : "outline"}
                className={cn(
                  "rounded-md",
                  reviewDue && "bg-amber-600 text-white hover:bg-amber-700",
                )}
                size="sm"
              >
                <Link to="/dashboard/vendors/$id/review" params={{ id: vendor._id }}>
                  <ClipboardTextIcon size={16} />
                  Review
                </Link>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="rounded-md"
              size="sm"
              onClick={() => setOverviewModalOpen(true)}
            >
              <PencilSimpleIcon size={16} />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <VendorDetailCard
            title="Overview"
            icon={GlobeIcon}
            iconClassName="bg-blue-50 text-blue-600"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Hosting locations
                </p>
                <ul className="space-y-2 text-sm text-ink">
                  {vendor.hostingLocations.map((location) => (
                    <li key={`${location.region}-${location.jurisdiction}`}>
                      {location.region} ({location.jurisdiction})
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Data scope tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {vendor.dataScopeTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-hairline bg-paper-raised px-3 py-1 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {vendor.notes?.trim() && (
              <div className="mt-6 space-y-2 border-t border-hairline pt-6">
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Notes
                </p>
                <p className="whitespace-pre-wrap text-sm text-ink">{vendor.notes}</p>
              </div>
            )}
          </VendorDetailCard>

          <VendorDetailCard
            title="Data Processing Agreement"
            icon={FileTextIcon}
            iconClassName="bg-violet-50 text-violet-600"
            action={(
              <div className="flex items-center gap-2">
                {hasDpaFile && (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-md"
                    size="sm"
                    disabled={viewDpaMutation.isPending}
                    onClick={() => viewDpaMutation.mutate()}
                  >
                    {viewDpaMutation.isPending ? (
                      <CircleNotchIcon className="animate-spin" />
                    ) : (
                      <EyeIcon />
                    )}
                    View
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={DPA_PDF_ACCEPT}
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;

                    if (!isValidDpaPdfFile(file)) {
                      toast.error("Upload a PDF file.");
                      return;
                    }

                    void handleDpaUpload(file);
                  }}
                />
                <Button
                  type="button"
                  variant={hasDpaFile ? "destructive" : "outline"}
                  className="rounded-md"
                  size="sm"
                  disabled={dpaUploadMutation.isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {dpaUploadMutation.isPending ? (
                    <CircleNotchIcon className="animate-spin" />
                  ) : (
                    <FileArrowUpIcon />
                  )}
                  {hasDpaFile ? "Replace" : "Upload"}
                </Button>
              </div>
            )}
          >
            {!hasDpaFile ? (
              <div className="rounded-lg border border-dashed border-hairline bg-paper px-4 py-10 text-center">
                <FileTextIcon size={28} className="mx-auto text-text-secondary" />
                <p className="mt-3 text-sm font-medium text-ink">No DPA on file</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Upload a PDF DPA to track signed dates, SCC status, and AI-extracted terms.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <dl className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                      Signed date
                    </dt>
                    <dd className="text-sm text-ink">
                      {vendor.dpa.signedDate
                        ? dayjs(vendor.dpa.signedDate).format("DD MMM YYYY")
                        : "—"}
                    </dd>
                  </div>
                  <div className="space-y-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                      Review date
                    </dt>
                    <dd className="text-sm text-ink">
                      {vendor.dpa.reviewDate
                        ? dayjs(vendor.dpa.reviewDate).format("DD MMM YYYY")
                        : "—"}
                    </dd>
                  </div>
                  <div className="space-y-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                      SCC status
                    </dt>
                    <dd className="text-sm text-ink">{vendor.dpa.sccStatus}</dd>
                  </div>
                  {/* <div className="space-y-2 sm:col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                      AI processing
                    </dt>
                    <dd>
                      <AiProcessingStatusBadge
                        status={aiProcessingStatus}
                        error={vendor.dpa.aiProcessingError}
                      />
                    </dd>
                  </div> */}
                </dl>

                {(hasAiInsightsData) && (
                  <div className="space-y-4 border-t border-hairline pt-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                        AI Insights
                      </p>
                      {vendor.dpa.aiProcessedAt && (
                        <p className="text-xs text-text-secondary">
                          Processed {dayjs(vendor.dpa.aiProcessedAt).format("DD MMM YYYY")}
                        </p>
                      )}
                    </div>

                    {aiExtraction?.verdict?.value && (() => {
                      const { rating, rationale } = parseVerdict(aiExtraction.verdict.value);

                      return (
                        <div className="rounded-lg border border-hairline bg-paper px-4 py-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                            Verdict
                          </p>
                          <div className="mt-2 space-y-2">
                            <VerdictBadge rating={rating} />
                            {rationale && (
                              <p className="text-sm text-ink">{rationale}</p>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {aiExtraction?.summary?.value && (
                      <div className="rounded-lg border border-hairline bg-paper px-4 py-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                          Document Overview
                        </p>
                        <div className="mt-2">
                          <ControllerBriefing
                            text={aiExtraction.summary.value}
                            sourcePage={aiExtraction.summary.sourcePage}
                          />
                        </div>
                      </div>
                    )}

                    <dl className="grid gap-6 sm:grid-cols-2">
                      <SourcedTextField label="Retention period" field={aiExtraction?.retentionPeriod} />
                      <SourcedTextField label="Subprocessor clause" field={aiExtraction?.subprocessorClause} />
                      <SourcedTextField label="Transfer mechanism" field={aiExtraction?.transferMechanism} />
                      <SourcedTextField
                        label="Breach notification window"
                        field={aiExtraction?.breachNotificationWindow}
                      />
                      <SourcedTextField
                        label="Subprocessor authorization"
                        field={aiExtraction?.subprocessorAuthorizationMechanism}
                      />
                      <SourcedBooleanField
                        label="Deletion/return on termination"
                        field={aiExtraction?.deletionOrReturnOfDataOnTermination}
                      />
                      <SourcedTextField label="Jurisdiction" field={aiExtraction?.jurisdiction} />
                      <SourcedTextField
                        label="Vendor privacy contact"
                        field={aiExtraction?.vendorPrivacyContact}
                      />
                      <SourcedTextField
                        label="Effective/signed date (document)"
                        field={aiExtraction?.effectiveOrSignedDate}
                      />
                      {aiExtraction?.art32SecurityMeasures?.value?.length ? (
                        <div className="space-y-2 sm:col-span-2">
                          <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                            Article 32 measures
                          </dt>
                          <dd className="flex flex-wrap gap-2">
                            {aiExtraction.art32SecurityMeasures.value.map((measure) => (
                              <span
                                key={measure}
                                className="rounded-full border border-hairline bg-paper-raised px-3 py-1 text-sm"
                              >
                                {measure}
                              </span>
                            ))}
                            <SourcePageBadge sourcePage={aiExtraction.art32SecurityMeasures.sourcePage} />
                          </dd>
                        </div>
                      ) : null}
                    </dl>

                    {signedDateMismatch && (
                      <div className="flex gap-3 rounded-lg border border-amber-300/80 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
                        <WarningIcon size={18} className="mt-0.5 shrink-0" weight="fill" />
                        <p>
                          The document&apos;s effective/signed date (
                          {aiExtraction?.effectiveOrSignedDate?.value}
                          ) may differ from the signed date you entered (
                          {dayjs(vendor.dpa.signedDate).format("DD MMM YYYY")}
                          ).
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {!aiExtractionEnabled && !hasAiInsightsData && (
                  <GatedAiInsightsSection />
                )}
              </div>
            )}
          </VendorDetailCard>

          <VendorDetailCard
            title="Subprocessors"
            icon={ShareNetworkIcon}
            iconClassName="bg-amber-50 text-amber-700"
            action={(
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-full"
                aria-label="Edit subprocessors"
                onClick={() => setSubprocessorsModalOpen(true)}
              >
                <PencilSimpleIcon size={6} />
              </Button>
            )}
          >
            {subprocessors.length === 0 ? (
              <p className="text-sm text-text-secondary">No subprocessors recorded.</p>
            ) : (
              <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-hairline">
                {subprocessors.map((entry) => (
                  <li
                    key={`${entry.source}-${entry.name}`}
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
          </VendorDetailCard>
        </div>

        <aside className="space-y-6">
          <VendorDetailCard
            title="Data owners"
            icon={UsersIcon}
            iconClassName="bg-statute/10 text-statute"
            action={(
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-full"
                aria-label="Edit data owners"
                onClick={() => setDataOwnersModalOpen(true)}
              >
                <PencilSimpleIcon size={6} />
              </Button>
            )}
          >
            {dataOwners.length === 0 ? (
              <div className="flex gap-3 rounded-lg border border-amber-300/80 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
                <WarningIcon size={18} className="mt-0.5 shrink-0" weight="fill" />
                <p>
                  No data owners assigned. Assign an owner to track accountability for this vendor.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {dataOwners.map((owner) => (
                  <li key={owner._id}>
                    <button
                      type="button"
                      onClick={() => setSelectedOwner(owner)}
                      className="flex w-full items-center gap-3 rounded-lg border border-hairline px-4 py-3 text-left transition-colors hover:bg-paper-raised"
                    >
                      <OwnerAvatar name={owner.name} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{owner.name}</p>
                        {owner.role && (
                          <p className="truncate text-xs text-text-secondary">{owner.role}</p>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </VendorDetailCard>

          <VendorDetailCard
            title="Creator"
            icon={UserIcon}
            iconClassName="bg-blue-50 text-blue-700"
          >
            {!vendor.createdBy ? (
              <p className="text-sm text-text-secondary">No creator recorded.</p>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-hairline px-4 py-3">
                <OwnerAvatar
                  name={[vendor.createdBy.firstName, vendor.createdBy.lastName].filter(Boolean).join(" ")}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {[vendor.createdBy.firstName, vendor.createdBy.lastName].filter(Boolean).join(" ")}
                  </p>
                  <p className="truncate text-xs text-text-secondary">
                    Created {dayjs(vendor.createdAt).format("DD MMM YYYY")}
                  </p>
                </div>
              </div>
            )}
          </VendorDetailCard>

          {vendor.globalVendor ? (
            <VendorDetailCard
              title="Linked global vendor"
              icon={BooksIcon}
              iconClassName="bg-violet-50 text-violet-700"
            >
              {linkedGlobalVendorQuery.isPending ? (
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <CircleNotchIcon size={18} className="animate-spin" />
                  Loading catalog vendor...
                </div>
              ) : linkedGlobalVendorQuery.data ? (
                <LinkedGlobalVendorLink globalVendor={linkedGlobalVendorQuery.data} />
              ) : (
                <p className="text-sm text-text-secondary">
                  Unable to load linked catalog vendor.
                </p>
              )}
            </VendorDetailCard>
          ) : null}

          <VendorDetailCard
            title="Trust page"
            icon={ShieldCheckIcon}
            iconClassName="bg-emerald-50 text-emerald-700"
          >
            {!trustPageEnabled ? (
              <div className="space-y-3">
                <p className="text-sm text-text-secondary">
                  Trust page is not enabled for your organization. Enable it in settings to include vendors on your public trust page.
                </p>
              </div>
            ) : trustPageLayout === "Sectioned" ? (
              <div className="space-y-3">
                <p className="text-sm text-text-secondary">
                  Trust page placement is managed in Trust Page sections.
                </p>
                <p className="text-sm text-ink">
                  {trustPageIncluded
                    ? "This vendor is included in your trust page draft."
                    : "This vendor is not currently assigned to a trust page section."}
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-text-secondary">
                  {trustPageIncluded
                    ? "Included on your next trust page publish."
                    : "Not included on your trust page."}
                </p>
                <Switch
                  id="trustPageIncluded"
                  disabled={trustPageMutation.isPending}
                  values={{ trustPageIncluded }}
                  setFieldValue={(_, value) => {
                    const included = Boolean(value);
                    setTrustPageIncluded(included);
                    trustPageMutation.mutate(included);
                  }}
                />
              </div>
            )}
          </VendorDetailCard>
        </aside>
      </div>

      <DataOwnerViewModal
        open={Boolean(selectedOwner)}
        closeModal={() => setSelectedOwner(null)}
        datum={selectedOwner}
      />

      <UpdateVendorModal
        open={overviewModalOpen}
        closeModal={() => setOverviewModalOpen(false)}
        vendor={vendor}
        onUpdated={onUpdated}
      />

      <EditDataOwnersModal
        open={dataOwnersModalOpen}
        closeModal={() => setDataOwnersModalOpen(false)}
        vendorId={vendor._id}
        currentOwners={dataOwners}
        onUpdated={onUpdated}
      />

      <EditSubprocessorsModal
        open={subprocessorsModalOpen}
        closeModal={() => setSubprocessorsModalOpen(false)}
        vendorId={vendor._id}
        subprocessors={subprocessors}
        onUpdated={onUpdated}
      />
    </div>
  );
}

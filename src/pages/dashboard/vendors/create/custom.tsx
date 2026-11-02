import { Button } from "@/components/ui/button";
import { WizardStepIndicator } from "@/components/vendors/wizard-step-indicator";
import { createVendor } from "@/lib/api/vendors";
import { fetchGlobalVendor } from "@/lib/api/global-vendors";
import { fetchCurrentUser } from "@/lib/api/user";
import { useActiveVendorCount } from "@/lib/hooks/use-active-vendor-count";
import {
  INITIAL_WIZARD_STATE,
  type CustomVendorWizardState,
} from "@/lib/types/vendor.type";
import type { IGlobalVendor } from "@/lib/types/global-vendor.type";
import { deriveDefaultSccStatus } from "@/lib/utils/vendor";
import { validateDpaDates } from "@/lib/utils/dpa-dates";
import { getVendorLimitMessage } from "@/lib/utils/plan-limits";
import { wrapError } from "@/lib/utils/request";
import { useAuth } from "@clerk/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DashboardVendorsCreateRoute } from "./index";
import {
  Step2CoreDetails,
  getValidHostingLocations,
  validateStep2,
} from "./steps/step-2-core-details";
import { Step3DpaOwners, clearStep3Data, validateStep3 } from "./steps/step-3-dpa-owners";
import { Step4Subprocessors, getValidSubprocessors } from "./steps/step-4-subprocessors";
import { Step5TrustPage } from "./steps/step-5-trust-page";
import { Step6Review } from "./steps/step-6-review";
import { WIZARD_STEPS } from "@/lib/constants/vendor";

export const DashboardVendorsCreateCustomRoute = createRoute({
  getParentRoute: () => DashboardVendorsCreateRoute,
  path: "/custom",
  component: CustomVendorWizardPage,
});

function buildWizardStateFromGlobalVendor(
  globalVendor: IGlobalVendor,
): Partial<CustomVendorWizardState> {
  const hostingLocations = globalVendor.availableRegions.length > 0
    ? globalVendor.availableRegions.map((region) => ({
      region,
      jurisdiction: "",
    }))
    : [{ region: "", jurisdiction: "" }];

  return {
    name: globalVendor.name,
    logoUrl: globalVendor.logoUrl ?? "",
    category: globalVendor.category,
    hostingLocations,
  };
}

export function CustomVendorWizardPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { atLimit, plan } = useActiveVendorCount();
  const [globalVendorId] = useQueryState("globalVendor", parseAsString);
  const [state, setState] = useState<CustomVendorWizardState>(INITIAL_WIZARD_STATE);
  const [prefillApplied, setPrefillApplied] = useState(!globalVendorId);
  const prefillSourceId = useRef<string | null>(null);

  const sessionQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      return fetchCurrentUser(token);
    },
  });

  const globalVendorQuery = useQuery({
    enabled: Boolean(globalVendorId),
    queryKey: ["global-vendor", globalVendorId],
    queryFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      if (!globalVendorId) throw new Error("Missing global vendor id");
      return fetchGlobalVendor(token, globalVendorId);
    }),
  });

  useEffect(() => {
    if (!globalVendorId || !globalVendorQuery.data) return;
    if (prefillSourceId.current === globalVendorId) return;

    prefillSourceId.current = globalVendorId;
    setState((current) => ({
      ...INITIAL_WIZARD_STATE,
      ...buildWizardStateFromGlobalVendor(globalVendorQuery.data),
      step: current.step,
    }));
    setPrefillApplied(true);
  }, [globalVendorId, globalVendorQuery.data]);

  const trustPageEnabled = sessionQuery.data?.organization?.trustPageEnabled ?? false;
  const trustPageLayout = sessionQuery.data?.organization?.trustPageLayout ?? "Simplified";
  const isSectionedTrustPage = trustPageLayout === "Sectioned";
  const isCatalogFlow = Boolean(globalVendorId);
  const isLoadingCatalog = isCatalogFlow && (
    globalVendorQuery.isPending || !prefillApplied
  );

  const updateState = (patch: Partial<CustomVendorWizardState>) => {
    setState((current) => ({ ...current, ...patch }));
  };

  const goToStep = (step: CustomVendorWizardState["step"]) => {
    updateState({ step });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const createMutation = useMutation({
    mutationFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");

      const hostingLocations = getValidHostingLocations(state);
      const subprocessors = getValidSubprocessors(state);
      const sccStatus = state.dpa.sccStatus ?? deriveDefaultSccStatus(hostingLocations);
      const dateError = validateDpaDates({
        signedDate: state.dpa.signedDate,
        reviewDate: state.dpa.reviewDate,
      });

      if (dateError) {
        throw new Error(dateError);
      }

      return createVendor(token, {
        name: state.name.trim(),
        logoUrl: state.logoUrl.trim() || null,
        notes: state.notes.trim() || undefined,
        category: state.category!,
        customCategoryLabel: state.customCategoryLabel?.trim() || undefined,
        hostingLocations,
        riskTier: state.riskTier,
        dataScopeTags: state.dataScopeTags,
        dataOwners: state.dataOwnerIds.length ? state.dataOwnerIds : undefined,
        dpa: {
          fileKey: state.dpa.fileId,
          signedDate: state.dpa.signedDate,
          reviewDate: state.dpa.reviewDate,
          sccStatus,
        },
        customSubprocessors: subprocessors.length ? subprocessors : undefined,
        trustPage: {
          included: trustPageEnabled && !isSectionedTrustPage ? state.trustPageIncluded : false,
        },
        globalVendor: globalVendorId ?? undefined,
      });
    }),
    onSuccess: (result) => {
      toast.success("Vendor created successfully");
      navigate({
        to: "/dashboard/vendors/$id",
        params: { id: result.vendor._id },
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleNext = () => {
    if (state.step === 2) {
      const error = validateStep2(state);
      if (error) {
        toast.error(error);
        return;
      }
      goToStep(3);
      return;
    }

    if (state.step === 3) {
      const error = validateStep3(state);
      if (error) {
        toast.error(error);
        return;
      }
      goToStep(4);
      return;
    }

    if (state.step === 4) {
      goToStep(isSectionedTrustPage ? 6 : 5);
      return;
    }

    if (state.step === 5) goToStep(6);
  };

  const handleBack = () => {
    if (state.step === 2) {
      navigate({ to: "/dashboard/vendors/create" });
      return;
    }

    if (state.step === 6 && isSectionedTrustPage) {
      goToStep(4);
      return;
    }

    goToStep((state.step - 1) as CustomVendorWizardState["step"]);
  };

  const handleSkip = () => {
    if (state.step === 3) {
      setState((current) => ({
        ...current,
        ...clearStep3Data(),
        step: 4,
      }));
      return;
    }

    if (state.step === 4) {
      goToStep(isSectionedTrustPage ? 6 : 5);
    }
  };

  const handleSubmit = () => {
    if (atLimit) {
      toast.error(getVendorLimitMessage(plan));
      return;
    }

    createMutation.mutate();
  };

  if (atLimit) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 py-4">
        <p className="text-sm text-amber-800">{getVendorLimitMessage(plan)}</p>
        <Link
          to="/dashboard/vendors/create"
          className="inline-flex items-center gap-2 text-sm text-statute hover:underline"
        >
          <ArrowLeftIcon size={16} />
          Back to entry options
        </Link>
      </div>
    );
  }

  if (isLoadingCatalog) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl flex-col items-center justify-center gap-4 py-4">
        <CircleNotchIcon size={28} className="animate-spin text-statute" />
        <p className="text-sm text-text-secondary">Loading catalog vendor details...</p>
      </div>
    );
  }

  if (isCatalogFlow && globalVendorQuery.isError) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 py-4">
        <p className="text-sm text-red-600">
          {globalVendorQuery.error instanceof Error
            ? globalVendorQuery.error.message
            : "Unable to load catalog vendor."}
        </p>
        <Link
          to="/dashboard/vendors/create"
          className="inline-flex items-center gap-2 text-sm text-statute hover:underline"
        >
          <ArrowLeftIcon size={16} />
          Back to entry options
        </Link>
      </div>
    );
  }

  const wizardSteps = WIZARD_STEPS.filter(
    (step) => !isSectionedTrustPage || step.id !== 5,
  );
  const currentStepIndex = wizardSteps.findIndex((step) => step.id === state.step);

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-4">
      <div className="space-y-4">
        <Link
          to="/dashboard/vendors/create"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-ink"
        >
          <ArrowLeftIcon size={16} />
          Back to entry options
        </Link>
        <div className="space-y-3">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            {isCatalogFlow ? "Add catalog vendor" : "Add custom vendor"}
          </h1>
          <p className="text-sm text-text-secondary">
            Step {Math.max(currentStepIndex + 1, 1)} of {wizardSteps.length} — complete each section at your own pace.
          </p>
          {isCatalogFlow && globalVendorQuery.data ? (
            <div className="rounded-xl border border-statute/20 bg-statute/5 px-4 py-3 text-sm text-text-secondary">
              Prefilled from{" "}
              <span className="font-medium text-ink">{globalVendorQuery.data.name}</span>
              . Edits here won&apos;t affect the catalog record, but subprocessor monitoring
              stays linked to this vendor.
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
        <aside className="lg:w-52 lg:sticky lg:top-10">
          <WizardStepIndicator
            currentStep={state.step}
            steps={wizardSteps.map((step) => step.id)}
          />
        </aside>

        <div className="min-w-0 flex-1 space-y-8">
          <div className="rounded-2xl border border-hairline bg-white p-8 shadow-sm sm:p-10">
            {state.step === 2 && (
              <Step2CoreDetails state={state} onChange={updateState} />
            )}
            {state.step === 3 && (
              <Step3DpaOwners
                state={state}
                onChange={updateState}
                plan={sessionQuery.data?.organization?.plan}
              />
            )}
            {state.step === 4 && (
              <Step4Subprocessors
                state={state}
                onChange={updateState}
                globalVendor={globalVendorQuery.data ?? null}
              />
            )}
            {state.step === 5 && !isSectionedTrustPage && (
              <Step5TrustPage
                state={state}
                trustPageEnabled={trustPageEnabled}
                onChange={updateState}
              />
            )}
            {state.step === 6 && (
              <Step6Review
                state={state}
                globalVendor={globalVendorQuery.data ?? null}
                showTrustPageSection={!isSectionedTrustPage}
                onEdit={goToStep}
                onSubmit={handleSubmit}
                submitting={createMutation.isPending}
              />
            )}
          </div>

          {state.step !== 6 && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>

              <div className="flex flex-wrap gap-3">
                {(state.step === 3 || state.step === 4) && (
                  <Button type="button" variant="ghost" onClick={handleSkip}>
                    Skip this step
                  </Button>
                )}
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              </div>
            </div>
          )}

          {state.step === 6 && (
            <div>
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

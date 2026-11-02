import { useEffect, useMemo } from "react";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@clerk/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/auth-layout";
import { AuthGuard } from "@/components/auth/auth-guard";
import { LogoUploadField } from "@/components/onboarding/logo-upload-field";
import { PlanSelector } from "@/components/onboarding/plan-selector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { fetchCurrentUser } from "@/lib/api/user";
import { getAuthToken } from "@/lib/auth/get-auth-token";
import { submitOrganizationOnboarding } from "@/lib/api/onboarding";
import { generateSlug, isValidSlug } from "@/lib/utils/slug";
import { getPlanByKey, type PlanKey } from "@/config";
import config from "@/config";
import { rootRoute } from "@/router";

const allowedPlanKeys = config.pricing.plans.map((plan) => plan.key);

const OnboardingSchema = Yup.object({
  name: Yup.string()
    .trim()
    .max(255, "Organization name is too long")
    .required("Organization name is required"),
  logo: Yup.string().url("Invalid logo URL").optional(),
  planKey: Yup.mixed<PlanKey>()
    .oneOf(allowedPlanKeys)
    .required("Choose a plan to continue"),
});

export const OnboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/onboarding",
  component: OnboardingPage,
});

function OnboardingPageContent() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();

  const userQuery = useQuery({
    queryKey: ["onboarding-user"],
    enabled: isLoaded && isSignedIn,
    queryFn: async () => {
      const token = await getAuthToken(getToken);
      if (!token) return null;
      return fetchCurrentUser(token);
    },
  });

  useEffect(() => {
    if (userQuery.data?.isOnboarded) {
      navigate({ to: "/dashboard" });
    }
  }, [userQuery.data?.isOnboarded, navigate]);

  const mutation = useMutation({
    mutationFn: async (values: {
      name: string;
      slug: string;
      logo?: string;
      planKey: PlanKey;
    }) => {
      const token = await getToken({ skipCache: true });
      if (!token) {
        throw new Error("You must be signed in to continue onboarding.");
      }

      if (token.split(".").length !== 3) {
        throw new Error(
          "Unable to obtain a valid session token. Please sign in again.",
        );
      }

      const plan = getPlanByKey(values.planKey);

      return submitOrganizationOnboarding(
        {
          name: values.name,
          slug: values.slug,
          logo: values.logo || undefined,
          polarPlanId: plan.polarPlanId,
          planKey: values.planKey,
        },
        token,
      );
    },
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create your organization.",
      );
    },
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      logo: "",
      planKey: (config.isEarlyAccessEnabled ? "EarlyAccess" : "") as PlanKey | "",
    },
    validationSchema: OnboardingSchema,
    onSubmit: async (values) => {
      const slug = generateSlug(values.name);

      if (!isValidSlug(slug)) {
        toast.error("Enter a valid organization name to generate a company slug.");
        return;
      }

      try {
        await mutation.mutateAsync({
          name: values.name.trim(),
          slug,
          logo: values.logo || undefined,
          planKey: values.planKey as PlanKey,
        });
      } catch {
        // Error toast is handled in mutation.onError.
      }
    },
  });

  const slugPreview = useMemo(
    () => generateSlug(formik.values.name),
    [formik.values.name],
  );

  if (userQuery.isLoading || userQuery.data?.isOnboarded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-statute border-t-transparent" />
      </div>
    );
  }

  return (
    <AuthLayout
      title="Set up your organization"
      subtitle="Create your workspace, choose a plan, and continue to checkout."
      className="max-w-4xl"
    >
      <form className="space-y-6" onSubmit={formik.handleSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Organization Name</Label>
          <Input
            id="name"
            placeholder="Acme Corporation"
            aria-invalid={Boolean(formik.touched.name && formik.errors.name)}
            {...formik.getFieldProps("name")}
          />
          {formik.touched.name && formik.errors.name ? (
            <p className="text-sm text-destructive">{formik.errors.name}</p>
          ) : null}
        </div>

        <LogoUploadField
          value={formik.values.logo}
          onChange={(value) => formik.setFieldValue("logo", value)}
          error={
            formik.touched.logo && formik.errors.logo
              ? String(formik.errors.logo)
              : undefined
          }
        />

        <div className="space-y-2">
          <Label htmlFor="slug-preview">Company slug</Label>
          <div className="rounded-lg border border-hairline bg-paper px-3 py-2">
            <p
              id="slug-preview"
              className="font-mono text-sm text-text-secondary tabular-nums"
            >
              {slugPreview
                ? `procvault.com/trust/${slugPreview}`
                : "procvault.com/trust/your-company"}
            </p>
          </div>
          <p className="text-xs text-text-muted">
            This slug is generated from your organization name and will be used
            for your trust page URL.
          </p>
        </div>

        <PlanSelector
          value={formik.values.planKey || undefined}
          onChange={(planKey) => formik.setFieldValue("planKey", planKey)}
          error={
            formik.touched.planKey && formik.errors.planKey
              ? String(formik.errors.planKey)
              : undefined
          }
        />

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full text-base active:scale-[0.96]"
          loading={mutation.isPending}
          disabled={mutation.isPending}
        >
          Create organization and continue
        </Button>
      </form>
    </AuthLayout>
  );
}

export function OnboardingPage() {
  return (
    <AuthGuard requireAuth redirectTo={config.clerk.onboardingUrl}>
      <OnboardingPageContent />
    </AuthGuard>
  );
}

import { useEffect, useState } from "react";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/auth-layout";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/session";
import { authClient } from "@/lib/auth/client";
import { createRole, rolesQueryKeys } from "@/lib/api/roles";
import { useQueryClient } from "@tanstack/react-query";
import { generateSlug, isValidSlug } from "@/lib/utils/slug";
import { cn } from "@/lib/utils";
import config from "@/config";
import { rootRoute } from "@/router";

type OnboardingStep = "workspace" | "role";

const WorkspaceSchema = Yup.object({
  name: Yup.string()
    .trim()
    .max(255, "Workspace name is too long")
    .required("Workspace name is required"),
});

const RoleSchema = Yup.object({
  title: Yup.string()
    .trim()
    .min(1, "Role title is required")
    .max(200, "Title is too long")
    .required("Role title is required"),
  description: Yup.string()
    .trim()
    .min(50, "Paste a fuller job description so we can draft useful criteria")
    .max(50_000, "Job description is too long")
    .required("Job description is required"),
});

function randomSlugSuffix() {
  return Math.random().toString(36).slice(2, 6);
}

export const OnboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/onboarding",
  component: OnboardingPage,
});

function OnboardingPageContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionPending } = useSession();
  const [step, setStep] = useState<OnboardingStep>("workspace");
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [isCheckingOrgs, setIsCheckingOrgs] = useState(true);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  useEffect(() => {
    if (sessionPending) return;

    let cancelled = false;

    async function loadOrganizations() {
      setIsCheckingOrgs(true);
      const { data, error } = await authClient.organization.list();

      if (cancelled) return;

      if (error) {
        setIsCheckingOrgs(false);
        return;
      }

      const organizations = data ?? [];
      if (organizations.length > 0) {
        navigate({ to: config.auth.afterSignInUrl });
        return;
      }

      setIsCheckingOrgs(false);
    }

    void loadOrganizations();

    return () => {
      cancelled = true;
    };
  }, [sessionPending, navigate]);

  const workspaceForm = useFormik({
    initialValues: { name: "" },
    validationSchema: WorkspaceSchema,
    onSubmit: async (values) => {
      if (!session?.session) {
        toast.error("You must be signed in to continue.");
        return;
      }

      if (organizationId) {
        setStep("role");
        return;
      }

      const name = values.name.trim();
      setWorkspaceName(name);
      let slug = generateSlug(name);

      if (!isValidSlug(slug)) {
        toast.error("Enter a workspace name we can turn into a valid slug.");
        return;
      }

      setIsCreatingWorkspace(true);

      const tryCreate = async (candidateSlug: string) => {
        return authClient.organization.create({
          name,
          slug: candidateSlug,
        });
      };

      let createResult = await tryCreate(slug);

      if (createResult.error) {
        createResult = await tryCreate(`${slug}-${randomSlugSuffix()}`);
      }

      if (createResult.error || !createResult.data) {
        toast.error(
          createResult.error?.message ?? "Unable to create your workspace.",
        );
        setIsCreatingWorkspace(false);
        return;
      }

      const org = createResult.data;
      const orgId = org.id;

      await authClient.organization.setActive({ organizationId: orgId });

      setOrganizationId(orgId);
      setIsCreatingWorkspace(false);
      setStep("role");
    },
  });

  const roleForm = useFormik({
    initialValues: { title: "", description: "" },
    validationSchema: RoleSchema,
    onSubmit: async (values) => {
      if (!organizationId) {
        toast.error("Create a workspace before adding a role.");
        setStep("workspace");
        return;
      }

      setIsCreatingRole(true);
      try {
        await createRole({
          title: values.title,
          companyName: workspaceName.trim() || "Your company",
          jobDescription: values.description,
        });
        await queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
        navigate({ to: config.auth.afterSignInUrl });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to save your role.",
        );
        setIsCreatingRole(false);
      }
    },
  });

  if (sessionPending || isCheckingOrgs) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const stepNumber = step === "workspace" ? 1 : 2;

  const aside =
    step === "workspace"
      ? {
          eyebrow: "Step 1 of 2",
          title: "Name your workspace",
          body: "Use your company or agency name. Your team will share this space when you invite them.",
          showHeroImage: false,
          footer: defaultFooter,
        }
      : {
          eyebrow: "Step 2 of 2",
          title: "Add your first role",
          body: "Add a role title and paste the job description. Candiday will draft screening criteria for you to approve.",
          showHeroImage: false,
          footer: defaultFooter,
        };

  return (
    <AuthLayout
      title={step === "workspace" ? "Set up your workspace" : "Add your first role"}
      subtitle={
        step === "workspace"
          ? "Step 1 of 2 — Give your hiring team a shared home."
          : "Step 2 of 2 — Title and job description for your first screening role."
      }
      className="max-w-2xl"
      aside={aside}
    >
      <p className="mb-6 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground lg:text-left">
        Step {stepNumber} of 2
      </p>

      {step === "workspace" ? (
        <form
          className="space-y-6"
          onSubmit={workspaceForm.handleSubmit}
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace name</Label>
            <Input
              id="workspace-name"
              placeholder="Acme Ltd or Northside Recruitment"
              aria-invalid={Boolean(
                workspaceForm.touched.name && workspaceForm.errors.name,
              )}
              {...workspaceForm.getFieldProps("name")}
            />
            {workspaceForm.touched.name && workspaceForm.errors.name ? (
              <p className="text-sm text-destructive">{workspaceForm.errors.name}</p>
            ) : null}
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full text-base"
            loading={isCreatingWorkspace}
            disabled={isCreatingWorkspace}
          >
            Continue
          </Button>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={roleForm.handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="role-title">Role title</Label>
            <Input
              id="role-title"
              placeholder="Senior Frontend Engineer"
              aria-invalid={Boolean(
                roleForm.touched.title && roleForm.errors.title,
              )}
              {...roleForm.getFieldProps("title")}
            />
            {roleForm.touched.title && roleForm.errors.title ? (
              <p className="text-sm text-destructive">{roleForm.errors.title}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-description">Job description</Label>
            <textarea
              id="job-description"
              rows={14}
              placeholder="Paste the full job description here…"
              className={cn(
                "flex w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-base text-foreground transition-colors",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm",
              )}
              aria-invalid={Boolean(
                roleForm.touched.description && roleForm.errors.description,
              )}
              {...roleForm.getFieldProps("description")}
            />
            <p className="text-xs text-muted-foreground">
              Candiday will use this to draft screening criteria you can review.
            </p>
            {roleForm.touched.description && roleForm.errors.description ? (
              <p className="text-sm text-destructive">
                {roleForm.errors.description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-11 flex-1 text-base"
              onClick={() => setStep("workspace")}
              disabled={isCreatingRole}
            >
              Back
            </Button>
            <Button
              type="submit"
              size="lg"
              className="h-11 flex-[2] text-base"
              loading={isCreatingRole}
              disabled={isCreatingRole}
            >
              Continue
            </Button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}

const defaultFooter =
  "Candiday shows the evidence. Your team makes the decision.";

export function OnboardingPage() {
  return (
    <AuthGuard requireAuth redirectTo={config.auth.onboardingUrl}>
      <OnboardingPageContent />
    </AuthGuard>
  );
}
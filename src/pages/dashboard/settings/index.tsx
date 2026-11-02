import { ImageUploadField } from "@/components/form/image-upload-field";
import { LogoUploadField } from "@/components/onboarding/logo-upload-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createBillingPortalSession,
  fetchSettings,
  updateOrganizationSettings,
  updateProfileSettings,
} from "@/lib/api/settings";
import { useUser } from "@/lib/context/user-context";
import { wrapError } from "@/lib/utils/request";
import config, { getPlanByKey, PLAN_KEYS, type PlanKey } from "@/config";
import { useAuth, useOrganization, useUser as useClerkUser } from "@clerk/react";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createRoute, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardRootRoute } from "../root";
import lodash from "lodash";

export const DashboardSettingsRoute = createRoute({
  getParentRoute: () => DashboardRootRoute,
  path: "/settings",
  component: SettingsPage,
});

function isPaidPlan(plan: string): plan is PlanKey {
  return PLAN_KEYS.includes(plan as PlanKey);
}

function formatBillingPeriod(start?: string | null, end?: string | null) {
  if (!start || !end) {
    return "Not available";
  }

  return `${dayjs(start).format("MMM D, YYYY")} – ${dayjs(end).format("MMM D, YYYY")}`;
}

function getBillingStatus(plan: string, status: string) {
  if (status === "Suspended") {
    return "Inactive";
  }

  if (plan === "Onboarding") {
    return "Setup incomplete";
  }

  return "Active";
}

export function SettingsPage() {
  const { getToken } = useAuth();
  const { user: clerkUser } = useClerkUser();
  const { organization, membership } = useOrganization();
  const appUser = useUser((state) => state.user);
  const appOrganization = useUser((state) => state.organization);
  const setUser = useUser((state) => state.setUser);
  const setOrganization = useUser((state) => state.setOrganization);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [orgName, setOrgName] = useState("");
  const [orgLogoUrl, setOrgLogoUrl] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      return fetchSettings(token);
    }),
  });

  const settings = settingsQuery.data;
  const isOrgAdmin = Boolean(
    settings?.isOrgAdmin || membership?.role === "org:admin",
  );

  useEffect(() => {
    if (!settings) return;

    setOrgName(settings.organization.name);
    setOrgLogoUrl(settings.organization.logoUrl ?? "");
    setFirstName(settings.profile.firstName);
    setLastName(settings.profile.lastName);
    setProfileImageUrl(settings.profile.imageUrl ?? "");
  }, [settings]);

  const invalidateSettings = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["settings"] }),
      queryClient.invalidateQueries({ queryKey: ["current-user"] }),
      organization?.reload(),
      clerkUser?.reload(),
    ]);
  };

  const organizationMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");

      const payload: { name?: string; logoUrl?: string | null } = {};

      if (orgName.trim() !== settings?.organization.name) {
        payload.name = orgName.trim();
      }

      const nextLogoUrl = orgLogoUrl || null;
      if (nextLogoUrl !== (settings?.organization.logoUrl ?? null)) {
        payload.logoUrl = nextLogoUrl;
      }

      if (Object.keys(payload).length === 0) {
        throw new Error("No organization changes to save.");
      }

      return updateOrganizationSettings(token, payload);
    },
    onSuccess: async (data) => {
      toast.success("Organization settings updated.");
      if (appUser) {
        setUser({
          ...appUser,
          firstName: data.profile.firstName,
          lastName: data.profile.lastName,
          imageUrl: data.profile.imageUrl ?? null,
        });
      }
      setOrganization({
        _id: appOrganization?._id ?? "",
        name: data.organization.name,
        slug: data.organization.slug,
        logoUrl: data.organization.logoUrl ?? null,
        plan: data.organization.plan,
        trustPageEnabled: appOrganization?.trustPageEnabled ?? false,
        trustPagePublishedAt: appOrganization?.trustPagePublishedAt ?? null,
        trustPageLastModifiedAt: appOrganization?.trustPageLastModifiedAt ?? null,
        trustPageHasUnpublishedChanges: appOrganization?.trustPageHasUnpublishedChanges ?? false,
        subscriptionRenewedAt: data.organization.subscriptionRenewedAt ?? null,
        subscriptionEndsAt: data.organization.subscriptionEndsAt ?? null,
        hasBillingAccount: data.organization.hasBillingAccount,
      });
      await invalidateSettings();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to save organization settings.");
    },
  });

  const profileMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");

      const payload: {
        firstName?: string;
        lastName?: string;
        imageUrl?: string | null;
      } = {};

      if (firstName.trim() !== settings?.profile.firstName) {
        payload.firstName = firstName.trim();
      }

      if (lastName.trim() !== settings?.profile.lastName) {
        payload.lastName = lastName.trim();
      }

      const nextImageUrl = profileImageUrl || null;
      if (nextImageUrl !== (settings?.profile.imageUrl ?? null)) {
        payload.imageUrl = nextImageUrl;
      }

      if (Object.keys(payload).length === 0) {
        throw new Error("No profile changes to save.");
      }

      return updateProfileSettings(token, payload);
    },
    onSuccess: async (data) => {
      toast.success("Profile updated.");
      if (appUser) {
        setUser({
          ...appUser,
          firstName: data.profile.firstName,
          lastName: data.profile.lastName,
          imageUrl: data.profile.imageUrl ?? null,
        });
      }
      await invalidateSettings();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to save profile.");
    },
  });

  const billingPortalMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      return createBillingPortalSession(token);
    },
    onSuccess: (data) => {
      window.location.href = data.portalUrl;
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to open billing portal.");

      if (config.polarCustomerSupportPortalUrl) {
        toast.message("You can also manage billing from the customer portal.", {
          action: {
            label: "Open portal",
            onClick: () => {
              window.open(config.polarCustomerSupportPortalUrl, "_blank", "noopener,noreferrer");
            },
          },
        });
      }
    },
  });

  if (settingsQuery.isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <CircleNotchIcon
          size={28}
          className="animate-spin text-statute"
          aria-label="Loading settings"
        />
      </div>
    );
  }

  if (settingsQuery.isError || !settings) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-3">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
          Settings
        </h1>
        <p className="text-sm text-text-secondary">
          Unable to load your settings. Please refresh and try again.
        </p>
      </div>
    );
  }

  const plan = settings.organization.plan;
  const planDetails = isPaidPlan(plan) ? getPlanByKey(plan) : null;
  const billingStatus = getBillingStatus(plan, appUser?.status ?? "Active");
  const showCompleteSetup = plan === "Onboarding" || !settings.organization.hasBillingAccount;

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
          Settings
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your organization, profile, and billing preferences.
        </p>
      </div>

      <Card className="bg-white p-6">
        <CardHeader>
          <CardTitle className="font-display text-xl font-semibold text-ink">
            Organization
          </CardTitle>
          <CardDescription>
            Update your workspace identity. These details appear across ProcVault and your trust page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isOrgAdmin ? (
            <p className="rounded-lg border border-hairline bg-paper px-4 py-3 text-sm text-text-secondary">
              Only organization admins can edit workspace settings.
            </p>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="organization-name">Organization name</Label>
              <Input
                id="organization-name"
                value={orgName}
                onChange={(event) => setOrgName(event.target.value)}
                disabled={!isOrgAdmin || organizationMutation.isPending}
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization-slug">Public slug</Label>
              <Input
                id="organization-slug"
                value={settings.organization.slug}
                disabled
                readOnly
              />
              <p className="text-xs text-text-muted">
                Edit your public trust page URL on the{" "}
                <Link to="/dashboard/trust-page" className="font-medium text-statute hover:underline">
                  Trust page
                </Link>
                .
              </p>
            </div>
          </div>

          <LogoUploadField
            value={orgLogoUrl}
            onChange={setOrgLogoUrl}
            disabled={!isOrgAdmin || organizationMutation.isPending}
          />

        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline/60 bg-transparent">
          <div className="flex flex-wrap gap-4 text-sm">
            <Link to="/dashboard/team" className="font-medium text-statute hover:underline">
              Manage team
            </Link>
            <Link to="/dashboard/trust-page" className="font-medium text-statute hover:underline">
              Trust page
            </Link>
          </div>
          {isOrgAdmin ? (
            <Button
              onClick={() => organizationMutation.mutate()}
              loading={organizationMutation.isPending}
            >
              Save organization
            </Button>
          ) : null}
        </CardFooter>
      </Card>

      <Card className="bg-white p-6">
        <CardHeader>
          <CardTitle className="font-display text-xl font-semibold text-ink">
            Personal profile
          </CardTitle>
          <CardDescription>
            Update how you appear inside your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ImageUploadField
            id="profile-photo"
            label="Profile photo"
            value={profileImageUrl}
            onChange={setProfileImageUrl}
            disabled={profileMutation.isPending}
            previewClassName="size-16 rounded-full"
            emptyLabel="Upload a profile photo"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-first-name">First name</Label>
              <Input
                id="profile-first-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                disabled={profileMutation.isPending}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-last-name">Last name</Label>
              <Input
                id="profile-last-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                disabled={profileMutation.isPending}
                maxLength={100}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-email">Email address</Label>
            <Input
              id="profile-email"
              value={settings.profile.emailAddress}
              disabled
              readOnly
            />
            <p className="text-xs text-text-muted">
              Managed through your sign-in provider and cannot be changed here.
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t border-hairline/60 bg-transparent">
          <Button
            onClick={() => profileMutation.mutate()}
            loading={profileMutation.isPending}
          >
            Save profile
          </Button>
        </CardFooter>
      </Card>

      <Card className="bg-white p-6">
        <CardHeader>
          <CardTitle className="font-display text-xl font-semibold text-ink">
            Plan & billing
          </CardTitle>
          <CardDescription>
            Review your subscription and manage billing details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Current plan
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{lodash.startCase(plan)}</Badge>
                {planDetails ? (
                  <span className="text-sm text-text-secondary">{planDetails.price}</span>
                ) : null}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Status
              </p>
              <p className="text-sm font-medium text-ink">{billingStatus}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Billing period
            </p>
            <p className="text-sm text-ink">
              {formatBillingPeriod(
                settings.organization.subscriptionRenewedAt,
                settings.organization.subscriptionEndsAt,
              )}
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t border-hairline/60 bg-transparent">
          {isOrgAdmin ? (
            showCompleteSetup ? (
              <Button onClick={() => navigate({ to: "/auth/onboarding" })}>
                Complete setup
              </Button>
            ) : (
              <Button
                onClick={() => billingPortalMutation.mutate()}
                loading={billingPortalMutation.isPending}
              >
                Manage billing
              </Button>
            )
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}

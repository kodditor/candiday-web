import { ImageUploadField } from "@/components/form/image-upload-field";
import SelectInput from "@/components/form/select";
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
  fetchSettings,
  updateOrganizationSettings,
} from "@/lib/api/settings";
import { authClient } from "@/lib/auth/client";
import { useUser } from "@/lib/context/user-context";
import { wrapError } from "@/lib/utils/request";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import lodash from "lodash";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { DashboardRootRoute } from "../root";

const RETENTION_MONTH_OPTIONS = [
  { label: "3 months", value: 3 },
  { label: "6 months", value: 6 },
  { label: "12 months", value: 12 },
  { label: "24 months", value: 24 },
] as const;

export const DashboardSettingsRoute = createRoute({
  getParentRoute: () => DashboardRootRoute,
  path: "/settings",
  component: SettingsPage,
});

function ReadOnlyField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
        {label}
      </p>
      <div className="text-sm font-medium text-ink">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const appUser = useUser((state) => state.user);
  const setUser = useUser((state) => state.setUser);
  const queryClient = useQueryClient();

  const [retentionMonths, setRetentionMonths] = useState(6);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: async () => wrapError(async () => fetchSettings()),
  });

  const settings = settingsQuery.data;
  const isOrgAdmin = Boolean(settings?.isOrgAdmin);

  useEffect(() => {
    if (!settings) return;

    setRetentionMonths(settings.organization.roleRetentionMonths);
    setFirstName(settings.profile.firstName);
    setLastName(settings.profile.lastName);
    setProfileImageUrl(settings.profile.imageUrl ?? "");
  }, [settings]);

  const invalidateSettings = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["settings"] }),
      queryClient.invalidateQueries({ queryKey: ["current-user"] }),
    ]);
  };

  const organizationMutation = useMutation({
    mutationFn: async () => {
      if (
        retentionMonths === settings?.organization.roleRetentionMonths
      ) {
        throw new Error("No organization changes to save.");
      }

      return updateOrganizationSettings({ roleRetentionMonths: retentionMonths });
    },
    onSuccess: async () => {
      toast.success("Organization settings updated.");
      await invalidateSettings();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save organization settings.",
      );
    },
  });

  const profileMutation = useMutation({
    mutationFn: async () => {
      const name = `${firstName.trim()} ${lastName.trim()}`.trim();
      const nextImageUrl = profileImageUrl || null;

      const nameChanged =
        firstName.trim() !== settings?.profile.firstName ||
        lastName.trim() !== settings?.profile.lastName;
      const imageChanged =
        nextImageUrl !== (settings?.profile.imageUrl ?? null);

      if (!nameChanged && !imageChanged) {
        throw new Error("No profile changes to save.");
      }

      const { error } = await authClient.updateUser({
        ...(nameChanged ? { name } : {}),
        ...(imageChanged ? { image: nextImageUrl ?? undefined } : {}),
      });

      if (error) {
        throw new Error(error.message ?? "Unable to update profile.");
      }
    },
    onSuccess: async () => {
      toast.success("Profile updated.");
      if (appUser) {
        setUser({
          ...appUser,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          imageUrl: profileImageUrl || null,
        });
      }
      await invalidateSettings();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to save profile.");
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
  const retentionDirty =
    retentionMonths !== settings.organization.roleRetentionMonths;

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
          Settings
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Organization details and your profile.
        </p>
      </div>

      <Card className="bg-white p-6">
        <CardHeader>
          <CardTitle className="font-display text-xl font-semibold text-ink">
            Organization
          </CardTitle>
          <CardDescription>
            Workspace details and data retention for archived roles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <ReadOnlyField label="Name">{settings.organization.name}</ReadOnlyField>
            <ReadOnlyField label="Plan">
              <Badge variant="secondary">{lodash.startCase(plan)}</Badge>
            </ReadOnlyField>
            <ReadOnlyField label="Date joined">
              {dayjs(settings.organization.createdAt).format("MMM D, YYYY")}
            </ReadOnlyField>
            <ReadOnlyField label="Users">
              {settings.organization.memberCount}
            </ReadOnlyField>
          </div>

          <div className="border-t border-hairline/60 pt-6">
            <h3 className="text-sm font-medium text-ink">Role retention</h3>
            <p className="mt-1 max-w-xl text-sm text-text-secondary">
              Archived roles are permanently removed after this period. New roles use
              the current setting when they are created.
            </p>

            {!isOrgAdmin ? (
              <p className="mt-4 rounded-lg border border-hairline bg-paper px-4 py-3 text-sm text-text-secondary">
                Only organization admins can change retention.
              </p>
            ) : null}

            <div className="mt-4 max-w-xs">
              <SelectInput
                id="roleRetentionMonths"
                label="Retention period"
                options={RETENTION_MONTH_OPTIONS.map((opt) => ({
                  label: opt.label,
                  value: opt.value,
                }))}
                values={{ roleRetentionMonths: retentionMonths }}
                handleChange={(event) => {
                  setRetentionMonths(Number(event.target.value));
                }}
                disabled={!isOrgAdmin || organizationMutation.isPending}
              />
            </div>
          </div>
        </CardContent>
        {isOrgAdmin ? (
          <CardFooter className="justify-end border-t border-hairline/60 bg-transparent">
            <Button
              onClick={() => organizationMutation.mutate()}
              loading={organizationMutation.isPending}
              disabled={!retentionDirty}
            >
              Save organization
            </Button>
          </CardFooter>
        ) : null}
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
    </div>
  );
}
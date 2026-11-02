export type SettingsOrganization = {
  name: string;
  slug: string;
  logoUrl?: string | null;
  plan: string;
  subscriptionRenewedAt?: string | null;
  subscriptionEndsAt?: string | null;
  hasBillingAccount: boolean;
};

export type SettingsProfile = {
  firstName: string;
  lastName: string;
  emailAddress: string;
  imageUrl?: string | null;
};

export type SettingsResponse = {
  isOrgAdmin: boolean;
  organization: SettingsOrganization;
  profile: SettingsProfile;
};

export type UpdateOrganizationSettingsPayload = {
  name?: string;
  logoUrl?: string | null;
};

export type UpdateProfileSettingsPayload = {
  firstName?: string;
  lastName?: string;
  imageUrl?: string | null;
};

export type BillingPortalResponse = {
  portalUrl: string;
};

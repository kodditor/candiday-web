export type SettingsOrganization = {
  name: string;
  plan: string;
  createdAt: string;
  memberCount: number;
  roleRetentionMonths: number;
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
  roleRetentionMonths: number;
};
export type MembershipStatus = "active" | "archived";

export type TrustPageLayout = "Simplified" | "Sectioned";

export type ICurrentOrganization = {
  _id: string;
  name?: string;
  slug?: string;
  logoUrl?: string | null;
  plan?: string;
  trustPageEnabled: boolean;
  trustPageLayout?: TrustPageLayout;
  trustPagePublishedAt?: string | null;
  trustPageLastModifiedAt?: string | null;
  trustPageHasUnpublishedChanges?: boolean;
  subscriptionRenewedAt?: string | null;
  subscriptionEndsAt?: string | null;
  hasBillingAccount?: boolean;
};

export type ICurrentUser = {
  _id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  imageUrl?: string | null;
  clerkId?: string;
  clerkOrgId?: string | null;
  org?: string | null;
  plan: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

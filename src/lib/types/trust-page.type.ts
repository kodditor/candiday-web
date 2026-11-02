import type { IVendor } from "@/lib/types/vendor.type";

export type TrustPageLayout = "Simplified" | "Sectioned";

export type ITrustPageSnapshot = {
  vendorId: string;
  name: string;
  logoUrl?: string | null;
  category: string;
  dataScopeTags: string[];
  hostingRegions: string[];
  lastReviewed: string;
  publishedAt: string;
  useCase?: string;
  description?: string;
};

export type ITrustPageSubprocessorHistoryEntry = {
  changedAt: string;
  diff: {
    added: string[];
    removed: string[];
  };
};

export type TrustPageSection = {
  id: string;
  title: string;
  description?: string | null;
  introText?: string | null;
  sortOrder: number;
  vendors: string[];
};

export type TrustPageSectionVendorInput = {
  vendorId: string;
  useCase?: string;
  description?: string;
};

export type TrustPageSectionInput = {
  id: string;
  title: string;
  description?: string;
  introText?: string;
  sortOrder: number;
  vendors: TrustPageSectionVendorInput[];
};

export type TrustPageSectionSnapshot = {
  title: string;
  description?: string;
  introText?: string;
  vendors: ITrustPageSnapshot[];
};

export type TrustPageSettings = {
  enabled: boolean;
  layout: TrustPageLayout;
  slug: string;
  publishedAt: string | null;
  lastModifiedAt: string | null;
  hasUnpublishedChanges: boolean;
  showSubprocessorHistory: boolean;
  plan: string;
  organizationName: string;
  organizationLogoUrl: string | null;
};

export type TrustPageVendor = IVendor & {
  isPublished: boolean;
};

export type TrustPageSettingsResponse = {
  settings: TrustPageSettings;
  sections: TrustPageSection[];
  vendors: TrustPageVendor[];
  publishedVendorIds: string[];
};

export type PublicTrustPageResponse = {
  organizationName: string;
  organizationLogoUrl: string | null;
  slug: string;
  layout: TrustPageLayout;
  publishedAt: string;
  lastModifiedAt: string;
  showSubprocessorHistory: boolean;
  subprocessorChangeHistory: ITrustPageSubprocessorHistoryEntry[];
  vendors?: ITrustPageSnapshot[];
  sections?: TrustPageSectionSnapshot[];
};

export type UpdateTrustPageSettingsPayload = {
  enabled?: boolean;
  slug?: string;
  showSubprocessorHistory?: boolean;
  layout?: TrustPageLayout;
};

export type UpdateTrustPageSectionsPayload = {
  sections: TrustPageSectionInput[];
};

export type TrustPagePreviewVendor = {
  vendorId: string;
  name: string;
  logoUrl?: string | null;
  category: string;
  customCategoryLabel?: string;
  dataScopeTags: string[];
  hostingRegions: string[];
  lastReviewed: string | null;
  useCase?: string;
  description?: string;
  isUnpublished?: boolean;
};

export type TrustPagePreviewSection = {
  title: string;
  description?: string;
  introText?: string;
  vendors: TrustPagePreviewVendor[];
};

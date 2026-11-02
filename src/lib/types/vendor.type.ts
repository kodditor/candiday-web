import type { IDataOwner } from "@/lib/types/data-owner.type";

export const VendorCategories = [
  "CloudHosting",
  "Payments",
  "CRM",
  "CustomerSupport",
  "Productivity",
  "Analytics",
  "CommunicationEmail",
  "DevOpsMonitoring",
  "CDNSecurity",
  "HRPayroll",
  "Scheduling",
  "VideoConferencing",
  "IdentityAccess",
  "AIML",
  "FileStorageBackup",
  "MarketingAutomation",
  "ErrorTrackingObservability",
  "ContractingLegal",
  "Other",
] as const;
export type VendorCategory = typeof VendorCategories[number];

export const VendorCategoriesDisplayMap: Record<VendorCategory, string> = {
  CloudHosting: "Cloud Hosting",
  Payments: "Payments",
  CRM: "CRM",
  CustomerSupport: "Customer Support",
  Productivity: "Productivity",
  Analytics: "Analytics",
  CommunicationEmail: "Communication & Email",
  DevOpsMonitoring: "DevOps & Monitoring",
  CDNSecurity: "CDN & Security",
  HRPayroll: "HR & Payroll",
  Scheduling: "Scheduling",
  VideoConferencing: "Video Conferencing",
  IdentityAccess: "Identity & Access",
  AIML: "AI & ML",
  FileStorageBackup: "File Storage & Backup",
  MarketingAutomation: "Marketing Automation",
  ErrorTrackingObservability: "Error Tracking & Observability",
  ContractingLegal: "Contracting & Legal",
  Other: "Other",
};

export const RiskTiers = ["Low", "Medium", "High"] as const;
export type RiskTier = typeof RiskTiers[number];

export const SccStatuses = ["NotRequired", "Missing", "Signed"] as const;
export type SccStatus = typeof SccStatuses[number];

export const SubprocessorModes = ["Inherited", "Custom", "None"] as const;
export type SubprocessorMode = typeof SubprocessorModes[number];

export const VendorStatuses = ["Active", "Archived"] as const;
export type VendorStatus = typeof VendorStatuses[number];

export const SubscriptionPlans = ["Onboarding", "Starter", "Growth", "Business", "EarlyAccess"] as const;
export type SubscriptionPlan = typeof SubscriptionPlans[number];

export type IHostingLocation = {
  region: string;
  jurisdiction: string;
};

export const DpaAiProcessingStatuses = [
  "Idle",
  "Queued",
  "Processing",
  "Failed",
  "Completed",
] as const;
export type DpaAiProcessingStatus = typeof DpaAiProcessingStatuses[number];

export type IDpaAiSourcedField<T = string> = {
  value: T;
  sourcePage: number | null;
};

export type IDpaAiExtraction = {
  verdict?: IDpaAiSourcedField;
  summary?: IDpaAiSourcedField;
  retentionPeriod?: IDpaAiSourcedField;
  art32SecurityMeasures?: IDpaAiSourcedField<string[]>;
  subprocessorClause?: IDpaAiSourcedField;
  transferMechanism?: IDpaAiSourcedField;
  breachNotificationWindow?: IDpaAiSourcedField;
  subprocessorAuthorizationMechanism?: IDpaAiSourcedField;
  deletionOrReturnOfDataOnTermination?: IDpaAiSourcedField<boolean>;
  jurisdiction?: IDpaAiSourcedField;
  vendorPrivacyContact?: IDpaAiSourcedField;
  effectiveOrSignedDate?: IDpaAiSourcedField;
};

export type IVendorDpa = {
  fileKey: string | null;
  signedDate: string | null;
  reviewDate: string | null;
  sccStatus: SccStatus;
  isAIExtracted: boolean;
  aiProcessedAt: string | null;
  aiProcessingStatus: DpaAiProcessingStatus;
  aiProcessingError: string | null;
  aiProcessedFileKey: string | null;
  aiExtraction?: IDpaAiExtraction;
};

export type IVendorTrustPage = {
  included: boolean;
  useCase?: string;
  description?: string;
};

export type ISubprocessor = {
  name: string;
  region?: string;
  addedAt: string;
  source: "Global" | "Org";
};

export type IVendorSubprocessorHistoryEntry = {
  changedAt: string;
  changedBy: string;
  diff: {
    added: string[];
    removed: string[];
  };
};

export type IVendorCreator = {
  _id: string;
  firstName: string;
  lastName: string;
  imageUrl?: string | null;
};

export type IVendor = {
  _id: string;
  org: string;
  orgPlan: SubscriptionPlan;
  globalVendor: string | null;
  name: string;
  logoUrl?: string | null;
  notes?: string;
  category: VendorCategory;
  customCategoryLabel?: string;
  hostingLocations: IHostingLocation[];
  riskTier: RiskTier;
  dataScopeTags: string[];
  dataOwners: string[];
  createdBy?: IVendorCreator | null;
  dpa: IVendorDpa;
  subprocessorMode: SubprocessorMode;
  customSubprocessors: ISubprocessor[];
  subprocessorHistory?: IVendorSubprocessorHistoryEntry[];
  trustPage: IVendorTrustPage;
  status?: VendorStatus;
  createdAt: string;
  updatedAt: string;
};

export type VendorFlags = {
  dpaMissing: boolean;
  noSccOnFile: boolean;
  noOwnerAssigned: boolean;
};

export type CreateVendorPayload = {
  name: string;
  logoUrl?: string | null;
  notes?: string;
  category: VendorCategory;
  customCategoryLabel?: string;
  hostingLocations: IHostingLocation[];
  riskTier: RiskTier;
  dataScopeTags: string[];
  dataOwners?: string[];
  dpa?: {
    fileKey?: string | null;
    signedDate?: string | null;
    reviewDate?: string | null;
    sccStatus?: SccStatus;
  };
  customSubprocessors?: Array<{ name: string; region?: string }>;
  trustPage?: {
    included?: boolean;
  };
  globalVendor?: string;
};

export type CreateVendorResponse = {
  vendor: IVendor;
  flags: VendorFlags;
};

export type UpdateVendorPayload = {
  overview?: {
    name: string;
    logoUrl?: string | null;
    notes?: string;
    category: VendorCategory;
    customCategoryLabel?: string;
    hostingLocations: IHostingLocation[];
    riskTier: RiskTier;
    dataScopeTags: string[];
  };
  dataOwners?: string[];
  customSubprocessors?: Array<{ name: string; region?: string }>;
  dpa?: {
    fileKey?: string | null;
  };
  trustPage?: {
    included?: boolean;
  };
};

export type SubmitDpaReviewPayload = {
  dpa: {
    fileKey?: string | null;
    signedDate: string | null;
    reviewDate: string | null;
    sccStatus: SccStatus;
  };
  notes?: string;
};

export type VendorDetailResponse = CreateVendorResponse & {
  dataOwnerDetails: IDataOwner[];
  subprocessors: ISubprocessor[];
};

export type ListVendorsParams = {
  query?: string | null;
  page?: number;
  limit?: number;
};

export type CustomVendorWizardState = {
  step: 2 | 3 | 4 | 5 | 6;
  name: string;
  logoUrl: string;
  notes: string;
  category: VendorCategory | null;
  customCategoryLabel?: string;
  hostingLocations: IHostingLocation[];
  dataScopeTags: string[];
  riskTier: RiskTier;
  dpa: {
    fileId: string | null;
    signedDate: string | null;
    reviewDate: string | null;
    sccStatus: SccStatus | null;
  };
  dataOwnerIds: string[];
  customSubprocessors: Array<{ name: string; region?: string }>;
  trustPageIncluded: boolean;
};

export const INITIAL_WIZARD_STATE: CustomVendorWizardState = {
  step: 2,
  name: "",
  logoUrl: "",
  notes: "",
  category: null,
  customCategoryLabel: "",
  hostingLocations: [{ region: "", jurisdiction: "" }],
  dataScopeTags: [],
  riskTier: "Medium",
  dpa: {
    fileId: null,
    signedDate: null,
    reviewDate: null,
    sccStatus: null,
  },
  dataOwnerIds: [],
  customSubprocessors: [],
  trustPageIncluded: false,
};

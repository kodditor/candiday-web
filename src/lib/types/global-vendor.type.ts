export const GlobalVendorCategories = [
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
] as const;

export type GlobalVendorCategory = typeof GlobalVendorCategories[number];

export type MonitoringSourceFormat = "WebPage" | "PDF";

export type IMonitoringSource = {
  url: string;
  type: "SubprocessorPage" | "TrustPage";
  format?: MonitoringSourceFormat;
  pdfUrl?: string;
  pdfHash?: string | null;
};

export type IGlobalSubprocessor = {
  name: string;
  region?: string;
  addedAt: string;
  source: "Global" | "Org";
};

export type ISubprocessorDiffEntry = {
  detectedAt: string;
  diff: {
    added: string[];
    removed: string[];
  };
  aiSummary: string;
  format?: MonitoringSourceFormat;
};

export type IGlobalVendor = {
  _id: string;
  slug: string;
  name: string;
  category: GlobalVendorCategory;
  logoUrl?: string | null;
  website: string;
  isCurated: boolean;
  availableRegions: string[];
  primaryJurisdiction: string;
  monitoringSource?: IMonitoringSource;
  knownSubprocessors: IGlobalSubprocessor[];
  subprocessorHistory: ISubprocessorDiffEntry[];
  lastCrawledAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ListGlobalVendorsParams = {
  query?: string | null;
  page?: number;
  limit?: number;
};

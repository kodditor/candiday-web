import {
  VendorCategoriesDisplayMap,
  type IHostingLocation,
  type RiskTier,
  type SccStatus,
  type VendorCategory,
  type VendorFlags,
} from "@/lib/types/vendor.type";

export const ADEQUATE_JURISDICTIONS = new Set([
  "eu",
  "eea",
  "uk",
  "gb",
  "ch",
  "ca",
  "jp",
  "kr",
  "nz",
  "il",
  "ar",
  "uy",
]);

export const HIGH_SENSITIVITY_TAGS = new Set([
  "Payment Data",
  "Health Data",
]);

export const MEDIUM_SENSITIVITY_TAGS = new Set([
  "Customer PII",
  "Employee Records",
  "Marketing/Lead Data",
  "Support Tickets",
  "Analytics/Usage Data",
]);

export function normalizeJurisdiction(jurisdiction: string): string {
  return jurisdiction.trim().toLowerCase();
}

export function isAdequateJurisdiction(jurisdiction: string): boolean {
  return ADEQUATE_JURISDICTIONS.has(normalizeJurisdiction(jurisdiction));
}

export function hasNonAdequateHosting(hostingLocations: IHostingLocation[]): boolean {
  return hostingLocations.some(
    (location) => location.jurisdiction.trim() && !isAdequateJurisdiction(location.jurisdiction),
  );
}

export function computeRiskTier(
  hostingLocations: IHostingLocation[],
  dataScopeTags: string[],
): RiskTier {
  const validLocations = hostingLocations.filter(
    (location) => location.region.trim() && location.jurisdiction.trim(),
  );
  const nonAdequate = hasNonAdequateHosting(validLocations);
  const hasHighTag = dataScopeTags.some((tag) => HIGH_SENSITIVITY_TAGS.has(tag));
  const hasMediumTag = dataScopeTags.some((tag) => MEDIUM_SENSITIVITY_TAGS.has(tag));

  if (hasHighTag || (nonAdequate && hasMediumTag)) {
    return "High";
  }

  if (hasMediumTag || nonAdequate) {
    return "Medium";
  }

  return "Low";
}

export function deriveDefaultSccStatus(
  hostingLocations: IHostingLocation[],
): SccStatus {
  return hasNonAdequateHosting(hostingLocations) ? "Missing" : "NotRequired";
}

export function computeVendorFlags(input: {
  dpaFileKey?: string | null;
  dpaSccStatus?: SccStatus | null;
  hostingLocations: IHostingLocation[];
  dataOwnerIds?: string[];
}): VendorFlags {
  const dpaMissing = !input.dpaFileKey;
  const noSccOnFile =
    input.dpaSccStatus !== "Signed" &&
    hasNonAdequateHosting(input.hostingLocations);
  const noOwnerAssigned = !input.dataOwnerIds || input.dataOwnerIds.length === 0;

  return {
    dpaMissing,
    noSccOnFile,
    noOwnerAssigned,
  };
}

export function formatCategoryLabel(category: string, customLabel?: string): string {
  if (category === "Other" && customLabel) {
    return customLabel;
  }

  if (category in VendorCategoriesDisplayMap) {
    return VendorCategoriesDisplayMap[category as VendorCategory];
  }

  return category;
}

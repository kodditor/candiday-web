import {
  VendorCategories,
  VendorCategoriesDisplayMap,
} from "@/lib/types/vendor.type";

export const DATA_SCOPE_TAG_SUGGESTIONS = [
  "Customer PII",
  "Employee Records",
  "Payment Data",
  "Health Data",
  "Marketing/Lead Data",
  "Support Tickets",
  "Analytics/Usage Data",
] as const;

export const VENDOR_CATEGORY_OPTIONS = VendorCategories.map((value) => ({
  value,
  label: VendorCategoriesDisplayMap[value],
}));

export const SCC_STATUS_OPTIONS = [
  { value: "NotRequired", label: "Not required" },
  { value: "Missing", label: "Missing" },
  { value: "Signed", label: "Signed" },
] as const;

export const RISK_TIER_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
] as const;

export const WIZARD_STEPS = [
  { id: 2, label: "Core details" },
  { id: 3, label: "DPA & owners" },
  { id: 4, label: "Subprocessors" },
  { id: 5, label: "Trust page" },
  { id: 6, label: "Review" },
] as const;

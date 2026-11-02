import { PlanLimits } from "@/constants/limits";
import type { SubscriptionPlan } from "@/lib/types/vendor.type";

export function getVendorLimit(plan: SubscriptionPlan): number {
  return PlanLimits[plan].vendors;
}

export function isAiExtractionEnabled(plan: SubscriptionPlan): boolean {
  return PlanLimits[plan].aiExtraction;
}

export function isSubprocessorHistoryEnabled(plan: SubscriptionPlan): boolean {
  return PlanLimits[plan].subprocessorHistory;
}

export function getSubprocessorHistoryUpgradeMessage(): string {
  return "Upgrade your plan to view subprocessor history";
}

export function isVendorLimitReached(
  plan: SubscriptionPlan,
  activeCount: number,
): boolean {
  return activeCount >= getVendorLimit(plan);
}

export function getVendorLimitMessage(plan: SubscriptionPlan): string {
  const vendorLimit = getVendorLimit(plan);

  if (vendorLimit === 1) {
    return "Your plan allows 1 active vendor. Archive an existing vendor or upgrade your plan to add more.";
  }

  return `Your plan allows ${vendorLimit} active vendors. Archive a vendor or upgrade your plan to add more.`;
}

export function parseSubscriptionPlan(plan: string | undefined): SubscriptionPlan {
  if (plan && plan in PlanLimits) {
    return plan as SubscriptionPlan;
  }

  return "Onboarding";
}

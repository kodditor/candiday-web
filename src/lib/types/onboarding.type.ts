import type { PlanKey } from "@/config";

export type OnboardingRequest = {
  name: string;
  slug: string;
  logo?: string;
  polarPlanId: string;
  planKey: PlanKey;
};

export type OnboardingResponse = {
  checkoutUrl: string;
  organizationId?: string;
};

export type OnboardingUser = {
  _id: string;
  clerkId: string;
  isOnboarded: boolean;
  organization?: string;
};

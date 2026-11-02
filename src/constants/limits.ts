import type { SubscriptionPlan } from "@/lib/types/vendor.type";

type Limits = {
  vendors: number;
  aiExtraction: boolean;
  subprocessorHistory: boolean;
  fileSize: number;
};

export const PlanLimits: Record<SubscriptionPlan, Limits> = {
  Onboarding: {
    vendors: 1,
    aiExtraction: false,
    subprocessorHistory: false,
    fileSize: 10 * 1024 * 1024,
  },
  Starter: {
    vendors: 25,
    aiExtraction: false,
    subprocessorHistory: false,
    fileSize: 5 * 1024 * 1024,
  },
  Growth: {
    vendors: 100,
    aiExtraction: true,
    subprocessorHistory: true,
    fileSize: 10 * 1024 * 1024,
  },
  Business: {
    vendors: 100000000,
    aiExtraction: true,
    subprocessorHistory: true,
    fileSize: 10 * 1024 * 1024,
  },
  EarlyAccess: {
    vendors: 100000000,
    aiExtraction: true,
    subprocessorHistory: true,
    fileSize: 10 * 1024 * 1024,
  },
};

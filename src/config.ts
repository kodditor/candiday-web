export const PLAN_KEYS = ["Starter", "Growth", "Business", "EarlyAccess"] as const;
export type PlanKey = (typeof PLAN_KEYS)[number];

export type PricingPlan = {
  key: PlanKey;
  name: string;
  price: string;
  vendors: string;
  polarPlanId: string;
  features: string[];
};

const isEarlyAccessEnabled =
  import.meta.env.VITE_EARLY_ACCESS_ENABLED === "true";

const standardPlans = [
  {
    key: "Starter",
    name: "Starter",
    price: "€39/mo",
    vendors: "25",
    polarPlanId: import.meta.env.VITE_POLAR_STARTER_PLAN_ID || "",
    features: [
      "25 vendors",
      "DPA tracking + reminders",
      "Data owners & scope",
      "Public trust page",
    ],
  },
  {
    key: "Growth",
    name: "Growth",
    price: "€99/mo",
    vendors: "100",
    polarPlanId: import.meta.env.VITE_POLAR_GROWTH_PLAN_ID || "",
    features: [
      "100 vendors",
      "Subprocessor monitoring",
      "AI extraction",
      "Public trust page",
    ],
  },
  {
    key: "Business",
    name: "Business",
    price: "€249/mo",
    vendors: "Unlimited",
    polarPlanId: import.meta.env.VITE_POLAR_BUSINESS_PLAN_ID || "",
    features: [
      "Unlimited vendors",
      "Everything in Growth",
      "Priority support",
    ],
  },
] satisfies PricingPlan[];

const earlyAccessPlan = {
  key: "EarlyAccess",
  name: "Early Access",
  price: "Free",
  vendors: "Unlimited",
  polarPlanId: import.meta.env.VITE_POLAR_EARLY_ACCESS_PLAN_ID || "",
  features: [
    "Unlimited vendors",
    "Subprocessor monitoring",
    "AI extraction",
    "Public trust page",
    "Priority support",
  ],
} satisfies PricingPlan;

const allPlans = [...standardPlans, earlyAccessPlan];

const config = {
  env: import.meta.env.VITE_VERCEL_ENV || import.meta.env.MODE || "development",
  url: import.meta.env.VITE_APP_URL || "http://localhost:5173",
  name: import.meta.env.VITE_APP_NAME || "procvault-web",
  isEarlyAccessEnabled,
  api: {
    url: import.meta.env.VITE_API_URL || "http://localhost:4000",
  },
  clerk: {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "",
    signUpUrl: "/auth/signup",
    signInUrl: "/auth/login",
    onboardingUrl: "/auth/onboarding",
    ssoCallbackUrl: "/sso-callback",
    afterSignInUrl: "/dashboard",
    afterSignUpUrl: "/dashboard",
  },
  polarCustomerSupportPortalUrl: import.meta.env.VITE_POLAR_CUSTOMER_SUPPORT_PORTAL_URL || "",
  pricing: {
    plans: isEarlyAccessEnabled ? [earlyAccessPlan] : standardPlans,
  },
} as const;

export default config;

export function getPlanByKey(key: PlanKey): PricingPlan {
  const plan = allPlans.find((item) => item.key === key);
  if (!plan) {
    throw new Error(`Unknown plan key: ${key}`);
  }
  return plan;
}

export function getPrimaryCtaLabel() {
  return config.isEarlyAccessEnabled ? "Get early access" : "Start your free trial";
}

export function getPricingCtaLabel() {
  return config.isEarlyAccessEnabled ? "Get early access" : "Start your trial";
}

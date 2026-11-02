/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_API_URL: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_POLAR_STARTER_PLAN_ID: string;
  readonly VITE_POLAR_GROWTH_PLAN_ID: string;
  readonly VITE_POLAR_BUSINESS_PLAN_ID: string;
  readonly VITE_EARLY_ACCESS_ENABLED?: string;
  readonly VITE_POLAR_EARLY_ACCESS_PLAN_ID?: string;
  readonly VITE_VERCEL_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

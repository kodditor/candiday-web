import { createAuthClient } from "better-auth/react";
import { emailOTPClient, organizationClient } from "better-auth/client/plugins";
import config from "@/config";

export const authClient = createAuthClient({
  baseURL: config.api.url,
  basePath: "/api/v1/auth",
  plugins: [emailOTPClient(), organizationClient()],
});

import { createRoute } from "@tanstack/react-router";
import { AuthenticateWithRedirectCallback } from "@clerk/react";
import config from "@/config";
import { rootRoute } from "@/router";

export const SSOCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sso-callback",
  component: SSOCallbackPage,
});

export function SSOCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl={config.clerk.afterSignInUrl}
        signUpFallbackRedirectUrl={config.clerk.afterSignUpUrl}
        continueSignUpUrl={config.clerk.signUpUrl}
      />
    </div>
  );
}

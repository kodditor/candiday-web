import { useEffect } from "react";
import { useAuth, useClerk } from "@clerk/react";
import { useNavigate } from "@tanstack/react-router";
import config from "@/config";

type AuthGuardProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectIfSignedIn?: boolean;
  redirectTo?: string;
};

export function AuthGuard({
  children,
  requireAuth = false,
  redirectIfSignedIn = false,
  redirectTo,
}: AuthGuardProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { session } = useClerk();
  const navigate = useNavigate();
  const isAuthenticated = isSignedIn || !!session;
  const signedInDestination = redirectTo ?? config.clerk.afterSignInUrl;

  useEffect(() => {
    if (!isLoaded) return;

    if (requireAuth && !isAuthenticated) {
      navigate({
        to: config.clerk.signInUrl,
        search: redirectTo ? { redirect_to: redirectTo } : { redirect_to: undefined },
      });
      return;
    }

    if (redirectIfSignedIn && isAuthenticated) {
      navigate({ to: signedInDestination });
    }
  }, [
    isLoaded,
    isAuthenticated,
    requireAuth,
    redirectIfSignedIn,
    navigate,
    redirectTo,
    signedInDestination,
  ]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-statute border-t-transparent" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-statute border-t-transparent" />
      </div>
    );
  }

  if (redirectIfSignedIn && isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-statute border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

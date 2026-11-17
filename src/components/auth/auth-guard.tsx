import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import config from "@/config";
import { useSession } from "@/lib/auth/session";

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
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const isAuthenticated = Boolean(session?.session);
  const signedInDestination = redirectTo ?? config.auth.afterSignInUrl;

  useEffect(() => {
    if (isPending) return;

    if (requireAuth && !isAuthenticated) {
      navigate({
        to: config.auth.signInUrl,
        search: redirectTo ? { redirect_to: redirectTo } : { redirect_to: undefined },
      });
      return;
    }

    if (redirectIfSignedIn && isAuthenticated) {
      navigate({ to: signedInDestination });
    }
  }, [
    isPending,
    isAuthenticated,
    requireAuth,
    redirectIfSignedIn,
    navigate,
    redirectTo,
    signedInDestination,
  ]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (redirectIfSignedIn && isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

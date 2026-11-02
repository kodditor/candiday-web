import { AuthGuard } from "@/components/auth/auth-guard";
import { SuspendedAccountScreen } from "@/components/auth/suspended-account-screen";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { resetSessionAndSignOut } from "@/lib/auth/reset-session";
import { getAuthToken } from "@/lib/auth/get-auth-token";
import { fetchCurrentUser, isAuthFailure } from "@/lib/api/user";
import { useUser } from "@/lib/context/user-context";
import { useAuth, useClerk } from "@clerk/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Outlet, createRoute, useNavigate } from "@tanstack/react-router";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { rootRoute } from "@/router";

export const DashboardRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardLayout,
});

export function DashboardLayout() {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const { signOut } = useClerk();
  const queryClient = useQueryClient();
  const setUser = useUser((state) => state.setUser);
  const setOrganization = useUser((state) => state.setOrganization);
  const setMembershipStatus = useUser((state) => state.setMembershipStatus);
  const appUser = useUser((state) => state.user);
  const membershipStatus = useUser((state) => state.membershipStatus);
  const navigate = useNavigate();
  const sessionRecoveryRef = useRef(false);

  const userQuery = useQuery({
    enabled: isLoaded && isSignedIn && Boolean(userId),
    queryKey: ["current-user"],
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async () => {
      const token = await getAuthToken(getToken);

      if (!token) {
        throw new Error("Missing session token");
      }

      const response = await fetchCurrentUser(token);

      if (response.user) {
        setUser(response.user);
        setOrganization(response.organization);
        setMembershipStatus(response.membershipStatus);
      }

      return response;
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("checkout") === "success") {
      toast.success("Payment complete. Welcome to ProcVault!");
      params.delete("checkout");
      params.delete("customer_session_token");

      const nextSearch = params.toString();
      const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`;
      window.history.replaceState({}, "", nextUrl);
    }
  }, []);

  useEffect(() => {
    if (!userQuery.isError || sessionRecoveryRef.current) {
      return;
    }

    if (isAuthFailure(userQuery.error)) {
      sessionRecoveryRef.current = true;
      toast.error("Unable to load your workspace. Please sign in again.");
      void resetSessionAndSignOut(signOut, queryClient);
      return;
    }

    toast.error(
      userQuery.error instanceof Error
        ? userQuery.error.message
        : "Unable to load your workspace.",
    );
  }, [userQuery.isError, userQuery.error, signOut, queryClient]);

  useEffect(() => {
    if (!userQuery.data || userQuery.isLoading) {
      return;
    }

    if (!userQuery.data.isOnboarded) {
      navigate({ to: "/auth/onboarding" });
    }
  }, [userQuery.data, userQuery.isLoading, navigate]);

  if (
    userQuery.isError &&
    !isAuthFailure(userQuery.error) &&
    !sessionRecoveryRef.current
  ) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper px-6">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <p className="text-sm leading-relaxed text-text-secondary">
            {userQuery.error instanceof Error
              ? userQuery.error.message
              : "Unable to load your workspace."}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              void userQuery.refetch();
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (
    !isLoaded ||
    userQuery.isLoading ||
    (userQuery.isError && isAuthFailure(userQuery.error)) ||
    userQuery.data?.isOnboarded === false
  ) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper">
        <CircleNotchIcon
          size={28}
          className="animate-spin text-statute"
          aria-label="Loading dashboard"
        />
      </div>
    );
  }

  const userStatus = appUser?.status ?? userQuery.data?.user?.status;
  const resolvedMembershipStatus = membershipStatus ?? userQuery.data?.membershipStatus;

  if (userStatus === "Suspended" || userStatus === "Deleted") {
    return (
      <AuthGuard requireAuth>
        <SuspendedAccountScreen
          plan={appUser?.plan ?? userQuery.data?.user?.plan}
          status={userStatus}
        />
      </AuthGuard>
    );
  }

  if (resolvedMembershipStatus === "archived") {
    return (
      <AuthGuard requireAuth>
        <SuspendedAccountScreen status="Archived" />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth>
      <DashboardShell>
        <Outlet />
      </DashboardShell>
    </AuthGuard>
  );
}

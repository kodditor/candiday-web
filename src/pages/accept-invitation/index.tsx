import { AuthGuard } from "@/components/auth/auth-guard";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { useSession } from "@/lib/auth/session";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { createRoute, getRouteApi, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { rootRoute } from "@/router";

const acceptInvitationRouteApi = getRouteApi("/auth/accept-invitation");

export const AcceptInvitationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/accept-invitation",
  validateSearch: (search: Record<string, unknown>) => ({
    invitationId:
      typeof search.invitationId === "string" ? search.invitationId : undefined,
  }),
  component: AcceptInvitationPage,
});

function AcceptInvitationPageContent() {
  const navigate = useNavigate();
  const { invitationId } = acceptInvitationRouteApi.useSearch();
  const { data: session, isPending } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!invitationId) {
      setError("This invitation link is invalid or missing an invitation id.");
      return;
    }

    if (!session?.session) {
      const returnUrl = encodeURIComponent(
        `/auth/accept-invitation?invitationId=${encodeURIComponent(invitationId)}`,
      );
      navigate({
        to: "/auth/login",
        search: { redirect_to: returnUrl },
        replace: true,
      });
      return;
    }

    if (attemptedRef.current || isAccepting) {
      return;
    }

    attemptedRef.current = true;
    setIsAccepting(true);
    setError(null);

    void (async () => {
      const { error: acceptError } = await authClient.organization.acceptInvitation({
        invitationId,
      });

      setIsAccepting(false);

      if (acceptError) {
        setError(acceptError.message ?? "Unable to accept this invitation.");
        return;
      }

      toast.success("Welcome! You have joined the organization.");
      navigate({ to: "/dashboard/team", replace: true });
    })();
  }, [invitationId, isPending, session?.session, navigate, isAccepting]);

  if (!invitationId) {
    return (
      <AuthLayout title="Invalid invitation" subtitle="This link cannot be used.">
        <p className="text-center text-sm text-text-secondary">{error}</p>
        <Button className="mt-6 w-full" onClick={() => navigate({ to: "/auth/login" })}>
          Go to sign in
        </Button>
      </AuthLayout>
    );
  }

  if (error) {
    return (
      <AuthLayout title="Invitation failed" subtitle="We could not add you to the team.">
        <p className="text-center text-sm text-text-secondary">{error}</p>
        <Button className="mt-6 w-full" onClick={() => navigate({ to: "/dashboard" })}>
          Go to dashboard
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Joining organization" subtitle="Hang tight while we confirm your invite.">
      <div className="flex flex-col items-center gap-4 py-8">
        <CircleNotchIcon size={32} className="animate-spin text-statute" aria-hidden />
        <p className="text-sm text-text-secondary">
          {isAccepting ? "Accepting invitation…" : "Checking your session…"}
        </p>
      </div>
    </AuthLayout>
  );
}

function AcceptInvitationPage() {
  return (
    <AuthGuard requireAuth={false}>
      <AcceptInvitationPageContent />
    </AuthGuard>
  );
}
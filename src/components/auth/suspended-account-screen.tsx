import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/react";
import { ProhibitIcon } from "@phosphor-icons/react";
import { useState } from "react";

type SuspendedAccountScreenProps = {
  plan?: string;
  status?: "Suspended" | "Deleted" | "Archived";
};

export function SuspendedAccountScreen({
  plan,
  status = "Suspended",
}: SuspendedAccountScreenProps) {
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isDeleted = status === "Deleted";
  const isArchived = status === "Archived";
  const title = isDeleted
    ? "Account unavailable"
    : isArchived
      ? "Access removed"
      : "Subscription inactive";
  const description = isDeleted
    ? "This account has been deleted and can no longer access ProcVault."
    : isArchived
      ? "Your access to this organization has been removed by an administrator."
      : "Your organization's subscription is inactive. Access to ProcVault is paused until billing is restored.";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ redirectUrl: "/auth/login" });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-paper px-6">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-risk-high-bg text-risk-high">
          <ProhibitIcon size={28} weight="bold" aria-hidden />
        </div>

        <div className="space-y-2">
          {plan ? (
            <Badge variant="secondary">{plan} plan</Badge>
          ) : null}
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            {title}
          </h1>
          <p className="text-sm leading-relaxed text-text-secondary">
            {description}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleSignOut}
          loading={isSigningOut}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}

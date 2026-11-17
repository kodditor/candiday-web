import { authClient } from "@/lib/auth/client";
import { useUser } from "@/lib/context/user-context";
import { useEffect, useState } from "react";

export function useOrganizationId(): string {
  const appUser = useUser((state) => state.user);
  const organization = useUser((state) => state.organization);
  const [authOrgId, setAuthOrgId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void authClient.organization
      .getFullOrganization()
      .then(({ data }) => {
        if (!cancelled && data?.id) {
          setAuthOrgId(data.id);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAuthOrgId(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    authOrgId ??
    appUser?.clerkOrgId ??
    appUser?.org ??
    organization?._id ??
    ""
  );
}
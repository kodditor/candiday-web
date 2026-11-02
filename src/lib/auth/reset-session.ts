import type { QueryClient } from "@tanstack/react-query";
import { useUser } from "@/lib/context/user-context";
import config from "@/config";

type SignOutFn = (options?: { redirectUrl?: string }) => Promise<void>;

export async function resetSessionAndSignOut(
  signOut: SignOutFn,
  queryClient?: QueryClient,
): Promise<void> {
  useUser.getState().logout();
  queryClient?.clear();
  await signOut({ redirectUrl: config.clerk.signInUrl });
}

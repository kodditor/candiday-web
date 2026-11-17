import type { QueryClient } from "@tanstack/react-query";
import { useUser } from "@/lib/context/user-context";
import { signOut } from "@/lib/auth/session";

export async function resetSessionAndSignOut(
  queryClient?: QueryClient,
): Promise<void> {
  useUser.getState().logout();
  queryClient?.clear();
  await signOut();
}

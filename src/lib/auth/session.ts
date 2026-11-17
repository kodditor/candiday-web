import { authClient } from "@/lib/auth/client";

export function useSession() {
  return authClient.useSession();
}

export async function signOut() {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.href = "/auth/login";
      },
    },
  });
}

export { authClient };

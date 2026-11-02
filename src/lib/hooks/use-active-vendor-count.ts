import { fetchVendors } from "@/lib/api/vendors";
import { useUser } from "@/lib/context/user-context";
import {
  isVendorLimitReached,
  parseSubscriptionPlan,
} from "@/lib/utils/plan-limits";
import { wrapError } from "@/lib/utils/request";
import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";

export function useActiveVendorCount() {
  const user = useUser((state) => state.user);
  const organization = useUser((state) => state.organization);
  const { getToken } = useAuth();

  const query = useQuery({
    enabled: Boolean(user),
    queryKey: ["vendors", "active-count"],
    gcTime: 0,
    queryFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      return fetchVendors(token, { page: 1, limit: 1 });
    }),
  });

  const plan = parseSubscriptionPlan(organization?.plan);
  const activeCount = query.data?.totalDocs ?? 0;
  const atLimit = isVendorLimitReached(plan, activeCount);

  return {
    activeCount,
    atLimit,
    plan,
    isLoading: query.isPending,
    isError: query.isError,
  };
}

import { RoleList } from "@/components/roles/role-list";
import { RoleListSkeleton } from "@/components/roles/role-list-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchRoles,
  mapListItemToRole,
  rolesQueryKeys,
} from "@/lib/api/roles";
import { useOrganizationId } from "@/lib/hooks/use-organization-id";
import { BriefcaseIcon, MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createRoute, Link } from "@tanstack/react-router";
import lodash from "lodash";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DashboardRootRoute } from "../root";

export const DashboardRolesIndexRoute = createRoute({
  getParentRoute: () => DashboardRootRoute,
  path: "/roles",
  component: RolesIndexPage,
});

function RolesIndexPage() {
  const organizationId = useOrganizationId();
  const enabled = Boolean(organizationId);

  const [qParam, setQParam] = useQueryState("q", parseAsString.withDefault(""));
  const [searchDraft, setSearchDraft] = useState(qParam);

  useEffect(() => {
    setSearchDraft(qParam);
  }, [qParam]);

  const debouncedSetQ = useMemo(
    () =>
      lodash.debounce((value: string) => {
        void setQParam(value.trim() || "");
      }, 300),
    [setQParam],
  );

  useEffect(() => {
    return () => debouncedSetQ.cancel();
  }, [debouncedSetQ]);

  const onSearchChange = useCallback(
    (value: string) => {
      setSearchDraft(value);
      debouncedSetQ(value);
    },
    [debouncedSetQ],
  );

  const listQuery = useInfiniteQuery({
    queryKey: rolesQueryKeys.list({ q: qParam, archived: "false" }),
    queryFn: ({ pageParam }) =>
      fetchRoles({
        q: qParam || undefined,
        cursor: pageParam,
        limit: 20,
        archived: "false",
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled,
    retry: 1,
  });

  const lastErrorKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!listQuery.isError) {
      lastErrorKeyRef.current = null;
      return;
    }
    const fingerprint = `${qParam}::${listQuery.error instanceof Error ? listQuery.error.message : "error"}`;
    if (lastErrorKeyRef.current === fingerprint) return;
    lastErrorKeyRef.current = fingerprint;
    toast.error(
      listQuery.error instanceof Error
        ? listQuery.error.message
        : "Unable to load roles.",
    );
  }, [listQuery.isError, listQuery.error, qParam]);

  const roles = useMemo(
    () =>
      (listQuery.data?.pages ?? [])
        .flatMap((page) => page.items)
        .map(mapListItemToRole),
    [listQuery.data?.pages],
  );

  const isInitialLoading =
    enabled && (listQuery.isLoading || listQuery.isFetching) && !listQuery.data;
  const isSearching = Boolean(qParam.trim());
  const hasRoles = !isInitialLoading && !listQuery.isError && roles.length > 0;
  const showEmptyWorkspace =
    !isInitialLoading && !listQuery.isError && !isSearching && roles.length === 0;
  const showSearchError =
    isSearching && listQuery.isError && !listQuery.isFetching;
  const showNoSearchResults =
    !showSearchError &&
    !isInitialLoading &&
    isSearching &&
    !listQuery.isError &&
    roles.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-ink">Roles</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {showEmptyWorkspace
              ? "Create a role to start reviewing applicants."
              : "All open roles in your workspace."}
          </p>
        </div>
        {hasRoles || showNoSearchResults || showSearchError ? (
          <Button asChild className="h-10 shrink-0 gap-2">
            <Link to="/dashboard/roles/new">
              <PlusIcon className="size-4" weight="bold" />
              New role
            </Link>
          </Button>
        ) : null}
      </div>

      {!showEmptyWorkspace ? (
        <div className="relative max-w-md">
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search roles…"
            value={searchDraft}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 pl-9"
            aria-label="Search roles"
          />
        </div>
      ) : null}

      {isInitialLoading ? (
        <RoleListSkeleton rows={6} />
      ) : showEmptyWorkspace ? (
        <div className="rounded-lg border border-dashed border-hairline bg-white px-8 py-12 text-center">
          <BriefcaseIcon
            className="mx-auto size-6 text-text-muted"
            weight="regular"
            aria-hidden
          />
          <h2 className="mt-4 text-base font-medium text-ink">No roles yet</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm text-text-muted">
            Paste a job description to start reviewing CVs.
          </p>
          <Button asChild className="mt-6 h-10 px-4">
            <Link to="/dashboard/roles/new">Create your first role</Link>
          </Button>
        </div>
      ) : showSearchError ? (
        <div className="rounded-lg border border-hairline bg-white px-8 py-10 text-center">
          <p className="text-sm text-text-muted">
            Search failed. Try again or change your query.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 h-10"
            onClick={() => void listQuery.refetch()}
          >
            Retry search
          </Button>
        </div>
      ) : showNoSearchResults ? (
        <div className="rounded-lg border border-hairline bg-white px-8 py-10 text-center">
          <p className="text-sm text-text-muted">
            No roles match &ldquo;{qParam.trim()}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <RoleList roles={roles} />
          {listQuery.hasNextPage ? (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="h-10"
                loading={listQuery.isFetchingNextPage}
                disabled={listQuery.isFetchingNextPage}
                onClick={() => void listQuery.fetchNextPage()}
              >
                Load more
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
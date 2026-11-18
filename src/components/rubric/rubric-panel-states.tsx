import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CircleNotchIcon,
  ListChecksIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

export function RubricEmptyState({
  onGenerate,
  busy,
}: {
  onGenerate: () => void;
  busy: boolean;
}) {
  return (
    <div className="rounded-lg border border-dashed border-hairline px-6 py-8 text-center">
      <ListChecksIcon
        className="mx-auto size-6 text-text-muted"
        weight="regular"
        aria-hidden
      />
      <h3 className="mt-3 text-sm font-medium text-ink">No rubric yet</h3>
      <p className="mx-auto mt-1.5 max-w-xs text-sm text-text-muted">
        We&apos;ll draft evaluation criteria from the job description. You can review and edit
        before approving.
      </p>
      <Button type="button" className="mt-5 h-9 px-4" disabled={busy} onClick={onGenerate}>
        Generate rubric
      </Button>
    </div>
  );
}

export function RubricGeneratingState() {
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-2.5">
        <CircleNotchIcon className="size-4 shrink-0 animate-spin text-statute" aria-hidden />
        <p className="text-sm font-medium text-ink">Generating rubric…</p>
      </div>
      <p className="text-sm text-text-muted">
        Reading the job description and drafting screening criteria. This usually takes a minute.
      </p>
      <ul className="space-y-3" aria-hidden>
        {Array.from({ length: 3 }).map((_, index) => (
          <li key={index} className="rounded-lg border border-hairline bg-muted/30 px-4 py-3">
            <div className="flex items-baseline justify-between gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="mt-2 h-3 w-full" />
            <Skeleton className="mt-1.5 h-3 w-4/5" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RubricFailedState({
  message,
  onRetry,
  busy,
}: {
  message: string;
  onRetry: () => void;
  busy: boolean;
}) {
  return (
    <div
      className="rounded-md border border-red-200 bg-red-50 px-4 py-3"
      role="alert"
    >
      <div className="flex gap-2.5">
        <WarningCircleIcon className="mt-0.5 size-4 shrink-0 text-red-700" weight="fill" aria-hidden />
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-red-900">Couldn&apos;t generate rubric</p>
          <p className="text-sm text-red-800">{message}</p>
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={onRetry}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
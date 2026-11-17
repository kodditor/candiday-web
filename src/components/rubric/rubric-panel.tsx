import { RubricDraftView } from "@/components/rubric/rubric-draft-view";
import { RubricEditModal } from "@/components/rubric/rubric-edit-modal";
import { Button } from "@/components/ui/button";
import {
  approveRubric,
  fetchRubricView,
  rubricQueryKeys,
  saveRubricItems,
  startRubricGeneration,
} from "@/lib/api/rubric";
import {
  RUBRIC_POLL_MS,
  canApprove,
  derivePanelPhase,
  shouldPollRubric,
} from "@/features/rubric-panel/machine";
import type { RoleDetailDto } from "@/lib/types/role.type";
import type { RubricView } from "@/lib/types/rubric.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function idempotencyKey() {
  return crypto.randomUUID();
}

type RubricPanelProps = {
  role: RoleDetailDto;
};

export function RubricPanel({ role }: RubricPanelProps) {
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const rubricQuery = useQuery({
    queryKey: rubricQueryKeys.view(role.id),
    queryFn: () => fetchRubricView(role.id),
    refetchInterval: (query) =>
      shouldPollRubric(query.state.data) ? RUBRIC_POLL_MS : false,
  });

  const view = rubricQuery.data ?? null;
  const phase = derivePanelPhase(view);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: rubricQueryKeys.view(role.id) });
    void queryClient.invalidateQueries({ queryKey: ["roles", "detail", role.id] });
  };

  const generateMutation = useMutation({
    mutationFn: (replace: boolean) =>
      startRubricGeneration(role.id, idempotencyKey(), replace),
    onSuccess: () => {
      invalidate();
      toast.success("Generating rubric…");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveMutation = useMutation({
    mutationFn: (items: NonNullable<RubricView["items"]>) =>
      saveRubricItems(view!.id, view!.revision, items),
    onSuccess: () => {
      invalidate();
      setEditOpen(false);
      toast.success("Rubric saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const approveMutation = useMutation({
    mutationFn: () =>
      approveRubric(view!.id, view!.revision, role.version),
    onSuccess: () => {
      invalidate();
      toast.success("Rubric approved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => {
    if (phase !== "generating") {
      void queryClient.invalidateQueries({ queryKey: ["roles", "detail", role.id] });
    }
  }, [phase, queryClient, role.id]);

  const generateBusy = generateMutation.isPending;

  return (
    <section
      className="rounded-lg border border-hairline bg-white p-5"
      aria-labelledby="rubric-panel-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="rubric-panel-heading" className="text-base font-semibold text-ink">
          Evaluation rubric
        </h2>
        {phase === "draft" && view?.items ? (
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              Edit rubric
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!canApprove(view) || approveMutation.isPending}
              onClick={() => approveMutation.mutate()}
            >
              Approve rubric
            </Button>
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        {phase === "empty" ? (
          <EmptyState
            onGenerate={() => generateMutation.mutate(false)}
            busy={generateBusy}
          />
        ) : null}

        {phase === "generating" ? (
          <p className="text-sm text-text-muted" role="status" aria-live="polite">
            Generating rubric from the job description…
          </p>
        ) : null}

        {phase === "failed" ? (
          <FailedState
            message={view?.generationError ?? role.rubricGenerationError ?? "Generation failed"}
            onRetry={() => generateMutation.mutate(true)}
            busy={generateBusy}
          />
        ) : null}

        {phase === "draft" && view?.items ? (
          <RubricDraftView
            items={view.items}
            validation={view.validation}
            staleBanner={view.roleChangedSinceGeneration}
          />
        ) : null}

        {phase === "approved" && view?.items ? (
          <RubricDraftView items={view.items} validation={null} />
        ) : null}
      </div>

      {view?.items && phase === "draft" ? (
        <RubricEditModal
          open={editOpen}
          items={view.items}
          saving={saveMutation.isPending}
          onOpenChange={setEditOpen}
          onSave={async (items) => saveMutation.mutateAsync(items)}
        />
      ) : null}
    </section>
  );
}

function EmptyState({
  onGenerate,
  busy,
}: {
  onGenerate: () => void;
  busy: boolean;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-text-muted">
        Generate evaluation criteria from the job description.
      </p>
      <Button type="button" disabled={busy} onClick={onGenerate}>
        Generate rubric
      </Button>
    </div>
  );
}

function FailedState({
  message,
  onRetry,
  busy,
}: {
  message: string;
  onRetry: () => void;
  busy: boolean;
}) {
  return (
    <div className="space-y-3" role="alert">
      <p className="text-sm text-red-700">{message}</p>
      <Button type="button" disabled={busy} onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}